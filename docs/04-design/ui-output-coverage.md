# Agent Output → UI Coverage

새 AI 기능을 추가하기 전에 이미 추출된 필드를 UI에서 최대한 사용한다.

| Agent Output | UI |
|---|---|
| `title`, `issuer` | Current Page / Context Card |
| `benefits_or_outcomes` | Overview |
| `key_dates` | 가장 가까운 마감 / Timeline |
| `key_requirements` | 주요 조건 / Breakdown |
| `required_submissions` | 필수 제출 Checklist |
| `conditional_submissions` | 조건부 제출 Checklist |
| `quick_questions` | Dynamic Quick Form |
| `critical_cautions` | 놓치면 안 되는 것 |
| `next_actions_seed` | Action Checklist |
| `format_constraints` | 작성 전 확인 |
| `form_cautions` | 작성 위험요소 |
| `procedure steps` | 진행 순서 |
| `completion_checks` | 완료 확인 |
| location/citation | Source badge, hover preview, viewer navigation |

Quick Chip도 캐시된 결과를 우선한다.

- `나는 신청할 수 있나요?` → Quick Form
- `무엇을 준비해야 하나요?` → 제출 Checklist 즉시 표시
- `주의사항 알려줘` → caution 즉시 표시

추가 설명이 필요한 경우에만 Solar를 호출한다.
