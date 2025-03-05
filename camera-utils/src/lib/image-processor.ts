export class ImageProcessor {
  private readonly asciiChars = '@%#*+=-:. ';

  invertColors(imageData: ImageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];         // R
      data[i + 1] = 255 - data[i + 1]; // G
      data[i + 2] = 255 - data[i + 2]; // B
    }
  }

  grayscale(imageData: ImageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;     // R
      data[i + 1] = avg; // G
      data[i + 2] = avg; // B
    }
  }

  toAscii(imageData: ImageData, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    const cellSize = 4; // Reduced from 8 to 4 for more detail
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${cellSize}px monospace`;
    ctx.fillStyle = '#fff';

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const posX = x * cellSize;
        const posY = y * cellSize;

        // Get average brightness of cell
        let brightness = 0;
        for (let sy = 0; sy < cellSize; sy++) {
          for (let sx = 0; sx < cellSize; sx++) {
            const pixelPos = ((posY + sy) * canvas.width + posX + sx) * 4;
            brightness += (
              imageData.data[pixelPos] +
              imageData.data[pixelPos + 1] +
              imageData.data[pixelPos + 2]
            ) / 3;
          }
        }
        brightness /= cellSize * cellSize;

        // Map brightness to ASCII character
        const charIndex = Math.floor(
          (brightness / 255) * (this.asciiChars.length - 1)
        );

        ctx.fillText(
          this.asciiChars[charIndex],
          posX,
          posY + cellSize
        );
      }
    }
  }

  sepia(imageData: ImageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
      data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
      data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
    }
  }

  pixelate(imageData: ImageData, size: number = 8) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        let r = 0, g = 0, b = 0;
        let count = 0;

        // Get average color of the block
        for (let dy = 0; dy < size && y + dy < height; dy++) {
          for (let dx = 0; dx < size && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }

        // Apply average color to the block
        r = r / count;
        g = g / count;
        b = b / count;

        for (let dy = 0; dy < size && y + dy < height; dy++) {
          for (let dx = 0; dx < size && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
          }
        }
      }
    }
  }

  edgeDetection(imageData: ImageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data.length);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Sobel operator
        for (let c = 0; c < 3; c++) {
          const i = idx + c;
          const gx = data[i - 4] - data[i + 4];
          const gy = data[i - width * 4] - data[i + width * 4];

          const g = Math.sqrt(gx * gx + gy * gy);
          output[i] = g > 32 ? 255 : 0;
        }
        output[idx + 3] = 255;
      }
    }

    data.set(output);
  }
}
