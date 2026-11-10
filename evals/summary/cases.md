# 총평 평가 입력 (23주)

| id | 분류 | 기록 수 | 생각 빈 기록 | 출처 |
|---|---|---|---|---|
| real-w43 | real | 2 | 0 | 실제 기록 #4, #5 |
| real-w45 | real | 1 | 0 | 실제 기록 #7 |
| sparse-1 | sparse | 2 | 1 | 합성 |
| sparse-2 | sparse | 1 | 0 | 합성 |
| sparse-3 | sparse | 2 | 0 | 합성 |
| sparse-4 | sparse | 3 | 2 | 합성 |
| sparse-5 | sparse | 1 | 0 | 합성 |
| sparse-6 | sparse | 2 | 0 | 합성 |
| empty-1 | empty-thoughts | 1 | 1 | 합성 |
| empty-2 | empty-thoughts | 2 | 1 | 합성 |
| empty-3 | empty-thoughts | 2 | 2 | 합성 |
| empty-4 | empty-thoughts | 3 | 2 | 합성 |
| empty-5 | empty-thoughts | 1 | 1 | 합성 |
| empty-6 | empty-thoughts | 2 | 1 | 합성 |
| unrelated-1 | unrelated | 2 | 0 | 합성 |
| unrelated-2 | unrelated | 3 | 1 | 합성 |
| unrelated-3 | unrelated | 2 | 1 | 합성 |
| unrelated-4 | unrelated | 2 | 0 | 합성 |
| unrelated-5 | unrelated | 3 | 1 | 합성 |
| normal-1 | normal | 2 | 0 | 합성 |
| normal-2 | normal | 2 | 0 | 합성 |
| normal-3 | normal | 3 | 1 | 합성 |
| normal-4 | normal | 1 | 0 | 합성 |

분류별: real 2, sparse 6, empty-thoughts 6, unrelated 5, normal 4 · 기록 총 45건

## real-w43 (real, 2건)

**1. LLM이 만든 SQL을 믿고 실행하기까지: A2A 기반의 대화형 BI 애플리케이션 개발기**

- 키워드: LLM, DDB
- 인상 깊은 문장:

````
llm & sql
운영환경에서도 실행 가능한 SQL 생성
메타데이터 - SQL 생성
온톨로지 DB - 수많은 DB 중 분석에 필요한 정보
Graph DB vs Vector DB 도입 비용 문제
````

- 내 생각:

````
RDB의 데이터를 LLM이 사용할 수 있도록 정제하는 과정
운영환경에서도 LLM을 통한 쿼리 생성이 가능한 날이 머지 않음
Graph와 Vector의 도입 비용에 대한 생각도 필요
````

**2. 리드타임 3일, 글로벌 매장 개발자가 출장지에서 일하는 법**

- 키워드: PDA, Agile
- 인상 깊은 문장:

````
물류 도메인의 '순환 재고조사' 업무
현업담당자의 차이(국내, 해외)로 인한 요구사항 단순화
````

- 내 생각:

````
짧은 시간동안 현업담당자의 요구사항 중 가장 기초가 되는 것만 발라내고 빠른 개발 및 테스트 역량 중요
````

## real-w45 (real, 1건)

**1. 알아두면 쓸데있는 LDAP**

- 키워드: LDAP
- 인상 깊은 문장:

````
TCP/IP 기반의 디렉토리 서비스를 제공하기 위한 프로토콜

1) LDAP 구
Information 모델
Entry : Attribute = 1 : N
LDAP 디렉토리 구조는 Entry 데이터들을 트리 구조로 형성, 관리
ObjectClass는 엔트리에서 꼭 필요하거나 가질 수 있는 Attribute 타입을 정의합니다. Entry를 만들 때 ObjectClass를 통해 데이터에 필수적으로 들어가야 하는 정보를 담을 수 있게 정의할 수 있습니다. 또한 ObjectClass는 다른 ObjectClass를 상속해 구현하며 개념을 확장할 수 있습니다.

