jest.mock('../../src/firebase/config', () => ({
  db: {},
  isFirebaseConfigured: true,
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'doc-ref'),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  increment: jest.fn((n) => n),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  collectionGroup: jest.fn(() => 'skills-collection-group'),
  query: jest.fn((...args) => args),
  where: jest.fn((field, op, value) => [field, op, value]),
}));

import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  assignSkillAssessor,
  computeStreak,
  getAssignedLearners,
  reviewSkillSubmission,
  submitSkillTask,
  summarizeAssignedLearners,
} from '../../src/lib/personaSkillProgress';

function task(day, completedAt) {
  return { day, completed: Boolean(completedAt), completedAt: completedAt ?? null };
}

beforeEach(() => {
  jest.clearAllMocks();
  // CRA's default jest config resets mock implementations between tests,
  // so the factory defaults above don't survive—set them fresh each time.
  doc.mockReturnValue('doc-ref');
  collectionGroup.mockReturnValue('skills-collection-group');
  query.mockImplementation((...args) => args);
  where.mockImplementation((field, op, value) => [field, op, value]);
});

test('no completed tasks means no streak', () => {
  expect(computeStreak([task(1), task(2)])).toEqual({ current: 0, longest: 0 });
});

test('a single day completed today counts as a streak of one', () => {
  const reference = new Date('2026-07-20T12:00:00Z');
  const tasks = [task(1, '2026-07-20')];
  expect(computeStreak(tasks, reference)).toEqual({ current: 1, longest: 1 });
});

test('consecutive days ending today build the current streak', () => {
  const reference = new Date('2026-07-20T12:00:00Z');
  const tasks = [
    task(1, '2026-07-17'),
    task(2, '2026-07-18'),
    task(3, '2026-07-19'),
    task(4, '2026-07-20'),
  ];
  expect(computeStreak(tasks, reference)).toEqual({ current: 4, longest: 4 });
});

test('a gap breaks the current streak but longest still reflects the best run', () => {
  const reference = new Date('2026-07-20T12:00:00Z');
  const tasks = [
    task(1, '2026-07-10'),
    task(2, '2026-07-11'),
    task(3, '2026-07-12'),
    // gap
    task(4, '2026-07-19'),
    task(5, '2026-07-20'),
  ];
  expect(computeStreak(tasks, reference)).toEqual({ current: 2, longest: 3 });
});

test('yesterday still counts toward the current streak if today has not happened yet', () => {
  const reference = new Date('2026-07-20T08:00:00Z');
  const tasks = [task(1, '2026-07-18'), task(2, '2026-07-19')];
  expect(computeStreak(tasks, reference)).toEqual({ current: 2, longest: 2 });
});

test('a stale streak (missed both today and yesterday) resets to zero', () => {
  const reference = new Date('2026-07-20T12:00:00Z');
  const tasks = [task(1, '2026-07-15'), task(2, '2026-07-16')];
  expect(computeStreak(tasks, reference)).toEqual({ current: 0, longest: 2 });
});

describe('assignSkillAssessor', () => {
  test('assigns an assessor when none is set yet', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ tasks: [], assignedAssessorId: null }),
    });

    await assignSkillAssessor('uid-1', 'design', {
      assessorId: 'assessor-1',
      assessorName: 'Ada',
    });

    expect(updateDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({
        assignedAssessorId: 'assessor-1',
        assignedAssessorName: 'Ada',
      }),
    );
  });

  test('refuses to overwrite an already-assigned assessor', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        tasks: [],
        assignedAssessorId: 'assessor-1',
        assignedAssessorName: 'Ada',
      }),
    });

    await expect(
      assignSkillAssessor('uid-1', 'design', {
        assessorId: 'assessor-2',
        assessorName: 'Bola',
      }),
    ).rejects.toThrow(/already assigned/i);

    expect(updateDoc).not.toHaveBeenCalled();
  });
});

describe('submitSkillTask', () => {
  const baseProgress = {
    assignedAssessorId: 'assessor-1',
    tasks: [
      { day: 1, completed: false, completedAt: null },
      { day: 2, completed: false, completedAt: null },
    ],
  };

  test('rejects a submission with no link and no images', async () => {
    await expect(
      submitSkillTask('uid-1', 'design', 1, { link: '', imageUrls: [], note: '' }),
    ).rejects.toThrow(/link or at least one image/i);

    expect(updateDoc).not.toHaveBeenCalled();
  });

  test('rejects submitting before an assessor is assigned', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ...baseProgress, assignedAssessorId: null }),
    });

    await expect(
      submitSkillTask('uid-1', 'design', 1, { link: 'https://example.com', imageUrls: [] }),
    ).rejects.toThrow(/pick an assessor/i);

    expect(updateDoc).not.toHaveBeenCalled();
  });

  test('marks the task complete and attaches the submission', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => baseProgress,
    });

    const { tasks } = await submitSkillTask('uid-1', 'design', 1, {
      link: 'https://example.com/work',
      imageUrls: ['https://img/one.png'],
      note: 'First pass',
    });

    const submittedTask = tasks.find((t) => t.day === 1);
    expect(submittedTask.completed).toBe(true);
    expect(submittedTask.submission).toEqual(
      expect.objectContaining({
        link: 'https://example.com/work',
        imageUrls: ['https://img/one.png'],
        note: 'First pass',
        status: 'pending',
      }),
    );
    expect(tasks.find((t) => t.day === 2).completed).toBe(false);

    expect(updateDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ tasks }),
    );
  });
});

