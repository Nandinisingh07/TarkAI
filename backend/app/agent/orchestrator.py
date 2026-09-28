import json
import re
import time
import httpx
from typing import List, Dict, Any, Optional, Tuple

from app.config.settings import settings
from app.model_router import model_router
from app.model_integrity import check_and_enforce_integrity, SecurityError
from app.audit_logger import audit_logger

from app.agent.tools.file_io_tool import read_file, write_file
from app.agent.tools.code_exec_tool import execute_code
from app.agent.tools.spreadsheet_tool import write_spreadsheet, read_spreadsheet
from app.agent.tools.doc_search_tool import search_knowledge_base
from app.agent.tools.deliverable_tool import render_deliverable_document
from app.tools.ocr_tool import extract_text
from app.tools.vision_tool import describe_image

ORCHESTRATOR_TOOL_MAP = {
    "read_file": read_file,
    "write_file": write_file,
    "execute_code": execute_code,
    "write_spreadsheet": write_spreadsheet,
    "read_spreadsheet": read_spreadsheet,
    "search_knowledge_base": search_knowledge_base,
    "extract_text": extract_text,
    "describe_image": describe_image,
    "render_deliverable_document": render_deliverable_document
}

# Keywords that signal the task explicitly requires a numeric computation.
# If any of these appear in the task description, FINAL_ANSWER is blocked
# until execute_code has actually been called at least once.
CALCULATION_TRIGGER_WORDS = [
    "calculate", "compute", "calculation", "margin", "difference",
    "average", "mean", "sum", "total", "percentage", "ratio",
    "how much", "how many", "delta"
]


ORCHESTRATOR_SYSTEM_PROMPT = """
IMPORTANT TOOL RULES:
- ONLY use tools listed in AVAILABLE TOOLS. NEVER invent a tool name.
- For arithmetic or numerical calculations, use execute_code with Python.
- Do not repeat the same tool call with identical input unless the previous observation was an error or insufficient.
- After search_knowledge_base returns the required facts, move to the next required operation instead of repeating the search.
- Preserve exact values and semantic labels from source documents.
- For spreadsheet creation, provide data using {"headers":[...],"rows":[...]} or a simple key/value dictionary.
- Complete all requested operations before FINAL_ANSWER.
- Never write placeholder or invented content into a file path that was supposed to
  contain user-provided input. If required input is missing, use FINAL_ANSWER to
  report that the task cannot proceed without it.
- ALWAYS output both a "Thought:" line AND an "Action:" line together in the same
  response. Never stop after only writing a Thought.
- Keep each Thought to 1-2 short sentences. Do not write long explanations.
- CRITICAL: Action Input must be a SINGLE LINE of valid JSON. Any newline inside a
  code string MUST be written as the two characters backslash-n (\\n), never as an
  actual line break. Never paste multi-line code with real line breaks into JSON.
- BEFORE writing your first Thought, mentally list every distinct sub-task the
  user asked for (e.g. "1) look up fact A, 2) look up fact B, 3) calculate X").
  A task with multiple asks (fetch info AND calculate something, or search AND
  compare) is NOT complete after only the first part. Do not call FINAL_ANSWER
  until every distinct sub-task you identified has actually been performed with
  a tool call and observed. If the task asks you to calculate, compute, or find
  a margin/difference/average/total, you MUST call execute_code with the actual
  numbers before FINAL_ANSWER, even if you already found the reference values
  via search_knowledge_base.

You are TarkAI Sovereign Industrial Agent, an air-gapped industrial AI assistant.
Your goal is to complete complex tasks step-by-step using available tools.

AVAILABLE TOOLS:
1. read_file(path: str) -> Reads content of file from sandbox.
2. write_file(path: str, content: str) -> Writes text file into sandbox.
3. execute_code(code: str, language: str) -> Executes python/bash code snippet in isolated sandbox.
4. write_spreadsheet(file_path: str, data: dict|str) -> Generates formatted Excel (.xlsx) data sheet.
5. read_spreadsheet(file_path: str) -> Reads Excel (.xlsx) contents into JSON structure.
6. search_knowledge_base(query: str) -> Searches internal SOP manuals & engineering guidelines for grounding.
7. extract_text(file_path: str) -> Performs OCR/text extraction on scanned PDFs or image files.
8. describe_image(file_path: str, prompt: str) -> Analyzes images using local multimodal vision model.

RESPONSE FORMAT RULES:
For each step, output strictly in one of these two forms.

Form 1 - To execute a tool:
Thought: <One short sentence reasoning about what to do next>
Action: <tool_name>
Action Input: <JSON formatted parameters for tool, all on one line>

Form 2 - To return the final deliverable answer:
Thought: <Short summary of findings and final deliverable contents>
Action: FINAL_ANSWER
Action Input: {"output_format": "text"|"docx"|"pptx"|"xlsx", "content": "<Complete text content or slide/table JSON specs>"}

EXAMPLE (follow this exact structure, always output BOTH Thought and Action together,
and notice the code value uses backslash-n instead of a real line break):
Thought: The user wants a prime-checking function. I will write and test it using execute_code.
Action: execute_code
Action Input: {"code": "def is_prime(n):\\n    if n < 2:\\n        return False\\n    for i in range(2, int(n**0.5)+1):\\n        if n % i == 0:\\n            return False\\n    return True\\nprint(is_prime(7))", "language": "python"}

EXAMPLE OF A MULTI-PART TASK (search first, THEN calculate before finishing):
Task: "Find the vibration limit and calculate the margin if the reading is 3.2 mm/s."
Thought: First I need the vibration limit from the knowledge base.
Action: search_knowledge_base
Action Input: {"query": "turbine vibration limit"}
(Observation returns: limit is 4.5 mm/s)
Thought: Now I must actually calculate the margin using execute_code, not just report the limit.
Action: execute_code
Action Input: {"code": "limit = 4.5\\nreading = 3.2\\nmargin = limit - reading\\nprint(margin)", "language": "python"}
(Only after this does FINAL_ANSWER get called.)

IMPORTANT:
- Action Input MUST be valid JSON, on a single line, with \\n used for line breaks inside strings.
- Execute tools sequentially to gather facts, calculate results, or create files before forming the final answer.
- If the task requires a calculation and you have not yet called execute_code, do NOT call FINAL_ANSWER yet.
"""

