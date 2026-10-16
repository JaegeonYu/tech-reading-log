# tech-reading-log

읽은 기술 블로그를 GitHub Issue로 기록하면, 매주 일요일 그 주의 기록을 모아 Tistory용 주간 포스트 초안을 PR로 만들어 줍니다.

## 흐름

1. **글을 읽을 때**: Issues → New issue → **읽은 글 기록** 폼에 링크, 키워드, 인상 깊은 문장, 내 생각을 적습니다(모바일 GitHub 앱에서도 됩니다). `reading` 라벨이 자동으로 붙습니다.
2. **일요일 18:00 KST**: `weekly-digest` 워크플로가 아래를 수행합니다. GitHub cron은 늦게 돌 수 있어 주 경계(일요일 자정)보다 여유를 두었습니다.
   - 열린 `reading` 이슈 중 아직 주차 milestone이 없는 것을 모읍니다.
   - `posts/YYYY-Www.md` 초안을 만듭니다. 링크, 키워드, 문장은 그대로 옮기고, 도입부와 "이번 주 흐름"만 Claude가 씁니다.
   - `digest/YYYY-Www` 브랜치로 PR을 엽니다. PR이 만들어진 **뒤에** 포함된 이슈에 그 주의 milestone을 붙입니다.
3. **발행**: PR의 `posts/...md`를 Tistory 에디터의 **마크다운 모드**에 붙여넣어 발행한 뒤 PR을 merge합니다. merge하면 포함된 이슈가 자동으로 닫힙니다.

## 최초 설정

1. 이 저장소를 GitHub에 push합니다.
2. Settings → Actions → General → Workflow permissions에서 **"Allow GitHub Actions to create and approve pull requests"**를 켭니다. 꺼져 있으면 PR 생성이 실패합니다.
3. Claude API는 API 키 없이 **Workload Identity Federation(WIF)**으로 인증합니다. 실행마다 GitHub이 발급한 단기 토큰을 교환하므로 만료되거나 교체할 키가 없습니다.
   - Claude Console → Settings → Workload identity → **Connect workload** → **GitHub Actions**를 선택합니다.
   - 규칙의 subject prefix는 `repo:<owner>/tech-reading-log:ref:refs/heads/main`, audience는 `https://api.anthropic.com`으로 둡니다.
   - Settings → Secrets and variables → Actions → **Variables**에 아래 값을 등록합니다. 비밀값이 아닌 ID들입니다.
     - `ANTHROPIC_FEDERATION_RULE_ID` (`fdrl_...`)
     - `ANTHROPIC_SERVICE_ACCOUNT_ID` (`svac_...`)
     - `ANTHROPIC_ORGANIZATION_ID` (Console → Organization 페이지)
     - (선택) `ANTHROPIC_WORKSPACE_ID`: 규칙이 여러 workspace에 걸칠 때만 필요합니다.
     - (선택) `ANTHROPIC_MODEL`: 기본값은 `claude-opus-5-5`이며, `claude-sonnet-5-5` 등으로 바꿀 수 있습니다.
   - 인증이 실패하면 Console → Workload identity → History 탭에서 원인을 볼 수 있습니다. 흔한 원인은 `main`이 아닌 브랜치에서 수동 실행한 경우입니다.
4. `reading` 라벨을 만듭니다: `gh label create reading --color 0E8A16`
5. Actions → weekly-digest → **Run workflow**로 한 번 수동 실행해 동작을 확인합니다.

요청 흐름, 실패 지점별 확인 방법, 직접 테스트하는 절차는 [docs/request-flow.md](docs/request-flow.md)에 있습니다.

## 운영 메모

- **스케줄을 놓쳤을 때**: Run workflow로 수동 실행합니다. `week` 입력(예: `2026-W42`)으로 주차를 지정할 수도 있습니다.
- **같은 주에 다시 실행하면**: 그 주 milestone이 붙은 이슈와 새 이슈를 합쳐 같은 PR을 갱신합니다. PR이 중복으로 생기지 않습니다.
- **총평 생성이 실패하면**: 템플릿 부분만으로 PR이 만들어지고, PR 본문에 `⚠️ 총평 생성 실패` 사유가 표시됩니다.
- **이미 발행된 주차**: 기본 브랜치에 `posts/YYYY-Www.md`가 있으면 그 주차는 덮어쓰지 않고 건너뜁니다. 그 뒤에 쓴 기록은 다음 주 글에 들어갑니다.
- **지난 주차 milestone이 붙은 열린 이슈**: PR을 merge하지 않고 닫은 경우입니다. PR 본문 경고에 표시되며, milestone을 지우면 다음 실행에 다시 모입니다.
- **링크에서 URL을 찾지 못한 이슈**: 매주 경고에 나옵니다. 이슈 본문의 링크를 고치거나 이슈를 닫으세요. 링크 칸에 "제목 https://..."처럼 섞여 있으면 URL만 뽑아 씁니다.
- 원문 본문은 가져오지 않습니다. 짧은 인용과 출처 링크만 씁니다.

## 로컬 실행

```bash
npm install
npm test
# GitHub에 쓰지 않고 초안만 출력
node scripts/digest.mjs --dry-run --no-llm --fixture tests/fixtures/issues.json --week 2026-W42
```
