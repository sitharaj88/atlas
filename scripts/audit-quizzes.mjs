#!/usr/bin/env node
// Static audit of every Quiz block in lesson MDX.
// Reports: missing fields, orphan answers, duplicate option values,
// answer that doesn't match an option, no-explanation, etc.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../src/content/docs/paths', import.meta.url).pathname;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (entry.endsWith('.mdx')) out.push(p);
  }
  return out;
}

// Extract <Quiz ... /> blocks. Walk forward from each <Quiz token, respecting
// JSX expression braces and string boundaries, until we hit the matching />
// that closes the tag (i.e. /> at brace-depth 0, outside any string).
function extractQuizBlocks(src) {
  const blocks = [];
  let pos = 0;
  while (true) {
    const start = src.indexOf('<Quiz', pos);
    if (start === -1) break;
    const next = src[start + 5];
    if (next && /[A-Za-z0-9_]/.test(next)) { pos = start + 5; continue; } // not the Quiz tag
    let i = start;
    let depth = 0;
    let inStr = null;
    let escaped = false;
    let end = -1;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (escaped) { escaped = false; continue; }
      if (inStr) {
        if (ch === '\\') { escaped = true; continue; }
        if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') { inStr = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      else if (depth === 0 && ch === '/' && src[i + 1] === '>') { end = i + 2; break; }
      else if (depth === 0 && ch === '>') { end = i + 1; break; }
    }
    if (end === -1) break;
    blocks.push({ raw: src.slice(start, end), offset: start });
    pos = end;
  }
  return blocks;
}

// Extract just the questions array literal text from a single Quiz block.
// Respects string boundaries so braces inside strings don't break depth counting.
function extractQuestionsArray(block) {
  const idx = block.indexOf('questions={');
  if (idx === -1) return null;
  let start = idx + 'questions='.length;
  if (block[start] !== '{') return null;
  let depth = 0;
  let i = start;
  let inStr = null; // ' " or `
  let escaped = false;
  for (; i < block.length; i++) {
    const ch = block[i];
    if (escaped) { escaped = false; continue; }
    if (inStr) {
      if (ch === '\\') { escaped = true; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { inStr = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  return block.slice(start + 1, i - 1).trim();
}

// Convert a JSX-style array literal to JSON-ish so we can eval it safely.
// The Quiz array uses single quotes, trailing commas, identifier keys, and
// occasional JS template literals. We do a permissive parse via Function.
function evalArray(text) {
  // Strip leading "[" and trailing "]" sanity
  const trimmed = text.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    throw new Error('not an array literal');
  }
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${trimmed});`)();
}

const issues = [];
let total = 0;
let totalQuestions = 0;

for (const file of walk(ROOT)) {
  const src = readFileSync(file, 'utf8');
  const blocks = extractQuizBlocks(src);
  if (!blocks.length) continue;
  for (const { raw } of blocks) {
    total++;
    const arr = extractQuestionsArray(raw);
    if (!arr) {
      issues.push({ file, kind: 'no-questions-prop', detail: '' });
      continue;
    }
    let questions;
    try {
      questions = evalArray(arr);
    } catch (e) {
      issues.push({ file, kind: 'parse-error', detail: e.message });
      continue;
    }
    if (!Array.isArray(questions) || !questions.length) {
      issues.push({ file, kind: 'empty-questions', detail: '' });
      continue;
    }
    for (const q of questions) {
      totalQuestions++;
      const qid = q?.id ?? '<no-id>';
      if (!q.id) issues.push({ file, kind: 'missing-id', detail: q.prompt });
      if (!q.prompt) issues.push({ file, kind: 'missing-prompt', detail: qid });
      if (!Array.isArray(q.options) || q.options.length < 2) {
        issues.push({ file, kind: 'too-few-options', detail: qid });
        continue;
      }
      const values = q.options.map((o) => o.value);
      const dup = values.filter((v, i) => values.indexOf(v) !== i);
      if (dup.length) issues.push({ file, kind: 'duplicate-option-values', detail: `${qid}: ${dup.join(', ')}` });
      for (const opt of q.options) {
        if (typeof opt.value !== 'string' || opt.value === '')
          issues.push({ file, kind: 'bad-option-value', detail: qid });
        if (typeof opt.label !== 'string' || opt.label === '')
          issues.push({ file, kind: 'bad-option-label', detail: `${qid}/${opt.value}` });
      }
      if (q.answer === undefined) {
        issues.push({ file, kind: 'missing-answer', detail: qid });
      } else if (q.type === 'multi') {
        if (!Array.isArray(q.answer) || !q.answer.length)
          issues.push({ file, kind: 'multi-needs-array-answer', detail: qid });
        else {
          const missing = q.answer.filter((a) => !values.includes(a));
          if (missing.length)
            issues.push({ file, kind: 'answer-not-in-options', detail: `${qid}: ${missing.join(', ')}` });
          if (new Set(q.answer).size !== q.answer.length)
            issues.push({ file, kind: 'duplicate-answer-values', detail: qid });
        }
      } else {
        if (typeof q.answer !== 'string')
          issues.push({ file, kind: 'single-needs-string-answer', detail: qid });
        else if (!values.includes(q.answer))
          issues.push({ file, kind: 'answer-not-in-options', detail: `${qid}: ${q.answer}` });
      }
      if (q.type && !['single', 'multi', 'true-false'].includes(q.type)) {
        issues.push({ file, kind: 'bad-type', detail: `${qid}: ${q.type}` });
      }
      if (q.type === 'true-false') {
        if (q.options.length !== 2)
          issues.push({ file, kind: 'true-false-needs-2-options', detail: qid });
      }
      if (!q.explanation) issues.push({ file, kind: 'missing-explanation', detail: qid });
    }
  }
}

const by = (k) => issues.filter((i) => i.kind === k);
const KINDS = [
  'parse-error',
  'no-questions-prop',
  'empty-questions',
  'missing-id',
  'missing-prompt',
  'too-few-options',
  'duplicate-option-values',
  'bad-option-value',
  'bad-option-label',
  'missing-answer',
  'multi-needs-array-answer',
  'single-needs-string-answer',
  'answer-not-in-options',
  'duplicate-answer-values',
  'true-false-needs-2-options',
  'bad-type',
  'missing-explanation',
];

console.log(`Scanned ${total} Quiz blocks across ${totalQuestions} questions`);
console.log('');
let hasFatal = false;
for (const kind of KINDS) {
  const list = by(kind);
  if (!list.length) continue;
  if (kind !== 'missing-explanation') hasFatal = true;
  console.log(`[${list.length}] ${kind}`);
  for (const it of list.slice(0, 30)) {
    console.log(`   ${relative(process.cwd(), it.file)}  →  ${it.detail}`);
  }
  if (list.length > 30) console.log(`   ... and ${list.length - 30} more`);
  console.log('');
}
if (!issues.length) console.log('No issues found.');
process.exit(hasFatal ? 1 : 0);
