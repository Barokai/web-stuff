import { ImageProcessor } from './lib/image-processor.js';

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('camera') as HTMLVideoElement;
  const canvas = document.getElementById('preview') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const captureBtn = document.getElementById('captureBtn') as HTMLButtonElement;
  const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;
  const cameraInfo = document.getElementById('cameraInfo') as HTMLDivElement;
  const cameraWarning = document.getElementById('cameraWarning') as HTMLDivElement;
  const filterButtons = document.querySelectorAll('.filter-toggle') as NodeListOf<HTMLButtonElement>;
  const stopCameraBtn = document.getElementById('stopCameraBtn') as HTMLButtonElement;

  const processor = new ImageProcessor();
  let currentFilter = 'none';
  let stream: MediaStream | null = null;

  async function initCamera() {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { max: 1024 },
          height: { max: 1024 }
        }
      });

      video.srcObject = stream;
      cameraInfo.textContent = 'Camera active';
      captureBtn.disabled = false;
    } catch (err) {
      console.error('Error accessing camera:', err);
      cameraWarning.textContent = 'Error: Could not access camera';
      cameraWarning.style.display = 'block';
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
      video.srcObject = null;
      video.style.display = 'none';
      canvas.style.display = 'none';
      cameraInfo.textContent = 'Camera stopped';
      captureBtn.disabled = true;
    }
  }

  function capturePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    applyFilter();

    video.style.display = 'none';
    canvas.style.display = 'block';
    downloadBtn.disabled = false;
  }

  function applyFilter() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    switch (currentFilter) {
      case 'invert':
        processor.invertColors(imageData);
        break;
      case 'grayscale':
        processor.grayscale(imageData);
        break;
      case 'ascii':
        processor.toAscii(imageData, canvas);
        return; // ASCII filter handles its own drawing
      default:
        // No filter
        break;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function downloadPhoto() {
    const link = document.createElement('a');
    link.download = `photo-${currentFilter}-${new Date().toISOString()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  captureBtn.addEventListener('click', capturePhoto);
  downloadBtn.addEventListener('click', downloadPhoto);

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter || 'none';
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (canvas.style.display === 'block') {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        applyFilter();
      }
    });
  });

  stopCameraBtn.addEventListener('click', stopCamera);

  // Initialize camera
  initCamera();
});
