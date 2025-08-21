import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// import {
//   connect,
//   ExtensionTransport,
// } from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isExtensionEnvironment() {
  return Boolean(window.chrome?.runtime?.id);
}

export async function getActiveTab() {
  console.log("🍐 Getting active tab");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log("🍐 Active tab:", tab);
  return tab;
}

export async function getViewportInfo() {
  const tab = await getActiveTab();
  if (!tab.id) throw new Error("No active tab found");
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
    }),
  });

  const viewport = result.result;
  if (!viewport) throw new Error("Could not get viewport info");
  console.log("\n📊 EXTENSION VIEWPORT INFO:");
  console.log(`📐 Browser viewport: ${viewport.width}x${viewport.height}`);
  console.log(`📱 Device pixel ratio: ${viewport.devicePixelRatio}`);
  console.log(
    `🖥️ Physical pixels: ${viewport.width * viewport.devicePixelRatio}x${viewport.height * viewport.devicePixelRatio}`,
  );

  return viewport;
}

export async function getDOMContent() {
  const tab = await getActiveTab();
  if (!tab.id) throw new Error("No active tab found");
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML,
  });
  const dom = result.result;
  if (!dom) throw new Error("Could not get DOM content");
  return dom;
}

// export async function getScreenshot() {
//   const dataUrl = await chrome.tabs.captureVisibleTab();
//   const base64 = dataUrl.split(",")[1];
//   return base64;
// }

// async function getCroppedScreenshotV2(clip: {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// }) {
//   const crxApp = await crx.start();
//   const tab = await getActiveTab();
//   if (!tab.id) throw new Error("No active tab found");
//   const page = await crxApp.attach(tab.id);
//   const buffer = await page.screenshot({
//     type: "jpeg",
//     fullPage: true,
//     clip: {
//       x: clip.x,
//       y: clip.y,
//       width: clip.width,
//       height: clip.height,
//     },
//   });
//   const base64 = buffer.toString("base64");
//   console.log("🍐 Base64 from getCroppedScreenshotV2:", base64);
//   return base64;
// }

// async function getCroppedScreenshot(clip: {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
// }) {
//   const fullDataUrl = await chrome.tabs.captureVisibleTab();

//   const image = new Image();
//   image.src = fullDataUrl;

//   await new Promise((resolve) => (image.onload = resolve));

//   const canvas = document.createElement("canvas");
//   canvas.width = clip.width;
//   canvas.height = clip.height;
//   const ctx = canvas.getContext("2d")!;
//   ctx.drawImage(
//     image,
//     clip.x,
//     clip.y,
//     clip.width,
//     clip.height,
//     0,
//     0,
//     clip.width,
//     clip.height,
//   );

//   return canvas.toDataURL("image/png");
// }

// export async function getScreenshot() {
//   // When overlay is active, take AI screenshot of hidden content area
//   const tab = await getActiveTab();
//   if (!tab.id) throw new Error("No active tab found");
//   const tabId = tab.id;
//   const viewportInfo = await chrome.tabs.sendMessage(tabId, {
//     type: "GET_VIEWPORT_INFO",
//   });

//   console.log("Viewport info:", viewportInfo);

//   if (viewportInfo.isOverlayActive) {
//     const aiScreenshot = await getCroppedScreenshotV2({
//       x: 0,
//       y: viewportInfo.height,
//       width: viewportInfo.width,
//       height: viewportInfo.height,
//     });
//     // const base64 = aiScreenshot.split(",")[1];
//     return aiScreenshot;
//   } else {
//     // Normal screenshot
//     const screenshot = await chrome.tabs.captureVisibleTab();
//     const base64 = screenshot.split(",")[1];
//     return base64;
//   }
// }

// export async function getScreenshot() {
//   const tab = await getActiveTab();
//   if (!tab.id) throw new Error("No active tab found");
//   const tabId = tab.id;

//   // Get viewport info to check if overlay is active
//   const viewportInfo = await chrome.tabs.sendMessage(tabId, {
//     type: "GET_VIEWPORT_INFO",
//   });

//   console.log("Viewport info:", viewportInfo);

//   if (viewportInfo.isOverlayActive) {
//     let wasDebuggerAttached = false;

