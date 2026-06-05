import { useEffect, useRef, useState } from 'react';
import {
  canPlayMimeType,
  normalizeMimeType,
  PLAYBACK_UNSUPPORTED_MESSAGE,
} from '../lib/audioRecording';

export default function RecordingPlayer({ src, mimeType, className = '', autoPlay = false }) {
  const audioRef = useRef(null);
  const [playbackError, setPlaybackError] = useState(null);

  const normalizedMime = normalizeMimeType(mimeType);
  const likelyUnsupported = mimeType && !canPlayMimeType(mimeType);

  useEffect(() => {
    setPlaybackError(likelyUnsupported ? PLAYBACK_UNSUPPORTED_MESSAGE : null);
  }, [src, mimeType, likelyUnsupported]);

  if (!src) return null;

  return (
    <div className={className}>
      <audio
        ref={audioRef}
        controls
        autoPlay={autoPlay}
        playsInline
        preload="auto"
        className="w-full"
        onError={() => setPlaybackError(PLAYBACK_UNSUPPORTED_MESSAGE)}
        onLoadedMetadata={() => setPlaybackError(null)}
      >
        <source src={src} type={normalizedMime} />
        <track kind="captions" />
      </audio>
      {playbackError && (
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">
          {playbackError}
        </p>
      )}
    </div>
  );
}
