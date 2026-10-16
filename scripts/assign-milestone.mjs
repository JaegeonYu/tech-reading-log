#!/usr/bin/env node
// PR 생성이 끝난 뒤 포함된 이슈에 주차 milestone을 붙인다.
// 사용법: node scripts/assign-milestone.mjs --week 2026-W42 --issues 12,15
import { parseArgs } from 'node:util';
import { createGitHub, parseWeek } from './lib.mjs';

const { values: args } = parseArgs({
  options: {
    week: { type: 'string' },
    issues: { type: 'string' },
  },
});

async function main() {
  if (!parseWeek(args.week)) throw new Error(`잘못된 주차 형식: ${args.week}`);
  const numbers = (args.issues ?? '').split(',').map(Number).filter(Number.isInteger).filter((n) => n > 0);
  if (!numbers.length) throw new Error('--issues가 비어 있습니다');
  const { GITHUB_TOKEN: token, GITHUB_REPOSITORY: repo } = process.env;
  if (!token || !repo) throw new Error('GITHUB_TOKEN과 GITHUB_REPOSITORY 환경변수가 필요합니다');

  const github = createGitHub({ token, repo });
  const milestone = await github.ensureMilestone(args.week);
  for (const n of numbers) await github.setMilestone(n, milestone.number);
  console.log(`milestone ${args.week} → #${numbers.join(', #')}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
