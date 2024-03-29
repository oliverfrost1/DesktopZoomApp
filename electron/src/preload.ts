// In the preload script.
import { ipcRenderer } from "electron";

let stream: MediaStream;
ipcRenderer.on("SET_SOURCE", async (_, sourceId) => {
  stream && stream.getTracks().forEach((track) => track.stop());
  console.log("setting source");

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          width: "100%",
          height: "100%",

          // Hide cursor from the screen capture
        },
      },
    });

    console.log(stream);
    handleStream(stream);
    callWindowPosition();
  } catch (e) {
    handleError(e);
  }
});

let windowX = 0;
let windowY = 0;
let windowWidth = 0;
let windowHeight = 0;

function handleStream(stream: MediaStream) {
  const video = document.createElement("video");
  video.srcObject = stream;
  video.play();
  video.onloadedmetadata = () => {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    // Set canvas size to the desired crop region size

    // Continuously draw the video frame, cropped to the canvas
    (function drawFrame() {
      if (!stream?.active) return;
      requestAnimationFrame(drawFrame);
      console.log(windowHeight, windowWidth, windowX, windowY);
      canvas.width = windowWidth;
      canvas.height = windowHeight;
      ctx.drawImage(
        video,
        windowX + 8,
        windowY + 8,
        windowWidth,
        windowHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );
    })();
    // Append the canvas to the body or another element on your page
    document.body.appendChild(canvas);
  };
}

function callWindowPosition() {
  ipcRenderer.send("request-window-position");
  setTimeout(() => {
    callWindowPosition();
  }, 50);
}

ipcRenderer.on("window-position", (_, { x, y, width, height }) => {
  windowX = x;
  windowY = y;
  windowWidth = width;
  windowHeight = height;
});

function handleError(e: any) {
  console.log(e);
}
