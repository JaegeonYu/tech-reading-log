// 판정 모델 검증: 다른 주의 총평을 이 주의 기록에 붙여 채점한다. ①은 반드시 실패해야 한다.
//   node evals/summary/judge-check.mjs <총평을 가져올 case id> <기록을 쓸 case id> [...쌍 반복]
// 총평은 baseline 실행이 저장한 .claude/hillclimb/summary/baseline/ref/<id> 에서 읽는다.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JUDGE_MODEL, judge } from './grading.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const cases = Object.fromEntries(JSON.parse(readFileSync(join(here, 'cases.json'), 'utf8')).map((c) => [c.id, c]));
const refDir = join(here, '..', '..', '.claude', 'hillclimb', 'summary', 'baseline', 'ref');
const pairs = process.argv.slice(2);
if (!pairs.length || pairs.length % 2) {
  console.error('usage: node evals/summary/judge-check.mjs <summary-from> <records-of> [...]');
  process.exit(2);
}
let caught = 0;
for (let i = 0; i < pairs.length; i += 2) {
  const [from, to] = [pairs[i], pairs[i + 1]];
  const summary = JSON.parse(readFileSync(join(refDir, from), 'utf8'));
  const r = await judge('grounded', cases[to].records, summary);
  const ok = r.grade.grounded === 0;
  caught += ok;
  console.log(`${ok ? '✅ 잡음' : '❌ 놓침'}  ${from} 총평 → ${to} 기록: 근거 없는 문장 ${r.grade.unsupported}개 (${JUDGE_MODEL}, in ${r.usage.input_tokens} / out ${r.usage.output_tokens})`);
}
console.log(`${caught}/${pairs.length / 2} 잡음`);
process.exit(caught === pairs.length / 2 ? 0 : 1);
