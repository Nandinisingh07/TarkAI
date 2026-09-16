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


ORCHESTRATOR_SYSTEM_PROMPT = """You are TarkAI Sovereign Industrial Agent, an air-gapped industrial AI assistant.
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
For each step, output strictly in one of these two forms:

Form 1 - To execute a tool:
Thought: <Detailed reasoning about current goal and what tool to call next>
Action: <tool_name>
Action Input: <JSON formatted parameters for tool>

Form 2 - To return the final deliverable answer:
Thought: <Summary of findings and final deliverable contents>
Action: FINAL_ANSWER
Action Input: {"output_format": "text"|"docx"|"pptx"|"xlsx", "content": "<Complete text content or slide/table JSON specs>"}

IMPORTANT:
- Action Input MUST be valid JSON.
- Execute tools sequentially to gather facts, calculate results, or create files before forming the final answer.
"""

class AgentOrchestrator:
    """
    Plan-Act-Observe ReAct Orchestrator Loop.
    Executes sequential tools, logs audit events, and updates step traces.
    """
    def __init__(self, task_id: str, task_description: str, attached_files: List[str] = None, max_steps: int = 8):
        self.task_id = task_id
        self.task_description = task_description
        self.attached_files = attached_files or []
        self.max_steps = max_steps
        self.current_step = 0

        routing = model_router.classify_and_route(task_description, log_audit=True)
        self.model = routing["selected_model"]
        self.task_type = routing["task_type"]
        self.routing_reason = routing["reason"]

        self.trace: List[Dict[str, Any]] = []

    def _call_model(self, prompt: str) -> str:
        # Enforce model checksum integrity check
        check_and_enforce_integrity(self.model)

        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,
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

    def _parse_response(self, text: str) -> Tuple[str, str, Any]:
        truncated = text
        stop_patterns = [r"\n\s*Observation:", r"Observation:", r"\n\s*---", r"--- STEP"]
        for pattern in stop_patterns:
            match = re.search(pattern, truncated, re.IGNORECASE)
            if match:
                truncated = truncated[:match.start()]

        llm_output = truncated.strip()
        thought_match = re.search(r"Thought:(.*?)(?=Action:|$)", llm_output, re.DOTALL | re.IGNORECASE)
        action_match = re.search(r"Action:\s*([a-zA-Z0-9_]+)", llm_output, re.IGNORECASE)
        action_input_match = re.search(r"Action Input:\s*(\{.*\}|\[.*\]|\".*\")", llm_output, re.DOTALL | re.IGNORECASE)

        thought = thought_match.group(1).strip() if thought_match else llm_output.strip()
        action = action_match.group(1).strip() if action_match else ""
        raw_input = action_input_match.group(1).strip() if action_input_match else ""

        action_input = raw_input
        if raw_input:
            try:
                action_input = json.loads(raw_input)
            except Exception:
                cleaned = re.sub(r"^```json\s*", "", raw_input)
                cleaned = re.sub(r"\s*```$", "", cleaned)
                try:
                    action_input = json.loads(cleaned)
                except Exception:
                    action_input = raw_input

        if "FINAL_ANSWER" in llm_output and not action:
            action = "FINAL_ANSWER"
            if not action_input:
                action_input = {"output_format": "text", "content": llm_output}

        return thought, action, action_input

    def run_loop(self) -> Dict[str, Any]:

        initial_context = f"TASK: {self.task_description}\n"
        if self.attached_files:
            initial_context += f"ATTACHED FILES: {', '.join(self.attached_files)}\n"

        prompt_history = ORCHESTRATOR_SYSTEM_PROMPT + "\n\n" + initial_context

        for step in range(1, self.max_steps + 1):
            self.current_step = step
            step_prompt = prompt_history + f"\n\n--- STEP {step} ---\nOutput Thought, Action, and Action Input:"
            
            raw_resp = self._call_model(step_prompt)
            thought, action, action_input = self._parse_response(raw_resp)

            step_record = {
                "step": step,
                "thought": thought,
                "action": action,
                "action_input": action_input,
                "observation": "",
                "status": "in_progress",
                "timestamp": time.strftime("%H:%M:%S")
            }

            if not action or action == "FINAL_ANSWER":
                step_record["observation"] = "Agent reached final answer deliverable."
                step_record["status"] = "completed"
                self.trace.append(step_record)

                final_content = action_input if isinstance(action_input, dict) and action_input.get("content") else {"output_format": "text", "content": str(action_input or thought)}
                
                return {
                    "task_id": self.task_id,
                    "model_used": self.model,
                    "routing_reason": self.routing_reason,
                    "status": "completed",
                    "final_answer": final_content,
                    "trace": self.trace
                }

            # Execute Tool
            tool_fn = ORCHESTRATOR_TOOL_MAP.get(action)
            if not tool_fn:
                observation = f"Error: Unknown tool '{action}'."
            else:
                try:
                    kwargs = {}
                    if isinstance(action_input, dict):
                        kwargs = action_input.copy()
                    elif isinstance(action_input, str) and action_input:
                        kwargs = {"path": action_input}

                    # Inject job_id if supported
                    if action in ["read_file", "write_file", "execute_code", "write_spreadsheet", "read_spreadsheet", "search_knowledge_base", "extract_text", "describe_image"]:
                        kwargs["job_id"] = self.task_id

                    observation = tool_fn(**kwargs)
                except Exception as e:
                    observation = f"Error executing tool '{action}': {str(e)}"

            step_record["observation"] = str(observation)
            step_record["status"] = "completed"
            self.trace.append(step_record)

            prompt_history += f"\nStep {step} Thought: {thought}\nAction: {action}\nObservation: {observation}\n"

        # Max steps reached fallback
        fallback = self.trace[-1]["observation"] if self.trace else "Task loop ended."
        return {
            "task_id": self.task_id,
            "model_used": self.model,
            "routing_reason": self.routing_reason,
            "status": "completed",
            "final_answer": {"output_format": "text", "content": fallback},
            "trace": self.trace
        }
