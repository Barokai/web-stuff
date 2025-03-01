// Add type declarations for the Web Audio API
interface Window {
  webkitAudioContext: typeof AudioContext;
}

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById(
    "startButton"
  ) as HTMLButtonElement;
  const canvas = document.getElementById("visualizer") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const microphoneInfo = document.getElementById(
    "microphoneInfo"
  ) as HTMLDivElement;
  const soundWarning = document.getElementById(
    "soundWarning"
  ) as HTMLDivElement;
  let audioContext: AudioContext | undefined;
  let analyser: AnalyserNode | undefined;
  let microphoneLabel: string = "";
  let soundTimeout: number | undefined;

  // Check if microphone is already permitted
  navigator.permissions.query({ name: 'microphone' as PermissionName })
    .then((permissionStatus) => {
      if (permissionStatus.state === 'granted') {
        initAudio();
      }

      // Listen for future permission changes
      permissionStatus.addEventListener('change', () => {
        if (permissionStatus.state === 'granted') {
          initAudio();
        }
      });
    })
    .catch(() => {
      // Fallback if permissions API is not supported
      console.log('Permissions API not supported, using button fallback');
    });

  startButton.addEventListener("click", () => {
    if (!audioContext) {
      initAudio();
    }
  });

  function initAudio() {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(async (stream) => {
        const source = audioContext!.createMediaStreamSource(stream);
        source.connect(analyser!);

        // Get the audio track
        const audioTrack = stream.getAudioTracks()[0];
        console.log('Audio track:', audioTrack);

        try {
          // Wait for devices to be enumerated
          const devices = await navigator.mediaDevices.enumerateDevices();
          console.log('Available devices:', devices);

          // Find matching device
          const matchingDevice = devices.find(device =>
            device.kind === 'audioinput' &&
            device.deviceId === audioTrack.getSettings().deviceId
          );

          if (matchingDevice) {
            microphoneLabel = matchingDevice.label || `Microphone (${matchingDevice.deviceId})`;
          } else {
            microphoneLabel = `Active Microphone (${audioTrack.label})`;
          }

          console.log('Selected microphone:', microphoneLabel);
          microphoneInfo.textContent = `Microphone: ${microphoneLabel}`;
        } catch (err) {
          console.error('Error getting device info:', err);
          microphoneLabel = audioTrack.label || 'Unknown Microphone';
          microphoneInfo.textContent = `Microphone: ${microphoneLabel}`;
        }

        visualize(dataArray);
      })
      .catch((err) => {
        console.error("Error accessing microphone:", err);
        microphoneInfo.textContent = "Error: Could not access microphone";
      });
  }

  function visualize(dataArray: Uint8Array) {
    analyser!.getByteFrequencyData(dataArray);

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;
    let maxVolume = 0;

    // Calculate average and max volume
    let totalVolume = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i];
      maxVolume = Math.max(maxVolume, barHeight);
      totalVolume += barHeight;

      const hue = (barHeight / 255) * 120;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

      x += barWidth + 1;
    }

    const avgVolume = totalVolume / dataArray.length;
    // Debug volume levels
    if (avgVolume > 0) {
      console.debug(`Volume - Avg: ${avgVolume.toFixed(2)}, Max: ${maxVolume}`);
    }

    // Adjusted threshold for sound detection (increased from 10 to 25)
    if (maxVolume < 25 && avgVolume < 5) {
      if (!soundTimeout) {
        soundTimeout = setTimeout(() => {
          soundWarning.style.display = "block";
        }, 2000);
      }
    } else {
      if (soundTimeout) {
        clearTimeout(soundTimeout);
        soundTimeout = undefined;
        soundWarning.style.display = "none";
      }
    }

    requestAnimationFrame(() => visualize(dataArray));
  }
});
