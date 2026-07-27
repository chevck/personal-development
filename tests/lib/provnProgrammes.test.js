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
  limit: jest.fn(() => 'limit-clause'),
  query: jest.fn(() => 'query-ref'),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  where: jest.fn(() => 'where-clause'),
}));

const { collection, doc, getDoc, getDocs, query, updateDoc, where } = require('firebase/firestore');
const {
  assignProgrammeAssessor,
  getProvnProgramme,
  startProgrammeTraining,
  submitProgrammeTask,
} = require('../../src/lib/provnProgrammes');

beforeEach(() => {
  jest.clearAllMocks();
  collection.mockReturnValue('collection-ref');
  doc.mockReturnValue('doc-ref');
  query.mockReturnValue('query-ref');
  where.mockReturnValue('where-clause');
});

test('returns null without a uid or track', async () => {
  expect(await getProvnProgramme(null, 'design')).toBeNull();
  expect(await getProvnProgramme('uid-1', null)).toBeNull();
  expect(getDocs).not.toHaveBeenCalled();
});

test('queries by userId and track, and returns null when nothing matches', async () => {
  getDocs.mockResolvedValue({ empty: true, docs: [] });

  const result = await getProvnProgramme('uid-1', 'design');

  expect(collection).toHaveBeenCalledWith({}, 'provn_programmes');
  expect(where).toHaveBeenCalledWith('userId', '==', 'uid-1');
  expect(where).toHaveBeenCalledWith('track', '==', 'design');
  expect(result).toBeNull();
});

test('returns the first matching programme with its doc id attached', async () => {
  getDocs.mockResolvedValue({
    empty: false,
    docs: [
      {
        id: 'programme-1',
        data: () => ({
          userId: 'uid-1',
          track: 'design',
          skill: 'Design',
          programmeDuration: 14,
          role: 'learner',
          createdAt: '2026-07-01T00:00:00.000Z',
          encouragementNote: "You've got this.",
          tasks: [{ id: 1, title: 'Audit a login screen', subtitle: '', goal: '' }],
        }),
      },
    ],
  });

  const result = await getProvnProgramme('uid-1', 'design');

  expect(result).toEqual({
    id: 'programme-1',
    userId: 'uid-1',
    track: 'design',
    skill: 'Design',
    programmeDuration: 14,
    role: 'learner',
    createdAt: '2026-07-01T00:00:00.000Z',
    encouragementNote: "You've got this.",
    tasks: [{ id: 1, title: 'Audit a login screen', subtitle: '', goal: '' }],
  });
});

describe('assignProgrammeAssessor', () => {
  test('assigns the assessor when none is set yet', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ assignedAssessorId: null }) });

    await assignProgrammeAssessor('programme-1', {
      assessorId: 'assessor-1',
      assessorName: 'Ada Lovelace',
    });

    expect(doc).toHaveBeenCalledWith({}, 'provn_programmes', 'programme-1');
    expect(updateDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({
        assignedAssessorId: 'assessor-1',
        assignedAssessorName: 'Ada Lovelace',
      }),
    );
  });

  test('refuses to overwrite an existing assessor', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ assignedAssessorId: 'assessor-existing' }),
    });

    await expect(
      assignProgrammeAssessor('programme-1', { assessorId: 'assessor-1', assessorName: 'Ada' }),
    ).rejects.toThrow(/already assigned/i);
    expect(updateDoc).not.toHaveBeenCalled();
  });

  test('throws when the programme does not exist', async () => {
    getDoc.mockResolvedValue({ exists: () => false });

    await expect(
      assignProgrammeAssessor('programme-1', { assessorId: 'assessor-1', assessorName: 'Ada' }),
    ).rejects.toThrow(/couldn't find/i);
  });
});

describe('startProgrammeTraining', () => {
  test('starts training once an assessor is assigned', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ assignedAssessorId: 'assessor-1' }),
    });

    await startProgrammeTraining('programme-1');

    expect(updateDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ trainingStarted: true }),
    );
  });

  test('refuses to start without an assessor', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ assignedAssessorId: null }) });

    await expect(startProgrammeTraining('programme-1')).rejects.toThrow(
      /select an assessor/i,
    );
    expect(updateDoc).not.toHaveBeenCalled();
  });
});

describe('submitProgrammeTask', () => {
  const existingTasks = [
    { id: 1, title: 'Audit a login screen', subtitle: '', goal: '' },
    { id: 2, title: 'Typography pass', subtitle: '', goal: '' },
  ];

  test('rejects a submission with no link and no images', async () => {
    await expect(
      submitProgrammeTask('programme-1', 1, { link: '', imageUrls: [], note: '' }),
    ).rejects.toThrow(/link or at least one image/i);
    expect(updateDoc).not.toHaveBeenCalled();
  });

  test('replaces only the matching task with its submission, leaving the rest untouched', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ tasks: existingTasks }) });

    const result = await submitProgrammeTask('programme-1', 1, {
      link: 'https://example.com',
      imageUrls: ['https://storage.example.com/img.png'],
      note: 'Here you go',
    });

    expect(result[0]).toMatchObject({
      id: 1,
      submission: {
        link: 'https://example.com',
        imageUrls: ['https://storage.example.com/img.png'],
        note: 'Here you go',
        status: 'pending',
      },
    });
    expect(result[1]).toEqual(existingTasks[1]);
    expect(updateDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ tasks: result }),
    );
  });

  test('throws when the programme does not exist', async () => {
    getDoc.mockResolvedValue({ exists: () => false });

    await expect(
      submitProgrammeTask('programme-1', 1, { link: 'https://example.com' }),
    ).rejects.toThrow(/couldn't find/i);
  });
});
