import React from 'react';
import { HardDrive, Code2, Layers, Search, CheckCircle2, FileText } from 'lucide-react';

export const R6RAGPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hero Header */}
      <div className="hero-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <HardDrive size={28} color="var(--accent-emerald)" />
          <h2 className="hero-title">Local Knowledge Base & IntelliMesh RAG (Requirement R6)</h2>
        </div>
        <p className="hero-desc">
          Satisfies PS26117 Requirement 6: Grounding agent responses in local industrial SOP documents (stored in <code>data/knowledge_base/</code>) rather than model-only knowledge. Exposes inline source citations (e.g. <code>[Source: SOP-302_Thermal_Power_Plant_Safety.txt]</code>) when knowledge passages are retrieved.
        </p>
      </div>

      {/* IntelliMesh RAG Pipeline Architecture Diagram */}
      <div className="card">
        <div className="card-title">
          <span>IntelliMesh Hybrid RAG Pipeline (Dense + BM25 + RRF + MMR)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginBottom: '0.3rem' }}>STAGE 1: BM25 KEYWORD</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Frequency Scoring</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Scores exact technical term matches with term frequency & IDF weights.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', marginBottom: '0.3rem' }}>STAGE 2: TF-IDF VECTOR</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Cosine Similarity</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Dense vector space retrieval capturing semantic term distributions.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginBottom: '0.3rem' }}>STAGE 3: RRF FUSION</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Rank Merging</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Reciprocal Rank Fusion merges BM25 and TF-IDF rank lists smoothly.</p>
          </div>

          <div style={{ background: '#060b18', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', marginBottom: '0.3rem' }}>STAGE 4: MMR DIVERSITY</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Passage Reranking</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Maximal Marginal Relevance eliminates redundant document chunks.</p>
          </div>
        </div>
      </div>

      {/* Technical Implementation Reference */}
      <div className="card">
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={18} color="var(--accent-cyan)" /> Technical Implementation Reference
          </span>
          <span className="badge badge-secure">R6 VERIFIED LIVE</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <div>📁 <strong>RAG Pipeline Module:</strong> <code>backend/app/rag_pipeline.py</code></div>
          <div>📁 <strong>Knowledge Base Directory:</strong> <code>backend/data/knowledge_base/</code></div>
          <div>🛠️ <strong>Tool Wrapper:</strong> <code>backend/app/tools/doc_search.py</code></div>
          <div>📄 <strong>Seeded Industrial Documents:</strong> <code>SOP-302_Thermal_Power_Plant_Safety.txt</code>, <code>SOP-409_Turbine_Vibration_Diagnostic_Guide.txt</code></div>
        </div>
      </div>
    </div>
  );
};
