import {
  MAX_ASSESSOR_ID_DOCUMENT_BYTES,
  MAX_ASSESSOR_PHOTO_BYTES,
  validateAssessorIdDocument,
  validateAssessorPhoto,
} from '../../src/lib/personaAssessorMedia';

describe('validateAssessorPhoto', () => {
  test('accepts a PNG under the size limit', () => {
    expect(() =>
      validateAssessorPhoto({ type: 'image/png', size: 1024 }),
    ).not.toThrow();
  });

  test('accepts a JPG under the size limit', () => {
    expect(() =>
      validateAssessorPhoto({ type: 'image/jpeg', size: 1024 }),
    ).not.toThrow();
  });

  test('rejects other file types', () => {
    expect(() =>
      validateAssessorPhoto({ type: 'application/pdf', size: 1024 }),
    ).toThrow(/png or jpg/i);
  });

  test('rejects a photo over 5MB', () => {
    expect(() =>
      validateAssessorPhoto({ type: 'image/png', size: MAX_ASSESSOR_PHOTO_BYTES + 1 }),
    ).toThrow(/5MB/);
  });
});

describe('validateAssessorIdDocument', () => {
  test('accepts a PDF under the size limit', () => {
    expect(() =>
      validateAssessorIdDocument({ type: 'application/pdf', size: 1024 }),
    ).not.toThrow();
  });

  test('accepts a PNG or JPG under the size limit', () => {
    expect(() =>
      validateAssessorIdDocument({ type: 'image/png', size: 1024 }),
    ).not.toThrow();
    expect(() =>
      validateAssessorIdDocument({ type: 'image/jpeg', size: 1024 }),
    ).not.toThrow();
  });

  test('rejects unsupported file types', () => {
    expect(() =>
      validateAssessorIdDocument({ type: 'application/msword', size: 1024 }),
    ).toThrow(/pdf, png, or jpg/i);
  });

  test('rejects a document over 8MB', () => {
    expect(() =>
      validateAssessorIdDocument({
        type: 'application/pdf',
        size: MAX_ASSESSOR_ID_DOCUMENT_BYTES + 1,
      }),
    ).toThrow(/8MB/);
  });
});
