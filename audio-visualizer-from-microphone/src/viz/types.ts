export interface AudioVisualization {
    draw(ctx: CanvasRenderingContext2D, dataArray: Uint8Array): void;
}
