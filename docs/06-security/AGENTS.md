# AGENTS.md — docs/06-security

## 적용 범위

`docs/06-security` 아래에 적용하며 루트 `AGENTS.md`를 함께 따른다.

## 책임

Manifest 권한, API Key, 개인정보, 외부 전송 경계를 관리한다.

## 필수 참고

- `docs/06-security/privacy-security.md`
- `docs/06-security/chrome-permissions.md`

## 규칙

- 권한 확대는 ADR과 사용자 고지가 필요하다.
- 민감정보 예시를 문서에 그대로 복사하지 않는다.

## 완료 기준

- 문서의 현재 결정과 원본 reference가 구분되어 있다.
- 변경이 다른 폴더의 계약에 영향을 주면 관련 문서와 ADR을 함께 수정한다.
- 기능 구현과 문서 변경을 한 커밋에 무분별하게 섞지 않는다.
