jest.mock('../../src/firebase/config', () => ({
  db: {},
  isFirebaseConfigured: true,
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'collection-ref'),
  doc: jest.fn(() => 'doc-ref'),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  increment: jest.fn((n) => n),
  query: jest.fn(() => 'query-ref'),
  setDoc: jest.fn(),
  where: jest.fn(() => 'where-clause'),
  writeBatch: jest.fn(),
}));

const { collection, doc, getDoc, getDocs, query, setDoc, where, writeBatch } =
  require('firebase/firestore');
const {
  hasRatedAssessor,
  incrementAssessorStudentCount,
  listAssessorsForTrack,
  rateAssessor,
  upsertAssessorDirectoryEntry,
} = require('../../src/lib/personaAssessorDirectory');

beforeEach(() => {
  jest.clearAllMocks();
  collection.mockReturnValue('collection-ref');
  doc.mockReturnValue('doc-ref');
  query.mockReturnValue('query-ref');
  where.mockReturnValue('where-clause');
});

describe('upsertAssessorDirectoryEntry', () => {
  test('stamps kycStatus unverified when creating a brand-new assessor', async () => {
    await upsertAssessorDirectoryEntry('uid-1', {
      name: 'Ada Lovelace',
      track: 'design',
      kycStatus: 'unverified',
    });

    expect(setDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ kycStatus: 'unverified' }),
      { merge: true },
    );
  });

  test('stamps kycStatus pending when submitting KYC', async () => {
    await upsertAssessorDirectoryEntry('uid-1', {
      name: 'Ada Lovelace',
      track: 'design',
      kycStatus: 'pending',
    });

    expect(setDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ kycStatus: 'pending' }),
      { merge: true },
    );
  });

  test('leaves kycStatus untouched on a later re-sync, so an approval survives unrelated edits', async () => {
    await upsertAssessorDirectoryEntry('uid-1', {
      name: 'Ada Lovelace',
      track: 'design',
      bio: 'Updated bio',
    });

    const [, payload] = setDoc.mock.calls[0];
    expect(payload).not.toHaveProperty('kycStatus');
  });

  test('carries through photo and mentoring charge fields', async () => {
    await upsertAssessorDirectoryEntry('uid-1', {
      name: 'Ada Lovelace',
      track: 'design',
      photoUrl: 'https://storage.example.com/ada.jpg',
      mentoringCharge: 150,
      mentoringCurrency: 'USD',
    });

    expect(setDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({
        photoUrl: 'https://storage.example.com/ada.jpg',
        mentoringCharge: 150,
        mentoringCurrency: 'USD',
      }),
      { merge: true },
    );
  });
});

describe('listAssessorsForTrack', () => {
  test('filters by both track and active kycStatus', async () => {
    getDocs.mockResolvedValue({ docs: [] });

    await listAssessorsForTrack('design');

    expect(where).toHaveBeenCalledWith('track', '==', 'design');
    expect(where).toHaveBeenCalledWith('kycStatus', '==', 'active');
  });

  test('returns assessors sorted by name', async () => {
    getDocs.mockResolvedValue({
      docs: [
        { data: () => ({ name: 'Zainab' }) },
        { data: () => ({ name: 'Ada' }) },
      ],
    });

    const result = await listAssessorsForTrack('design');

    expect(result.map((a) => a.name)).toEqual(['Ada', 'Zainab']);
  });
});

describe('directory entry creation', () => {
  test('zeroes rating and student counters for a brand-new assessor', async () => {
    await upsertAssessorDirectoryEntry('uid-1', {
      name: 'Ada Lovelace',
      track: 'design',
      kycStatus: 'unverified',
    });

    expect(setDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ ratingSum: 0, ratingCount: 0, studentsCount: 0 }),
      { merge: true },
    );
  });

  test('does not reset counters on a later re-sync, so accumulated ratings/students survive unrelated edits', async () => {
    await upsertAssessorDirectoryEntry('uid-1', {
      name: 'Ada Lovelace',
      track: 'design',
      bio: 'Updated bio',
    });

    const [, payload] = setDoc.mock.calls[0];
    expect(payload).not.toHaveProperty('ratingSum');
    expect(payload).not.toHaveProperty('ratingCount');
    expect(payload).not.toHaveProperty('studentsCount');
  });
});

describe('hasRatedAssessor', () => {
  test('returns true when a rating doc exists', async () => {
    getDoc.mockResolvedValue({ exists: () => true });

    expect(await hasRatedAssessor('assessor-1', 'learner-1')).toBe(true);
    expect(doc).toHaveBeenCalledWith({}, 'persona_users', 'assessor-1', 'ratings', 'learner-1');
  });

  test('returns false when no rating doc exists', async () => {
    getDoc.mockResolvedValue({ exists: () => false });

    expect(await hasRatedAssessor('assessor-1', 'learner-1')).toBe(false);
  });
});

describe('rateAssessor', () => {
  test('rejects a score outside 1-5', async () => {
    await expect(rateAssessor('assessor-1', 'learner-1', 0)).rejects.toThrow();
    await expect(rateAssessor('assessor-1', 'learner-1', 6)).rejects.toThrow();
    expect(writeBatch).not.toHaveBeenCalled();
  });

  test('batches the rating doc create with the aggregate increment', async () => {
    const batch = {
      set: jest.fn(),
      update: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    writeBatch.mockReturnValue(batch);

    await rateAssessor('assessor-1', 'learner-1', 4);

    expect(batch.set).toHaveBeenCalledWith('doc-ref', expect.objectContaining({ score: 4 }));
    expect(batch.update).toHaveBeenCalledWith('doc-ref', { ratingSum: 4, ratingCount: 1 });
    expect(batch.commit).toHaveBeenCalled();
  });
});

describe('incrementAssessorStudentCount', () => {
  test('bumps studentsCount with a merge write', async () => {
    await incrementAssessorStudentCount('assessor-1');

    expect(setDoc).toHaveBeenCalledWith('doc-ref', { studentsCount: 1 }, { merge: true });
  });
});
