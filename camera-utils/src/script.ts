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
  const cameraSelect = document.getElementById('cameraSelect') as HTMLSelectElement;
  let lastCapturedImage: ImageData | null = null;
  let isPhotoCaptured = false;

  const processor = new ImageProcessor();
  let currentFilter = 'none';
  let stream: MediaStream | null = null;

  async function updateCameraList() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');

      cameraSelect.innerHTML = cameras.map(camera =>
        `<option value="${camera.deviceId}">${camera.label || `Camera ${camera.deviceId.slice(0, 4)}`}</option>`
      ).join('');

      cameraSelect.style.display = cameras.length > 1 ? 'block' : 'none';
    } catch (err) {
      console.error('Error listing cameras:', err);
    }
  }

  async function initCamera(deviceId?: string) {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: deviceId ?
          { deviceId: { exact: deviceId }, width: { max: 1024 }, height: { max: 1024 } } :
          { width: { max: 1024 }, height: { max: 1024 } }
      };

      stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      video.style.display = 'block';
      canvas.style.display = 'none';
      captureBtn.disabled = false;
      stopCameraBtn.textContent = '⏹';

      // Update camera info
      const tracks = stream.getVideoTracks();
      if (tracks.length > 0) {
        const settings = tracks[0].getSettings();
        cameraInfo.textContent = `Active: ${tracks[0].label || `Camera ${settings.deviceId?.slice(0, 4)}`}`;
      }

      await updateCameraList();
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
      cameraInfo.textContent = 'Camera stopped';
      stopCameraBtn.textContent = '▶';
    }
  }

  function capturePhoto() {
    if (!stream) {
      // If no stream, try to start camera first
      initCamera().then(() => {
        // Wait for video to be ready
        video.onloadeddata = () => {
          performCapture();
        };
      });
      return;
    }
    performCapture();
  }

  function performCapture() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Store original image data
    lastCapturedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    isPhotoCaptured = true;

    // Stop video but keep showing canvas
    stopCamera();
    canvas.style.display = 'block';
    downloadBtn.disabled = false;
    captureBtn.disabled = false; // Enable to allow taking new photos

    // Apply current filter
    applyFilter();
  }

  function applyFilter() {
    if (!lastCapturedImage) return;

    // Reset canvas with original image
    canvas.width = lastCapturedImage.width;
    canvas.height = lastCapturedImage.height;
    ctx.putImageData(lastCapturedImage, 0, 0);

    // Get fresh image data for filtering
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
      case 'sepia':
        processor.sepia(imageData);
        break;
      case 'pixelate':
        processor.pixelate(imageData);
        break;
      case 'edges':
        processor.edgeDetection(imageData);
        break;
      default:
        // No filter
        break;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function downloadPhoto() {
    if (!lastCapturedImage) return;

    // Apply current filter to a fresh copy for download
    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = lastCapturedImage.width;
    downloadCanvas.height = lastCapturedImage.height;
    const downloadCtx = downloadCanvas.getContext('2d')!;

    // Start with original image
    downloadCtx.putImageData(lastCapturedImage, 0, 0);

    // Apply current filter
    const downloadImageData = downloadCtx.getImageData(0, 0, downloadCanvas.width, downloadCanvas.height);
    switch (currentFilter) {
      case 'invert':
        processor.invertColors(downloadImageData);
        downloadCtx.putImageData(downloadImageData, 0, 0);
        break;
      case 'grayscale':
        processor.grayscale(downloadImageData);
        downloadCtx.putImageData(downloadImageData, 0, 0);
        break;
      case 'ascii':
        processor.toAscii(downloadImageData, downloadCanvas);
        break;
      default:
        // No filter - use original
        break;
    }

    const link = document.createElement('a');
    link.download = `photo-${currentFilter}-${new Date().toISOString()}.png`;
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  }

  captureBtn.addEventListener('click', capturePhoto);
  downloadBtn.addEventListener('click', downloadPhoto);

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter || 'none';
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (isPhotoCaptured && lastCapturedImage) {
        applyFilter();
      }
    });
  });

  stopCameraBtn.addEventListener('click', () => {
    if (stream) {
      stopCamera();
    } else {
      canvas.style.display = 'none'; // Hide previous photo
      video.style.display = 'block'; // Show video preview
      initCamera(cameraSelect.value);
    }
  });

  cameraSelect.addEventListener('change', () => {
    initCamera(cameraSelect.value);
  });

  // Initialize camera
  initCamera();
});
