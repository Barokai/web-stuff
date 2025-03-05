# Audio Visualizer

An interactive audio visualizer that captures microphone input and displays real-time visualizations.

## Features

- Multiple visualization modes:
  - Frequency Bars: Color-coded amplitude display
  - Wave Pattern: Oscilloscope-style waveform
  - Circular: Concentric audio-reactive circles
  - Fractal: Audio-reactive geometric patterns
- Real-time audio processing
- Microphone selection support
- Fullscreen mode
- Audio level monitoring
- Multiple visualization combinations

## Technologies

- TypeScript
- Web Audio API
- Canvas API
- ES Modules
- Bun for development

## Usage

1. Allow microphone access when prompted
2. Select your preferred microphone if multiple are available
3. Click "Start Visualizer" to begin
4. Toggle different visualization modes
5. Use fullscreen for immersive experience
6. Monitor audio levels with built-in warning system

## Controls

- **Start/Stop**: Toggle audio processing
- **Fullscreen**: Toggle fullscreen mode
- **Visualization Toggles**: Enable/disable different visualizations
- **Microphone Selection**: Choose input device

## Setup

```bash
bun install
bun run watch
```

## Browser Requirements

- Modern browser with Web Audio API support
- JavaScript enabled
- HTTPS required (except on localhost)
- Microphone permissions
- WebGL support recommended

## Security Notes

- Microphone access is required
- No audio data is stored or transmitted
- All processing happens locally
- HTTPS is required for production use

## References

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

## Disclaimer

This tool was developed with assistance from GitHub Copilot (powered by OpenAI's GPT-4) and Claude 3.5 Sonnet. While the implementation has been tested, performance and behavior may vary across different browsers, audio devices, and systems. Please test thoroughly in your environment.
