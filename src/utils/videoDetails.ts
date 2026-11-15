import type { VideoDetails } from '../api';

const COVER_MAX_SIDE = 1080;
const COVER_QUALITY = 0.85;
const COVER_MOMENT_SECONDS = 0.5;

function waitFor(video: HTMLVideoElement, event: 'loadeddata' | 'seeked'): Promise<void> {
  return new Promise((resolve, reject) => {
    video.addEventListener(event, () => resolve(), { once: true });
    video.addEventListener('error', () => reject(new Error('video')), { once: true });
  });
}

export async function readVideoDetails(file: File): Promise<VideoDetails> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;

  try {
    await waitFor(video, 'loadeddata');
    video.currentTime = Math.min(COVER_MOMENT_SECONDS, video.duration / 2);
    await waitFor(video, 'seeked');

    const scale = Math.min(1, COVER_MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const cover = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', COVER_QUALITY));
    if (!cover || !video.videoWidth || !Number.isFinite(video.duration)) throw new Error('video');

    return { cover, width: video.videoWidth, height: video.videoHeight, durationSeconds: Math.max(1, Math.round(video.duration)) };
  } finally {
    URL.revokeObjectURL(url);
  }
}
