# Final Agent Run

- Job: `job_XHVD4hULc9tFatRSVr7Bgx`
- Agent: General Document Guidance v0.22
- Cache: MISS
- Document count: 5
- Total: 약 139.07초

주요 단계:

| Step | Time |
|---|---:|
| Parse | 33.58s |
| Classify | 4.02s |
| application_form_extract | 15.48s |
| primary_notice_extract | 34.66s |
| procedure_extract | 19.86s |
| requirements_checklist_extract | 23.54s |
| initial_guidance | 7.91s |

Studio의 화면상 Accuracy 백분율은 제품 acceptance metric으로 그대로 사용하지 않는다.
실제 role routing, 필드 존재, QQ, citation, source location을 자체 검증한다.

유용한 조회 예:

```bash
jq '.id, .model' job_XHVD4hULc9tFatRSVr7Bgx.json
jq '.output[] | {model, status}' job_XHVD4hULc9tFatRSVr7Bgx.json
```
