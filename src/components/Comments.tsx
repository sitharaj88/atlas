import Giscus from '@giscus/react';
import { useEffect, useState } from 'react';

interface Props {
  /** Override per-page if needed; defaults are pulled from public env. */
  repo?: `${string}/${string}`;
  repoId?: string;
  category?: string;
  categoryId?: string;
}

export default function Comments({
  repo = 'sitharaj88/atlas',
  repoId,
  category = 'General',
  categoryId,
}: Props) {
  const [theme, setTheme] = useState<'light' | 'dark_dimmed'>('light');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const update = () => {
      const t = document.documentElement.dataset.theme;
      setTheme(t === 'dark' ? 'dark_dimmed' : 'light');
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  // Without repoId/categoryId Giscus shows a configuration prompt only the maintainer sees.
  // Hide the section entirely if not configured to keep the page clean.
  if (!repoId || !categoryId) {
    return (
      <section className="atlas-comments atlas-comments--placeholder">
        <h2>Discussion</h2>
        <p className="atlas-mute">
          Comments are powered by{' '}
          <a href="https://giscus.app" rel="noopener">
            Giscus
          </a>{' '}
          and GitHub Discussions. To enable, configure{' '}
          <code>GISCUS_REPO_ID</code> and <code>GISCUS_CATEGORY_ID</code> at{' '}
          <a href="https://giscus.app">giscus.app</a> and add them to{' '}
          <code>src/components/Comments.tsx</code>.
        </p>
        <style>{`
          .atlas-comments {
            margin: 3rem 0 1rem;
            padding-top: 2rem;
            border-top: 1px solid var(--sl-color-hairline);
          }
          .atlas-comments h2 { font-size: 1.3rem; margin: 0 0 0.6rem; }
          .atlas-comments--placeholder p { font-size: 0.9rem; }
        `}</style>
      </section>
    );
  }

  return (
    <section className="atlas-comments">
      <h2>Discussion</h2>
      <Giscus
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="en"
        loading="lazy"
      />
      <style>{`
        .atlas-comments {
          margin: 3rem 0 1rem;
          padding-top: 2rem;
          border-top: 1px solid var(--sl-color-hairline);
        }
        .atlas-comments h2 { font-size: 1.3rem; margin: 0 0 0.6rem; }
      `}</style>
    </section>
  );
}
