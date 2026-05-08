import { Sandpack } from '@codesandbox/sandpack-react';
import { atomDark, githubLight } from '@codesandbox/sandpack-themes';
import { useEffect, useState } from 'react';

type Template =
  | 'static'
  | 'react'
  | 'react-ts'
  | 'vue'
  | 'svelte'
  | 'vanilla'
  | 'vanilla-ts'
  | 'angular';

interface Props {
  template?: Template;
  files?: Record<string, string | { code: string; hidden?: boolean; active?: boolean }>;
  options?: {
    showConsole?: boolean;
    showLineNumbers?: boolean;
    showTabs?: boolean;
    editorHeight?: number;
    layout?: 'preview' | 'console' | 'tests';
  };
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const update = () =>
      setTheme((root.dataset.theme as 'light' | 'dark') ?? 'light');
    update();
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

export default function Playground({
  template = 'static',
  files,
  options = {},
}: Props) {
  const theme = useTheme();
  return (
    <div className="atlas-playground" aria-label="Interactive code playground">
      <Sandpack
        template={template}
        files={files}
        theme={theme === 'dark' ? atomDark : githubLight}
        options={{
          showLineNumbers: options.showLineNumbers ?? true,
          showTabs: options.showTabs ?? true,
          editorHeight: options.editorHeight ?? 360,
          showConsole: options.showConsole ?? false,
          showConsoleButton: true,
          wrapContent: true,
          classes: { 'sp-wrapper': 'atlas-sandpack' },
        }}
      />
      <style>{`
        .atlas-playground { margin: 1.5rem 0; }
        .atlas-playground :global(.atlas-sandpack) {
          border-radius: var(--atlas-radius-lg) !important;
          overflow: hidden;
          border: 1px solid var(--sl-color-hairline);
        }
      `}</style>
    </div>
  );
}
