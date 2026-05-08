#!/usr/bin/env node
// Cross-cutting content audit:
//   1. Broken internal lesson links (`/paths/.../`)
//   2. Stale Web Vital thresholds (LCP ≠ 2.5s, INP ≠ 200ms, CLS ≠ 0.1)
//   3. Deprecated React patterns in code blocks
//   4. Common typos / outdated facts

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DOCS = new URL('../src/content/docs', import.meta.url).pathname;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (entry.endsWith('.mdx') || entry.endsWith('.md')) out.push(p);
  }
  return out;
}

// Build an index of every available route (file-system → URL).
function fileToRoute(file) {
  // /src/content/docs/paths/foo/bar.mdx → /paths/foo/bar/
  const rel = relative(DOCS, file).replace(/\.mdx?$/, '');
  if (rel === 'index') return '/';
  if (rel.endsWith('/index')) return '/' + rel.slice(0, -'/index'.length) + '/';
  return '/' + rel + '/';
}

const allFiles = walk(DOCS);
const routes = new Set(allFiles.map(fileToRoute));

const issues = [];

// 1. Broken internal links — only the canonical /paths/... and /reference/... etc.
const LINK_RE = /\((\/[a-z0-9][a-z0-9\-/]*\/)\)/gi;
const HREF_RE = /href="(\/[a-z0-9][a-z0-9\-/]*\/?)"/gi;

const STATIC_OK = new Set([
  '/', '/start/', '/contribute/', '/about/', '/blog/', '/playground/',
  '/cheatsheets/', '/glossary/', '/projects/', '/reference/', '/roadmaps/',
  '/paths/',
]);

function checkLinks(file, src) {
  const seen = new Set();
  for (const re of [LINK_RE, HREF_RE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      let url = m[1];
      if (!url.endsWith('/')) url += '/';
      if (seen.has(url)) continue;
      seen.add(url);
      // skip anchors, query
      if (url.includes('#')) url = url.split('#')[0];
      // skip non-doc links (assets, /api/, /og/)
      if (!url.startsWith('/paths/') && !url.startsWith('/reference/') &&
          !url.startsWith('/cheatsheets/') && !url.startsWith('/roadmaps/') &&
          !url.startsWith('/projects/') && !url.startsWith('/glossary/') &&
          !STATIC_OK.has(url)) continue;
      if (!routes.has(url) && !STATIC_OK.has(url)) {
        issues.push({ file, kind: 'broken-link', detail: url });
      }
    }
  }
}

// 2. Web Vital threshold sanity
function checkVitals(file, src) {
  // Look for LCP claims and check the number near them
  const lcpClaims = src.match(/LCP[^.\n]{0,80}?(\d+(?:\.\d+)?)\s*(?:s|seconds)/gi) ?? [];
  for (const c of lcpClaims) {
    const num = parseFloat(c.match(/(\d+(?:\.\d+)?)/)[1]);
    // accept 2.5 (good threshold) and 4 (poor threshold). Anything else is suspect.
    if (num !== 2.5 && num !== 4) {
      issues.push({ file, kind: 'lcp-suspicious', detail: c.trim() });
    }
  }
  const inpClaims = src.match(/INP[^.\n]{0,80}?(\d+)\s*ms/gi) ?? [];
  for (const c of inpClaims) {
    const num = parseInt(c.match(/(\d+)/)[1], 10);
    if (num !== 200 && num !== 500) {
      issues.push({ file, kind: 'inp-suspicious', detail: c.trim() });
    }
  }
  const clsClaims = src.match(/CLS[^.\n]{0,80}?(\d+\.\d+)/gi) ?? [];
  for (const c of clsClaims) {
    const num = parseFloat(c.match(/(\d+\.\d+)/)[1]);
    if (num !== 0.1 && num !== 0.25) {
      issues.push({ file, kind: 'cls-suspicious', detail: c.trim() });
    }
  }
}

// 3. Deprecated React patterns
function checkReact(file, src) {
  const PATTERNS = [
    [/componentWillMount\b/, 'componentWillMount (use componentDidMount or hooks)'],
    [/componentWillReceiveProps\b/, 'componentWillReceiveProps (use getDerivedStateFromProps)'],
    [/componentWillUpdate\b/, 'componentWillUpdate (use getSnapshotBeforeUpdate)'],
    [/React\.createClass\b/, 'React.createClass (use class or function components)'],
    [/PropTypes\.\w+/, 'PropTypes (use TypeScript)'],
    [/\bdefaultProps\s*=/, 'defaultProps on function components (deprecated; use default args)'],
  ];
  for (const [re, msg] of PATTERNS) {
    if (re.test(src)) issues.push({ file, kind: 'deprecated-react', detail: msg });
  }
}

// 4. Misc footguns
function checkMisc(file, src) {
  if (/\bvar\s+[a-z_]/i.test(src) && /```\s*ts/i.test(src)) {
    // Only flag in TS code blocks — `var` is rarely intentional in modern TS
    const tsBlocks = src.match(/```ts[\s\S]*?```/g) ?? [];
    for (const b of tsBlocks) {
      if (/\bvar\s+[a-z_]/i.test(b)) {
        issues.push({ file, kind: 'var-in-ts', detail: 'TS code block uses `var`' });
        break;
      }
    }
  }
  // npm install -g for things that should be local
  if (/npm\s+install\s+-g\s+(?:vite|astro|next|playwright|vitest)/i.test(src)) {
    issues.push({ file, kind: 'global-install-suspect', detail: 'Suggests global install of a tool that should be local' });
  }
}

for (const file of allFiles) {
  const src = readFileSync(file, 'utf8');
  checkLinks(file, src);
  checkVitals(file, src);
  checkReact(file, src);
  checkMisc(file, src);
}

const KINDS = [
  'broken-link', 'lcp-suspicious', 'inp-suspicious', 'cls-suspicious',
  'deprecated-react', 'var-in-ts', 'global-install-suspect',
];

console.log(`Scanned ${allFiles.length} content files. Found ${issues.length} issues.`);
console.log('');
for (const k of KINDS) {
  const list = issues.filter((i) => i.kind === k);
  if (!list.length) continue;
  console.log(`[${list.length}] ${k}`);
  const groups = new Map();
  for (const i of list) {
    const key = relative(process.cwd(), i.file);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i.detail);
  }
  for (const [f, dets] of groups) {
    console.log(`   ${f}`);
    for (const d of dets.slice(0, 4)) console.log(`      • ${d}`);
    if (dets.length > 4) console.log(`      ... and ${dets.length - 4} more`);
  }
  console.log('');
}
