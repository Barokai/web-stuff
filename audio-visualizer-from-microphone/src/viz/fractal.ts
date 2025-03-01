import { AudioVisualization } from './types';

export class FractalVisualizer implements AudioVisualization {
    private zoom = 1;
    private offsetX = 0;
    private offsetY = 0;
    private maxIterations = 100;
    private lastAvgVolume = 0;
    private colorOffset = 0;
    private juliaX = 0;
    private juliaY = 0;
    private time = 0;

    draw(ctx: CanvasRenderingContext2D, dataArray: Uint8Array) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const imageData = ctx.createImageData(width, height);

        // Calculate audio metrics for different frequency ranges
        const bassRange = dataArray.slice(0, 10);
        const midRange = dataArray.slice(10, 30);
        const trebleRange = dataArray.slice(30);

        const avgVolume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const bassVolume = bassRange.reduce((a, b) => a + b, 0) / bassRange.length;
        const midVolume = midRange.reduce((a, b) => a + b, 0) / midRange.length;
        const trebleVolume = trebleRange.reduce((a, b) => a + b, 0) / trebleRange.length;

        // Dynamic parameters based on audio
        this.time += 0.01 + (avgVolume / 255) * 0.1;
        this.zoom = 1 + Math.sin(this.time) * (bassVolume / 255) * 0.5;
        this.maxIterations = 50 + Math.floor((midVolume / 255) * 200);
        this.colorOffset = (this.colorOffset + (trebleVolume / 255) * 0.1) % 1;

        // Julia set parameters driven by sound
        this.juliaX = 0.7885 * Math.sin(this.time + bassVolume / 255);
        this.juliaY = 0.7885 * Math.cos(this.time + midVolume / 255);

        // Draw the fractal
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const result = this.julia(
                    (x - width / 2) / (height * 0.4 * this.zoom),
                    (y - height / 2) / (height * 0.4 * this.zoom)
                );

                if (result.iterations < this.maxIterations) {
                    // Dynamic coloring based on audio
                    const hue = (result.iterations / this.maxIterations * 360 +
                        this.colorOffset * 360 +
                        (trebleVolume / 255) * 180) % 360;

                    const saturation = 70 + (midVolume / 255) * 30;
                    const lightness = 40 + (bassVolume / 255) * 30 +
                        (result.iterations / this.maxIterations) * 20;

                    // Smooth coloring with audio reactivity
                    const smooth = result.iterations + 1 -
                        Math.log2(Math.log(result.lastMagnitude));

                    const color = this.hslToRgb(
                        hue,
                        saturation,
                        lightness * (smooth / this.maxIterations)
                    );

                    const index = (y * width + x) * 4;
                    imageData.data[index] = color.r;
                    imageData.data[index + 1] = color.g;
                    imageData.data[index + 2] = color.b;
                    imageData.data[index + 3] = 255;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    private julia(x0: number, y0: number) {
        let x = x0;
        let y = y0;
        let iterations = 0;
        let lastMagnitude = 0;

        while (x * x + y * y <= 4 && iterations < this.maxIterations) {
            const xTemp = x * x - y * y + this.juliaX;
            y = 2 * x * y + this.juliaY;
            x = xTemp;
            lastMagnitude = x * x + y * y;
            iterations++;
        }

        return { iterations, lastMagnitude };
    }

    private hslToRgb(h: number, s: number, l: number) {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
}
