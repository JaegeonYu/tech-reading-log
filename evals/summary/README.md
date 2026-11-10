# 총평 평가 (summary)

`generateSummary()`가 만든 주간 총평이 **기록 밖 내용을 쓰지 않는지** 잰다. 원본 글은 조회하지 않는다: 기준은 "참인가"가 아니라 "기록에 근거가 있는가"다.

| 지표 | 뜻 | 채점 |
|---|---|---|
| ① 기록 근거 (`grounded`, 헤드라인) | 기록에 없는 사실·설명·배경지식·원문 결론이 한 문장도 없다 | 판정 모델, 문장 단위 |
| `unsupported` | 근거 없는 문장 수 | 판정 모델 |
| ② 생각 범위 (`thoughts`) | 글쓴이 생각은 thoughts 범위 안. 같은 뜻의 문장화는 허용, 이유·경험·없는 공통 관심사를 덧붙이면 위반 | 판정 모델 |
| ③ 억지 연결 없음 (`no_forced`) | 제목·키워드·인용에 공통점이 있는 묶기는 허용, 없는 연결·인과·순서를 지어내면 위반 (기록 1건인 주는 생략) | 판정 모델 |
| ④ 형식 (`format`) | intro 2~3문장, wrapup 300~500자(공백 포함), 기록마다 문단, 마크다운·링크 없음, 존댓말 | 코드 |

## 파일

- `cases.json` / `cases.md`: 입력 23주 (실제 기록 2주 + 합성 21주: sparse, empty-thoughts, unrelated, normal)
- `grading.mjs`: ④ 형식 검사와 ①②③ 판정 프롬프트
- `run-eval.mjs`: 러너 (claude-api build-eval 스캐폴드 기반). 실제 `generateSummary`를 호출
- `judge-check.mjs`: 판정 모델 검증 (다른 주의 총평을 붙였을 때 ①이 실패하는지)
- 결과: `.claude/hillclimb/summary/` (`_state.json`에 지표 정의, `baseline/`에 결과)

## 실행

인증은 `ant auth login` 프로필을 SDK가 자동으로 읽는다 (API 키 불필요). **모든 호출이 유료**다.

```sh
# 저장소 루트에서. 평가 코드가 바뀌었으면 --approve-harness를 붙여 사람이 승인한다.
EVAL_CASES=real-w43,sparse-1,empty-4,unrelated-2,normal-3 \
JUDGE_MODEL=claude-haiku-5-5 \
node evals/summary/run-eval.mjs --flow .claude/hillclimb/summary --variant baseline --model claude-opus-5-5 --reps 1

# 리포트
node <claude-api 스킬>/shared/evals/report/build-report-lite.mjs .claude/hillclimb/summary/
```

- 프롬프트를 바꿔 비교할 때는 `--variant v1`로 같은 주들을 돌린다.
- 비용 (2026-11-10 파일럿 실측, 주 1회분): 총평 Opus 5.5 약 $0.03 + 판정 Sonnet 5.5 3회 약 $0.03. 판정을 Haiku 5.5로 바꾸면 판정 비용은 약 1/20 (미검증: `judge-check.mjs`로 먼저 확인).

## 현재 상태

- 파일럿 5주 × 1회 (`baseline/`): ① 5/5, ② 4/5, ③ 5/5, ④ 5/5. ②의 1건(normal-3)은 판정 오류로 확인했고, 판정 프롬프트에 기록 필드 뜻을 넣어 고쳤다 (고친 판정으로는 아직 미실행).
- 판정 검증: 다른 주 총평 3건을 모두 ① 실패로 잡음.
- 전체 기준선(23주 × 2회, 약 $2.9)은 예산 때문에 보류.
