import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  FIELDS,
  SUMMARY_SCHEMA,
  generateSummary,
  isoWeekKST,
  parseIssueBody,
  renderPost,
  renderPrBody,
  selectStale,
  selectTargets,
  splitKeywords,
  toItem,
  weekRange,
} from '../scripts/lib.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const fixturePath = fileURLToPath(new URL('./fixtures/issues.json', import.meta.url));
const issues = JSON.parse(readFileSync(fixturePath, 'utf8'));
const byNumber = (n) => issues.find((i) => i.number === n);

test('Issue Form label과 파서 FIELDS가 일치한다', () => {
  const yml = readFileSync(new URL('../.github/ISSUE_TEMPLATE/reading.yml', import.meta.url), 'utf8');
  const labels = [...yml.matchAll(/^\s+label: (.+)$/gm)].map((m) => m[1].trim());
  assert.deepEqual(labels, Object.values(FIELDS));
});

test('본문 파싱: _No response_는 빈 값, 모르는 ### 제목은 내용으로 유지', () => {
  const parsed = parseIssueBody(byNumber(12).body);
  assert.equal(parsed.url, 'https://example.com/kafka-idempotence');
  assert.equal(parsed.title, '');
  assert.deepEqual(parsed.keywords, ['Kafka', '멱등성', 'exactly-once']);
  assert.equal(parsed.quotes, '재시도는 공짜가 아니다.\n\n### 이건 내가 쓴 소제목\n중복은 브로커가 막는다.');
  assert.equal(parsed.thoughts, '우리 정산 배치에도 적용할 수 있을 것 같다.');
});

test('본문 파싱: CRLF와 줄바꿈 구분 키워드', () => {
  const parsed = parseIssueBody(byNumber(15).body);
  assert.equal(parsed.title, 'PostgreSQL [부분] 인덱스');
  assert.deepEqual(parsed.keywords, ['PostgreSQL', '인덱스']);
  assert.equal(parsed.quotes, '');
});

test('splitKeywords는 빈 항목과 # 접두어를 제거한다', () => {
  assert.deepEqual(splitKeywords(' a, ,#b\n c '), ['a', 'b', 'c']);
});

test('toItem: 제목이 없으면 이슈 제목에서 접두어를 뗀다, 링크가 없으면 에러', () => {
  assert.equal(toItem(byNumber(12)).title, 'Kafka 멱등 프로듀서');
  assert.match(toItem(byNumber(21)).error, /링크/);
});

test('toItem: 링크 필드에 제목과 URL이 섞여 있으면 URL만 뽑는다', () => {
  const issue = { number: 1, title: '[읽음] x', body: '### 링크\n\n좋은 글 - 블로그 https://example.com/a?b=1\n\n### 키워드\n\nk' };
  assert.equal(toItem(issue).url, 'https://example.com/a?b=1');
  assert.match(toItem({ ...issue, body: '### 링크\n\n그냥 텍스트\n\n### 키워드\n\nk' }).error, /URL/);
});

test('selectTargets: PR과 다른 주차 milestone은 제외, 이번 주 milestone은 포함', () => {
  assert.deepEqual(selectTargets(issues, '2026-W42').map((i) => i.number), [12, 15, 21]);
});

test('selectStale: 지난 주차 milestone이 붙은 열린 이슈만', () => {
  assert.deepEqual(selectStale(issues, '2026-W42').map((i) => i.number), [9]);
  assert.deepEqual(selectStale(issues, '2026-W41'), []);
});

test('isoWeekKST: KST 경계와 연도 경계', () => {
  assert.equal(isoWeekKST(new Date('2026-10-18T12:00:00Z')), '2026-W42'); // 일 21:00 KST
  assert.equal(isoWeekKST(new Date('2026-10-18T14:59:00Z')), '2026-W42'); // 일 23:59 KST
  assert.equal(isoWeekKST(new Date('2026-10-18T15:30:00Z')), '2026-W43'); // 월 00:30 KST
  assert.equal(isoWeekKST(new Date('2027-01-01T03:00:00Z')), '2026-W53');
  assert.equal(isoWeekKST(new Date('2027-01-04T03:00:00Z')), '2027-W01');
});

