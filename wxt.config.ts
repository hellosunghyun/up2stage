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
    icons: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    },
    permissions: ["activeTab", "sidePanel", "storage", "scripting"],
    host_permissions: ["https://api.upstage.ai/*", "http://hissf.or.kr/*"],
    optional_host_permissions: ["https://*/*", "http://*/*"],
    action: {
      default_title: "Up to Stage 열기",
      default_icon: {
        16: "icons/icon-16.png",
        32: "icons/icon-32.png",
        48: "icons/icon-48.png",
        128: "icons/icon-128.png",
      },
    },
  }
});
