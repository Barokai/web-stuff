import { FractalVisualizer } from './viz/fractal.js';

interface Window {
  webkitAudioContext: typeof AudioContext;
}

type VisualizationMode = 'bars' | 'waves' | 'circles' | 'fractal';
interface VisualizationStates {
  [key: string]: boolean;
}

document.addEventListener("DOMContentLoaded", () => {
  let startTime = Date.now();

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
  const microphoneSelector = document.getElementById("microphoneSelector") as HTMLDivElement;
  const microphoneList = document.getElementById("microphoneList") as HTMLSelectElement;
  const changeMicButton = document.getElementById("changeMicButton") as HTMLButtonElement;
  let audioContext: AudioContext | undefined;
  let analyser: AnalyserNode | undefined;
  let microphoneLabel: string = "";
  let soundTimeout: number | undefined;
  let currentStream: MediaStream | null = null;

  // Add new controls
  let isFullscreen = false;
  let activeVisualizations: VisualizationStates = {
    bars: true,
    waves: false,
    circles: false,
    fractal: false
  };
  let isRunning = false;

  const toggleFullscreenBtn = document.getElementById("toggleFullscreen") as HTMLButtonElement;
  const visualizationToggles = document.querySelectorAll('.visualization-toggle') as NodeListOf<HTMLButtonElement>;

  const fractalViz = new FractalVisualizer();

  function updateButtonStates() {
    startButton.textContent = isRunning ? "Stop Visualizer" : "Start Visualizer";
    startButton.classList.toggle('active', isRunning);
    visualizationToggles.forEach(btn => {
      const mode = btn.dataset.mode as VisualizationMode;
      btn.classList.toggle('active', activeVisualizations[mode]);
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

  // Remove old mode button listeners and add new toggle listeners
  visualizationToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode as VisualizationMode;
      activeVisualizations[mode] = !activeVisualizations[mode];
      updateButtonStates();
    });
  });

  async function checkMicrophonePermission() {
    try {
      // First try to get devices - this will trigger permission prompt
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');

      if (!hasMicrophone) {
        microphoneInfo.textContent = "No microphone found!";
        return false;
      }

      // Then explicitly request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Clean up test stream
      return true;
    } catch (err) {
      console.error("Microphone permission error:", err);
      microphoneInfo.textContent = "Please allow microphone access to use this app";
      return false;
    }
  }

  async function initAudio() {
    if (isRunning) {
      return;
    }

    startTime = Date.now();

    // Check for HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      microphoneInfo.textContent = "This app requires HTTPS to access the microphone";
      return;
    }

    const hasPermission = await checkMicrophonePermission();
    if (hasPermission) {
      startVisualization();
    }
  }

  (async () => {
    const hasPermission = await checkMicrophonePermission();
    if (hasPermission) {
      initAudio();
    }
  })();

  startButton.addEventListener("click", () => {
    if (!isRunning) {
      initAudio();
    } else {
      stopVisualization();
    }
  });

  changeMicButton.addEventListener("click", () => {
    updateMicrophoneList();
    microphoneSelector.classList.toggle("visible");
  });

  microphoneList.addEventListener("change", () => {
    if (microphoneList.value) {
      startVisualization(microphoneList.value);
    }
  });

  async function updateMicrophoneList() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices.filter(device => {
        if (device.kind === 'audioinput') {
          return true;
        }
        return false;
      });

      // Clear existing options except the first one
      while (microphoneList.options.length > 1) {
        microphoneList.options.remove(1);
      }

      microphones.forEach(mic => {
        const option = document.createElement('option');
        option.value = mic.deviceId;
        option.text = mic.label || `Microphone ${microphoneList.options.length}`;
        microphoneList.appendChild(option);
      });
    } catch (err) {
      console.error('Error listing microphones:', err);
    }
  }

  function startVisualization(deviceId?: string) {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const constraints = {
      audio: deviceId ? { deviceId: { exact: deviceId } } : true
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(async (stream) => {
        currentStream = stream;
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

          // Add a small delay before starting visualization to allow audio system to initialize
          setTimeout(() => {
            visualize(dataArray);
            isRunning = true;
            updateButtonStates();
            microphoneSelector.classList.remove("visible");
          }, 500);
        } catch (err) {
          console.error('Error getting device info:', err);
          microphoneLabel = audioTrack.label || 'Unknown Microphone';
          microphoneInfo.textContent = `Microphone: ${microphoneLabel}`;
        }
      })
      .catch((err) => {
        console.error("Error accessing microphone:", err);
        microphoneInfo.textContent = "Error: Could not access microphone";
      });
  }

  function stopVisualization() {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      currentStream = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = undefined;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isRunning = false;
    updateButtonStates();
  }

  function showSoundWarning() {
    soundWarning.innerHTML = `
      No sound detected! <button class="button" onclick="document.getElementById('changeMicButton').click()">
        Change Microphone?
      </button>
    `;
    soundWarning.style.display = "block";
  }

  function visualize(dataArray: Uint8Array) {
    analyser!.getByteFrequencyData(dataArray);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each active visualization
    if (activeVisualizations.fractal) fractalViz.draw(ctx, dataArray);
    if (activeVisualizations.bars) drawBars(dataArray);
    if (activeVisualizations.waves) drawWaves(dataArray);
    if (activeVisualizations.circles) drawCircles(dataArray);

    // Calculate volumes for warning system
    let maxVolume = 0;
    let totalVolume = 0;

    for (let i = 0; i < dataArray.length; i++) {
      maxVolume = Math.max(maxVolume, dataArray[i]);
      totalVolume += dataArray[i];
    }

    const avgVolume = totalVolume / dataArray.length;

    // Adjusted sound detection with initial grace period
    const gracePeriod = 3000; // 3 seconds
    const timeSinceStart = Date.now() - startTime;

    if (timeSinceStart > gracePeriod && maxVolume < 25 && avgVolume < 5) {
      if (!soundTimeout) {
        soundTimeout = setTimeout(() => {
          showSoundWarning();
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
