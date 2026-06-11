export interface ImageLike {
    toBase64(): Promise<string>;
    getDimensions(): Promise<{ width: number; height: number }>;
}