test('weekRange는 월~일 날짜를 돌려준다', () => {
  assert.equal(weekRange('2026-W42'), '10/12 ~ 10/18');
  assert.equal(weekRange('2026-W53'), '12/28 ~ 1/3');
});

const items = [toItem(byNumber(12)), toItem(byNumber(15))];

test('renderPost: 링크, 키워드, 문장, 생각을 원문 그대로 담는다', () => {
  const post = renderPost({ week: '2026-W42', items, summary: null });
  for (const item of items) {
    assert.ok(post.includes(item.url));
    for (const k of item.keywords) assert.ok(post.includes(`\`${k}\``));
    for (const line of item.quotes.split('\n').filter((l) => l.trim())) assert.ok(post.includes(`> ${line}`));
    if (item.thoughts) assert.ok(post.includes(item.thoughts));
  }
  assert.ok(post.includes('# 주간 기술 읽기 — 2026년 42주차 (10/12 ~ 10/18)'));
  assert.ok(post.includes('[PostgreSQL \\[부분\\] 인덱스](https://example.com/pg-index)'));
  assert.ok(!post.includes('이번 주 흐름'));
});

test('renderPost: 문장은 줄마다 문단을 나누고, 생각은 강제 줄바꿈, 백틱 키워드는 이중 백틱', () => {
  const item = { number: 1, title: 't', url: 'https://e.com', keywords: ['a`b'], quotes: 'A\nB', thoughts: 'X\nY' };
  const post = renderPost({ week: '2026-W42', items: [item], summary: null });
  assert.ok(post.includes('> A\n>\n> B'));
  assert.ok(post.includes('X  \nY'));
  assert.ok(post.includes('`` a`b ``'));
});

test('renderPost: 총평이 있으면 도입과 흐름 섹션을 넣는다', () => {
  const post = renderPost({ week: '2026-W42', items, summary: { intro: '도입 문단', wrapup: '흐름 문단' } });
  assert.ok(post.indexOf('도입 문단') < post.indexOf('## 이번 주 읽은 글'));
  assert.ok(post.includes('## 이번 주 흐름\n\n흐름 문단'));
});

test('renderPrBody: 이슈마다 Closes, 경고 표시', () => {
  const body = renderPrBody({ week: '2026-W42', items, warnings: ['⚠️ 총평 생성 실패: x'] });
  assert.ok(body.includes('Closes #12\nCloses #15'));
  assert.ok(body.includes('- ⚠️ 총평 생성 실패: x'));
});

function fakeClient(response) {
  const calls = [];
  return { calls, beta: { messages: { create: async (req) => (calls.push(req), response) } } };
}

test('generateSummary: 요청 형식과 정상 응답', async () => {
  const client = fakeClient({
    stop_reason: 'end_turn',
    content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: '{"intro":"i","wrapup":"w"}' }],
  });
  assert.deepEqual(await generateSummary(client, items), { intro: 'i', wrapup: 'w' });
  const req = client.calls[0];
  assert.equal(req.model, 'claude-opus-5-5');
  assert.equal(req.fallbacks, 'default');
  assert.deepEqual(req.betas, ['server-side-fallback-2026-07-01']);
  assert.deepEqual(req.output_config.format.schema, SUMMARY_SCHEMA);
  assert.ok(req.messages[0].content.includes('https://example.com/kafka-idempotence'));
});

test('generateSummary: 거절, 잘림, 잘못된 JSON은 에러', async () => {
  await assert.rejects(generateSummary(fakeClient({ stop_reason: 'refusal', stop_details: { category: 'cyber' }, content: [] }), items), /거절.*cyber/);
  await assert.rejects(generateSummary(fakeClient({ stop_reason: 'max_tokens', content: [] }), items), /max_tokens/);
  await assert.rejects(generateSummary(fakeClient({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'nope' }] }), items), /JSON/);
  await assert.rejects(generateSummary(fakeClient({ stop_reason: 'end_turn', content: [{ type: 'text', text: '{"intro":"i"}' }] }), items), /intro\/wrapup/);
});

