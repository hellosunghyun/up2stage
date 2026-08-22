# Logging과 Performance

민감 정보를 기록하지 않고 사용자 체감 성능을 측정한다.

# 85. Logging

개발 로그는 다음 정도만.

```ts
logger.info('agent_job_submitted', {
  caseId,
  documentCount,
  jobId
});
```

금지:

```text
원문 전체
API Key
사용자 답변 원문
개인정보
```

---

---

# 86. Performance 목표

현재 Agent 자체 baseline을 더 줄이기 위해 schema를 훼손하지 않는다.

UI 목표:

```text
Overlay display          < 150ms 체감
Side Panel initial load  < 500ms
Local cached case open   < 500ms
Quick Form open          즉시
Cached Quick Action      즉시
Source navigation        < 300ms 체감
Viewer page shell        < 1s
```

Agent는 async processing UI로 감싼다.

---