Schema는 ObjectClass와 Attribute에 대해 정의하는 규칙으로 보면 됩니다. ObjectClass에 어떤 Attribute가 들어갈지, Attribute의 값에 대한 제약 및 조건 등 관련된 규칙들을 정의할 수 있습니다. 스키마 정의를 통해 여러 응용 프로그램에서 디렉토리 서비스를 읽고 사용할 때 상호운용성을 보호해주는 역할을 합니다.

2) ldap server, client
server : open, apache, active
client : jndi, spring, unboundId
````

- 내 생각:

````
공인인증서 인증 과정에서 한국전자인증의 LDAP 호출을 통해 폐기된 인증서 목록과 CA 인증서 발급 등이 진행됨.
LDAP은 평소에 많이 들어봤지만 정확한 뜻은 몰랐음.
LDAP은 디렉토리 서비스 제공을 위한 프로토콜이라는걸 인지
````

## sparse-1 (sparse, 2건)

**1. 트랜잭션 격리 수준 다시 보기**

- 키워드: MVCC
- 인상 깊은 문장:

````
(없음)
````

- 내 생각:

````
(없음)
````

**2. 사내 배포 파이프라인 개선기**

- 키워드: CI/CD, ArgoCD
- 인상 깊은 문장:

````
롤백 3분
````

- 내 생각:

````
우리도?
````

## sparse-2 (sparse, 1건)

**1. Redis 캐시 스탬피드 대응**

- 키워드: Redis
- 인상 깊은 문장:

````
PER
````

- 내 생각:

````
TTL 지터
````

## sparse-3 (sparse, 2건)

**1. Spring Batch 대용량 처리 튜닝**

- 키워드: Batch, chunk
- 인상 깊은 문장:

````
chunk size 1000 → 5000
````

- 내 생각:

````
회사 배치 확인
````

**2. JVM GC 로그 읽는 법**

- 키워드: G1GC
- 인상 깊은 문장:

````
(없음)
````

- 내 생각:

````
STW
````

## sparse-4 (sparse, 3건)

**1. 모노레포 전환 회고**

- 키워드: Nx
- 인상 깊은 문장:

````
빌드 캐시
````

- 내 생각:

````
(없음)
````

**2. 코드 리뷰 문화 만들기**

- 키워드: 리뷰
- 인상 깊은 문장:

````
(없음)
````

- 내 생각:

````
PR 크기
````

**3. OAuth 2.1 변경점**

- 키워드: PKCE
- 인상 깊은 문장:

````
implicit 제거
````

- 내 생각:

````
(없음)
````

## sparse-5 (sparse, 1건)

**1. 쿠버네티스 HPA 오해와 진실**

- 키워드: HPA, k8s
- 인상 깊은 문장:

````
(없음)
````

- 내 생각:

````
metrics-server
````

## sparse-6 (sparse, 2건)

**1. Elasticsearch 샤드 설계**

- 키워드: ES, shard
- 인상 깊은 문장:

````
샤드당 30GB
````

- 내 생각:

````
??
````

**2. 테스트 픽스처 관리**

- 키워드: Fixture Monkey
- 인상 깊은 문장:

````
(없음)
````

- 내 생각:

````
도입 검토
````

## empty-1 (empty-thoughts, 1건)

**1. Kafka 컨슈머 리밸런싱 줄이기**

- 키워드: Kafka, Cooperative Sticky
- 인상 깊은 문장:

````
Eager 리밸런싱은 모든 파티션 할당을 해제한 뒤 다시 할당한다
CooperativeStickyAssignor는 이동이 필요한 파티션만 회수한다
static membership으로 재시작 시 리밸런싱 회피
````

- 내 생각:

````
(없음)
````

## empty-2 (empty-thoughts, 2건)

**1. PostgreSQL VACUUM 이해하기**

- 키워드: PostgreSQL, VACUUM
- 인상 깊은 문장:

````
dead tuple
autovacuum_vacuum_scale_factor 기본 0.2
XID wraparound
````

- 내 생각:

````
Oracle의 undo와 비교해 보면 재밌을 듯. 오라클은 undo 세그먼트에서 이전 버전을 읽는데 PG는 테이블에 남긴다
````

**2. gRPC 도입기**

- 키워드: gRPC, protobuf
- 인상 깊은 문장:

