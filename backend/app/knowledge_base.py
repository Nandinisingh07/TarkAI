from pathlib import Path
from typing import List, Dict, Any
from app.rag_pipeline import IntelliMeshRAG, rag_engine
from app.config.settings import settings
from app.audit_logger import audit_logger

class LocalKnowledgeBase:
    """
    Local Offline Knowledge Base RAG Connector for TarkAI.
    Manages local document ingestion and hybrid BM25 + TF-IDF vector retrieval over SOP manuals.
    100% air-gapped with zero external network dependencies.
    """
    def __init__(self, kb_dir: Path = None):
        self.rag = IntelliMeshRAG(kb_dir=kb_dir or settings.KNOWLEDGE_BASE_DIR)

    def ingest_document(self, filename: str, content: str) -> Dict[str, Any]:
        target_path = settings.KNOWLEDGE_BASE_DIR / filename
        target_path.write_text(content, encoding="utf-8")
        self.rag.reload_documents()

        audit_logger.log_event(
            action="FILE_ACCESSED",
            resource=filename,
            status="INGESTED",
            details={"path": str(target_path), "bytes": len(content)}
        )

        return {
            "filename": filename,
            "status": "ingested",
            "chunks_indexed": len(self.rag.documents)
        }

    def search_passages(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        results = self.rag.search(query=query, top_k=top_k)
        
        audit_logger.log_event(
            action="FILE_ACCESSED",
            resource="data/knowledge_base",
            status="SEARCHED",
            details={"query": query, "results_found": len(results)}
        )
        return results

knowledge_base = LocalKnowledgeBase()
