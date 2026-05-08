import { useEffect, useState } from 'react';
import { useProgress } from '../lib/progress';

interface Props {
  lessonIds: string[];
  label?: string;
}

export default function ProgressBar({ lessonIds, label = 'Progress' }: Props) {
  const [mounted, setMounted] = useState(false);
  const pathProgress = useProgress((s) => s.pathProgress);

  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="atlas-progress" aria-hidden="true">
        <div className="atlas-progress__label">
          <span>{label}</span>
          <span className="atlas-progress__count">— / {lessonIds.length}</span>
        </div>
        <div className="atlas-progress__track">
          <div className="atlas-progress__fill" style={{ width: '0%' }} />
        </div>
      </div>
    );
  }

  const { done, total, pct } = pathProgress(lessonIds);

  return (
    <div
      className="atlas-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={`${label}: ${done} of ${total} lessons complete`}
    >
      <div className="atlas-progress__label">
        <span>{label}</span>
        <span className="atlas-progress__count">
          {done} / {total} · {pct}%
        </span>
      </div>
      <div className="atlas-progress__track">
        <div className="atlas-progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <style>{`
        .atlas-progress { font-size: var(--atlas-fs-sm); }
        .atlas-progress__label {
          display: flex; justify-content: space-between; gap: 1rem;
          margin-bottom: 0.4rem; color: var(--sl-color-gray-3); font-weight: 500;
        }
        .atlas-progress__count { color: var(--sl-color-text-accent); font-weight: 600; }
        .atlas-progress__track {
          height: 8px; border-radius: 999px; background: var(--sl-color-gray-2); overflow: hidden;
        }
        .atlas-progress__fill {
          height: 100%;
          background: linear-gradient(90deg, var(--atlas-amber-400), var(--atlas-amber-500));
          transition: width 480ms cubic-bezier(0.2,0.65,0.2,1);
        }
      `}</style>
    </div>
  );
}
