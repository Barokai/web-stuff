# Web Experiments Collection

A collection of interactive web experiments and visualizations using modern web technologies.

## Projects

### Audio Visualizer

An interactive audio visualizer that captures microphone input and displays real-time visualizations.

**Features:**

- Multiple visualization modes (bars, waves, circles, and fractal)
- Real-time audio reactive animations
- Microphone selection and management
- Fullscreen support
- Dynamic color schemes based on audio input

**Technologies:**

- TypeScript
- Web Audio API
- Canvas API
- ES Modules

[Try Audio Visualizer →](./audio-visualizer-from-microphone/)

### Network Tools

A CIDR calculator and IP range utility tool.

[Try Network Tools →](./network-tools/)

## Important Notes

- These experiments require HTTPS when hosted (except for localhost)
- Microphone access must be granted for the audio visualizer
- For GitHub Pages deployment, make sure to allow microphone access in your browser settings

## Setup & Running

### Local Development

1. Navigate to the project directory:

```bash
cd /c:/dev-stuff
```

2. Start a local server:

```bash
npx http-server
# Server will start at http://127.0.0.1:8080
```

3. Access the projects:

- Main page: http://127.0.0.1:8080
- Audio Visualizer: http://127.0.0.1:8080/audio-visualizer-from-microphone/

### For TypeScript Projects (like Audio Visualizer)

1. Navigate to the project directory:

```bash
cd audio-visualizer-from-microphone
```

2. Install dependencies and start TypeScript compilation:

```bash
npm install
npm run watch
```

3. Keep the TypeScript compiler running in a separate terminal while developing

### Notes

- No global installations required
- Works with any modern web server
- TypeScript compilation is automatic in watch mode
- Hot reload is supported when using `http-server`

## Browser Support

- ES Modules
- Web Audio API
- Canvas API
- Async/Await

## Disclaimer

This project was developed with assistance from GitHub Copilot (powered by OpenAI's GPT-4) and Claude 3.5 Sonnet. While efforts have been made to ensure accuracy and reliability, the generated code may contain unexpected behaviors or errors. Please review and test thoroughly before using in production environments.

## References

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [IP Addressing Guide](https://www.rfc-editor.org/rfc/rfc1918)
