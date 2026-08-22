# Git Workflow

## 핵심 규칙

눈에 띄는 기능 하나를 구현할 때마다 바로 커밋한다.
UI 여러 화면, Agent integration, Viewer를 한 커밋에 합치지 않는다.

## 메시지 형식

```text
feat: 한국어로 기능 하나를 설명

- 사용자에게 보이는 동작을 구체적으로 설명
- 중요한 데이터 흐름과 제약을 설명
- 수행한 테스트 또는 확인 방법을 설명
```

## 좋은 예

```text
feat: 현재 페이지의 첨부문서를 발견

- PDF, HWP, HWPX, XLSX 링크를 DOM에서 수집
- URL과 파일명을 기준으로 중복 후보를 제거
- 사용자가 선택하기 전에는 문서를 외부로 전송하지 않음
```

## 나쁜 예

```text
feat: 기능 구현
```

```text
feat: 오버레이와 패널과 에이전트와 뷰어 구현
```

## 커밋 전 체크

1. 변경 범위가 기능 한 가지인지 확인
2. unrelated diff 제거
3. 관련 test 실행
4. `git diff --check`
5. 로그/Fixture에 API Key·원문 개인정보가 없는지 확인
6. 상세 본문 작성

## 초기 설정

스타터 최초 세팅은 다음처럼 별도 커밋한다.

```text
chore: 개발 의존성과 잠금 파일을 고정

- WXT, React, TypeScript와 테스트 도구 의존성을 설치
- pnpm-lock.yaml을 생성해 재현 가능한 환경을 고정
- lint, typecheck, test, build 기본 명령을 확인
```

## 기존 커밋 보호

요청 없이 amend, rebase, force push를 하지 않는다.
