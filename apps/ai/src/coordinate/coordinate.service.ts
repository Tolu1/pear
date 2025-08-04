// apps/ai/src/coordinate/coordinate.service.ts
import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

export interface ViewportInfo {
  width: number;
  height: number;
  // devicePixelRatio removed - no longer needed
}

export interface ProcessedImage {
  base64: string;
  transformationData: {
    scaledWidth: number;
    scaledHeight: number;
    offsetX: number;
    offsetY: number;
    scaleFactorX: number;
    scaleFactorY: number;
  };
}

@Injectable()
export class CoordinateService {
  private readonly CLAUDE_WIDTH = 1024;
  private readonly CLAUDE_HEIGHT = 768;

  async preprocessImage(
    screenshot: string,
    viewport: ViewportInfo,
  ): Promise<ProcessedImage> {
    try {
      const imageBuffer = Buffer.from(screenshot, 'base64');

      // Calculate letterboxing parameters
      const targetRatio = this.CLAUDE_WIDTH / this.CLAUDE_HEIGHT;
      const originalRatio = viewport.width / viewport.height;

      let scaledWidth: number;
      let scaledHeight: number;
      let offsetX = 0;
      let offsetY = 0;

      if (originalRatio > targetRatio) {
        // Original is wider - fit to width, pad height
        scaledWidth = this.CLAUDE_WIDTH;
        scaledHeight = Math.round(this.CLAUDE_WIDTH / originalRatio);
        offsetY = Math.round((this.CLAUDE_HEIGHT - scaledHeight) / 2);
      } else {
        // Original is taller - fit to height, pad width
        scaledHeight = this.CLAUDE_HEIGHT;
        scaledWidth = Math.round(this.CLAUDE_HEIGHT * originalRatio);
        offsetX = Math.round((this.CLAUDE_WIDTH - scaledWidth) / 2);
      }

      // Create letterboxed image with Sharp
      const resizedImage = await sharp(imageBuffer)
        .resize(scaledWidth, scaledHeight, { fit: 'fill' })
        .toBuffer();

      const letterboxedImage = await sharp({
        create: {
          width: this.CLAUDE_WIDTH,
          height: this.CLAUDE_HEIGHT,
          channels: 3,
          background: { r: 0, g: 0, b: 0 },
        },
      })
        .composite([{ input: resizedImage, top: offsetY, left: offsetX }])
        .jpeg({ quality: 75 })
        .toBuffer();

      const base64 = letterboxedImage.toString('base64');
      const scaleFactorX = scaledWidth / viewport.width;
      const scaleFactorY = scaledHeight / viewport.height;

      return {
        base64,
        transformationData: {
          scaledWidth,
          scaledHeight,
          offsetX,
          offsetY,
          scaleFactorX,
          scaleFactorY,
        },
      };
    } catch (error) {
      throw new Error(`Image preprocessing failed: ${error.message}`);
    }
  }

  transformCoordinatesToBrowser(
    claudeX: number,
    claudeY: number,
    transformationData: ProcessedImage['transformationData'],
  ): { x: number; y: number } {
    const { offsetX, offsetY, scaleFactorX, scaleFactorY } = transformationData;

    // Remove letterbox offsets and scale back to original viewport size
    const browserX = Math.round((claudeX - offsetX) / scaleFactorX);
    const browserY = Math.round((claudeY - offsetY) / scaleFactorY);

    return { x: browserX, y: browserY };
  }
}
