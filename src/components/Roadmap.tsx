import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useState } from 'react';
import { useProgress } from '../lib/progress';
import { withBase } from '../lib/url';

interface RoadmapNode {
  id: string;
  label: string;
  description?: string;
  href?: string;
  lessonId?: string;
  position: { x: number; y: number };
  group?: 'core' | 'optional' | 'milestone';
}

interface Props {
  title?: string;
  nodes: RoadmapNode[];
  edges: { source: string; target: string; dashed?: boolean }[];
  height?: number;
}

export default function Roadmap({ nodes, edges, height = 560 }: Props) {
  const [mounted, setMounted] = useState(false);
  const completed = useProgress((s) => s.completed);
  useEffect(() => setMounted(true), []);

  const flowNodes: Node[] = nodes.map((n) => {
    const done = mounted && n.lessonId ? Boolean(completed[n.lessonId]) : false;
    const accent =
      n.group === 'milestone' ? '#F5B14A' : n.group === 'optional' ? '#2bb4a4' : '#1c3963';
    return {
      id: n.id,
      type: 'default',
      position: n.position,
      data: {
        label: (
          <a
            href={n.href ? withBase(n.href) : '#'}
            className="atlas-roadmap-node"
            aria-label={`${n.label}${done ? ' (completed)' : ''}`}
          >
            <strong>{done ? '✓ ' : ''}{n.label}</strong>
            {n.description ? <span>{n.description}</span> : null}
          </a>
        ),
      },
      style: {
        padding: 0,
        background: 'transparent',
        border: `2px solid ${done ? '#6abf6e' : accent}`,
        borderRadius: 14,
        boxShadow: '0 4px 14px rgba(11,27,43,0.08)',
        width: 220,
      },
    };
  });

  const flowEdges: Edge[] = edges.map((e, i) => ({
    id: `${e.source}-${e.target}-${i}`,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: 'var(--sl-color-gray-3)',
      strokeWidth: 1.4,
      strokeDasharray: e.dashed ? '5 5' : undefined,
    },
  }));

  return (
    <div className="atlas-roadmap" style={{ height }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        zoomOnScroll={false}
        panOnScroll
      >
        <Background gap={24} size={1} color="var(--sl-color-hairline)" />
        <MiniMap pannable zoomable />
        <Controls showInteractive={false} />
      </ReactFlow>
      <style>{`
        .atlas-roadmap {
          margin: 1.5rem 0;
          border: 1px solid var(--sl-color-hairline);
          border-radius: var(--atlas-radius-lg);
          overflow: hidden;
          background: var(--sl-color-bg-sidebar);
        }
        :global(.atlas-roadmap-node) {
          display: block; padding: 0.7rem 0.9rem; text-decoration: none;
          color: var(--sl-color-text); font-size: var(--atlas-fs-sm); line-height: 1.3;
        }
        :global(.atlas-roadmap-node strong) { display: block; margin-bottom: 0.2rem; }
        :global(.atlas-roadmap-node span) {
          display: block; font-weight: 400; color: var(--sl-color-gray-3); font-size: 0.78rem;
        }
        :global(.atlas-roadmap-node:hover strong) { color: var(--sl-color-text-accent); }
        :global(.react-flow__attribution) { display: none; }
      `}</style>
    </div>
  );
}
