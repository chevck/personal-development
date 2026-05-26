import {
  canPlayMimeType,
  extensionForMimeType,
  isAppleMobile,
  normalizeMimeType,
} from './audioRecording';

describe('audioRecording', () => {
  test('extensionForMimeType', () => {
    expect(extensionForMimeType('audio/mp4')).toBe('m4a');
    expect(extensionForMimeType('audio/webm')).toBe('webm');
  });

  test('normalizeMimeType', () => {
    expect(normalizeMimeType('audio/mp4')).toBe('audio/mp4');
  });

  test('isAppleMobile is boolean', () => {
    expect(typeof isAppleMobile()).toBe('boolean');
  });

  test('canPlayMimeType returns boolean', () => {
    expect(typeof canPlayMimeType('audio/mp4')).toBe('boolean');
  });
});
