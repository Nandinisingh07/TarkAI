from app.rag_pipeline import rag_engine

def internal_document_search(query: str, top_k: int = 4):
    """
    Exposed tool function for internal document search over SOPs, manuals, correspondence, and engineering drawings.
    Returns list of matching chunks with full metadata (source_file, page, doc_type, ingestion_date, department, confidentiality_tag).
    """
    return rag_engine.internal_document_search(query, top_k=top_k)

def search_knowledge_base(query: str, top_k: int = 4) -> str:
    """
    Searches internal air-gapped industrial knowledge base (SOPs, manuals, safety guidelines, drawings)
    using IntelliMesh RAG (BGE-M3 Dense + BM25 + RRF).
    Returns relevant context passages with source citations and metadata.
    """
    results = internal_document_search(query, top_k=top_k)
    if not results:
        return f"No documents found in knowledge base matching query: '{query}'."

    output_lines = [f"Found {len(results)} relevant knowledge base passages for '{query}':\n"]
    for idx, item in enumerate(results, 1):
        meta = item.get("metadata", {})
        source_str = meta.get("source_file", item.get("source", "unknown"))
        page_str = f" Page {meta.get('page', 1)}" if meta.get("page") else ""
        doc_type_str = f" [{meta.get('doc_type', 'doc').upper()}]"
        output_lines.append(
            f"--- Passage {idx} [Source: {source_str}{page_str}{doc_type_str} (Chunk #{item.get('chunk_id', 0)})] ---\n"
            f"{item['content']}\n"
        )
    return "\n".join(output_lines)
