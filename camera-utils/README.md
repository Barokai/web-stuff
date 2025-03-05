# Camera Utils

A collection of camera-based utilities and image filters.

## Features

- Live camera preview
- Photo capture with multiple camera support
- Camera controls:
  - Start/Stop camera
  - Switch between available cameras
  - Single-shot photo mode
- Multiple filter options:
  - Normal (no filter)
  - Invert colors
  - Grayscale
  - Sepia tone
  - ASCII art (improved detail)
  - Pixelate
  - Edge Detection
- Download processed images
- Resolution limit for better performance

## Technologies

- TypeScript
- Web Camera API
- Canvas API
- ES Modules
- CSS3 with variables
- Bun for development

## Usage

1. Allow camera access when prompted
2. Select your preferred camera if multiple are available
3. Click "Take Photo" to capture
4. Apply filters to the captured image
5. Download the processed photo
6. Use the camera toggle to take new photos

## Controls

- **Camera Toggle**: Start/Stop camera (▶/⏹)
- **Camera Select**: Choose between available cameras
- **Take Photo**: Capture current frame
- **Download**: Save processed image
- **Filters**: Apply different effects to captured photo

## Setup

```bash
bun install
bun run watch
```

## Browser Requirements

- Modern browser with Camera API support
- JavaScript enabled
- For security reasons, HTTPS is required (except on localhost)
- Permissions for camera access

## References

- [MDN: MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN: Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web Camera API Guide](https://web.dev/media-capturing-images/)

## Disclaimer

This tool was developed with assistance from GitHub Copilot (powered by OpenAI's GPT-4) and Claude 3.5 Sonnet. While the implementation has been tested, performance and behavior may vary across different browsers, cameras, and systems. Please test thoroughly in your environment.