//     try {
//       // Check if debugger is already attached by trying to send a command
//       try {
//         await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
//           expression: "1 + 1",
//         });
//         wasDebuggerAttached = true;
//         console.log("🔧 Using existing debugger attachment");
//       } catch (error) {
//         // Debugger not attached, we need to attach it
//         console.log("🔧 Attaching new debugger for screenshot");
//         await chrome.debugger.attach({ tabId }, "1.3");
//       }

//       // Capture screenshot with custom clip region (content below overlay)
//       const screenshot = (await chrome.debugger.sendCommand(
//         { tabId },
//         "Page.captureScreenshot",
//         {
//           format: "jpeg",
//           quality: 60,
//           clip: {
//             x: 0,
//             y: viewportInfo.height, // Start below the overlay
//             width: viewportInfo.width,
//             height: viewportInfo.height,
//             scale: 1,
//           },
//         },
//       )) as { data: string };

//       // Only detach if we attached it (don't interfere with automation debugger)
//       if (!wasDebuggerAttached) {
//         await chrome.debugger.detach({ tabId });
//         console.log("🔧 Detached temporary debugger");
//       }

//       return screenshot.data; // Already base64 encoded
//     } catch (error) {
//       // If we attached the debugger and there's an error, make sure to detach
//       if (!wasDebuggerAttached) {
//         try {
//           await chrome.debugger.detach({ tabId });
//         } catch (detachError) {
//           console.error("Failed to detach debugger:", detachError);
//         }
//       }
//       throw error;
//     }
//   } else {
//     // Normal screenshot when no overlay
//     const screenshot = await chrome.tabs.captureVisibleTab();
//     const base64 = screenshot.split(",")[1];
//     return base64;
//   }
// }

// export async function getScreenshot() {
//   const tab = await getActiveTab();
//   if (!tab.id) throw new Error("No active tab found");
//   const tabId = tab.id;

//   // Get viewport info to check if overlay is active
//   const response = await chrome.tabs.sendMessage(tabId, {
//     type: "GET_VIEWPORT_INFO",
//   });

//   const viewportInfo = response.viewportInfo;

//   console.log("🔍 Viewport info:", viewportInfo);

//   if (viewportInfo.isOverlayActive) {
//     console.log("🔍 Overlay is active, capturing hidden content");

//     let wasDebuggerAttached = false;

//     try {
//       // Check if debugger is already attached by trying to send a command
//       try {
//         await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
//           expression: "1 + 1",
//         });
//         wasDebuggerAttached = true;
//         console.log("🔧 Using existing debugger attachment");
//       } catch (error) {
//         // Debugger not attached, we need to attach it
//         console.log("🔧 Attaching new debugger for screenshot");
//         await chrome.debugger.attach({ tabId }, "1.3");
//       }

//       // Get page layout metrics to understand the full page dimensions
//       const layoutMetrics = (await chrome.debugger.sendCommand(
//         { tabId },
//         "Page.getLayoutMetrics",
//       )) as {
//         layoutViewport: { clientWidth: number; clientHeight: number };
//         visualViewport: { clientWidth: number; clientHeight: number };
//         contentSize: { width: number; height: number };
//       };

//       console.log("🔍 Page layout metrics:", layoutMetrics);
//       console.log(
//         `🔍 Content size: ${layoutMetrics.contentSize.width}x${layoutMetrics.contentSize.height}`,
//       );
//       console.log(
//         `🔍 Layout viewport: ${layoutMetrics.layoutViewport.clientWidth}x${layoutMetrics.layoutViewport.clientHeight}`,
//       );

//       // // After getting layoutMetrics, calculate the device pixel ratio
//       // const devicePixelRatio =
//       //   layoutMetrics.layoutViewport.clientWidth / viewportInfo.width;
//       // console.log("🔍 Device pixel ratio:", devicePixelRatio);

//       // // Update your clip region calculation to use device pixels
//       // const clipRegion = {
//       //   x: 0,
//       //   y: viewportInfo.height * devicePixelRatio, // Convert to device pixels
//       //   width: viewportInfo.width * devicePixelRatio, // Convert to device pixels
//       //   height: viewportInfo.height * devicePixelRatio, // Convert to device pixels
//       //   scale: 1,
//       // };

