import { useEffect, useMemo, useState } from 'react';
import { useProgress } from '../lib/progress';

export interface QuizQuestion {
  id: string;
  prompt: string;
  type?: 'single' | 'multi' | 'true-false';
  options: { value: string; label: string }[];
  answer: string | string[];
  explanation?: string;
}

interface Props {
  lessonId: string;
  questions: QuizQuestion[];
  title?: string;
}

function eq(a: string | string[], b: string | string[]): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const A = [...a].sort();
    const B = [...b].sort();
    return A.every((v, i) => v === B[i]);
  }
  return a === b;
}

export default function Quiz({ questions, title = 'Check your understanding' }: Props) {
  const [mounted, setMounted] = useState(false);
  const recordQuiz = useProgress((s) => s.recordQuiz);
  const stored = useProgress((s) => s.quiz);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydrate from store on mount
  useEffect(() => {
    if (!mounted) return;
    const initial: Record<string, string | string[]> = {};
    const rev: Record<string, boolean> = {};
    for (const q of questions) {
      const prior = stored[q.id];
      if (prior) {
        initial[q.id] = prior.selected;
        rev[q.id] = true;
      }
    }
    setAnswers(initial);
    setRevealed(rev);
    // We intentionally only run on mount; the store is the source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const score = useMemo(() => {
    const right = questions.filter((q) => {
      const a = answers[q.id];
      if (a === undefined) return false;
      return eq(a, q.answer);
    }).length;
    return { right, total: questions.length };
  }, [answers, questions]);

  const select = (q: QuizQuestion, value: string) => {
    if (q.type === 'multi') {
      const cur = (answers[q.id] as string[] | undefined) ?? [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      setAnswers((s) => ({ ...s, [q.id]: next }));
    } else {
      setAnswers((s) => ({ ...s, [q.id]: value }));
    }
  };

  const check = (q: QuizQuestion) => {
    const a = answers[q.id];
    if (a === undefined) return;
    const correct = eq(a, q.answer);
    recordQuiz({ questionId: q.id, selected: a, correct, at: Date.now() });
    setRevealed((s) => ({ ...s, [q.id]: true }));
  };

  return (
    <section className="atlas-quiz" aria-label={title}>
      <header className="atlas-quiz__header">
        <h3>{title}</h3>
        <span className="atlas-pill atlas-quiz__score" aria-label={`Score ${score.right} of ${score.total}`}>
          <span className="atlas-quiz__score-label">Quiz</span>
          <span className="atlas-quiz__score-divider" aria-hidden="true">·</span>
          <span className="atlas-quiz__score-value">{score.right}<span className="atlas-quiz__score-sep" aria-hidden="true">/</span>{score.total}</span>
        </span>
      </header>

      <ol className="atlas-quiz__list">
        {questions.map((q, i) => {
          const a = answers[q.id];
          const isRevealed = revealed[q.id];
          const isMulti = q.type === 'multi';
          const isCorrect = a !== undefined && eq(a, q.answer);
          return (
            <li key={q.id} className="atlas-quiz__q">
              <p className="atlas-quiz__prompt">
                <strong>{i + 1}.</strong> {q.prompt}
              </p>
              <ul className="atlas-quiz__options" role="group">
                {q.options.map((opt) => {
                  const checked = isMulti
                    ? Array.isArray(a) && a.includes(opt.value)
                    : a === opt.value;
                  return (
                    <li key={opt.value}>
                      <label
                        className={[
                          'atlas-quiz__opt',
                          checked && 'is-checked',
                          isRevealed && opt.value === q.answer && 'is-answer',
                          isRevealed &&
                            isMulti &&
                            Array.isArray(q.answer) &&
                            q.answer.includes(opt.value) &&
                            'is-answer',
                          isRevealed && checked && !isCorrect && 'is-wrong',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <input
                          type={isMulti ? 'checkbox' : 'radio'}
                          name={q.id}
                          value={opt.value}
                          checked={checked}
                          disabled={!mounted || isRevealed}
                          onChange={() => select(q, opt.value)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <div className="atlas-quiz__row">
                {!isRevealed ? (
                  <button
                    className="atlas-btn atlas-btn--ghost atlas-quiz__btn"
                    type="button"
                    disabled={a === undefined}
                    onClick={() => check(q)}
                  >
                    Check answer
                  </button>
                ) : (
                  <p className={`atlas-quiz__feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`} role="status">
                    {isCorrect ? '✓ Correct.' : '✗ Not quite.'}
                    {q.explanation ? ` ${q.explanation}` : ''}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <style>{`
        .atlas-quiz {
          margin: 2.5rem 0;
          padding: 1.5rem;
          border: 1px solid var(--sl-color-hairline);
          border-radius: var(--atlas-radius-lg);
          background: var(--sl-color-bg-sidebar);
        }
        .atlas-quiz__header {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .atlas-quiz__header h3 {
          margin: 0;
          font-size: var(--atlas-fs-lg);
          line-height: 1.3;
          flex: 1 1 auto;
          min-width: 0;
        }
        .atlas-quiz__score {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          flex: 0 0 auto;
          font-variant-numeric: tabular-nums;
        }
        .atlas-quiz__score-divider {
          opacity: 0.5;
        }
        .atlas-quiz__score-value {
          font-weight: 600;
          color: var(--sl-color-text);
        }
        .atlas-quiz__score-sep {
          margin: 0 0.1rem;
          opacity: 0.5;
          font-weight: 400;
        }
        .atlas-quiz__list { list-style: none; padding: 0; margin: 1.2rem 0 0; }
        .atlas-quiz__q { padding: 1rem 0; border-top: 1px dashed var(--sl-color-hairline-light); }
        .atlas-quiz__q:first-child { border-top: 0; padding-top: 0.4rem; }
        .atlas-quiz__prompt { margin: 0 0 0.7rem; line-height: 1.55; }
        .atlas-quiz__options { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.45rem; }
        .atlas-quiz__opt {
          display: flex;
          gap: 0.7rem;
          align-items: center;
          padding: 0.7rem 0.9rem;
          border: 1px solid var(--sl-color-hairline);
          border-radius: var(--atlas-radius-md);
          cursor: pointer;
          background: transparent;
          line-height: 1.5;
          transition:
            background var(--atlas-dur-fast),
            border-color var(--atlas-dur-fast),
            box-shadow var(--atlas-dur-fast);
        }
        .atlas-quiz__opt:hover {
          background: var(--sl-color-gray-6);
          border-color: var(--sl-color-hairline-shade);
        }
        .atlas-quiz__opt:has(input:focus-visible) {
          outline: 2px solid var(--atlas-amber-400);
          outline-offset: 2px;
        }
        .atlas-quiz__opt:has(input:disabled) {
          cursor: default;
        }
        .atlas-quiz__opt:has(input:disabled):hover {
          background: transparent;
          border-color: var(--sl-color-hairline);
        }
        .atlas-quiz__opt input {
          margin: 0;
          flex-shrink: 0;
          width: 1.05rem;
          height: 1.05rem;
          accent-color: var(--atlas-amber-500);
          cursor: inherit;
        }
        .atlas-quiz__opt > span {
          flex: 1;
          min-width: 0;
        }
        .atlas-quiz__opt.is-checked {
          border-color: var(--atlas-amber-400);
          background: oklch(72% 0.18 65 / 0.08);
        }
        .atlas-quiz__opt.is-answer {
          border-color: var(--atlas-leaf-500);
          background: oklch(68% 0.16 145 / 0.12);
        }
        .atlas-quiz__opt.is-wrong {
          border-color: var(--atlas-rose-500);
          background: oklch(68% 0.18 20 / 0.12);
        }
        .atlas-quiz__row { margin-top: 0.9rem; }
        .atlas-quiz__btn { font-size: var(--atlas-fs-sm); }
        .atlas-quiz__feedback {
          margin: 0;
          padding: 0.7rem 0.9rem;
          border-radius: var(--atlas-radius-md);
          font-size: var(--atlas-fs-sm);
          line-height: 1.55;
        }
        .atlas-quiz__feedback.is-correct {
          background: oklch(68% 0.16 145 / 0.15);
          color: oklch(38% 0.1 145);
        }
        :root[data-theme='dark'] .atlas-quiz__feedback.is-correct {
          color: oklch(82% 0.14 145);
        }
        .atlas-quiz__feedback.is-wrong {
          background: oklch(68% 0.18 20 / 0.13);
          color: oklch(40% 0.14 20);
        }
        :root[data-theme='dark'] .atlas-quiz__feedback.is-wrong {
          color: oklch(82% 0.13 20);
        }
      `}</style>
    </section>
  );
}
