import { defineConfig } from "wxt";

/**
 * WXT 기반 Manifest V3 설정이다.
 * 사용자 노출 이름은 "Up to Stage"를 사용한다.
 */
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Up to Stage",
    short_name: "up2stage",
    version: "0.0.1",
    description:
      "Unfold Pages to Structured, Trusted, Accessible Guidance for Everyone.",
    permissions: ["activeTab", "sidePanel", "storage", "scripting"],
    host_permissions: ["https://api.upstage.ai/*", "http://hissf.or.kr/*"],
    optional_host_permissions: ["https://*/*", "http://*/*"],
    action: {
      default_title: "Up to Stage 열기"
    }
  }
});
