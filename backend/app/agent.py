import json
import re
import httpx
from typing import List, Dict, Any, Optional, Tuple
from app.config.settings import settings
from app.router import TaskRouter
from app.tools.file_io import read_file, write_file
from app.tools.code_sandbox import execute_code
from app.tools.doc_search import search_knowledge_base
from app.tools.ocr_tool import extract_text
from app.tools.vision_tool import describe_image

TOOL_MAP = {
    "read_file": read_file,
    "write_file": write_file,
    "execute_code": execute_code,
    "search_knowledge_base": search_knowledge_base,
    "extract_text": extract_text,
    "describe_image": describe_image
}

SYSTEM_PROMPT = """You are an air-gapped industrial AI agent. You accomplish tasks step-by-step using available tools.

AVAILABLE TOOLS:
1. read_file(path: str) -> Reads file from sandbox/uploads.
2. write_file(path: str, content: str) -> Writes file to sandbox.
3. execute_code(code: str, language: str) -> Executes python/bash snippet in safe sandbox.
4. search_knowledge_base(query: str) -> Searches internal SOPs & engineering manuals for grounding.
5. extract_text(file_path: str) -> Performs OCR/text extraction on scanned PDFs or images.
6. describe_image(file_path: str, prompt: str) -> Analyzes images using local vision model.

RESPONSE FORMAT RULES:
For each step, output strictly in one of these two forms:

Form 1 - To use a tool:
Thought: <Reason about what to do next>
Action: <tool_name>
Action Input: <JSON formatted parameters for tool>

Form 2 - To return the final answer:
Thought: <Summary of findings and deliverable preparation>
Action: FINAL_ANSWER
Action Input: {"output_format": "text"|"docx"|"pptx"|"xlsx", "content": "<Detailed text content or slide/table specs>"}

IMPORTANT:
- Action Input MUST be valid JSON.
- If generating a deliverable document (.docx, .pptx, .xlsx), set output_format accordingly and put complete content in Action Input.
- For docx/text: provide full formatted text with headers.
- For pptx: content should be JSON array of slide objects: [{"title": "...", "bullets": ["...", "..."]}]
- For xlsx: content should be JSON object: {"headers": ["col1", "col2"], "rows": [["a", "b"], ["c", "d"]]}
"""

class ReActAgent:
    def __init__(self, task_id: str, task_description: str, attached_files: List[str] = None):
        self.task_id = task_id
        self.task_description = task_description
        self.attached_files = attached_files or []
        
        # Route model dynamically
        routing_info = TaskRouter.classify_task(task_description)
        self.model = routing_info["model"]
        self.model_category = routing_info["category"]
        self.routing_reason = routing_info["reason"]

        self.max_steps = 8
        self.current_step = 0
        self.status = "initialized" # running, completed, failed
        self.trace: List[Dict[str, Any]] = []
        self.final_result: Optional[Dict[str, Any]] = None

    def _call_ollama(self, prompt: str) -> str:
        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2
            }
        }
        try:
            with httpx.Client(timeout=120.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    return resp.json().get("response", "")
                else:
                    return f"Error from Ollama ({resp.status_code}): {resp.text}"
        except Exception as e:
            return f"Ollama connection error: {str(e)}"

    def _parse_llm_output(self, llm_output: str) -> Tuple[str, str, Any]:
        """Extracts Thought, Action, and Action Input JSON from response."""
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
                # Attempt cleaning markdown backticks
                cleaned = re.sub(r"^```json\s*", "", raw_input)
                cleaned = re.sub(r"\s*```$", "", cleaned)
                try:
                    action_input = json.loads(cleaned)
                except Exception:
                    action_input = raw_input

        # If model outputs FINAL_ANSWER without explicit Action tag
        if "FINAL_ANSWER" in llm_output and not action:
            action = "FINAL_ANSWER"
            if isinstance(action_input, str) and not action_input:
                action_input = {"output_format": "text", "content": llm_output}

        return thought, action, action_input

    def run(self) -> Dict[str, Any]:
        self.status = "running"
        
        initial_context = f"TASK: {self.task_description}\n"
        if self.attached_files:
            initial_context += f"ATTACHED FILES: {', '.join(self.attached_files)}\n"

        prompt_history = SYSTEM_PROMPT + "\n\n" + initial_context

        for step in range(1, self.max_steps + 1):
            self.current_step = step
            step_prompt = prompt_history + f"\n\n--- STEP {step} ---\nOutput Thought, Action, and Action Input:"
            
            llm_response = self._call_ollama(step_prompt)
            thought, action, action_input = self._parse_llm_output(llm_response)

            step_record = {
                "step": step,
                "thought": thought,
                "action": action,
                "action_input": action_input,
                "observation": "",
                "status": "in_progress"
            }

            if not action or action == "FINAL_ANSWER":
                # Termination
                step_record["observation"] = "Agent reached final deliverable output."
                step_record["status"] = "completed"
                self.trace.append(step_record)
                
                final_content = action_input if isinstance(action_input, dict) else {"output_format": "text", "content": str(action_input or llm_response)}
                self.final_result = {
                    "task_id": self.task_id,
                    "model_used": self.model,
                    "routing_reason": self.routing_reason,
                    "status": "completed",
                    "final_answer": final_content,
                    "raw_response": llm_response
                }
                self.status = "completed"
                return self.final_result

            # Execute Tool
            tool_fn = TOOL_MAP.get(action)
            if not tool_fn:
                observation = f"Error: Unknown tool '{action}'. Available: {list(TOOL_MAP.keys())}"
            else:
                try:
                    if isinstance(action_input, dict):
                        observation = tool_fn(**action_input)
                    elif isinstance(action_input, str) and action_input:
                        observation = tool_fn(action_input)
                    else:
                        observation = tool_fn()
                except Exception as e:
                    observation = f"Error executing tool '{action}': {str(e)}"

            step_record["observation"] = str(observation)
            step_record["status"] = "completed"
            self.trace.append(step_record)

            prompt_history += f"\nStep {step} Thought: {thought}\nAction: {action}\nObservation: {observation}\n"

        # Max step limit reached
        self.status = "completed"
        fallback_content = self.trace[-1]["observation"] if self.trace else "Task ended."
        self.final_result = {
            "task_id": self.task_id,
            "model_used": self.model,
            "routing_reason": self.routing_reason,
            "status": "completed",
            "final_answer": {"output_format": "text", "content": fallback_content},
            "raw_response": fallback_content
        }
        return self.final_result
