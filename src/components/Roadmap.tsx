import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useState } from 'react';
import { useProgress } from '../lib/progress';
import { withBase } from '../lib/url';

type Group = 'core' | 'optional' | 'milestone';

interface RoadmapNode {
  id: string;
  label: string;
  description?: string;
  href?: string;
  lessonId?: string;
  position: { x: number; y: number };
  group?: Group;
}

interface Props {
  title?: string;
  nodes: RoadmapNode[];
  edges: { source: string; target: string; dashed?: boolean }[];
  height?: number;
}

interface NodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  href?: string;
  group: Group;
  done: boolean;
}

const GROUP_LABELS: Record<Group, string> = {
  milestone: 'Milestone',
  core: 'Core',
  optional: 'Optional',
};

function AtlasNode({ data }: NodeProps<Node<NodeData>>) {
  const { label, description, href, group, done } = data;
  const Wrapper: keyof JSX.IntrinsicElements = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href: withBase(href), 'aria-label': `${label}${done ? ' (completed)' : ''}` }
    : {};

  return (
    <div
      className={[
        'atlas-rm-node',
        `atlas-rm-node--${group}`,
        done && 'is-done',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Handle type="target" position={Position.Top} className="atlas-rm-handle" />
      <Wrapper className="atlas-rm-node__inner" {...wrapperProps}>
        <div className="atlas-rm-node__top">
          <span className="atlas-rm-node__group">{GROUP_LABELS[group]}</span>
          {done ? (
            <span className="atlas-rm-node__done" aria-hidden="true">
              ✓
            </span>
          ) : null}
        </div>
        <strong className="atlas-rm-node__title">{label}</strong>
        {description ? <span className="atlas-rm-node__desc">{description}</span> : null}
      </Wrapper>
      <Handle type="source" position={Position.Bottom} className="atlas-rm-handle" />
    </div>
  );
}

const nodeTypes = { atlas: AtlasNode };

export default function Roadmap({ nodes, edges, height = 620 }: Props) {
  const [mounted, setMounted] = useState(false);
  const completed = useProgress((s) => s.completed);
  useEffect(() => setMounted(true), []);

  const flowNodes: Node<NodeData>[] = useMemo(
    () =>
      nodes.map((n) => {
        const group: Group = n.group ?? 'core';
        const done = mounted && n.lessonId ? Boolean(completed[n.lessonId]) : false;
        return {
          id: n.id,
          type: 'atlas',
          position: n.position,
          data: {
            label: n.label,
            description: n.description,
            href: n.href,
            group,
            done,
          },
          draggable: false,
        };
      }),
    [nodes, completed, mounted],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((e, i) => ({
        id: `${e.source}-${e.target}-${i}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: Boolean(e.dashed),
        style: {
          stroke: e.dashed ? 'var(--atlas-teal-500, #2bb4a4)' : 'var(--atlas-roadmap-edge)',
          strokeWidth: e.dashed ? 1.5 : 1.8,
          strokeDasharray: e.dashed ? '6 6' : undefined,
        },
      })),
    [edges],
  );

  const stats = useMemo(() => {
    const total = nodes.filter((n) => n.lessonId).length;
    const doneCount = mounted
      ? nodes.filter((n) => n.lessonId && completed[n.lessonId]).length
      : 0;
    return { total, done: doneCount };
  }, [nodes, completed, mounted]);

  return (
    <div className="atlas-roadmap-shell">
      <header className="atlas-roadmap-shell__head">
        <ul className="atlas-roadmap-legend" aria-label="Node types">
          <li><span className="atlas-rm-dot atlas-rm-dot--milestone" aria-hidden="true" />Milestone</li>
          <li><span className="atlas-rm-dot atlas-rm-dot--core" aria-hidden="true" />Core</li>
          <li><span className="atlas-rm-dot atlas-rm-dot--optional" aria-hidden="true" />Optional</li>
          <li><span className="atlas-rm-dot atlas-rm-dot--done" aria-hidden="true" />Completed</li>
        </ul>
        {stats.total > 0 ? (
          <span className="atlas-roadmap-shell__progress" aria-live="polite">
            <span className="atlas-roadmap-shell__progress-value">
              {stats.done}/{stats.total}
            </span>
            <span className="atlas-roadmap-shell__progress-label">tracked lessons</span>
          </span>
        ) : null}
      </header>

      <div className="atlas-roadmap" style={{ height }}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          zoomOnScroll={false}
          panOnScroll
          minZoom={0.3}
          maxZoom={1.6}
        >
          <Background gap={26} size={1.2} color="var(--atlas-roadmap-dot)" />
          <MiniMap
            pannable
            zoomable
            maskColor="var(--atlas-roadmap-mask)"
            nodeColor={(node) => {
              const g = (node.data as NodeData | undefined)?.group ?? 'core';
              if (g === 'milestone') return 'var(--atlas-amber-500)';
              if (g === 'optional') return 'var(--atlas-teal-500, #2bb4a4)';
              return 'var(--atlas-navy-500, #1c3963)';
            }}
            nodeStrokeWidth={2}
          />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <p className="atlas-roadmap-shell__hint">
        Tip · drag to pan, scroll inside the canvas to navigate. Click any node to open its lesson.
      </p>

      <style>{`
        .atlas-roadmap-shell {
          --atlas-roadmap-edge: color-mix(in oklch, var(--sl-color-text) 28%, transparent);
          --atlas-roadmap-dot: color-mix(in oklch, var(--sl-color-text) 14%, transparent);
          --atlas-roadmap-mask: color-mix(in oklch, var(--sl-color-bg-sidebar) 88%, transparent);
          --atlas-rm-milestone: var(--atlas-amber-500, #F5B14A);
          --atlas-rm-core: var(--atlas-navy-500, #1c3963);
          --atlas-rm-optional: var(--atlas-teal-500, #2bb4a4);
          --atlas-rm-done: var(--atlas-leaf-500, #6abf6e);
          margin: 1.6rem 0 2.4rem;
        }
        :root[data-theme='dark'] .atlas-roadmap-shell {
          --atlas-rm-core: oklch(72% 0.1 235);
        }

        .atlas-roadmap-shell__head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.9rem 1.4rem;
          padding: 0.85rem 1rem;
          margin-bottom: 0.85rem;
          border: 1px solid var(--sl-color-hairline);
          border-radius: var(--atlas-radius-md, 12px);
          background: var(--sl-color-bg-sidebar);
        }
        .atlas-roadmap-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem 1rem;
          margin: 0;
          padding: 0;
          list-style: none;
          font-size: var(--atlas-fs-xs, 0.78rem);
          color: var(--sl-color-text);
        }
        .atlas-roadmap-legend li {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
        }
        .atlas-rm-dot {
          width: 0.65rem;
          height: 0.65rem;
          border-radius: 999px;
          display: inline-block;
        }
        .atlas-rm-dot--milestone {
          background: var(--atlas-rm-milestone);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--atlas-rm-milestone) 30%, transparent);
        }
        .atlas-rm-dot--core { background: var(--atlas-rm-core); }
        .atlas-rm-dot--optional {
          background: transparent;
          border: 1.5px dashed var(--atlas-rm-optional);
        }
        .atlas-rm-dot--done { background: var(--atlas-rm-done); }

        .atlas-roadmap-shell__progress {
          margin-left: auto;
          display: inline-flex;
          align-items: baseline;
          gap: 0.4rem;
          font-variant-numeric: tabular-nums;
        }
        .atlas-roadmap-shell__progress-value {
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--atlas-rm-milestone);
        }
        .atlas-roadmap-shell__progress-label {
          font-size: var(--atlas-fs-xs, 0.78rem);
          color: var(--sl-color-gray-3);
        }

        .atlas-roadmap {
          position: relative;
          border: 1px solid var(--sl-color-hairline);
          border-radius: var(--atlas-radius-lg, 16px);
          overflow: hidden;
          background:
            radial-gradient(circle at 0% 0%, color-mix(in oklch, var(--atlas-amber-500) 7%, transparent), transparent 55%),
            radial-gradient(circle at 100% 100%, color-mix(in oklch, var(--atlas-rm-optional) 7%, transparent), transparent 55%),
            var(--sl-color-bg-sidebar);
        }

        .atlas-roadmap-shell__hint {
          margin: 0.85rem 0 0;
          font-size: var(--atlas-fs-xs, 0.78rem);
          color: var(--sl-color-gray-3);
        }

        :global(.atlas-rm-handle) {
          opacity: 0;
          width: 6px;
          height: 6px;
          background: transparent;
          border: none;
          pointer-events: none;
        }

        :global(.atlas-rm-node) {
          position: relative;
          width: 232px;
          border-radius: 14px;
          padding: 1px;
          background: var(--atlas-rm-border, var(--sl-color-hairline));
          transition:
            transform 180ms ease,
            filter 180ms ease,
            box-shadow 180ms ease;
        }
        :global(.atlas-rm-node:hover) {
          transform: translateY(-2px);
          filter: drop-shadow(0 10px 18px color-mix(in oklch, var(--atlas-rm-accent, var(--sl-color-text)) 18%, transparent));
        }
        :global(.atlas-rm-node--milestone) {
          --atlas-rm-accent: var(--atlas-rm-milestone);
          --atlas-rm-border: linear-gradient(135deg,
            var(--atlas-amber-400, #F5B14A) 0%,
            var(--atlas-amber-600, #d8902b) 100%);
        }
        :global(.atlas-rm-node--core) {
          --atlas-rm-accent: var(--atlas-rm-core);
          --atlas-rm-border: color-mix(in oklch, var(--atlas-rm-core) 55%, var(--sl-color-hairline-shade));
        }
        :global(.atlas-rm-node--optional) {
          --atlas-rm-accent: var(--atlas-rm-optional);
          --atlas-rm-border: color-mix(in oklch, var(--atlas-rm-optional) 55%, var(--sl-color-hairline-shade));
        }
        :global(.atlas-rm-node.is-done) {
          --atlas-rm-accent: var(--atlas-rm-done);
          --atlas-rm-border: linear-gradient(135deg,
            color-mix(in oklch, var(--atlas-rm-done) 95%, white) 0%,
            var(--atlas-rm-done) 100%);
        }

        :global(.atlas-rm-node__inner) {
          display: block;
          padding: 0.75rem 0.9rem 0.85rem;
          border-radius: 13px;
          background: var(--sl-color-bg);
          color: var(--sl-color-text);
          text-decoration: none;
          line-height: 1.35;
          text-align: left;
        }
        :global(.atlas-rm-node--milestone .atlas-rm-node__inner) {
          background:
            linear-gradient(180deg,
              color-mix(in oklch, var(--atlas-rm-milestone) 9%, var(--sl-color-bg)) 0%,
              var(--sl-color-bg) 60%);
        }
        :global(.atlas-rm-node.is-done .atlas-rm-node__inner) {
          background:
            linear-gradient(180deg,
              color-mix(in oklch, var(--atlas-rm-done) 11%, var(--sl-color-bg)) 0%,
              var(--sl-color-bg) 60%);
        }

        :global(.atlas-rm-node__top) {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          margin-bottom: 0.3rem;
          font-size: 0.66rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--atlas-rm-accent);
          font-weight: 600;
        }
        :global(.atlas-rm-node__group) { line-height: 1; }
        :global(.atlas-rm-node__done) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: var(--atlas-rm-done);
          color: white;
          font-size: 0.7rem;
          line-height: 1;
        }
        :global(.atlas-rm-node__title) {
          display: block;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--sl-color-white, var(--sl-color-text));
          margin: 0;
        }
        :global(.atlas-rm-node__desc) {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.74rem;
          font-weight: 400;
          color: var(--sl-color-gray-3);
          line-height: 1.45;
        }
        :global(.atlas-rm-node__inner:hover .atlas-rm-node__title) {
          color: var(--atlas-rm-accent);
        }
        :global(.atlas-rm-node__inner:focus-visible) {
          outline: 2px solid var(--atlas-rm-accent);
          outline-offset: 3px;
        }

        :global(.react-flow__attribution) { display: none; }
        :global(.react-flow__edge-path) {
          stroke-linecap: round;
        }
        :global(.react-flow__controls) {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 6px 18px color-mix(in oklch, black 20%, transparent);
          border: 1px solid var(--sl-color-hairline);
        }
        :global(.react-flow__controls-button) {
          background: var(--sl-color-bg);
          border-bottom: 1px solid var(--sl-color-hairline);
          color: var(--sl-color-text);
          width: 30px;
          height: 30px;
        }
        :global(.react-flow__controls-button:hover) {
          background: var(--sl-color-gray-6);
          color: var(--atlas-rm-milestone);
        }
        :global(.react-flow__controls-button svg) { fill: currentColor; }
        :global(.react-flow__minimap) {
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--sl-color-hairline);
          background: var(--sl-color-bg);
        }

        @media (max-width: 48rem) {
          :global(.atlas-rm-node) { width: 200px; }
          :global(.atlas-rm-node__title) { font-size: 0.82rem; }
          :global(.atlas-rm-node__desc) { font-size: 0.7rem; }
          .atlas-roadmap-shell__progress { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}
