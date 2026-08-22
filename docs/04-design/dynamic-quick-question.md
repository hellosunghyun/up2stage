# Dynamic Quick Question UI

## 원칙

- 질문은 Agent의 `quick_questions` 결과를 사용한다.
- 버튼 클릭 후 질문 생성을 위한 새 LLM 호출을 하지 않는다.
- `type`, `options`, `required`, `rule`, location을 보존한다.
- `primary_notice`와 `requirements_checklist`의 중복 질문은 Extension에서 제거한다.

## 입력 타입

| Agent type | UI |
|---|---|
| `text` | TextInput |
| `number` | NumberInput |
| `select` | Select/Combobox |
| `boolean` | Segmented Control |
| `date` | DateInput |
| `organization_select` | Searchable Combobox |

## 추가 가치

- `rule`은 접힌 "왜 묻나요?" 설명으로 사용한다.
- `required=false`는 "모르면 비워도 돼요"로 표현한다.
- `sourceIds`가 있으면 질문 근거를 미리 볼 수 있다.
- `options`가 있으면 UI에 hardcode하지 않는다.

## 중복 제거

1. snake_case key 정규화
2. alias map 적용
3. `primary_notice` 질문을 우선
4. checklist의 추가 조건만 보강

## 결과 화면

전체 판정 한 줄뿐 아니라 항목별 상태를 보여준다.

```text
✓ 학년: 입력 2학년 / 기준 2학년 이상
✓ 지원구간: 입력 3구간 / 기준 4구간 이하
? 거주 조건: 미입력
```
