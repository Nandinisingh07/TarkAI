from app.rag_pipeline import rag_engine

def search_knowledge_base(query: str, top_k: int = 4) -> str:
    """
    Searches internal air-gapped industrial knowledge base (SOPs, manuals, safety guidelines)
    using IntelliMesh RAG (Dense + BM25 + RRF).
    Returns relevant context passages with source citations.
    """
    results = rag_engine.search(query, top_k=top_k)
    if not results:
        return f"No documents found in knowledge base matching query: '{query}'."

    output_lines = [f"Found {len(results)} relevant knowledge base passages for '{query}':\n"]
    for idx, item in enumerate(results, 1):
        output_lines.append(
            f"--- Passage {idx} [Source: {item['source']} (Chunk #{item['chunk_id']})] ---\n"
            f"{item['content']}\n"
        )
    return "\n".join(output_lines)
