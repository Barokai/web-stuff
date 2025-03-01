interface Window {
  webkitAudioContext: typeof AudioContext;
}

type VisualizationMode = 'bars' | 'waves' | 'circles';

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

  // Add new controls
  let isFullscreen = false;
  let visualizationMode: VisualizationMode = 'bars';
  let isRunning = false;

  const toggleFullscreenBtn = document.getElementById("toggleFullscreen") as HTMLButtonElement;
  const modeBtns = document.querySelectorAll('.visualization-mode') as NodeListOf<HTMLButtonElement>;

  function updateButtonStates() {
    startButton.textContent = isRunning ? "Stop Visualizer" : "Start Visualizer";
    startButton.classList.toggle('active', isRunning);
    modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === visualizationMode);
    });
  }

  toggleFullscreenBtn.addEventListener("click", () => {
    if (!isFullscreen) {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    isFullscreen = !isFullscreen;
  });

  document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
    canvas.classList.toggle('fullscreen', isFullscreen);
  });

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      visualizationMode = btn.dataset.mode as VisualizationMode;
      updateButtonStates();
    });
  });

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
    if (!isRunning) {
      initAudio();
      isRunning = true;
    } else {
      stopVisualization();
      isRunning = false;
    }
    updateButtonStates();
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

  function stopVisualization() {
    if (audioContext) {
      audioContext.close();
      audioContext = undefined;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function visualize(dataArray: Uint8Array) {
    analyser!.getByteFrequencyData(dataArray);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (visualizationMode) {
      case 'bars':
        drawBars(dataArray);
        break;
      case 'waves':
        drawWaves(dataArray);
        break;
      case 'circles':
        drawCircles(dataArray);
        break;
    }

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

  function drawBars(dataArray: Uint8Array) {
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i];
      const hue = (barHeight / 255) * 120;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

      x += barWidth + 1;
    }
  }

  function drawWaves(dataArray: Uint8Array) {
    const sliceWidth = canvas.width / dataArray.length;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsl(200, 100%, 50%)`;

    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  function drawCircles(dataArray: Uint8Array) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i];
      const radius = (value / 255) * Math.min(centerX, centerY);
      const hue = (i / dataArray.length) * 360;

      ctx.beginPath();
      ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.5)`;
      ctx.lineWidth = 2;
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
});
