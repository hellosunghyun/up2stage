# Network · Retry · Resume · Error UX

장시간 Agent Job과 Side Panel 재진입을 안정적으로 처리한다.

# 79. Network Client

공통 wrapper:

```ts
async function request<T>(
  input: RequestInfo,
  init: RequestInit,
  schema: ZodSchema<T>
): Promise<T>
```

기능:

- timeout
- abort
- JSON parse
- status error
- schema validation
- retry policy
- 로그 sanitization

---

---

# 80. Retry

### File Upload
- 네트워크 오류: 1~2회 retry

### Agent Submit
- 자동 중복 submit 방지

### Polling
- exponential-ish interval
- 최대 interval 제한

예:

```text
2s → 3s → 5s → 8s → 10s 유지
```

### Search/Solar
- 429/5xx 조건부 retry
- 사용자 cancel 지원

---

---

# 81. Cancel

Processing 화면에 P0에서는 반드시 버튼이 없어도 되지만 내부적으로 Abort 가능하게 구현.

```ts
AbortController
```

Side Panel이 닫혀도 Agent Job 자체는 계속될 수 있으므로 Case에 `agentJobId`를 저장해 재진입 시 polling resume.

---

---

# 82. Resume

Side Panel reopen:

```text
Case exists
+
agentJobId exists
+
status processing
↓
Job status fetch
↓
Processing UI resume
```

이 기능은 해커톤 demo 안정성에 중요하다.

---

---

# 83. Error UX

## Attachment fetch 실패

```text
일부 문서를 가져오지 못했어요.

✓ 공고문.pdf
! 신청서.hwp

[다시 시도] [가능한 문서만 분석]
```

## Agent 실패

```text
문서를 처리하지 못했어요.
선택한 파일은 그대로 유지됩니다.

[다시 시도]
```

## Unsupported viewer

```text
이 형식은 아직 원문 Viewer를 지원하지 않아요.
구조화된 문서 보기로 확인할 수 있습니다.

[구조 보기]
```

---
