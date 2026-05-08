import { useEffect, useRef, useState } from 'react';

interface Props {
  /** Raw Mermaid source. */
  code: string;
  /** Caption shown below the diagram. */
  caption?: string;
}

let counter = 0;
const nextId = () => `atlas-mermaid-${++counter}`;

export default function Mermaid({ code, caption }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        const isDark = document.documentElement.dataset.theme === 'dark';
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          themeVariables: isDark
            ? { primaryColor: '#142b4c', primaryTextColor: '#ecf0f7', lineColor: '#8e9bbb' }
            : { primaryColor: '#fff8ec', primaryTextColor: '#0b1b2b', lineColor: '#3d4f74' },
          fontFamily:
            "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        });
        const id = nextId();
        const { svg } = await mermaid.render(id, code);
        if (!cancelled) setSvg(svg);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Diagram error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <figure className="atlas-mermaid">
      {svg ? (
        <div ref={ref} className="atlas-mermaid__svg" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : err ? (
        <pre className="atlas-mermaid__err">{err}\n\n{code}</pre>
      ) : (
        <pre className="atlas-mermaid__loading">{code}</pre>
      )}
      {caption && <figcaption>{caption}</figcaption>}
      <style>{`
        .atlas-mermaid {
          margin: 1.4rem 0;
          padding: 1.2rem;
          border: 1px solid var(--sl-color-hairline);
          border-radius: var(--atlas-radius-lg);
          background: var(--sl-color-bg-sidebar);
          text-align: center;
        }
        .atlas-mermaid__svg :global(svg) {
          max-width: 100%;
          height: auto;
        }
        .atlas-mermaid__loading,
        .atlas-mermaid__err {
          margin: 0;
          padding: 0.8rem;
          background: transparent;
          color: var(--sl-color-gray-3);
          font-size: 0.85rem;
          white-space: pre-wrap;
          text-align: left;
        }
        .atlas-mermaid figcaption {
          margin-top: 0.7rem;
          font-size: 0.85rem;
          color: var(--sl-color-gray-3);
        }
      `}</style>
    </figure>
  );
}
