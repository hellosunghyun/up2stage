# Fixture Strategy

## 원본 Fixture

최종 실제 Agent 응답:

`references/upstage/runs/final/job_XHVD4hULc9tFatRSVr7Bgx.json`

이 파일은 읽기 전용이다.
테스트에서 매번 3MB 이상의 raw 파일을 직접 읽지 말고 필요한 최소 부분을 별도 fixture로 추출해 커밋한다.

예:

```text
test/fixtures/upstage/
├── parse-elements.sample.json
├── classify.sample.json
├── primary-notice.sample.json
├── quick-questions.sample.json
└── instruct-citations.sample.json
```

추출 fixture에는 원본 Job ID와 jq 추출 명령을 주석/README에 기록한다.
모델이 생성한 임의 데이터로 API contract test를 대체하지 않는다.
