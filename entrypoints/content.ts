import { defineContentScript } from "wxt/utils/define-content-script";

export default defineContentScript({
  matches: [],
  main() {
    console.log("up to stage content script loaded");
  },
});