//       // console.log("🔍 Clip region:", clipRegion);
//       // console.log(
//       //   `🔍 Attempting to capture from Y=${clipRegion.y} to Y=${clipRegion.y + clipRegion.height}`,
//       // );
//       // console.log(
//       //   `🔍 This should capture content from pixel ${clipRegion.y} down to pixel ${clipRegion.y + clipRegion.height}`,
//       // );

//       // Capture screenshot with custom clip region (content below overlay)
//       console.log("🔍 Sending Page.captureScreenshot command...");
//       const screenshot = (await chrome.debugger.sendCommand(
//         { tabId },
//         "Page.captureScreenshot",
//         {
//           format: "jpeg",
//           quality: 60,
//           // clip: clipRegion,
//           // clip: {
//           //   x: 0,
//           //   y: 0,
//           //   width: layoutMetrics.contentSize.width,
//           //   height: layoutMetrics.contentSize.height,
//           //   scale: 1,
//           // },
//           // clip: {
//           //   x: 0,
//           //   y: 0, // Start below the overlay
//           //   width: layoutMetrics.contentSize.width,
//           //   height:
//           //     layoutMetrics.contentSize.height -
//           //     viewportInfo.height * devicePixelRatio, // Everything below overlay
//           //   scale: 1,
//           // },
//           clip: {
//             x: 0,
//             y: 0, // Start below the overlay
//             width: layoutMetrics.contentSize.width,
//             height:
//               layoutMetrics.contentSize.height -
//               viewportInfo.height * devicePixelRatio, // Everything below overlay
//             scale: 1,
//           },
//           // clip: {
//           //   x: 0,
//           //   y: 0, // Start below the overlay
//           //   width: 1091,
//           //   height: 832 * 2,
//           //   scale: 1,
//           // },
//           // captureBeyondViewport: true,
//         },
//       )) as { data: string };

//       console.log("🔍 Screenshot captured successfully");
//       console.log(
//         `🔍 Screenshot data length: ${screenshot.data.length} characters`,
//       );

//       // Only detach if we attached it (don't interfere with automation debugger)
//       if (!wasDebuggerAttached) {
//         await chrome.debugger.detach({ tabId });
//         console.log("🔧 Detached temporary debugger");
//       }

//       return screenshot.data; // Already base64 encoded
//     } catch (error) {
//       console.error("🔍 Screenshot capture failed:", error);

//       // If we attached the debugger and there's an error, make sure to detach
//       if (!wasDebuggerAttached) {
//         try {
//           await chrome.debugger.detach({ tabId });
//         } catch (detachError) {
//           console.error("Failed to detach debugger:", detachError);
//         }
//       }
//       throw error;
//     }
//   } else {
//     console.log("🔍 No overlay active, taking normal screenshot");
//     // Normal screenshot when no overlay
//     const screenshot = await chrome.tabs.captureVisibleTab();
//     const base64 = screenshot.split(",")[1];
//     console.log(
//       `🔍 Normal screenshot data length: ${base64.length} characters`,
//     );
//     return base64;
//   }
// }

// export async function getScreenshot() {
//   const tab = await getActiveTab();
//   if (!tab.id) throw new Error("No active tab found");
//   const tabId = tab.id;

//   // Get viewport info to check if overlay is active
//   const response = await chrome.tabs.sendMessage(tabId, {
//     type: "GET_VIEWPORT_INFO",
//   });

//   const viewportInfo = response.viewportInfo;

//   console.log("🔍 Viewport info:", viewportInfo);

//   if (viewportInfo.isOverlayActive) {
//     console.log("🔍 Overlay is active, capturing hidden content");

//     let browser = await connect({
//       transport: await ExtensionTransport.connectTab(tab.id),
//     });

//     try {
//       const [page] = await browser.pages();
//       const screenshot = await page.screenshot({
//         type: "jpeg",
//         fullPage: true,
//         quality: 70,
//         encoding: "base64",
//       });
//       await browser.disconnect();
//       return screenshot;
//     } catch (error) {
//       console.error("🔍 Screenshot capture failed:", error);

//       await browser.disconnect();
//     }
//   } else {
//     console.log("🔍 No overlay active, taking normal screenshot");
//     // Normal screenshot when no overlay
//     const screenshot = await chrome.tabs.captureVisibleTab();
//     const base64 = screenshot.split(",")[1];
//     console.log(
//       `🔍 Normal screenshot data length: ${base64.length} characters`,
//     );
//     return base64;
//   }
// }

