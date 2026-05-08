import { useEffect, useState } from 'react';

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let pendingG = false;
    let pendingTimer: ReturnType<typeof setTimeout> | null = null;

    function isTypingTarget(t: EventTarget | null): boolean {
      if (!(t instanceof HTMLElement)) return false;
      if (t.isContentEditable) return true;
      const tag = t.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    }

    function go(href: string) {
      window.location.assign(href);
    }

    function find<T extends Element>(sel: string): T | null {
      return document.querySelector<T>(sel);
    }

    function focusSearch() {
      // Pagefind / Starlight built-in search dialog
      const button = find<HTMLButtonElement>('[data-open-modal]');
      if (button) {
        button.click();
        return;
      }
      // Fallback: any visible search input
      const input = find<HTMLInputElement>('input[type="search"]');
      if (input) input.focus();
    }

    function nextOrPrev(direction: 1 | -1) {
      // Starlight's pagination links are at the bottom of the article
      const sel =
        direction === 1 ? 'a[rel="next"], a.next-page' : 'a[rel="prev"], a.prev-page';
      const link = find<HTMLAnchorElement>(sel);
      if (link) link.click();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const k = e.key;

      // `?` opens help
      if (k === '?' || (e.shiftKey && k === '/')) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }

      // Escape closes help
      if (k === 'Escape') {
        if (open) {
          setOpen(false);
          e.preventDefault();
        }
        return;
      }

      // `/` focuses search
      if (k === '/') {
        e.preventDefault();
        focusSearch();
        return;
      }

      // `j` / `k` for next / previous lesson
      if (k === 'j') {
        nextOrPrev(1);
        return;
      }
      if (k === 'k') {
        nextOrPrev(-1);
        return;
      }

      // `g` then `h` / `p` for navigation
      if (k === 'g') {
        pendingG = true;
        if (pendingTimer) clearTimeout(pendingTimer);
        pendingTimer = setTimeout(() => {
          pendingG = false;
        }, 1000);
        return;
      }
      if (pendingG) {
        pendingG = false;
        if (pendingTimer) clearTimeout(pendingTimer);
        const base = (document.documentElement.dataset.atlasBase as string) || '';
        if (k === 'h') go(`${base}/`);
        else if (k === 'p') go(`${base}/paths/`);
        else if (k === 'r') go(`${base}/roadmaps/`);
        else if (k === 'c') go(`${base}/cheatsheets/`);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="atlas-shortcuts"
      role="dialog"
      aria-modal="true"
      aria-labelledby="atlas-shortcuts-title"
      onClick={(e) => {
        if (e.currentTarget === e.target) setOpen(false);
      }}
    >
      <div className="atlas-shortcuts__panel">
        <header>
          <h2 id="atlas-shortcuts-title">Keyboard shortcuts</h2>
          <button
            type="button"
            aria-label="Close"
            className="atlas-shortcuts__close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </header>
        <table>
          <tbody>
            <Row keys={['/']} description="Focus search" />
            <Row keys={['?']} description="Show this help" />
            <Row keys={['Esc']} description="Close any modal" />
            <Row keys={['j']} description="Next lesson" />
            <Row keys={['k']} description="Previous lesson" />
            <Row keys={['g', 'h']} description="Go to home" />
            <Row keys={['g', 'p']} description="Go to all paths" />
            <Row keys={['g', 'r']} description="Go to roadmaps" />
            <Row keys={['g', 'c']} description="Go to cheatsheets" />
          </tbody>
        </table>
      </div>
      <style>{`
        .atlas-shortcuts {
          position: fixed; inset: 0; z-index: 1000;
          display: grid; place-items: center;
          background: rgba(11, 27, 43, 0.55);
          backdrop-filter: blur(6px);
          padding: 1rem;
          animation: atlas-shortcuts-in 200ms cubic-bezier(0.2, 0.65, 0.2, 1);
        }
        @keyframes atlas-shortcuts-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .atlas-shortcuts__panel {
          width: min(34rem, 100%);
          background: var(--sl-color-bg);
          color: var(--sl-color-text);
          border: 1px solid var(--sl-color-hairline);
          border-radius: 18px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
          padding: 1.4rem 1.6rem 1.6rem;
        }
        .atlas-shortcuts__panel header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem;
        }
        .atlas-shortcuts__panel h2 { margin: 0; font-size: 1.2rem; }
        .atlas-shortcuts__close {
          background: transparent; border: 0; cursor: pointer;
          font-size: 1.2rem; color: var(--sl-color-gray-3);
        }
        .atlas-shortcuts__panel table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
        .atlas-shortcuts__panel td { padding: 0.45rem 0; vertical-align: middle; }
        .atlas-shortcuts__panel td:first-child { width: 8rem; }
        .atlas-shortcuts__panel kbd {
          display: inline-block;
          padding: 0.2em 0.55em;
          margin-right: 0.3em;
          border: 1px solid var(--sl-color-hairline-shade);
          border-bottom-width: 2px;
          border-radius: 6px;
          background: var(--sl-color-gray-7);
          font-family: var(--atlas-font-mono);
          font-size: 0.85em;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}

function Row({ keys, description }: { keys: string[]; description: string }) {
  return (
    <tr>
      <td>
        {keys.map((k) => (
          <kbd key={k}>{k}</kbd>
        ))}
      </td>
      <td>{description}</td>
    </tr>
  );
}
