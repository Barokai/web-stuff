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
    const cellSize = 8;
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
}