export async function getScreenshot() {
  const tab = await getActiveTab();
  if (!tab.id) throw new Error("No active tab found");
  const tabId = tab.id;

  // Get viewport info to check if overlay is active
  const response = await chrome.tabs.sendMessage(tabId, {
    type: "GET_VIEWPORT_INFO",
  });

  const viewportInfo = response.viewportInfo;

  console.log("🔍 Viewport info:", viewportInfo);

  if (viewportInfo.isOverlayActive) {
    console.log("🔍 Overlay is active, capturing hidden content");
    await chrome.tabs.sendMessage(tabId, {
      type: "HIDE_PROCESSING_OVERLAY",
    });

    const screenshot = await chrome.tabs.captureVisibleTab();
    await chrome.tabs.sendMessage(tabId, {
      type: "SHOW_PROCESSING_OVERLAY",
    });
    const base64 = screenshot.split(",")[1];
    return base64;
  } else {
    console.log("🔍 No overlay active, taking normal screenshot");
    const screenshot = await chrome.tabs.captureVisibleTab();
    const base64 = screenshot.split(",")[1];
    return base64;
  }
}

export async function benchmarkCaptures() {
  const formats = [
    { format: "png" },
    { format: "jpeg", quality: 100 },
    { format: "jpeg", quality: 80 },
    { format: "jpeg", quality: 60 },
    { format: "jpeg", quality: 40 },
    { format: "jpeg", quality: 30 },
    { format: "jpeg", quality: 20 },
    { format: "jpeg", quality: 10 },
  ];

  for (const opts of formats) {
    const label = `${opts.format}${opts.quality ? "-" + opts.quality : ""}`;
    console.time(label);
    await new Promise<void>((resolve) => {
      chrome.tabs.captureVisibleTab(opts, (dataUrl) => {
        // Optional: measure size too
        console.log(label, "size:", Math.round(dataUrl.length / 1024), "KB");
        // console.log("Screenshot being sent:", `${dataUrl}`);

        resolve();
      });
    });
    console.timeEnd(label);
  }
}

// export async function benchmarkCDPCaptures() {
//   const formats = [
//     { format: "png" },
//     { format: "jpeg", quality: 100 },
//     { format: "jpeg", quality: 80 },
//     { format: "jpeg", quality: 60 },
//     { format: "jpeg", quality: 40 },
//     { format: "jpeg", quality: 30 },
//     { format: "jpeg", quality: 20 },
//     { format: "jpeg", quality: 10 },
//   ];

//   const tab = await getActiveTab();
//   if (!tab.id) throw new Error("No active tab found");
//   const tabId = tab.id;

//   await chrome.debugger.attach({ tabId }, "1.3");

//   for (const opts of formats) {
//     const label = `${opts.format}${opts.quality ? "-" + opts.quality : ""}`;
//     console.time(label);
//     const result = (await chrome.debugger.sendCommand(
//       { tabId },
//       "Page.captureScreenshot",
//       opts,
//     )) as { data: string };
//     console.log(
//       label,
//       "size:",
//       Math.round((result.data.length * 3) / 4 / 1024),
//       "KB",
//     );
//     console.timeEnd(label);
//   }

//   await chrome.debugger.detach({ tabId });
// }

// Stream capture implementation

// class StreamCapture {
//   stream: MediaStream | null;
//   video: HTMLVideoElement;
//   canvas: HTMLCanvasElement;
//   ctx: CanvasRenderingContext2D | null;
//   isReady: boolean;

//   constructor() {
//     this.stream = null;
//     this.video = document.createElement("video");
//     this.canvas = document.createElement("canvas");
//     this.ctx = this.canvas.getContext("2d");
//     this.isReady = false;
//   }

//   async initialize() {
//     await new Promise<void>((resolve, reject) => {
//       chrome.tabCapture.capture({ audio: false, video: true }, (stream) => {
//         if (chrome.runtime.lastError || !stream) {
//           reject(new Error(chrome.runtime.lastError?.message || "No stream"));
//           return;
//         }
//         this.stream = stream;
//         resolve();
//       });
//     });

//     this.video.srcObject = this.stream;
//     this.video.muted = true;

//     await new Promise<void>((resolve) => {
//       this.video.onloadedmetadata = () => {
//         this.canvas.width = this.video.videoWidth;
//         this.canvas.height = this.video.videoHeight;
//         this.video.play();
//         this.isReady = true;
//         resolve();
//       };
//     });
//   }

