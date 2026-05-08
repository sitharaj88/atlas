import { useMemo, useState } from 'react';
import { withBase } from '../lib/url';

interface Choice {
  label: string;
  weights: Record<string, number>;
}

interface Step {
  id: string;
  question: string;
  choices: Choice[];
}

const PATHS: Record<string, { title: string; href: string; reason: string }> = {
  foundations: {
    title: 'Foundations of the Web',
    href: '/paths/foundations/',
    reason: 'You\'ll start with the bedrock: HTTP, HTML, CSS, JS, and how browsers actually work.',
  },
  'modern-css': {
    title: 'Modern CSS & Design Systems',
    href: '/paths/modern-css/',
    reason: 'You can build pages — now level up layout, theming, and design tokens.',
  },
  typescript: {
    title: 'TypeScript Mastery',
    href: '/paths/typescript/',
    reason: 'Strong JS foundation? Types are the highest-leverage upgrade you can make.',
  },
  'frontend-frameworks': {
    title: 'Frontend Frameworks',
    href: '/paths/frontend-frameworks/',
    reason: 'Time to compose UI from components — React, Vue, Svelte, or Solid.',
  },
  'full-stack': {
    title: 'Full-Stack Web Development',
    href: '/paths/full-stack/',
    reason: 'You\'re ready to ship complete apps — backend, database, auth, and deploy.',
  },
  'performance-a11y-seo': {
    title: 'Performance, A11y & SEO',
    href: '/paths/performance-a11y-seo/',
    reason: 'Make what you ship fast, accessible, and discoverable.',
  },
  testing: {
    title: 'Testing & Quality',
    href: '/paths/testing/',
    reason: 'Stop fearing deploys. Build a safety net you trust.',
  },
  devops: {
    title: 'DevOps for Web Developers',
    href: '/paths/devops/',
    reason: 'CI/CD, deployment, and observability for shipping with confidence.',
  },
  frontier: {
    title: 'The Modern Frontier',
    href: '/paths/frontier/',
    reason: 'Edge runtimes, server components, AI integration — the cutting edge.',
  },
};

const STEPS: Step[] = [
  {
    id: 'level',
    question: 'How would you describe your current web dev experience?',
    choices: [
      {
        label: "I've never built a webpage before",
        weights: { foundations: 5 },
      },
      {
        label: 'I can build static pages, but I\'m fuzzy on JS',
        weights: { foundations: 3, 'modern-css': 2 },
      },
      {
        label: 'I write JS comfortably, want to grow',
        weights: { typescript: 3, 'frontend-frameworks': 2, 'modern-css': 1 },
      },
      {
        label: 'I\'ve shipped real apps, want to go deeper',
        weights: { 'full-stack': 2, 'performance-a11y-seo': 2, frontier: 2, testing: 1 },
      },
    ],
  },
  {
    id: 'goal',
    question: 'What\'s your main goal right now?',
    choices: [
      {
        label: 'Land my first dev job',
        weights: { foundations: 2, 'frontend-frameworks': 3, 'full-stack': 2 },
      },
      {
        label: 'Build a side project end-to-end',
        weights: { 'full-stack': 4, devops: 2, 'frontend-frameworks': 1 },
      },
      {
        label: 'Level up at my current job',
        weights: { typescript: 2, 'performance-a11y-seo': 2, testing: 2, devops: 1 },
      },
      {
        label: 'Stay current with the bleeding edge',
        weights: { frontier: 4, 'frontend-frameworks': 1, 'performance-a11y-seo': 1 },
      },
    ],
  },
  {
    id: 'pain',
    question: 'Which of these has bitten you most recently?',
    choices: [
      {
        label: '"I don\'t even know where to start"',
        weights: { foundations: 4 },
      },
      {
        label: 'CSS layout / design feels like guessing',
        weights: { 'modern-css': 4 },
      },
      {
        label: 'My code breaks in production',
        weights: { testing: 3, devops: 2, typescript: 1 },
      },
      {
        label: 'Things work but feel slow / inaccessible',
        weights: { 'performance-a11y-seo': 4 },
      },
    ],
  },
];

