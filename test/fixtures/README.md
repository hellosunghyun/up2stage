# test/fixtures

이 폴더는 구조만 미리 생성되어 있으며 제품 구현 코드는 포함하지 않는다.
작업 전에 같은 폴더의 `AGENTS.md`와 `docs/00-index.md`를 읽고 기능 단위로 파일을 추가한다.

## Upstage final run sample

- 원본: `references/upstage/runs/final/job_XHVD4hULc9tFatRSVr7Bgx.json`
- 생성: `node test/fixtures/upstage/extract-final-run-fixture.mjs`
- 결과: `test/fixtures/upstage/job_XHVD4hULc9tFatRSVr7Bgx.sample.json`
- 범위: Guidance와 Evidence mapping에 필요한 실제 Parse page 1~6, 15, 17, 18, 19 및 전체 Classify/Extract/Instruct output
- 원본 Job과 Agent v0.22 JSON은 수정하지 않는다.
