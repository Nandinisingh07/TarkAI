import React, { useMemo, useState } from 'react';
import { GitBranch } from 'lucide-react';
import { TraceStep } from '../types';

interface Props {
  trace: TraceStep[];
  content: string;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'query' | 'source' | 'reference';
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
}

const extractCitations = (trace: TraceStep[], content: string) => {
  const sourceMap = new Map<string, Set<string>>();

  trace.forEach((step) => {
    const obs = String(step.observation || '');
    const chunks = obs.split(/---\s*Passage\s+\d+/i).slice(1);
    chunks.forEach((chunk) => {
      const sourceMatch = chunk.match(/Source:\s*([A-Za-z0-9_\-]+\.\w+)/i);
      const sourceName = sourceMatch ? sourceMatch[1] : null;
      const codes = Array.from(new Set(chunk.match(/\b(?:SOP|P|V|MSIV|IV)-[0-9A-Za-z]+\b/g) || []));
      if (sourceName) {
        if (!sourceMap.has(sourceName)) sourceMap.set(sourceName, new Set());
        codes.forEach((c) => sourceMap.get(sourceName)!.add(c));
      }
    });
  });

  const contentCodes = Array.from(new Set(content.match(/\b(?:SOP|P|V|MSIV|IV)-[0-9A-Za-z]+\b/g) || []));
  contentCodes.forEach((c) => {
    const alreadyLinked = Array.from(sourceMap.values()).some((set) => set.has(c));
    if (!alreadyLinked) {
      if (!sourceMap.has('Final Summary')) sourceMap.set('Final Summary', new Set());
      sourceMap.get('Final Summary')!.add(c);
    }
  });

  return sourceMap;
};

export const CitationGraph: React.FC<Props> = ({ trace, content }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const sourceMap = extractCitations(trace, content);
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    const centerX = 300;
    const centerY = 220;
    nodes.push({ id: 'query', label: 'Task Query', type: 'query', x: centerX, y: centerY });

    const sources = Array.from(sourceMap.keys());
    const sourceRadius = 130;

    sources.forEach((src, i) => {
      const angle = (2 * Math.PI * i) / Math.max(sources.length, 1) - Math.PI / 2;
      const x = centerX + sourceRadius * Math.cos(angle);
      const y = centerY + sourceRadius * Math.sin(angle);
      const srcId = `src-${i}`;
      nodes.push({ id: srcId, label: src, type: 'source', x, y });
      edges.push({ from: 'query', to: srcId });

      const codes = Array.from(sourceMap.get(src) || []);
      const codeRadius = 60;
      codes.forEach((code, j) => {
        const codeAngle = angle + (j - (codes.length - 1) / 2) * 0.35;
        const cx = x + codeRadius * Math.cos(codeAngle);
        const cy = y + codeRadius * Math.sin(codeAngle);
        const codeId = `code-${i}-${j}`;
        nodes.push({ id: codeId, label: code, type: 'reference', x: cx, y: cy });
        edges.push({ from: srcId, to: codeId });
      });
    });

    return { nodes, edges };
  }, [trace, content]);

  if (nodes.length <= 1) return null;

  const isConnected = (nodeId: string) => {
    if (!hovered) return true;
    if (nodeId === hovered) return true;
    return edges.some((e) => (e.from === hovered && e.to === nodeId) || (e.to === hovered && e.from === nodeId));
  };

  const nodeColor = (type: GraphNode['type']) =>
    type === 'query' ? '#60a5fa' : type === 'source' ? '#34d399' : '#fbbf24';

  const nodeRadius = (type: GraphNode['type']) => (type === 'query' ? 10 : type === 'source' ? 7 : 5);

  return (
    <div className="instrument-card">
      <div className="card-header-bar">
        <div className="card-title">
          <GitBranch size={16} color="var(--accent-blue)" />
          <span>Knowledge Citation Graph</span>
        </div>
        <div className="status-badge nominal" style={{ fontSize: '11px' }}>
          <span>Source Traceability for Audit Compliance</span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox="0 0 600 440" style={{ width: '100%', minWidth: '480px', height: '380px' }}>
          {edges.map((e, i) => {
            const from = nodes.find((n) => n.id === e.from)!;
            const to = nodes.find((n) => n.id === e.to)!;
            const active = isConnected(e.from) && isConnected(e.to);
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={active ? 'rgba(96, 165, 250, 0.45)' : 'rgba(148, 163, 184, 0.12)'}
                strokeWidth={1.5}
              />
            );
          })}

          {nodes.map((n) => {
            const active = isConnected(n.id);
            return (
              <g
                key={n.id}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={nodeRadius(n.type)}
                  fill={nodeColor(n.type)}
                  opacity={active ? 1 : 0.25}
                  stroke="#0b0f1a"
                  strokeWidth={1.5}
                />
                <text
                  x={n.x}
                  y={n.type === 'query' ? n.y - 16 : n.y + (n.type === 'source' ? -12 : 14)}
                  textAnchor="middle"
                  fontSize={n.type === 'query' ? 12 : n.type === 'source' ? 10 : 9}
                  fontWeight={n.type === 'query' ? 700 : 600}
                  fill={active ? '#e2e8f0' : 'rgba(226, 232, 240, 0.3)'}
                  style={{ pointerEvents: 'none' }}
                >
                  {n.label.length > 26 ? n.label.slice(0, 24) + '…' : n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} /> Task Query
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} /> Source Document
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} /> Cited SOP / Equipment Reference
        </span>
      </div>
    </div>
  );
};