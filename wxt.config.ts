import { defineConfig } from "wxt";

/**
 * WXT 기반 Manifest V3 설정이다.
 * 사용자 노출 이름은 "up to stage"를 사용한다.
 */
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "up to stage",
    short_name: "up2stage",
    version: "0.0.1",
    description:
      "웹에서 마주친 여러 문서를 구조화되고 신뢰할 수 있으며 접근 가능한 안내로 펼칩니다.",
    permissions: ["activeTab", "sidePanel", "storage", "scripting"],
    host_permissions: ["https://api.upstage.ai/*"],
    optional_host_permissions: ["https://*/*", "http://*/*"],
    action: {
      default_title: "up to stage 열기"
    }
  }
});
