# Camera Utils

A collection of camera-based utilities and image filters.

## Features

- Live camera preview
- Photo capture
- Multiple filter options:
  - Normal (no filter)
  - Invert colors
  - Grayscale
  - ASCII art
- Download processed images
- Resolution limit for better performance

## Technologies

- TypeScript
- Web Camera API
- Canvas API
- ES Modules
- CSS3 with variables

## Usage

1. Allow camera access when prompted
2. Choose a filter (optional)
3. Click "Take Photo" to capture
4. Download the processed image

## Setup

```bash
npm install
npm run watch
```

## Browser Requirements

- Modern browser with Camera API support
- JavaScript enabled
- For security reasons, HTTPS is required (except on localhost)

## References

- [MDN: MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN: Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web Camera API Guide](https://web.dev/media-capturing-images/)

## Disclaimer

This tool was developed with assistance from GitHub Copilot (powered by OpenAI's GPT-4) and Claude 3.5 Sonnet. While the implementation has been tested, performance and behavior may vary across different browsers, cameras, and systems.
