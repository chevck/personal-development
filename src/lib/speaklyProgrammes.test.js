import {
  getLocalProgrammePhases,
  normalizeProgrammePhases,
  resolveSpeaklyProgrammeForUser,
} from './speaklyProgrammes';
import { getCurriculumLength, setProgrammePhases } from './speechTrainingProgram';

jest.mock('./speaklyUsers', () => ({
  getSpeaklyUser: jest.fn(),
}));

jest.mock('../firebase/config', () => ({
  db: {},
  isFirebaseConfigured: true,
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

import { getDoc } from 'firebase/firestore';
import { getSpeaklyUser } from './speaklyUsers';

describe('speaklyProgrammes', () => {
  beforeEach(() => {
    setProgrammePhases(getLocalProgrammePhases());
    jest.clearAllMocks();
  });

  test('normalizeProgrammePhases accepts phases array on document', () => {
    const phases = normalizeProgrammePhases({
      phases: [
        {
          id: 1,
          title: 'Phase 1 — Test',
          days: [{ day: 1, title: 'Day one', type: 'Awareness' }],
        },
      ],
    });

    expect(phases).toHaveLength(1);
    expect(phases[0].days[0].title).toBe('Day one');
  });

  test('resolveSpeaklyProgrammeForUser falls back to local programme', async () => {
    getSpeaklyUser.mockResolvedValue(null);
    getDoc.mockResolvedValue({ exists: () => false });

    const result = await resolveSpeaklyProgrammeForUser('uid-1');

    expect(result.source).toBe('local');
    expect(result.phases).toHaveLength(getLocalProgrammePhases().length);
    expect(getCurriculumLength()).toBe(21);
  });

  test('resolveSpeaklyProgrammeForUser uses remote programme when present', async () => {
    getSpeaklyUser.mockResolvedValue({ programmeId: 'custom-programme' });
    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'custom-programme',
      data: () => ({
        phases: [
          {
            id: 1,
            title: 'Phase 1 — Remote',
            days: [
              { day: 1, title: 'Remote day 1', type: 'Awareness' },
              { day: 2, title: 'Remote day 2', type: 'Pacing' },
            ],
          },
        ],
      }),
    });

    const result = await resolveSpeaklyProgrammeForUser('uid-1');

    expect(result.source).toBe('remote');
    expect(result.id).toBe('custom-programme');
    expect(result.phases[0].days).toHaveLength(2);
  });
});
