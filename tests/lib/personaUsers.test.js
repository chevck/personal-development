jest.mock('../../src/firebase/config', () => ({
  db: {},
  isFirebaseConfigured: true,
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'doc-ref'),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('../../src/lib/personaAssessorDirectory', () => ({
  upsertAssessorDirectoryEntry: jest.fn(),
}));

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {
  PERSONA_TRACK_DESIGN,
  PERSONA_TRACK_VOICE,
} from '../../src/config/personaRegistration';
import { upsertAssessorDirectoryEntry } from '../../src/lib/personaAssessorDirectory';
import {
  buildPersonaAssessorDocument,
  createPersonaAssessor,
  submitAssessorKyc,
  validateAssessorKycSubmission,
  validateAssessorRegistrationProfile,
} from '../../src/lib/personaUsers';

beforeEach(() => {
  jest.clearAllMocks();
  // CRA's default jest config resets mock implementations between tests,
  // so the factory default above doesn't survive—set it fresh each time.
  doc.mockReturnValue('doc-ref');
});

const designAssessorProfile = {
  name: 'Chidi Okafor',
  email: 'chidi@example.com',
  track: PERSONA_TRACK_DESIGN,
  qualifications: ['product-designer'],
  qualificationsOther: '',
  assessorFocus: ['ui-ux'],
  assessorFocusOther: '',
  assessorBackground: 'years-5-10',
  assessorBio: 'I review product design work daily.',
  photoUrl: 'https://storage.example.com/chidi-photo.jpg',
  idDocumentUrl: 'https://storage.example.com/chidi-id.pdf',
  mentoringCharge: 150,
  mentoringCurrency: 'USD',
};

const voiceAssessorProfile = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  track: PERSONA_TRACK_VOICE,
  qualifications: ['speech-coach'],
  qualificationsOther: '',
  assessorFocus: ['pace-clarity'],
  assessorFocusOther: '',
  assessorBackground: 'volunteer',
  assessorBio: 'I coach speakers on pacing and clarity.',
  photoUrl: 'https://storage.example.com/ada-photo.jpg',
  idDocumentUrl: 'https://storage.example.com/ada-id.pdf',
  mentoringCharge: 200,
  mentoringCurrency: 'CAD',
};

describe('validateAssessorRegistrationProfile', () => {
  test('accepts a design assessor profile against design option banks', () => {
    expect(() => validateAssessorRegistrationProfile(designAssessorProfile)).not.toThrow();
  });

  test('accepts a voice assessor profile against voice option banks', () => {
    expect(() => validateAssessorRegistrationProfile(voiceAssessorProfile)).not.toThrow();
  });

  test('rejects a design qualification id for a voice-track profile', () => {
    expect(() =>
      validateAssessorRegistrationProfile({
        ...voiceAssessorProfile,
        qualifications: ['product-designer'],
      }),
    ).toThrow(/qualifications/i);
  });

  test('rejects a voice qualification id for a design-track profile', () => {
    expect(() =>
      validateAssessorRegistrationProfile({
        ...designAssessorProfile,
        qualifications: ['speech-coach'],
      }),
    ).toThrow(/qualifications/i);
  });

  test('requires exactly one experience level', () => {
    expect(() =>
      validateAssessorRegistrationProfile({ ...designAssessorProfile, assessorBackground: null }),
    ).toThrow(/experience level/i);
  });

  test('rejects an invalid experience level id', () => {
    expect(() =>
      validateAssessorRegistrationProfile({
        ...designAssessorProfile,
        assessorBackground: 'not-a-real-option',
      }),
    ).toThrow(/experience level/i);
  });

  test('does not require a photo, ID, or mentoring charge—KYC happens after sign-up', () => {
    expect(() =>
      validateAssessorRegistrationProfile({
        ...designAssessorProfile,
        photoUrl: null,
        idDocumentUrl: null,
        mentoringCharge: null,
        mentoringCurrency: null,
      }),
    ).not.toThrow();
  });
});

describe('validateAssessorKycSubmission', () => {
  const validKyc = {
    idDocumentUrl: 'https://storage.example.com/id.pdf',
    mentoringCharge: 150,
    mentoringCurrency: 'USD',
  };

  test('accepts a complete KYC submission', () => {
    expect(() => validateAssessorKycSubmission(validKyc)).not.toThrow();
  });

  test('requires an ID document', () => {
    expect(() =>
      validateAssessorKycSubmission({ ...validKyc, idDocumentUrl: null }),
    ).toThrow(/id/i);
  });

  test('requires a positive mentoring charge', () => {
    expect(() =>
      validateAssessorKycSubmission({ ...validKyc, mentoringCharge: 0 }),
    ).toThrow(/mentoring/i);
  });

  test('rejects a mentoring charge over the maximum', () => {
    expect(() =>
      validateAssessorKycSubmission({ ...validKyc, mentoringCharge: 25001 }),
    ).toThrow(/exceed/i);
  });

  test('requires a valid currency', () => {
    expect(() =>
      validateAssessorKycSubmission({ ...validKyc, mentoringCurrency: 'not-a-currency' }),
    ).toThrow(/currency/i);
  });
});

describe('buildPersonaAssessorDocument', () => {
  test('stores the track the assessor actually registered for', () => {
    const designDoc = buildPersonaAssessorDocument('uid-1', designAssessorProfile);
    expect(designDoc.track).toBe(PERSONA_TRACK_DESIGN);

    const voiceDoc = buildPersonaAssessorDocument('uid-2', voiceAssessorProfile);
    expect(voiceDoc.track).toBe(PERSONA_TRACK_VOICE);
  });
});

describe('createPersonaAssessor', () => {
  test('saves a voice assessor with track "voice", not hardcoded to design', async () => {
    getDoc.mockResolvedValue({ exists: () => false });

    const data = await createPersonaAssessor('uid-3', voiceAssessorProfile);

    expect(data.track).toBe(PERSONA_TRACK_VOICE);
    expect(data.kycStatus).toBe('unverified');
    expect(setDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ track: PERSONA_TRACK_VOICE, kycStatus: 'unverified' }),
    );
    expect(upsertAssessorDirectoryEntry).toHaveBeenCalledWith(
      'uid-3',
      expect.objectContaining({
        track: PERSONA_TRACK_VOICE,
        qualificationLabels: expect.arrayContaining([expect.any(String)]),
        photoUrl: voiceAssessorProfile.photoUrl,
        kycStatus: 'unverified',
      }),
    );
  });

  test('does not persist an ID or mentoring charge at sign-up', async () => {
    getDoc.mockResolvedValue({ exists: () => false });

    const data = await createPersonaAssessor('uid-3', voiceAssessorProfile);

    expect(data.idDocumentUrl).toBeNull();
    expect(data.mentoringCharge).toBeNull();
    expect(data.mentoringCurrency).toBeNull();
  });
});

describe('submitAssessorKyc', () => {
  const kycPayload = {
    idDocumentUrl: 'https://storage.example.com/id.pdf',
    mentoringCharge: 150,
    mentoringCurrency: 'USD',
  };

  test('moves the assessor to pending and syncs the directory', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ...voiceAssessorProfile, kycStatus: 'unverified' }),
    });

    const data = await submitAssessorKyc('uid-3', kycPayload);

    expect(data.kycStatus).toBe('pending');
    expect(updateDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ kycStatus: 'pending', idDocumentUrl: kycPayload.idDocumentUrl }),
    );
    expect(upsertAssessorDirectoryEntry).toHaveBeenCalledWith(
      'uid-3',
      expect.objectContaining({ kycStatus: 'pending' }),
    );
  });

  test('rejects an incomplete submission before writing anything', async () => {
    await expect(
      submitAssessorKyc('uid-3', { ...kycPayload, idDocumentUrl: null }),
    ).rejects.toThrow(/id/i);
    expect(updateDoc).not.toHaveBeenCalled();
  });
});