//   captureFrame(): ImageData | null {
//     if (!this.isReady || !this.ctx) return null;
//     this.ctx.drawImage(this.video, 0, 0);
//     return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
//   }

//   hasMarker(imageData: ImageData): boolean {
//     const pixels = imageData.data;
//     return pixels[0] === 255 && pixels[1] === 0 && pixels[2] === 255;
//   }

//   async captureCleanFrame(tabId: number): Promise<ImageData | null> {
//     console.log("🎬 Starting clean frame capture...");

//     const frames: ImageData[] = [];
//     const captureCount = 20;

//     console.time("toggle-speed");

//     // Fast toggle
//     await chrome.tabs.sendMessage(tabId, { type: "HIDE_PROCESSING_OVERLAY" });
//     await chrome.tabs.sendMessage(tabId, { type: "SHOW_PROCESSING_OVERLAY" });

//     console.timeEnd("toggle-speed");

//     // Capture frames after toggle
//     for (let i = 0; i < captureCount; i++) {
//       const frame = this.captureFrame();
//       if (frame) frames.push(frame);
//       await new Promise((resolve) => requestAnimationFrame(resolve));
//     }

//     console.log(`📸 Captured ${frames.length} frames`);

//     // Find marker-less sequence
//     const cleanFrames: ImageData[] = [];
//     for (const frame of frames) {
//       if (!this.hasMarker(frame)) {
//         cleanFrames.push(frame);
//       }
//     }

//     console.log(`🔍 Found ${cleanFrames.length} marker-less frames`);

//     if (cleanFrames.length === 0) return null;

//     // Select best frame using middle-frame logic
//     let selectedFrame: ImageData;
//     if (cleanFrames.length === 1) {
//       selectedFrame = cleanFrames[0];
//       console.log("📌 Using only available clean frame");
//     } else if (cleanFrames.length === 2) {
//       selectedFrame = cleanFrames[0];
//       console.log("📌 Using first of 2 clean frames");
//     } else {
//       const middleIndex = Math.floor(cleanFrames.length / 2);
//       selectedFrame = cleanFrames[middleIndex];
//       console.log(
//         `📌 Using middle frame (${middleIndex + 1}/${cleanFrames.length})`,
//       );
//     }

//     return selectedFrame;
//   }

//   cleanup() {
//     if (this.stream) {
//       this.stream.getTracks().forEach((track) => track.stop());
//     }
//     this.isReady = false;
//   }
// }

// // Simple benchmark function
// export async function benchmarkStreamCapture() {
//   console.log("🚀 Starting clean stream capture benchmark");
//   const capture = new StreamCapture();

//   try {
//     const tab = await getActiveTab();
//     if (!tab.id) throw new Error("No active tab found");
//     const tabId = tab.id;

//     // Initialize stream
//     console.time("stream-initialization");
//     await capture.initialize();
//     console.timeEnd("stream-initialization");

//     // Ensure overlay is showing (should already be on)
//     await chrome.tabs.sendMessage(tabId, { type: "SHOW_PROCESSING_OVERLAY" });

//     // Wait for stream to stabilize
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     // Capture clean frame
//     console.time("total-capture-time");
//     const cleanFrame = await capture.captureCleanFrame(tabId);
//     console.timeEnd("total-capture-time");

//     if (cleanFrame) {
//       const base64 = imageDataToBase64(cleanFrame);
//       console.log("✅ Clean frame captured successfully!");
//       console.log("🖼️ Base64 result:", base64);

//       return {
//         success: true,
//         base64,
//         dimensions: { width: cleanFrame.width, height: cleanFrame.height },
//       };
//     } else {
//       console.error("❌ No clean frame found");
//       return { success: false };
//     }
//   } catch (error) {
//     console.error("❌ Benchmark failed:", error);
//     throw error;
//   } finally {
//     capture?.cleanup();
//   }
// }

// function imageDataToBase64(imageData: ImageData): string {
//   const canvas = document.createElement("canvas");
//   canvas.width = imageData.width;
//   canvas.height = imageData.height;
//   const ctx = canvas.getContext("2d");
//   ctx?.putImageData(imageData, 0, 0);
//   return canvas.toDataURL("image/jpeg", 0.8);
// }

