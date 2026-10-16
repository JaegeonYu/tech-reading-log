import { readFileSync } from 'node:fs';

// Issue Form(.github/ISSUE_TEMPLATE/reading.yml)의 label과 1:1로 맞춰야 한다. 테스트가 이를 검사한다.
export const FIELDS = {
  url: '링크',
  title: '글 제목',
  keywords: '키워드',
  quotes: '인상 깊은 문장',
  thoughts: '내 생각',
};

const NO_RESPONSE = '_No response_';
const TITLE_PREFIX = /^\[읽음\]\s*/;
const DAY_MS = 86_400_000;
const KST_OFFSET_MS = 9 * 3_600_000;

export const DEFAULT_MODEL = 'claude-opus-5-5';

// ---------- Issue Form 파싱 ----------

export function parseIssueBody(body) {
  const known = new Set(Object.values(FIELDS));
  const sections = {};
  let current = null;
  for (const line of (body ?? '').replace(/\r\n/g, '\n').split('\n')) {
    const heading = line.startsWith('### ') ? line.slice(4).trim() : null;
    // 알려진 필드 제목만 섹션 경계로 본다. 사용자가 본문에 쓴 '### ...'은 내용으로 남는다.
    if (heading && known.has(heading)) {
      current = heading;
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  }
  const get = (key) => {
    const value = (sections[FIELDS[key]] ?? []).join('\n').trim();
    return value === NO_RESPONSE ? '' : value;
  };
  return {
    url: get('url'),
    title: get('title'),
    keywords: splitKeywords(get('keywords')),
    quotes: get('quotes'),
    thoughts: get('thoughts'),
  };
}

export function splitKeywords(raw) {
  return raw
    .split(/[,\n]/)
    .map((k) => k.trim().replace(/^#/, '').trim())
    .filter(Boolean);
}

export function toItem(issue) {
  const parsed = parseIssueBody(issue.body);
  // 모바일 공유는 '제목 https://...'처럼 붙여넣는 경우가 많아 첫 URL만 뽑는다.
  const url = /https?:\/\/\S+/.exec(parsed.url)?.[0];
  if (!url) return { number: issue.number, error: `'${FIELDS.url}' 필드에서 URL을 찾지 못함` };
  const title = parsed.title || issue.title.replace(TITLE_PREFIX, '').trim() || url;
  return { number: issue.number, milestone: issue.milestone?.title ?? null, ...parsed, url, title };
}

// 열린 reading 이슈 중 아직 어느 주에도 묶이지 않았거나, 이번 주에 이미 묶인 것(재실행)만 고른다.
export function selectTargets(issues, week) {
  return issues.filter((i) => !i.pull_request && (!i.milestone || i.milestone.title === week));
}

// 지난 주차 milestone이 붙은 채 열려 있는 이슈. PR이 merge되지 않았거나 닫힌 경우라 자동으로는 다시 모이지 않는다.
export function selectStale(issues, week) {
  return issues.filter(
    (i) => !i.pull_request && parseWeek(i.milestone?.title) && i.milestone.title < week,
  );
}

// ---------- 주차 계산 (KST 기준 ISO 8601) ----------

export function isoWeekKST(date = new Date()) {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  const d = new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); // 그 주의 목요일
  const year = d.getUTCFullYear();
  const week = Math.ceil(((d - Date.UTC(year, 0, 1)) / DAY_MS + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function parseWeek(label) {
  const m = /^(\d{4})-W(\d{2})$/.exec(label ?? '');
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 53) return null;
  return { year: Number(m[1]), week: Number(m[2]) };
}

function weekMonday(label) {
  const { year, week } = parseWeek(label);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  return new Date(jan4.getTime() - ((jan4.getUTCDay() || 7) - 1) * DAY_MS + (week - 1) * 7 * DAY_MS);
}

// '2026-W42' → '2026년 10월 3주차'. 두 달에 걸친 주는 목요일이 속한 달로 센다(ISO 주차와 같은 기준).
export function monthWeekLabel(label) {
  const thursday = new Date(weekMonday(label).getTime() + 3 * DAY_MS);
  const nth = Math.ceil(thursday.getUTCDate() / 7);
  return `${thursday.getUTCFullYear()}년 ${thursday.getUTCMonth() + 1}월 ${nth}주차`;
}

export function weekRange(label) {
  const monday = weekMonday(label);
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);
  const fmt = (d) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return `${fmt(monday)} ~ ${fmt(sunday)}`;
}

// ---------- 렌더링 ----------

const escapeLinkText = (s) => s.replace(/([[\]])/g, '\\$1');
const inlineCode = (s) => (s.includes('`') ? `\`\` ${s} \`\`` : `\`${s}\``);

function renderItem(item, index) {
  const lines = [`### ${index + 1}. [${escapeLinkText(item.title)}](${item.url})`, ''];
  if (item.keywords.length) {
    lines.push(`**키워드** ${item.keywords.map(inlineCode).join(' · ')}`, '');
  }
  if (item.quotes) {
    // 한 줄씩 적은 문장이 한 문단으로 합쳐지지 않도록 빈 '>' 줄로 문단을 나눈다.
    const quoteLines = item.quotes.split('\n').filter((q) => q.trim());
    lines.push(quoteLines.map((q) => `> ${q}`).join('\n>\n'), '');
  }
  if (item.thoughts) {
    // 줄바꿈을 마크다운 강제 줄바꿈(끝 공백 2개)으로 유지한다.
    lines.push('**내 생각**', '', item.thoughts.split('\n').join('  \n'), '');
  }
  return lines.join('\n');
}

export function renderPost({ week, items, summary }) {
  const out = [`# 주간 기술 읽기 — ${monthWeekLabel(week)} (${weekRange(week)})`, ''];
  if (summary) out.push(summary.intro.trim(), '');
  out.push('## 이번 주 읽은 글', '', ...items.map(renderItem));
  if (summary) out.push('## 이번 주 흐름', '', summary.wrapup.trim(), '');
  out.push('---', '', '**출처**', '', ...items.map((i) => `- [${escapeLinkText(i.title)}](${i.url})`), '');
  return out.join('\n');
}

export function renderPrBody({ week, items, warnings }) {
  const out = [
    `## ${monthWeekLabel(week)} 주간 포스트 초안`,
    '',
    `\`posts/${week}.md\` 내용을 Tistory 에디터의 **마크다운 모드**에 붙여넣어 발행한 뒤 이 PR을 merge하세요.`,
    'merge하면 아래 기록 이슈가 자동으로 닫힙니다.',
    '',
    `### 포함된 기록 (${items.length})`,
    '',
    ...items.map((i) => `- #${i.number} ${i.title}`),
    '',
  ];
  if (warnings.length) out.push('### 경고', '', ...warnings.map((w) => `- ${w}`), '');
  out.push(...items.map((i) => `Closes #${i.number}`), '');
  return out.join('\n');
}

// ---------- Claude 총평 ----------

export const SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    intro: { type: 'string' },
    wrapup: { type: 'string' },
  },
  required: ['intro', 'wrapup'],
  additionalProperties: false,
};

const SYSTEM_PROMPT = readFileSync(new URL('./prompts/summary.txt', import.meta.url), 'utf8');

export function buildUserPrompt(items) {
  const records = items.map(({ title, url, keywords, quotes, thoughts }) => ({ title, url, keywords, quotes, thoughts }));
  return `이번 주 읽기 기록입니다.\n\n<records>\n${JSON.stringify(records, null, 2)}\n</records>`;
}

export async function generateSummary(client, items, { model = DEFAULT_MODEL } = {}) {
  const response = await client.beta.messages.create({
    model,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SUMMARY_SCHEMA } },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(items) }],
  });
  if (response.stop_reason === 'refusal') {
    throw new Error(`모델이 요청을 거절함 (${response.stop_details?.category ?? 'unknown'})`);
  }
  if (response.stop_reason === 'max_tokens') throw new Error('max_tokens에 도달해 응답이 잘림');
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('응답을 JSON으로 파싱하지 못함');
  }
  if (typeof parsed?.intro !== 'string' || typeof parsed?.wrapup !== 'string') {
    throw new Error('응답에 intro/wrapup이 없음');
  }
  return parsed;
}

// ---------- GitHub REST ----------

export function createGitHub({ token, repo, fetchImpl = fetch }) {
  const base = `https://api.github.com/repos/${repo}`;

  async function request(method, path, body) {
    const res = await fetchImpl(`${base}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`GitHub ${method} ${path} → ${res.status}: ${await res.text()}`);
    return res.status === 204 ? null : res.json();
  }

  async function paginate(path) {
    const all = [];
    for (let page = 1; ; page++) {
      const batch = await request('GET', `${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
      all.push(...batch);
      if (batch.length < 100) return all;
    }
  }

  return {
    listReadingIssues: () => paginate('/issues?labels=reading&state=open'),
    async ensureMilestone(title) {
      const existing = (await paginate('/milestones?state=all')).find((m) => m.title === title);
      if (!existing) return request('POST', '/milestones', { title });
      if (existing.state === 'closed') return request('PATCH', `/milestones/${existing.number}`, { state: 'open' });
      return existing;
    },
    setMilestone: (issueNumber, milestoneNumber) =>
      request('PATCH', `/issues/${issueNumber}`, { milestone: milestoneNumber }),
  };
}
