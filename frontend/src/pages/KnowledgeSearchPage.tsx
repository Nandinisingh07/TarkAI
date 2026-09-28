import React, { KeyboardEvent, useMemo, useState } from 'react';
import {
  Search,
  Database,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import '../styles/workspace-reference.css';

type SearchResponse = {
  status: string;
  query: string;
  count: number;
  results: unknown;
  message?: string;
};

type ParsedResult = {
  number: number;
  source: string;
  content: string;
};

const pipeline = [
  ['01', 'BM25', 'Keyword retrieval'],
  ['02', 'Qwen3-Embedding', 'Dense retrieval'],
  ['03', 'RRF', 'Ranking fusion'],
  ['04', 'MMR', 'Passage refinement'],
];

function parseResults(raw: unknown): ParsedResult[] {
  if (Array.isArray(raw)) {
    return raw.map((item, index) => ({
      number: index + 1,
      source: String(
        (item as { source?: string; metadata?: { source?: string } })?.source ??
        (item as { metadata?: { source?: string } })?.metadata?.source ??
        'Local knowledge base'
      ),
      content: String(
        (item as { content?: string; text?: string; page_content?: string })?.content ??
        (item as { text?: string })?.text ??
        (item as { page_content?: string })?.page_content ??
        JSON.stringify(item, null, 2)
      ),
    }));
  }

  if (typeof raw !== 'string') {
    return [];
  }

  const parsed: ParsedResult[] = [];
  const regex =
    /--- Passage (\d+) \[Source: (.*?)\] ---\n([\s\S]*?)(?=\n--- Passage \d+ \[Source: |$)/g;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    parsed.push({
      number: Number(match[1]),
      source: match[2],
      content: match[3].trim(),
    });
  }

  if (parsed.length > 0) {
    return parsed;
  }

  const cleaned = raw
    .replace(/^Found \d+ relevant knowledge base passages.*?:\s*/i, '')
    .trim();

  return cleaned
    ? [{ number: 1, source: 'Local knowledge base', content: cleaned }]
    : [];
}

export const KnowledgeSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const results = useMemo(
    () => parseResults(data?.results),
    [data]
  );

  const runSearch = async () => {
    const trimmed = query.trim();

    if (!trimmed) {
      setError('Enter a search query.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: trimmed,
          top_k: 4,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: SearchResponse = await response.json();

      if (result.status !== 'success') {
        throw new Error(result.message || 'Knowledge search failed.');
      }

      setData(result);
      setSubmittedQuery(trimmed);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'Unable to search the knowledge base.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      void runSearch();
    }
  };

  return (
    <main className="workspace-reference-page">
      <div className="workspace-shell">

        <div className="workspace-eyebrow">
          Workspace / Knowledge
        </div>

        <header className="workspace-header">
          <div>
            <h1>Knowledge Search</h1>
            <p>Retrieve grounded evidence from the local industrial knowledge base.</p>
          </div>

          <div className="workspace-environment">
            <span className="workspace-environment-dot" />
            Local knowledge
          </div>
        </header>

        <section className="workspace-panel">
          <div className="workspace-panel-title">
            Search the approved local knowledge collection
          </div>

          <div className="workspace-panel-subtitle">
            Query is sent directly to the backend RAG pipeline.
          </div>

          <div className="workspace-input-row">
            <input
              className="workspace-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. turbine vibration safety"
              aria-label="Knowledge search query"
            />

            <button
              className="workspace-primary-button"
              onClick={() => void runSearch()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Searching
                </>
              ) : (
                <>
                  <Search size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Search
                </>
              )}
            </button>
          </div>

          {error && <div className="workspace-error">{error}</div>}
        </section>

        <h2 className="workspace-section-title">Retrieval pipeline</h2>

        <section className="workspace-stage-grid">
          {pipeline.map(([number, title, description]) => (
            <article className="workspace-stage" key={number}>
              <div className="workspace-stage-no">{number}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </section>

        <h2 className="workspace-section-title">
          {submittedQuery
            ? `Evidence for "${submittedQuery}"`
            : 'Retrieved evidence'}
        </h2>

        <section className="workspace-results">
          {!data && !loading && (
            <div className="workspace-empty">
              <Database size={24} style={{ marginBottom: 10 }} />
              <div>Run a search to retrieve local evidence.</div>
            </div>
          )}

          {loading && (
            <div className="workspace-empty">
              Searching the local knowledge base...
            </div>
          )}

          {!loading && results.map((result) => (
            <article className="workspace-result" key={`${result.number}-${result.source}`}>
              <div className="workspace-result-head">
                <div>
                  <div className="workspace-result-number">
                    PASSAGE {String(result.number).padStart(2, '0')}
                  </div>

                  <div className="workspace-result-source">
                    {result.source}
                  </div>
                </div>

                <CheckCircle2 size={17} color="#14763d" />
              </div>

              <div className="workspace-result-body">
                {result.content}
              </div>
            </article>
          ))}

          {!loading && data && results.length === 0 && (
            <div className="workspace-empty">
              No passages were returned for this query.
            </div>
          )}
        </section>

        <section className="workspace-panel" style={{ marginTop: 18 }}>
          <div className="workspace-panel-title">
            Grounding status
          </div>

          <div className="workspace-panel-subtitle">
            {data
              ? `${results.length} passages parsed from the live backend response.`
              : 'No query submitted yet.'}
          </div>

          <div style={{
            display: 'flex',
            gap: 18,
            flexWrap: 'wrap',
            marginTop: 14,
            color: '#50708e',
            fontSize: 12,
          }}>
            <span><ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> LOCAL ONLY</span>
            <span><FileText size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> SOURCE GROUNDED</span>
            <span><Database size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> LIVE RAG</span>
          </div>
        </section>

      </div>
    </main>
  );
};
