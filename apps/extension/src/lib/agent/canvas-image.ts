import type { ImageLike } from "@repo/agent-core/web";

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Browser-side {@link ImageLike}. Normalizes a captureVisibleTab screenshot
 * (physical pixels = CSS pixels × dpr) down to CSS-pixel space so model-returned
 * coordinates align 1:1 with CDP Input dispatch.
 */
export class CanvasImage implements ImageLike {
  private readonly sourceBase64: string;
  private readonly bitmap: ImageBitmap;
  private readonly dpr: number;

  private constructor(sourceBase64: string, bitmap: ImageBitmap, dpr: number) {
    this.sourceBase64 = sourceBase64;
    this.bitmap = bitmap;
    this.dpr = dpr;
  }

  static async fromDataUrl(dataUrl: string, dpr: number): Promise<CanvasImage> {
    const base64 = dataUrl.replace(/^data:.*?;base64,/, "");
    const blob = await (await fetch(dataUrl)).blob();
    const bitmap = await createImageBitmap(blob);
    return new CanvasImage(base64, bitmap, dpr);
  }

  async getDimensions(): Promise<{ width: number; height: number }> {
    if (this.dpr === 1) {
      return { width: this.bitmap.width, height: this.bitmap.height };
    }
    return {
      width: Math.round(this.bitmap.width / this.dpr),
      height: Math.round(this.bitmap.height / this.dpr),
    };
  }

  async toBase64(): Promise<string> {
    if (this.dpr === 1) {
      return this.sourceBase64;
    }
    const { width, height } = await this.getDimensions();
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire 2D canvas context");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(this.bitmap, 0, 0, width, height);
    const blob = await canvas.convertToBlob({ type: "image/png" });
    return blobToBase64(blob);
  }
}
