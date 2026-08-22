# 개인정보·보안 기본 원칙

# 7. Manifest / Permission

P0 기본 권한:

```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "sidePanel",
    "storage"
  ],
  "host_permissions": [
    "https://api.upstage.ai/*"
  ]
}
```

원칙:

- 기본 `<all_urls>` 금지
- cookies 미사용
- browsing history 미사용
- file access는 필요할 때 별도 UX
- 다른 origin의 첨부 파일 접근이 필요한 경우 optional permission으로 요청
- 사용자가 선택하지 않은 문서를 외부로 전송하지 않음

---

---

# 84. Security / Privacy

원칙:

1. 사용자가 선택한 문서만 전송
2. 전송 전 동의
3. API Key 로그 금지
4. 원본 문서 내용 console log 금지
5. 필요한 경우 local cache 삭제 제공
6. 페이지 전체 browsing history 저장 금지
7. Case source URL은 해당 분석에 필요한 범위로만 보관
8. User Quick Question 값은 해당 Case 판단에만 사용
9. Chat prompt에 불필요한 사용자 입력을 붙이지 않음

---
