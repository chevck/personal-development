/** True on iPhone/iPad Safari (and iPadOS desktop UA). */
export function isAppleMobile() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS =
    navigator.platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
  return isIOSDevice || isIPadOS;
}

export function isMobileBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || isAppleMobile();
}

/**
 * Prefer formats mobile Safari can play. iOS often records WebM but cannot play it back.
 */
export function pickRecordingMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';

  const preferred = isAppleMobile()
    ? [
        'audio/mp4',
        'audio/aac',
        'video/mp4', // Some iOS builds expose audio-only via video/mp4
        'audio/webm;codecs=opus',
        'audio/webm',
      ]
    : isMobileBrowser()
      ? ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
      : ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];

  return preferred.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

export function extensionForMimeType(mimeType) {
  const mime = (mimeType || '').toLowerCase();
  if (mime.includes('mp4') || mime.includes('aac') || mime.includes('m4a')) return 'm4a';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
  return 'webm';
}

export function normalizeMimeType(mimeType) {
  const mime = (mimeType || '').toLowerCase();
  if (!mime) return 'audio/webm';
  if (mime.includes('mp4') || mime.includes('m4a')) return 'audio/mp4';
  if (mime.includes('aac')) return 'audio/aac';
  return mimeType;
}

export function canPlayMimeType(mimeType) {
  if (typeof document === 'undefined') return true;
  const audio = document.createElement('audio');
  const normalized = normalizeMimeType(mimeType);
  if (audio.canPlayType(normalized) !== '') return true;
  // iOS may report empty for webm
  if (normalized.includes('webm') && isAppleMobile()) return false;
  return !normalized.includes('webm') || audio.canPlayType('audio/webm') !== '';
}

export const PLAYBACK_UNSUPPORTED_MESSAGE =
  'This recording cannot be played in your browser (often Safari with older WebM files). Ask the student to record again on this device, or open the link in Chrome.';
