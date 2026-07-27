import {
  MAX_SUBMISSION_IMAGE_BYTES,
  normalizeSubmissionLink,
  validateSubmissionImage,
} from '../../src/lib/personaTaskSubmissions';

describe('normalizeSubmissionLink', () => {
  test('returns an empty string for empty input', () => {
    expect(normalizeSubmissionLink('')).toBe('');
    expect(normalizeSubmissionLink('   ')).toBe('');
    expect(normalizeSubmissionLink(undefined)).toBe('');
  });

  test('leaves a full URL untouched', () => {
    expect(normalizeSubmissionLink('https://figma.com/file/abc')).toBe(
      'https://figma.com/file/abc',
    );
    expect(normalizeSubmissionLink('http://example.com')).toBe('http://example.com');
  });

  test('adds https:// to a bare domain', () => {
    expect(normalizeSubmissionLink('figma.com/file/abc')).toBe('https://figma.com/file/abc');
  });
});

describe('validateSubmissionImage', () => {
  test('accepts an image under the size limit', () => {
    const file = { type: 'image/png', size: 1024 };
    expect(() => validateSubmissionImage(file)).not.toThrow();
  });

  test('rejects a non-image file', () => {
    const file = { type: 'application/pdf', size: 1024 };
    expect(() => validateSubmissionImage(file)).toThrow(/only image files/i);
  });

  test('rejects an oversized image', () => {
    const file = { type: 'image/png', size: MAX_SUBMISSION_IMAGE_BYTES + 1 };
    expect(() => validateSubmissionImage(file)).toThrow(/8MB/);
  });
});
