// preload.js
import { contextBridge, desktopCapturer } from "electron";

contextBridge.exposeInMainWorld("api", {
  desktopCapturer: desktopCapturer,
});