class AgentOrchestrator:
    """
    Plan-Act-Observe ReAct Orchestrator Loop.
    Executes sequential tools, logs audit events, and updates step traces.

    FIX (2026-09-27, v4):
    - Thought/Action loop always runs on settings.GENERAL_MODEL (planner_model).
    - "No Action parsed" retries then honestly fails (no fake success).
    - Lenient JSON repair for raw newlines inside string values from the model.
    - Duplicate tool-call loops are capped and fail honestly instead of running
      to the step limit.
    - NEW: task-completeness enforcement. If the task description contains a
      calculation-trigger keyword (calculate/margin/difference/average/etc.)
      and the agent has NOT called execute_code even once, a premature
      FINAL_ANSWER is rejected (not returned to the user) and the agent is
      redirected with an explicit observation telling it to perform the
      calculation first. This is enforced in code, not just requested in the
      prompt, because small local models were observed to silently skip the
      calculation half of a two-part request (fetch value + compute margin)
      and return only the fetched value.
    """
    def __init__(self, task_id: str, task_description: str, attached_files: List[str] = None, max_steps: int = 8, desired_format: str = None):
        self.task_id = task_id
        self.task_description = task_description
        self.attached_files = attached_files or []
        self.max_steps = max_steps
        from app.output_generator import resolve_output_format
        self.required_format = resolve_output_format(desired_format, task_description)
        self.current_step = 0

        routing = model_router.classify_and_route(task_description, log_audit=True)
        self.model = routing["selected_model"]
        self.planner_model = settings.GENERAL_MODEL
        self.task_type = routing["task_type"]
        self.routing_reason = routing["reason"]

        self.trace: List[Dict[str, Any]] = []

        # Task-completeness tracking
        task_lower = task_description.lower()
        self._requires_calculation = any(re.search(r"\b" + re.escape(kw) + r"\b", task_lower) for kw in CALCULATION_TRIGGER_WORDS)
        self._execute_code_called = False
        self._final_answer_blocks_used = 0
        self._calc_success_hint_given = False
        self._auto_finalize_pending = False
        self._auto_finalize_summary = ""

    @staticmethod
    def _clean_calc_output(observation) -> str:
        text = str(observation)
        text = re.sub(r"\[Exit Code \d+\]\s*", "", text)
        text = re.sub(r"STDOUT:\s*", "", text).strip()
        text = re.sub(r"\d+\.\d{6,}", lambda m: f"{float(m.group()):.4f}".rstrip("0").rstrip("."), text)
        return text
    def _call_model(self, prompt: str) -> str:
        check_and_enforce_integrity(self.planner_model)

        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        payload = {
            "model": self.planner_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_predict": 700,
                "stop": ["Observation:", "\nObservation:", "\n---", "--- STEP"]
            }
        }
        try:
            with httpx.Client(timeout=120.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    return resp.json().get("response", "")
                else:
                    return f"Ollama Error ({resp.status_code}): {resp.text}"
        except Exception as e:
            return f"Model connection notice: {str(e)}"

    def _extract_first_json_block(self, text: str) -> str:
        start = text.find("{")
        if start == -1:
            return ""
        depth = 0
        for i in range(start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    return text[start:i + 1]
        return text[start:]

    @staticmethod
    def _escape_raw_control_chars_in_strings(raw: str) -> str:
        out = []
        in_string = False
        escape_next = False
        for ch in raw:
            if in_string:
                if escape_next:
                    out.append(ch)
                    escape_next = False
                    continue
                if ch == "\\":
                    out.append(ch)
                    escape_next = True
                    continue
                if ch == '"':
                    in_string = False
                    out.append(ch)
                    continue
                if ch == "\n":
                    out.append("\\n")
                    continue
                if ch == "\r":
                    out.append("\\r")
                    continue
                if ch == "\t":
                    out.append("\\t")
                    continue
                out.append(ch)
            else:
                if ch == '"':
                    in_string = True
                out.append(ch)
        return "".join(out)

    @classmethod
    def _lenient_json_loads(cls, raw: str):
        try:
            return json.loads(raw)
        except Exception:
            pass

        cleaned = re.sub(r"^```json\s*", "", raw)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            return json.loads(cleaned)
        except Exception:
            pass

        repaired = cls._escape_raw_control_chars_in_strings(cleaned)
        try:
            return json.loads(repaired)
        except Exception:
            return None

    def _parse_response(self, text: str) -> Tuple[str, str, Any]:
        truncated = text
        stop_patterns = [
            r"\n\s*Observation:", r"Observation:", r"\n\s*---", r"--- STEP",
            r"\n\s*Thought:",
        ]
        for pattern in stop_patterns:
            match = re.search(pattern, truncated, re.IGNORECASE)
            if match:
                truncated = truncated[:match.start()]

        llm_output = truncated.strip()
        thought_match = re.search(r"Thought:(.*?)(?=Action:|$)", llm_output, re.DOTALL | re.IGNORECASE)
        action_match = re.search(r"Action:\s*([a-zA-Z0-9_]+)", llm_output, re.IGNORECASE)

        thought = thought_match.group(1).strip() if thought_match else llm_output.strip()
        action = action_match.group(1).strip() if action_match else ""

        action_input_pos = llm_output.lower().find("action input:")
        raw_input = ""
        if action_input_pos != -1:
            after = llm_output[action_input_pos + len("action input:"):].strip()
            raw_input = self._extract_first_json_block(after)
            if not raw_input:
                alt_match = re.search(r"(\[.*?\]|\".*?\")", after, re.DOTALL)
                raw_input = alt_match.group(1).strip() if alt_match else ""

        action_input = raw_input
        if raw_input:
            parsed = self._lenient_json_loads(raw_input)
            if parsed is not None:
                action_input = parsed

        if "FINAL_ANSWER" in llm_output and not action:
            action = "FINAL_ANSWER"
            if not action_input:
                action_input = {"output_format": "text", "content": llm_output}

        return thought, action, action_input

    def run_loop(self) -> Dict[str, Any]:
        initial_context = f"TASK: {self.task_description}\n"
        if self.required_format:
            initial_context += (
                f"REQUIRED OUTPUT FORMAT: {self.required_format}. "
                f"Your FINAL_ANSWER must use output_format \"{self.required_format}\".\n"
            )

        if self.attached_files:
            initial_context += f"ATTACHED FILES: {', '.join(self.attached_files)}\n"

        prompt_history = ORCHESTRATOR_SYSTEM_PROMPT + "\n\n" + initial_context

        consecutive_parse_failures = 0
        consecutive_duplicate_hits = 0

        for step in range(1, self.max_steps + 1):
            self.current_step = step

            # Deterministic auto-finalize: once a required calculation has
            # already succeeded (see the execute_code branch below), do NOT
            # call the model again to ask it to wrap up -- small local models
            # were observed to ignore that instruction and either repeat the
            # calculation (infinite loop risk) or hit an Ollama timeout under
            # load. Finalizing here in code guarantees termination.
            if self._auto_finalize_pending:
                step_record = {
                    "step": step,
                    "thought": "Auto-finalized: required calculation already completed successfully.",
                    "action": "FINAL_ANSWER",
                    "action_input": {"output_format": "text", "content": self._auto_finalize_summary},
                    "observation": "Auto-finalized by orchestrator after successful calculation; model was not called again.",
                    "status": "completed",
                    "timestamp": time.strftime("%H:%M:%S"),
                }
                self.trace.append(step_record)
                return {
                    "task_id": self.task_id,
                    "model_used": self.model,
                    "routing_reason": self.routing_reason,
                    "status": "completed",
                    "final_answer": {"output_format": self.required_format or "text", "content": self._auto_finalize_summary},
                    "trace": self.trace,
                }

            step_prompt = (
                prompt_history
                + f"\n\n--- STEP {step} ---\n"
                + "Output Thought, Action, and Action Input:"
            )

            raw_resp = self._call_model(step_prompt)
            thought, action, action_input = self._parse_response(raw_resp)

            step_record = {
                "step": step,
                "thought": thought,
                "action": action,
                "action_input": action_input,
                "observation": "",
                "status": "in_progress",
                "timestamp": time.strftime("%H:%M:%S"),
            }

            if action == "FINAL_ANSWER":
                # ENFORCEMENT: block premature completion if a calculation was
                # required by the task but execute_code was never actually run.
                if self._requires_calculation and not self._execute_code_called and self._final_answer_blocks_used < 2:
                    self._final_answer_blocks_used += 1
                    observation = (
                        "Rejected: this task requires a numeric calculation "
                        "(margin/difference/calculate/etc.), but execute_code has "
                        "not been called yet. You must call execute_code with the "
                        "actual numbers to compute the result before FINAL_ANSWER."
                    )
                    step_record["observation"] = observation
                    step_record["status"] = "blocked"
                    self.trace.append(step_record)

                    audit_logger.log_event(
                        action="AGENT_PREMATURE_FINAL_ANSWER_BLOCKED",
                        resource=f"Job {self.task_id[:8]}",
                        status="REDIRECTED",
                        details={"step": step, "reason": "calculation required but execute_code not called"}
                    )

                    prompt_history += (
                        f"\nStep {step} Thought: {thought}\n"
                        f"Action: FINAL_ANSWER\n"
                        f"Observation: {observation}\n"
                    )
                    continue

                step_record["observation"] = "Agent reached final answer deliverable."
                step_record["status"] = "completed"
                self.trace.append(step_record)

                if self.required_format and isinstance(action_input, dict):
                    action_input["output_format"] = self.required_format

                if isinstance(action_input, dict) and action_input.get("content"):
                    final_content = action_input
                else:
                    final_content = {
                        "output_format": "text",
                        "content": str(action_input or thought),
                    }

                return {
                    "task_id": self.task_id,
                    "model_used": self.model,
                    "routing_reason": self.routing_reason,
                    "status": "completed",
                    "final_answer": final_content,
                    "trace": self.trace,
                }

            if not action:
                consecutive_parse_failures += 1
                step_record["observation"] = (
                    "Parser Error: planner model produced no valid Action "
                    f"(raw output: '{raw_resp[:1500]}'). Retrying."
                )
                step_record["status"] = "retry"
                self.trace.append(step_record)

                audit_logger.log_event(
                    action="AGENT_PARSE_FAILURE",
                    resource=f"Job {self.task_id[:8]}",
                    status="RETRY",
                    details={"step": step, "raw_response_snippet": raw_resp[:1500]}
                )

                if consecutive_parse_failures >= 3 or step >= self.max_steps:
                    fail_msg = (
                        "Agent could not produce a valid Action after repeated "
                        "attempts. Task marked as failed rather than falsely "
                        "reported complete."
                    )
                    return {
                        "task_id": self.task_id,
                        "model_used": self.model,
                        "routing_reason": self.routing_reason,
                        "status": "failed",
                        "final_answer": {"output_format": "text", "content": fail_msg},
                        "trace": self.trace,
                    }
                continue

            consecutive_parse_failures = 0

            tool_fn = ORCHESTRATOR_TOOL_MAP.get(action)
            needs_structured_input = action in [
                "execute_code", "write_spreadsheet", "read_spreadsheet",
                "describe_image", "render_deliverable_document"
            ]
            if needs_structured_input and not isinstance(action_input, dict):
                observation = (
                    f"Error: Action Input for '{action}' was not valid JSON "
                    "(likely an unescaped newline inside a string). Re-emit it "
                    "as a single-line JSON object with \\n for line breaks."
                )
                step_record["observation"] = observation
                step_record["status"] = "completed"
                self.trace.append(step_record)
                prompt_history += (
                    f"\nStep {step} Thought: {thought}\n"
                    f"Action: {action}\n"
                    f"Observation: {observation}\n"
                )
                continue

            normalized_input = json.dumps(action_input, sort_keys=True, default=str) if isinstance(action_input, (dict, list)) else str(action_input)
            current_call = (action, normalized_input)

            if current_call in getattr(self, "_executed_calls", set()):
                consecutive_duplicate_hits += 1
                observation = (
                    f"Duplicate action detected for '{action}'. "
                    "Use the previous observation and proceed to the next required step."
                )
                self.trace.append({
                    "step": step,
                    "action": action,
                    "action_input": action_input,
                    "observation": observation
                })
                if consecutive_duplicate_hits >= 2:
                    real_obs = [
                        str(t.get("observation", ""))
                        for t in self.trace
                        if t.get("observation")
                        and not str(t.get("observation", "")).startswith(("Duplicate action", "Parser Error", "Error:"))
                    ]
                    context = "\n\n".join(real_obs)[:3000]
                    task_text = getattr(self, "task_description", None) or getattr(self, "task", "") or ""
                    answer_prompt = (
                        "You already searched and the results are below. Do NOT call any tool. "
                        "Write the final answer to the task in plain text, using only these results.\n\n"
                        f"TASK: {task_text}\n\n"
                        f"RESULTS:\n{context}\n\nFINAL ANSWER:"
                    )
                    try:
                        answer_text = (self._call_model(answer_prompt) or "").strip()
                    except Exception:
                        answer_text = ""
                    if not answer_text or "Action:" in answer_text:
                        answer_text = context or "No result could be produced."
                    return {
                        "task_id": self.task_id,
                        "model_used": self.model,
                        "routing_reason": self.routing_reason,
                        "status": "completed",
                        "final_answer": {"output_format": "text", "content": answer_text},
                        "trace": self.trace,
                    }
                continue

            consecutive_duplicate_hits = 0

            if not hasattr(self, "_executed_calls"):
                self._executed_calls = set()
            self._executed_calls.add(current_call)

            if action == "execute_code":
                self._execute_code_called = True

            if not tool_fn:
                if action == "calculate_difference" and isinstance(action_input, dict):
                    try:
                        a = float(action_input.get("max_operating_temp"))
                        b = float(action_input.get("auto_trip_temp"))
                        difference = abs(a - b)
                        units = action_input.get("temperature_units", "Celsius")
                        observation = (
                            f"Calculation completed locally: "
                            f"|{a:g} - {b:g}| = {difference:g} {units}."
                        )
                    except Exception as e:
                        observation = f"Calculation error: {str(e)}"
                else:
                    observation = f"Error: Unknown tool '{action}'."
            else:
                halted_result = None
                try:
                    kwargs = {}

                    if isinstance(action_input, dict):
                        kwargs = action_input.copy()

                    elif isinstance(action_input, str) and action_input:
                        if action == "search_knowledge_base":
                            kwargs = {"query": action_input}
                        else:
                            kwargs = {"path": action_input}

                    if action in ["read_file", "write_file"]:
                        for alias in ["file", "filename", "file_name", "filepath", "file_path", "input_file"]:
                            if alias in kwargs and "path" not in kwargs:
                                kwargs["path"] = kwargs.pop(alias)

                    if action in ["extract_text", "describe_image"]:
                        for alias in ["file", "filename", "file_name", "filepath", "path", "input_file"]:
                            if alias in kwargs and "file_path" not in kwargs:
                                kwargs["file_path"] = kwargs.pop(alias)

                    if action in ["write_spreadsheet", "read_spreadsheet"]:
                        for alias in ["file", "filename", "path"]:
                            if alias in kwargs and "file_path" not in kwargs:
                                kwargs["file_path"] = kwargs.pop(alias)

                    if action == "write_spreadsheet" and "data" not in kwargs:
                        # Model sometimes emits headers/rows flat at the top
                        # level instead of nested under "data". Repack them.
                        if "headers" in kwargs or "rows" in kwargs:
                            kwargs["data"] = {
                                "headers": kwargs.pop("headers", []),
                                "rows": kwargs.pop("rows", []),
                            }

                    if action in [
                        "read_file",
                        "write_file",
                        "execute_code",
                        "write_spreadsheet",
                        "read_spreadsheet",
                        "search_knowledge_base",
                        "extract_text",
                        "describe_image",
                    ]:
                        kwargs["job_id"] = self.task_id

                    if action == "write_file":
                        target_path = kwargs.get("path", "")
                        if target_path and any(
                            target_path in af or af in target_path for af in self.attached_files
                        ):
                            halt_msg = (
                                f"Blocked: '{target_path}' was declared as an attached input "
                                "file and cannot be fabricated by the agent. Halting task."
                            )
                            step_record["observation"] = halt_msg
                            step_record["status"] = "halted"
                            self.trace.append(step_record)
                            halted_result = {
                                "task_id": self.task_id,
                                "model_used": self.model,
                                "routing_reason": self.routing_reason,
                                "status": "halted",
                                "final_answer": {"output_format": "text", "content": halt_msg},
                                "trace": self.trace,
                            }

                    if halted_result is None:
                        observation = tool_fn(**kwargs)

                except Exception as e:
                    observation = f"Error executing tool '{action}': {str(e)}"

                if halted_result is not None:
                    return halted_result

                # Steer the model: once a required calculation has actually
                # succeeded, tell it explicitly to stop calculating and move
                # to FINAL_ANSWER, instead of repeating execute_code forever.
                if (
                    action == "execute_code"
                    and isinstance(observation, str)
                    and "Exit Code 0" in observation
                    and self._requires_calculation
                    and not self._calc_success_hint_given
                ):
                    self._calc_success_hint_given = True
                    self._auto_finalize_pending = True
                    prior_findings = " ".join(
                        str(t.get("observation", ""))[:1500]
                        for t in self.trace
                        if t.get("action") == "search_knowledge_base"
                    )
                    self._auto_finalize_summary = (
                        f"Reference values found: {prior_findings}\n\n"
                        f"Calculation result: {self._clean_calc_output(observation)}"
                    ).strip()

            step_record["observation"] = str(observation)
            step_record["status"] = "completed"
            self.trace.append(step_record)

            prompt_history += (
                f"\nStep {step} Thought: {thought}\n"
                f"Action: {action}\n"
                f"Observation: {observation}\n"
            )

        fallback = (
            self.trace[-1]["observation"]
            if self.trace
            else "Task loop ended."
        )

        return {
            "task_id": self.task_id,
            "model_used": self.model,
            "routing_reason": self.routing_reason,
            "status": "completed",
            "final_answer": {
                "output_format": "text",
                "content": fallback,
            },
            "trace": self.trace,
        }