````
HTTP/2 멀티플렉싱
스키마 우선 개발
브라우저는 grpc-web 필요
````

- 내 생각:

````
(없음)
````

## empty-3 (empty-thoughts, 2건)

**1. 분산 락 구현 비교**

- 키워드: Redisson, ZooKeeper
- 인상 깊은 문장:

````
Redlock 논쟁
펜싱 토큰
````

- 내 생각:

````
(없음)
````

**2. API 레이트 리미터 설계**

- 키워드: Token Bucket
- 인상 깊은 문장:

````
토큰 버킷 vs 슬라이딩 윈도우
분산 환경에서는 중앙 저장소 필요
````

- 내 생각:

````
(없음)
````

## empty-4 (empty-thoughts, 3건)

**1. 인덱스 스킵 스캔은 언제 쓰일까**

- 키워드: Oracle, Index Skip Scan
- 인상 깊은 문장:

````
선두 컬럼의 distinct 값이 적을 때
선두 컬럼 조건이 없어도 인덱스 사용
````

- 내 생각:

````
SQLP 3장과 연결. 실습에서 확인해 보고 싶음
````

**2. 옵티마이저 통계 수집 전략**

- 키워드: DBMS_STATS
- 인상 깊은 문장:

````
히스토그램
통계 잠금
````

- 내 생각:

````
(없음)
````

**3. 실행계획 고정하기 (SPM)**

- 키워드: SPM, Baseline
- 인상 깊은 문장:

````
SQL Plan Baseline으로 계획 회귀 방지
````

- 내 생각:

````
(없음)
````

## empty-5 (empty-thoughts, 1건)

**1. WebSocket 대규모 연결 처리**

- 키워드: WebSocket, Netty
- 인상 깊은 문장:

````
커넥션당 메모리
epoll
````

- 내 생각:

````
(없음)
````

## empty-6 (empty-thoughts, 2건)

**1. 이벤트 소싱 실전 적용**

- 키워드: Event Sourcing, CQRS
- 인상 깊은 문장:

````
스냅샷으로 재생 비용 감소
이벤트 스키마 버전 관리
````

- 내 생각:

````
도입 비용이 커 보임. 감사 로그가 중요한 도메인에서만 의미가 있을 듯
````

**2. Outbox 패턴과 CDC**

- 키워드: Outbox, Debezium
- 인상 깊은 문장:

````
트랜잭션과 메시지 발행의 원자성
binlog 기반 CDC
````

- 내 생각:

````
(없음)
````

## unrelated-1 (unrelated, 2건)

**1. Kotlin 코루틴 구조적 동시성**

- 키워드: Kotlin, Coroutine
- 인상 깊은 문장:

````
부모 코루틴 취소 시 자식도 취소
SupervisorJob
````

- 내 생각:

````
자바 가상 스레드와 비교해 보고 싶다
````

**2. 사내 디자인 시스템 구축기**

- 키워드: Design System, Figma
- 인상 깊은 문장:

````
토큰 기반 테마
컴포넌트 문서화
````

- 내 생각:

````
백엔드 입장에선 API 스펙 문서화와 비슷한 고민
````

## unrelated-2 (unrelated, 3건)

**1. 리눅스 OOM Killer 동작 원리**

- 키워드: Linux, OOM
- 인상 깊은 문장:

````
oom_score_adj
메모리 오버커밋
````

- 내 생각:

````
컨테이너가 이유 없이 죽던 사례 생각남
````

**2. 개발자의 글쓰기**

- 키워드: 글쓰기
- 인상 깊은 문장:

````
두괄식
독자를 정하고 쓴다
````

- 내 생각:

````
블로그 글에 적용
````

**3. 엑셀 대용량 다운로드 개선**

- 키워드: Apache POI, SXSSF
- 인상 깊은 문장:

````
SXSSF 스트리밍 방식
행 단위로 임시 파일에 기록
````

- 내 생각:

````
(없음)
````

## unrelated-3 (unrelated, 2건)

**1. DNS 캐시와 장애**

- 키워드: DNS, TTL
- 인상 깊은 문장:

````
JVM DNS 캐시 기본값
negative cache
````

