import { useEffect, useState } from 'react';
import { useProgress } from '../lib/progress';
import { withBase } from '../lib/url';

export default function ResumeBanner() {
  const [mounted, setMounted] = useState(false);
  const last = useProgress((s) => s.lastVisited);
  const completed = useProgress((s) => s.completed);

  useEffect(() => setMounted(true), []);
  if (!mounted || !last) return null;

  const total = Object.keys(completed).length;

  return (
    <a className="atlas-resume" href={withBase(last.href)}>
      <span className="atlas-resume__pill">Resume</span>
      <span className="atlas-resume__title">{last.title}</span>
      <span className="atlas-resume__meta">
        {total > 0 ? `${total} lesson${total === 1 ? '' : 's'} completed` : 'Last visited'} →
      </span>
      <style>{`
        .atlas-resume {
          display: inline-flex; align-items: center; gap: 0.7rem;
          padding: 0.6rem 1rem;
          border: 1px solid var(--sl-color-hairline);
          border-radius: var(--atlas-radius-pill);
          background: var(--sl-color-bg-sidebar);
          color: var(--sl-color-text);
          text-decoration: none;
          font-size: var(--atlas-fs-sm);
          transition: border-color 240ms;
        }
        .atlas-resume:hover { border-color: var(--atlas-amber-400); }
        .atlas-resume__pill {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--sl-color-text-accent);
          background: var(--sl-color-accent-low);
          padding: 0.2rem 0.55rem; border-radius: 999px;
        }
        .atlas-resume__title { font-weight: 600; }
        .atlas-resume__meta { color: var(--sl-color-gray-3); }
      `}</style>
    </a>
  );
}