export default function StartQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const choose = (idx: number) => {
    const next = [...answers];
    next[step] = idx;
    setAnswers(next);
    setStep(step + 1);
  };

  const recommendation = useMemo(() => {
    if (answers.length < STEPS.length) return null;
    const scores: Record<string, number> = {};
    STEPS.forEach((s, i) => {
      const choice = s.choices[answers[i]];
      if (!choice) return;
      for (const [k, v] of Object.entries(choice.weights)) {
        scores[k] = (scores[k] ?? 0) + v;
      }
    });
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [topId] = sorted[0] ?? [];
    const top = PATHS[topId];
    const runners = sorted.slice(1, 3).map(([id]) => PATHS[id]).filter(Boolean);
    return { top, runners };
  }, [answers]);

  const reset = () => {
    setStep(0);
    setAnswers([]);
  };

  if (recommendation && recommendation.top) {
    return (
      <section className="atlas-startquiz atlas-startquiz--result">
        <span className="atlas-pill">Recommended path</span>
        <h3>{recommendation.top.title}</h3>
        <p>{recommendation.top.reason}</p>
        <div className="atlas-startquiz__cta">
          <a className="atlas-btn" href={withBase(recommendation.top.href)}>
            Start this path →
          </a>
          <button className="atlas-btn atlas-btn--ghost" type="button" onClick={reset}>
            Retake quiz
          </button>
        </div>
        {recommendation.runners.length > 0 && (
          <>
            <p className="atlas-startquiz__alt">Also worth a look:</p>
            <ul>
              {recommendation.runners.map((r) =>
                r ? (
                  <li key={r.href}>
                    <a href={withBase(r.href)}>{r.title}</a> — {r.reason}
                  </li>
                ) : null,
              )}
            </ul>
          </>
        )}
        <Style />
      </section>
    );
  }

  const current = STEPS[step];
  if (!current) return null;

  return (
    <section className="atlas-startquiz">
      <header className="atlas-startquiz__head">
        <span className="atlas-pill">
          Question {step + 1} of {STEPS.length}
        </span>
      </header>
      <h3>{current.question}</h3>
      <ul className="atlas-startquiz__choices">
        {current.choices.map((c, i) => (
          <li key={c.label}>
            <button type="button" onClick={() => choose(i)} className="atlas-startquiz__choice">
              {c.label}
            </button>
          </li>
        ))}
      </ul>
      <Style />
    </section>
  );
}

function Style() {
  return (
    <style>{`
      .atlas-startquiz {
        margin: 1.5rem 0;
        padding: 1.6rem;
        border: 1px solid var(--sl-color-hairline);
        border-radius: var(--atlas-radius-lg);
        background: var(--sl-color-bg-sidebar);
      }
      .atlas-startquiz h3 { margin: 0.6rem 0 1rem; font-size: var(--atlas-fs-xl); }
      .atlas-startquiz__choices { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
      .atlas-startquiz__choice {
        width: 100%; text-align: left;
        padding: 0.85rem 1rem;
        border: 1px solid var(--sl-color-hairline);
        border-radius: var(--atlas-radius-md);
        background: var(--sl-color-bg);
        color: var(--sl-color-text);
        cursor: pointer;
        font-size: var(--atlas-fs-base);
        transition: border-color 200ms, background 200ms, transform 100ms;
      }
      .atlas-startquiz__choice:hover {
        border-color: var(--atlas-amber-400);
        background: var(--sl-color-accent-low);
      }
      .atlas-startquiz__choice:active { transform: translateY(1px); }
      .atlas-startquiz__cta {
        display: flex; gap: 0.6rem; flex-wrap: wrap; margin: 1rem 0 1.5rem;
      }
      .atlas-startquiz__alt {
        font-weight: 600; color: var(--sl-color-text-accent);
        margin: 1rem 0 0.5rem;
      }
      .atlas-startquiz--result ul { padding-left: 1.2rem; }
      .atlas-startquiz--result li { margin: 0.4rem 0; }
    `}</style>
  );
}
