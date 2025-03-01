document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton') as HTMLButtonElement;
  const canvas = document.getElementById('visualizer') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  let audioContext: AudioContext | undefined;
  let analyser: AnalyserNode | undefined;

  startButton.addEventListener('click', () => {
      if (!audioContext) {
          initAudio();
      }
  });

  function initAudio() {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
              const source = audioContext!.createMediaStreamSource(stream);
              source.connect(analyser!);
              visualize(dataArray);
          })
          .catch(err => {
              console.error('Error accessing microphone:', err);
          });
  }

  function visualize(dataArray: Uint8Array) {
      analyser!.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
          const barHeight = dataArray[i];

          ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
          ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

          x += barWidth + 1;
      }

      requestAnimationFrame(() => visualize(dataArray));
  }
});