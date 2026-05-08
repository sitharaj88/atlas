import { useEffect, useState } from 'react';
import { useProgress } from '../lib/progress';
import { withBase } from '../lib/url';

interface Props {
  lessonId: string;
  lessonTitle: string;
  lessonHref: string;
  nextHref?: string;
  nextTitle?: string;
}

export default function LessonComplete({
  lessonId,
  lessonTitle,
  lessonHref,
  nextHref,
  nextTitle,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const completed = useProgress((s) => s.completed);
  const markComplete = useProgress((s) => s.markComplete);
  const markIncomplete = useProgress((s) => s.markIncomplete);
  const setLastVisited = useProgress((s) => s.setLastVisited);

  useEffect(() => {
    setMounted(true);
    setLastVisited({ id: lessonId, href: lessonHref, title: lessonTitle });
  }, [lessonId, lessonHref, lessonTitle, setLastVisited]);

  const isDone = mounted && Boolean(completed[lessonId]);

  return (
    <aside className="atlas-complete" aria-label="Lesson completion">
      <div className="atlas-complete__row">
        <label className="atlas-complete__check">
          <input
            type="checkbox"
            checked={isDone}
            disabled={!mounted}
            onChange={(e) => (e.target.checked ? markComplete(lessonId) : markIncomplete(lessonId))}
          />
          <span>{isDone ? 'Marked complete' : 'Mark this lesson complete'}</span>
        </label>
        {nextHref && (
          <a className="atlas-complete__next" href={withBase(nextHref)}>
            Next: {nextTitle ?? 'continue'} →
          </a>
        )}
      </div>
      <style>{`
        .atlas-complete {
          margin: 2.5rem 0 1rem;
          padding: 1.1rem 1.25rem;
          border: 1px solid var(--sl-color-hairline);
          border-radius: var(--atlas-radius-lg);
          background: var(--sl-color-bg-sidebar);
        }
        .atlas-complete__row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; flex-wrap: wrap;
        }
        .atlas-complete__check {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-weight: 600; color: var(--sl-color-text); cursor: pointer;
        }
        .atlas-complete__check input {
          width: 1.15rem; height: 1.15rem; accent-color: var(--atlas-amber-500);
        }
        .atlas-complete__next {
          color: var(--sl-color-text-accent); font-weight: 600; text-decoration: none;
        }
        .atlas-complete__next:hover { text-decoration: underline; }
      `}</style>
    </aside>
  );
}
