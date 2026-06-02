import { Image as BamlImage } from '@boundaryml/baml';
import { StoredMedia } from './serde';
import { Sharp } from 'sharp';
import sharp from 'sharp';

export type ImageMediaType = `image/${string}`;

export class Image {
    private img: Sharp;

    constructor(img: Sharp) {
        this.img = img;
    }

    static fromBase64(base64: string) {
        const base64Data = base64.replace(/^data:.*?;base64,/, '');
        return new Image(sharp(Buffer.from(base64Data, 'base64')));
    }

    async getFormat(): Promise<keyof sharp.FormatEnum> {
        const format = (await this.img.clone().metadata()).format;
        if (!format) throw new Error("Unable to get image format");
        return format;
    }

    async toJson(): Promise<StoredMedia> {
        return {
            type: 'media',
            format: await this.getFormat(),
            storage: 'base64',
            base64: await this.toBase64()
        };
    }

    async toBase64(): Promise<string> {
       const base64data = (await this.img.clone().toBuffer()).toString('base64');
       return base64data;
    }

    async toBaml(): Promise<BamlImage> {
        const format = await this.getFormat();
        const data = await this.toBase64();
        return BamlImage.fromBase64(`image/${format}`, data);
    }

    async saveToFile(filepath: string): Promise<void> {
        await this.img.clone().toFile(filepath);
    }

    async getDimensions(): Promise<{ width: number, height: number }> {
        const { info: { width, height } } = await this.img.clone().toBuffer({ resolveWithObject: true });
        if (!width || !height) throw new Error("Unable to get dimensions from image");
        return { width, height };
    }

    async resize(width: number, height: number): Promise<Image> {
        const resizedImage = new Image(await this.img.clone().resize({
            // Sharp throws on non-integer dimensions; floats can arise from DPR scaling
            width: Math.round(width),
            height: Math.round(height),
            fit: 'fill',
            kernel: sharp.kernel.lanczos3
        }));
        return resizedImage;
    }
}