function runCli(args, env = {}, cwd = root) {
  return spawnSync(process.execPath, [join(root, 'scripts/digest.mjs'), ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GITHUB_OUTPUT: '', ...env },
  });
}

test('CLI dry-run: 대상 이슈로 초안을 출력하고 링크 없는 이슈는 경고', () => {
  const r = runCli(['--dry-run', '--no-llm', '--fixture', fixturePath, '--week', '2026-W42']);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes('https://example.com/kafka-idempotence'));
  assert.ok(r.stdout.includes('https://example.com/pg-index'));
  assert.ok(!r.stdout.includes('last-week'));
  assert.ok(r.stdout.includes('#21: '));
  assert.ok(r.stdout.includes('#9: 지난 주차(2026-W41)'));
  assert.ok(r.stdout.includes('Closes #12'));
});

test('CLI: 이미 발행된 주차(posts 파일 존재)는 덮어쓰지 않는다', () => {
  const dir = mkdtempSync(join(tmpdir(), 'digest-'));
  mkdirSync(join(dir, 'posts'));
  writeFileSync(join(dir, 'posts', '2026-W42.md'), 'published');
  const r = runCli(['--no-llm', '--fixture', fixturePath, '--week', '2026-W42'], {}, dir);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /이미 발행된 주차/);
  assert.equal(readFileSync(join(dir, 'posts', '2026-W42.md'), 'utf8'), 'published');
});

test('CLI: 실제 실행은 posts 파일과 issues 출력을 만들고 GitHub milestone은 건드리지 않는다', () => {
  const dir = mkdtempSync(join(tmpdir(), 'digest-'));
  const output = join(dir, 'gh-output');
  const r = runCli(['--no-llm', '--fixture', fixturePath, '--week', '2026-W42', '--pr-body', join(dir, 'body.md')], { GITHUB_OUTPUT: output }, dir);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(readFileSync(join(dir, 'posts', '2026-W42.md'), 'utf8').includes('https://example.com/pg-index'));
  const out = readFileSync(output, 'utf8');
  assert.match(out, /^count=2$/m);
  assert.match(out, /^issues=12,15$/m);
});

test('CLI: 최신순으로 온 이슈를 기록한 순서(번호 오름차순)로 정렬한다', () => {
  const dir = mkdtempSync(join(tmpdir(), 'digest-'));
  const reversed = join(dir, 'reversed.json');
  writeFileSync(reversed, JSON.stringify([...issues].reverse()));
  const r = runCli(['--dry-run', '--no-llm', '--fixture', reversed, '--week', '2026-W42'], {}, dir);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.indexOf('### 1. [Kafka') !== -1);
  assert.ok(r.stdout.indexOf('- #12 ') < r.stdout.indexOf('- #15 '));
});

test('CLI: 대상이 없으면 정상 종료하고 PR을 만들지 않는다', () => {
  const empty = runCli(['--dry-run', '--no-llm', '--fixture', fileURLToPath(new URL('./fixtures/empty.json', import.meta.url))]);
  assert.equal(empty.status, 0, empty.stderr);
  assert.match(empty.stdout, /no new readings/);
});

test('CLI: API 키가 잘못돼도 템플릿만으로 초안을 만들고 경고한다', () => {
  const r = runCli(['--dry-run', '--fixture', fixturePath, '--week', '2026-W42'], {
    ANTHROPIC_API_KEY: 'sk-ant-invalid',
    ANTHROPIC_BASE_URL: 'http://127.0.0.1:9',
  });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes('⚠️ 총평 생성 실패'));
  assert.ok(r.stdout.includes('https://example.com/kafka-idempotence'));
});

test('CLI: 잘못된 주차 형식은 실패', () => {
  const r = runCli(['--dry-run', '--no-llm', '--fixture', fixturePath, '--week', '2026-42']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /잘못된 주차/);
});
