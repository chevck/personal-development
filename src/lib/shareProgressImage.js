import html2canvas from 'html2canvas';

export async function captureElementAsPng(element, { scale = 2 } = {}) {
  if (!element) {
    throw new Error('Nothing to capture.');
  }

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: null,
    useCORS: true,
    logging: false,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not create image.'));
          return;
        }
        resolve(blob);
      },
      'image/png',
      1,
    );
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function shareProgressImage({ blob, title, text }) {
  const file = new File([blob], 'speakly-progress.png', { type: 'image/png' });
  const payload = { title, text, files: [file] };

  if (navigator.share && navigator.canShare?.(payload)) {
    await navigator.share(payload);
    return 'shared';
  }

  if (navigator.share) {
    await navigator.share({ title, text });
    return 'text-only';
  }

  throw new Error('Sharing is not supported on this device. Save the image instead.');
}

export function buildShareCaption({ userName, day, phaseLabel, personalComment, score, programDuration, completedCount }) {
  const lines = [
    `Day ${day.day} complete on Speakly — "${day.title}" (${phaseLabel})`,
    personalComment?.trim() ? personalComment.trim() : null,
    score != null ? `Assessor score: ${score}/10` : null,
    `${completedCount}/${programDuration} days done`,
    '#Speakly #SpeechTraining #Persona',
  ].filter(Boolean);

  return lines.join('\n\n');
}
