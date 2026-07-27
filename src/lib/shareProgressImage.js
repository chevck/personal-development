import html2canvas from 'html2canvas';
import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
} from '../projects/speech-training/components/ShareProgressCard';

const SHARE_CARD_FONTS = [
  '600 64px "Fraunces"',
  '600 52px "Fraunces"',
  '600 72px "Fraunces"',
  '600 280px "Fraunces"',
  'italic 600 26px "Fraunces"',
  '700 18px "Plus Jakarta Sans"',
  '700 16px "Plus Jakarta Sans"',
  '800 20px "Plus Jakarta Sans"',
  '600 28px "Plus Jakarta Sans"',
  '600 26px "Plus Jakarta Sans"',
  '600 18px "Plus Jakarta Sans"',
];

export async function ensureShareCardFonts() {
  if (!document.fonts?.load) return;
  await Promise.all(SHARE_CARD_FONTS.map((spec) => document.fonts.load(spec)));
  await document.fonts.ready;
}

function waitForImages(element) {
  const images = element.querySelectorAll('img');
  return Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        }),
    ),
  );
}

export async function captureElementAsPng(element, { scale = 2, backgroundColor = '#ffffff' } = {}) {
  if (!element) {
    throw new Error('Nothing to capture.');
  }

  await ensureShareCardFonts();
  await waitForImages(element);

  const width = SHARE_CARD_WIDTH;
  const height = SHARE_CARD_HEIGHT;

  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.style.overflow = 'hidden';

  const canvas = await html2canvas(element, {
    scale,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    backgroundColor,
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    onclone: (_doc, clonedElement) => {
      clonedElement.style.transform = 'none';
      clonedElement.style.opacity = '1';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.position = 'relative';
      clonedElement.style.left = '0';
      clonedElement.style.top = '0';
      clonedElement.style.width = `${width}px`;
      clonedElement.style.height = `${height}px`;
      clonedElement.style.overflow = 'hidden';
      clonedElement.style.margin = '0';
      clonedElement.style.padding = '0';
    },
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

export function buildShareCaption({
  userName,
  day,
  phaseLabel,
  personalComment,
  score,
  programDuration,
  completedCount,
}) {
  const lines = [
    `Day ${day.day} complete on Speakly — "${day.title}" (${phaseLabel})`,
    personalComment?.trim() ? personalComment.trim() : null,
    score != null ? `Assessor score: ${score}/10` : null,
    `${completedCount}/${programDuration} days done`,
    '#Speakly #SpeechTraining #Provn',
  ].filter(Boolean);

  return lines.join('\n\n');
}