describe('getAssignedLearners', () => {
  test('queries the skills collection group filtered by assignedAssessorId', async () => {
    const docs = [{ data: () => ({ uid: 'learner-1' }) }, { data: () => ({ uid: 'learner-2' }) }];
    getDocs.mockResolvedValue({ docs });

    const result = await getAssignedLearners('assessor-1');

    expect(collectionGroup).toHaveBeenCalledWith({}, 'skills');
    expect(where).toHaveBeenCalledWith('assignedAssessorId', '==', 'assessor-1');
    expect(result).toEqual([{ uid: 'learner-1' }, { uid: 'learner-2' }]);
  });
});

describe('summarizeAssignedLearners', () => {
  const learner = (overrides) => ({
    uid: 'learner-1',
    skillId: 'design',
    answers: { name: 'Ada' },
    tasks: [],
    ...overrides,
  });

  test('counts distinct students and sums review time', () => {
    const learners = [
      learner({
        uid: 'learner-1',
        tasks: [
          { day: 1, submission: { status: 'pending', reviewDurationSeconds: 0, submittedAt: '2026-07-19T00:00:00Z' } },
        ],
      }),
      learner({
        uid: 'learner-2',
        tasks: [
          { day: 1, submission: { status: 'approved', reviewDurationSeconds: 3600 } },
        ],
      }),
    ];

    const summary = summarizeAssignedLearners(learners);

    expect(summary.studentCount).toBe(2);
    expect(summary.hoursReviewing).toBe(1);
    expect(summary.awaitingReview).toHaveLength(1);
    expect(summary.pendingResponse).toHaveLength(0);
  });

  test('splits pending review from changes-requested (pending response)', () => {
    const learners = [
      learner({
        tasks: [
          { day: 1, submission: { status: 'pending', submittedAt: '2026-07-20T00:00:00Z' } },
          { day: 2, submission: { status: 'changes_requested', reviewedAt: '2026-07-19T00:00:00Z' } },
          { day: 3, submission: { status: 'approved' } },
        ],
      }),
    ];

    const summary = summarizeAssignedLearners(learners);

    expect(summary.awaitingReview).toHaveLength(1);
    expect(summary.awaitingReview[0].task.day).toBe(1);
    expect(summary.pendingResponse).toHaveLength(1);
    expect(summary.pendingResponse[0].task.day).toBe(2);
  });

  test('handles no assigned learners', () => {
    expect(summarizeAssignedLearners([])).toEqual({
      studentCount: 0,
      hoursReviewing: 0,
      awaitingReview: [],
      pendingResponse: [],
    });
  });
});

describe('reviewSkillSubmission', () => {
  const baseProgress = {
    tasks: [
      {
        day: 1,
        completed: true,
        completedAt: '2026-07-19',
        submission: {
          link: 'https://example.com',
          imageUrls: [],
          status: 'pending',
          reviewDurationSeconds: 0,
        },
      },
    ],
  };

  test('rejects an invalid outcome', async () => {
    await expect(
      reviewSkillSubmission('learner-1', 'design', 1, { outcome: 'maybe' }),
    ).rejects.toThrow(/invalid review outcome/i);
    expect(updateDoc).not.toHaveBeenCalled();
  });

  test('approving keeps the task complete and sets status to approved', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => baseProgress });

    const { tasks } = await reviewSkillSubmission('learner-1', 'design', 1, {
      outcome: 'approved',
      comment: 'Great work',
      reviewDurationSeconds: 120,
    });

    const reviewed = tasks.find((t) => t.day === 1);
    expect(reviewed.completed).toBe(true);
    expect(reviewed.submission.status).toBe('approved');
    expect(reviewed.submission.reviewComment).toBe('Great work');
    expect(reviewed.submission.reviewDurationSeconds).toBe(120);
  });

  test('requesting changes reopens the task for the learner', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => baseProgress });

    const { tasks } = await reviewSkillSubmission('learner-1', 'design', 1, {
      outcome: 'changes_requested',
      comment: 'Try again',
      reviewDurationSeconds: 60,
    });

    const reviewed = tasks.find((t) => t.day === 1);
    expect(reviewed.completed).toBe(false);
    expect(reviewed.completedAt).toBeNull();
    expect(reviewed.submission.status).toBe('changes_requested');
    expect(reviewed.submission.reviewComment).toBe('Try again');
  });
});
