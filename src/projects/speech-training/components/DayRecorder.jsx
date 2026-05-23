import { useCallback, useEffect, useRef, useState } from 'react';

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function pickMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

function friendlyUploadError(message) {
  if (message?.includes('storage/unauthorized')) {
    return 'Storage permission denied. In Firebase Console → Storage → Rules, paste storage.rules from this project and publish, or run: firebase deploy --only storage';
  }
  return message;
}

export default function DayRecorder({
  dayNum,
  recording,
  canRecord,
  uploading,
  locked,
  lockedReason,
  onSaveRecording,
  onClearProgress,
}) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewDurationMs, setPreviewDurationMs] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const pendingBlobRef = useRef(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPreviewDurationMs(0);
    pendingBlobRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopStream();
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [stopStream]);

  const startRecording = async () => {
    setError(null);
    clearPreview();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stopStream();
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        const durationMs = Date.now() - startedAtRef.current;

        if (blob.size < 1000) {
          setError('Recording too short. Try again and speak for a few seconds.');
          setStatus('idle');
          return;
        }

        pendingBlobRef.current = blob;
        setPreviewDurationMs(durationMs);
        setPreviewUrl(URL.createObjectURL(blob));
        setStatus('preview');
      };

      recorder.start(250);
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setStatus('recording');
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 200);
    } catch (err) {
      stopStream();
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Allow the mic in your browser settings.');
      } else {
        setError(err.message || 'Could not start recording.');
      }
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleReRecord = () => {
    clearPreview();
    setError(null);
    setStatus('idle');
  };

  const handleSave = async () => {
    const blob = pendingBlobRef.current;
    if (!blob) return;

    setError(null);
    setStatus('uploading');
    try {
      await onSaveRecording(dayNum, blob, previewDurationMs);
      clearPreview();
      setStatus('idle');
    } catch (err) {
      setError(friendlyUploadError(err.message) || 'Failed to upload recording.');
      setStatus('preview');
    }
  };

  const isUploading = uploading || status === 'uploading';
  const isSaved = Boolean(recording);

  if (locked) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-taskly-muted">
          Record your practice
        </h3>
        <p className="mt-2 text-base text-taskly-muted">{lockedReason}</p>
      </section>
    );
  }

  if (!canRecord) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800">
          Record your practice
        </h3>
        <p className="mt-2 text-base text-amber-900/80">
          Add Firebase Storage to <code className="rounded bg-white/60 px-1">.env</code> (including{' '}
          <code className="rounded bg-white/60 px-1">REACT_APP_FIREBASE_STORAGE_BUCKET</code>
          ), enable Storage in the Firebase console, and deploy{' '}
          <code className="rounded bg-white/60 px-1">storage.rules</code>.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border-2 border-taskly-yellow/40 bg-taskly-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-taskly-ink">
          Record your practice
        </h3>
        {isSaved && (
          <span className="rounded-full bg-taskly-yellow px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-taskly-ink">
            Complete
          </span>
        )}
      </div>

      <p className="mt-1 text-base text-taskly-muted">
        Record your exercise, listen back, then save when you&apos;re happy with it.
      </p>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-base text-red-600" role="alert">
          {error}
        </p>
      )}

      {isSaved && status !== 'preview' && recording?.downloadUrl && (
        <div className="mt-4 rounded-xl bg-white p-4 shadow-soft">
          <p className="mb-2 text-sm font-semibold text-taskly-muted">
            Your saved recording
            {recording.recordedAt && (
              <span className="ml-2 font-normal">
                · {new Date(recording.recordedAt).toLocaleString()}
              </span>
            )}
          </p>
          <audio controls src={recording.downloadUrl} className="w-full" preload="metadata">
            <track kind="captions" />
          </audio>
          {recording.durationMs != null && (
            <p className="mt-1 text-sm text-taskly-muted">
              Duration: {formatDuration(recording.durationMs)}
            </p>
          )}
        </div>
      )}

      {status === 'preview' && previewUrl && (
        <div className="mt-4 rounded-xl border-2 border-taskly-yellow/60 bg-white p-4 shadow-soft">
          <p className="mb-2 text-sm font-semibold text-taskly-ink">
            Listen before saving · {formatDuration(previewDurationMs)}
          </p>
          <audio controls src={previewUrl} className="w-full" preload="metadata">
            <track kind="captions" />
          </audio>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {status === 'idle' && !isUploading && (
          <button
            type="button"
            onClick={startRecording}
            className="flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-2xl bg-taskly-ink py-4 text-base font-bold text-white transition hover:bg-neutral-800"
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
            {isSaved ? 'Record again' : 'Start recording'}
          </button>
        )}

        {status === 'recording' && (
          <>
            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 font-mono text-xl font-semibold text-taskly-ink">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
              {formatDuration(elapsedMs)}
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="rounded-2xl bg-taskly-yellow px-6 py-4 text-base font-bold text-taskly-ink transition hover:bg-taskly-yellow-hover"
            >
              Stop
            </button>
          </>
        )}

        {isUploading && (
          <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-4 text-base font-medium text-taskly-muted">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-taskly-yellow border-t-transparent" />
            Saving to Firebase…
          </div>
        )}

        {status === 'preview' && !isUploading && (
          <>
            <button
              type="button"
              onClick={handleReRecord}
              className="rounded-2xl border border-taskly-border bg-white px-5 py-4 text-base font-semibold text-taskly-ink"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-taskly-ink py-4 text-base font-bold text-white transition hover:bg-neutral-800"
            >
              Save recording
            </button>
          </>
        )}
      </div>

      {isSaved && (
        <button
          type="button"
          onClick={() => onClearProgress(dayNum)}
          disabled={isUploading}
          className="mt-4 w-full text-center text-sm font-medium text-taskly-muted underline-offset-2 hover:text-red-500 hover:underline disabled:opacity-50"
        >
          Reset day (removes this day and all later progress)
        </button>
      )}
    </section>
  );
}
