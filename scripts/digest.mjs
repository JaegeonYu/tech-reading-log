#!/usr/bin/env node
// 열린 reading 이슈를 모아 posts/<ISO주차>.md 초안과 PR 본문을 만든다.
// 사용법: node scripts/digest.mjs [--dry-run] [--week 2026-W42] [--fixture issues.json] [--no-llm] [--pr-body path]
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import Anthropic from '@anthropic-ai/sdk';
import {
  DEFAULT_MODEL,
  createGitHub,
  generateSummary,
  isoWeekKST,
  parseWeek,
  renderPost,
  renderPrBody,
  selectStale,
  selectTargets,
  toItem,
} from './lib.mjs';

const { values: args } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    week: { type: 'string' },
    fixture: { type: 'string' },
    'no-llm': { type: 'boolean', default: false },
    'pr-body': { type: 'string' },
  },
});

function setOutput(outputs) {
  if (!process.env.GITHUB_OUTPUT) return;
  appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(outputs).map(([k, v]) => `${k}=${v}\n`).join(''));
}

async function main() {
  const week = args.week || isoWeekKST();
  if (!parseWeek(week)) throw new Error(`잘못된 주차 형식: ${week} (예: 2026-W42)`);

  let github = null;
  let issues;
  if (args.fixture) {
    issues = JSON.parse(readFileSync(args.fixture, 'utf8'));
  } else {
    const { GITHUB_TOKEN: token, GITHUB_REPOSITORY: repo } = process.env;
    if (!token || !repo) throw new Error('GITHUB_TOKEN과 GITHUB_REPOSITORY 환경변수가 필요합니다 (로컬에서는 --fixture 사용)');
    github = createGitHub({ token, repo });
    issues = await github.listReadingIssues();
  }

  const postPath = join('posts', `${week}.md`);
  if (existsSync(postPath)) {
    // 기본 브랜치에 이미 발행된 주차는 덮어쓰지 않는다. 남은 기록은 다음 주에 모인다.
    console.log(`${postPath}가 이미 있어 건너뜀 (이미 발행된 주차)`);
    setOutput({ count: 0, week });
    return;
  }

  const items = [];
  const warnings = selectStale(issues, week).map(
    (i) => `#${i.number}: 지난 주차(${i.milestone.title}) milestone이 붙은 채 열려 있음 — milestone을 지우면 다음 실행에 포함됨`,
  );
  for (const issue of selectTargets(issues, week)) {
    const item = toItem(issue);
    if (item.error) warnings.push(`#${issue.number}: ${item.error} — 건너뜀`);
    else items.push(item);
  }
  items.sort((a, b) => a.number - b.number); // API는 최신순으로 주므로 기록한 순서로 되돌린다
  warnings.forEach((w) => console.warn(`warning: ${w}`));

  if (!items.length) {
    console.log(`no new readings (${week})`);
    setOutput({ count: 0, week });
    return;
  }

  let summary = null;
  if (!args['no-llm']) {
    try {
      summary = await generateSummary(new Anthropic(), items, { model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL });
    } catch (err) {
      warnings.push(`⚠️ 총평 생성 실패: ${err.message}`);
      console.warn(`warning: 총평 생성 실패: ${err.message}`);
    }
  }

  const post = renderPost({ week, items, summary });
  const prBody = renderPrBody({ week, items, warnings });

  if (args['dry-run']) {
    console.log(post);
    console.log('\n---------- PR body ----------\n');
    console.log(prBody);
    return;
  }

  mkdirSync('posts', { recursive: true });
  writeFileSync(postPath, post);
  const prBodyPath = args['pr-body'] || join(tmpdir(), `digest-${week}-pr-body.md`);
  writeFileSync(prBodyPath, prBody);

  // milestone은 PR이 만들어진 뒤 scripts/assign-milestone.mjs가 붙인다.
  // 먼저 붙이면 PR 생성이 실패했을 때 이슈가 지난 주차에 묶인 채 빠진다.
  console.log(`${postPath} 작성 완료 (${items.length}건)`);
  setOutput({ count: items.length, week, pr_body: prBodyPath, issues: items.map((i) => i.number).join(',') });
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
