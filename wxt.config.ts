import { defineConfig } from "wxt";

/**
 * 구조와 권한 기준만 담은 WXT 설정이다.
 * 이 ZIP에는 제품 구현 코드가 없으므로 entrypoint 구현은 기능 단위 커밋으로 추가한다.
 */
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "UP²STAGE",
    short_name: "UP2STAGE",
    description:
      "웹에서 마주친 여러 문서를 구조화되고 신뢰할 수 있으며 접근 가능한 안내로 펼칩니다.",
    permissions: ["activeTab", "scripting", "sidePanel", "storage"],
    host_permissions: ["https://api.upstage.ai/*"],
    optional_host_permissions: ["https://*/*", "http://*/*"],
    action: {
      default_title: "UP²STAGE 열기"
    }
  }
});