// Stream capture with recording
class StreamCapture {
  stream: MediaStream | null;
  video: HTMLVideoElement;
  recorder: MediaRecorder | null;
  recordedChunks: Blob[];
  isReady: boolean;

  constructor() {
    this.stream = null;
    this.video = document.createElement("video");
    this.recorder = null;
    this.recordedChunks = [];
    this.isReady = false;
  }

  async initialize() {
    await new Promise<void>((resolve, reject) => {
      chrome.tabCapture.capture({ audio: false, video: true }, (stream) => {
        if (chrome.runtime.lastError || !stream) {
          reject(new Error(chrome.runtime.lastError?.message || "No stream"));
          return;
        }
        this.stream = stream;
        resolve();
      });
    });

    this.video.srcObject = this.stream;
    this.video.muted = true;

    console.log(
      "📹 Stream initialized with frame rate:",
      (this.stream as MediaStream).getVideoTracks()[0].getSettings().frameRate,
    );

    await new Promise<void>((resolve) => {
      this.video.onloadedmetadata = () => {
        this.video.play();
        this.isReady = true;
        resolve();
      };
    });
  }

  startRecording() {
    if (!this.stream) throw new Error("Stream not initialized");

    this.recordedChunks = [];
    this.recorder = new MediaRecorder(this.stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.recorder.start();
    console.log("📹 Recording started");
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.recorder) throw new Error("Recorder not started");

      this.recorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: "video/webm" });
        console.log("📹 Recording stopped, blob size:", blob.size);
        resolve(blob);
      };

      this.recorder.stop();
    });
  }

  downloadRecording(blob: Blob, filename: string = "overlay-toggle.webm") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    console.log("📥 Recording downloaded:", filename);
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    this.isReady = false;
  }
}

// Toggle speed benchmark
export async function benchmarkToggleSpeed() {
  console.log("⚡ Starting toggle speed benchmark");

  try {
    const tab = await getActiveTab();
    if (!tab.id) throw new Error("No active tab found");
    const tabId = tab.id;

    // Ensure overlay is showing
    await chrome.tabs.sendMessage(tabId, { type: "SHOW_PROCESSING_OVERLAY" });

    // Run multiple toggles to get average
    const iterations = 10;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await chrome.tabs.sendMessage(tabId, { type: "FAST_TOGGLE_OVERLAY" });
      const end = performance.now();

      const duration = end - start;
      times.push(duration);
      console.log(`Toggle ${i + 1}: ${duration.toFixed(2)}ms`);

      // Wait between iterations
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    console.log(`⚡ Toggle Speed Results:`);
    console.log(`   Average: ${average.toFixed(2)}ms`);
    console.log(`   Min: ${min.toFixed(2)}ms`);
    console.log(`   Max: ${max.toFixed(2)}ms`);

    return { average, min, max, times };
  } catch (error) {
    console.error("❌ Toggle benchmark failed:", error);
    throw error;
  }
}

// Recording benchmark
export async function recordToggleTest() {
  console.log("📹 Starting toggle recording test");

  const capture = new StreamCapture();

  try {
    const tab = await getActiveTab();
    if (!tab.id) throw new Error("No active tab found");
    const tabId = tab.id;

    // Initialize stream
    console.time("stream-init");
    await capture.initialize();
    console.timeEnd("stream-init");

    // Ensure overlay is showing
    await chrome.tabs.sendMessage(tabId, { type: "SHOW_PROCESSING_OVERLAY" });

    // Wait for stream to stabilize
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Start recording
    capture.startRecording();

    // Wait a bit, then do toggle, then wait a bit more
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s before toggle

    console.log("🔄 Performing toggle...");
    await chrome.tabs.sendMessage(tabId, { type: "FAST_TOGGLE_OVERLAY" });

    await new Promise((resolve) => setTimeout(resolve, 2000)); // 1s after toggle

    // Stop recording and download
    const recordingBlob = await capture.stopRecording();
    capture.downloadRecording(recordingBlob, `toggle-test-${Date.now()}.webm`);

    console.log("✅ Toggle recording complete and downloaded");
    return { success: true, size: recordingBlob.size };
  } catch (error) {
    console.error("❌ Recording failed:", error);
    throw error;
  } finally {
    capture.cleanup();
  }
}