- 내 생각:

````
회사에서 특정 도메인만 접속 안 되던 일과 비교해 볼 것
````

**2. 팀 온보딩 문서 만들기**

- 키워드: 온보딩
- 인상 깊은 문장:

````
첫 주 체크리스트
````

- 내 생각:

````
(없음)
````

## unrelated-4 (unrelated, 2건)

**1. LLM 프롬프트 캐싱으로 비용 줄이기**

- 키워드: LLM, Prompt Caching
- 인상 깊은 문장:

````
고정 프롬프트를 앞에
캐시 히트율 모니터링
````

- 내 생각:

````
주간 읽기 자동화에도 적용 가능할지
````

**2. B-Tree와 LSM-Tree**

- 키워드: B-Tree, LSM
- 인상 깊은 문장:

````
쓰기 증폭 vs 읽기 증폭
컴팩션
````

- 내 생각:

````
RocksDB
````

## unrelated-5 (unrelated, 3건)

**1. 애자일 회고 진행 방법**

- 키워드: 회고, KPT
- 인상 깊은 문장:

````
Keep, Problem, Try
````

- 내 생각:

````
스터디 회고에도 써볼 것
````

**2. HTTP/3와 QUIC**

- 키워드: HTTP/3, QUIC
- 인상 깊은 문장:

````
UDP 기반
Head-of-line blocking 해소
````

- 내 생각:

````
(없음)
````

**3. Java 21 가상 스레드 실전**

- 키워드: Virtual Thread
- 인상 깊은 문장:

````
pinning
synchronized 블록 주의
````

- 내 생각:

````
커넥션 풀 크기와의 관계 궁금
````

## normal-1 (normal, 2건)

**1. MySQL 인덱스 설계 실수 모음**

- 키워드: MySQL, Index
- 인상 깊은 문장:

````
카디널리티 낮은 컬럼 선두 배치
커버링 인덱스로 테이블 접근 제거
````

- 내 생각:

````
Oracle에서도 같은 원리. 클러스터링 팩터 개념과 연결해서 이해
````

**2. 슬로우 쿼리 분석 자동화**

- 키워드: Slow Query, pt-query-digest
- 인상 깊은 문장:

````
쿼리 지문(fingerprint)으로 묶어서 상위 N개 관리
````

- 내 생각:

````
회사에서도 AWR 리포트로 비슷하게 할 수 있을 듯
````

## normal-2 (normal, 2건)

**1. 서킷 브레이커 적용기**

- 키워드: Resilience4j, Circuit Breaker
- 인상 깊은 문장:

````
실패율 임계치
half-open 상태
````

- 내 생각:

````
외부 API 장애가 전체 장애로 번지는 걸 막는 장치
````

**2. 타임아웃 설정의 모든 것**

- 키워드: Timeout
- 인상 깊은 문장:

````
connect timeout과 read timeout 구분
상위 타임아웃이 하위보다 길어야 한다
````

- 내 생각:

````
우리 서비스는 기본값 그대로인 곳이 많음
````

## normal-3 (normal, 3건)

**1. Kafka 정확히 한 번 처리**

- 키워드: Kafka, EOS
- 인상 깊은 문장:

````
멱등 프로듀서
트랜잭셔널 ID
````

- 내 생각:

````
Kafka 공부 시작 전에 개념 정리용으로 좋았음
````

**2. 컨슈머 오프셋 관리 전략**

- 키워드: Offset
- 인상 깊은 문장:

````
auto commit의 함정
처리 후 커밋
````

- 내 생각:

````
중복 처리 가능성 항상 고려
````

**3. Kafka 모니터링 지표**

- 키워드: Lag
- 인상 깊은 문장:

````
컨슈머 lag
under-replicated partitions
````

- 내 생각:

````
(없음)
````

## normal-4 (normal, 1건)

**1. 테스트 피라미드 다시 보기**

- 키워드: Test
- 인상 깊은 문장:

````
단위 테스트 비중
통합 테스트는 핵심 경로만
````

- 내 생각:

````
개인 프로젝트 테스트 구조와 비교해 보니 단위 테스트 위주로 잘 짜여 있음
````
