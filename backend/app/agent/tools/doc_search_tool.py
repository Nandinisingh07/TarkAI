from typing import List, Dict, Any
from app.tools.doc_search import search_knowledge_base as rag_search_kb
from app.audit_logger import audit_logger

def search_knowledge_base(query: str, top_k: int = 4, job_id: str = "orchestrator") -> str:
    """
    Searches internal SOP manuals, engineering guidelines, and inspection standards.
    Returns grounded context passages with source citations via BGE-M3 + ChromaDB IntelliMesh RAG.
    """
    try:
        results_text = rag_search_kb(query=query, top_k=top_k)
        
        audit_logger.log_event(
            action="TOOL_EXECUTED",
            resource=f"search_knowledge_base('{query[:30]}')",
            status="SUCCESS",
            details={"tool": "search_knowledge_base", "query": query, "job_id": job_id}
        )
        return results_text

    except Exception as e:
        audit_logger.log_event(
            action="TOOL_EXECUTED",
            resource=f"search_knowledge_base('{query[:30]}')",
            status="ERROR",
            details={"tool": "search_knowledge_base", "error": str(e), "job_id": job_id}
        )
        return f"Error searching knowledge base: {str(e)}"
