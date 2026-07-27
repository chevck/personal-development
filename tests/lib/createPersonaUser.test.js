jest.mock('../../src/firebase/config', () => ({
  db: {},
  isFirebaseConfigured: true,
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'doc-ref'),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('../../src/lib/apiClient', () => ({
  __esModule: true,
  default: { post: jest.fn().mockResolvedValue({ data: {} }) },
}));

const { doc, setDoc } = require('firebase/firestore');
const apiClient = require('../../src/lib/apiClient').default;
const { createPersonaUser } = require('../../src/lib/speaklyUsers');
const { PERSONA_USERS_COLLECTION } = require('../../src/lib/personaUsers');
const { PERSONA_TRACK_DESIGN, PERSONA_TRACK_VOICE } = require('../../src/config/personaRegistration');

const baseLearnerProfile = {
  role: 'learner',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  reasonsForJoining: ['freeze-meetings'],
  reasonsForJoiningOther: '',
  contexts: ['professional'],
  contextsOther: '',
  focusAreas: ['clarity'],
  focusAreasOther: '',
  endGoals: ['present-confidently'],
  endGoalsOther: '',
  programDuration: 21,
};

beforeEach(() => {
  jest.clearAllMocks();
  doc.mockReturnValue('doc-ref');
});

test('every new user is written to persona_users, regardless of track', async () => {
  await createPersonaUser('uid-1', { ...baseLearnerProfile, track: PERSONA_TRACK_VOICE });

  expect(doc).toHaveBeenCalledWith({}, PERSONA_USERS_COLLECTION, 'uid-1');
  expect(setDoc).toHaveBeenCalledWith(
    'doc-ref',
    expect.objectContaining({ track: PERSONA_TRACK_VOICE }),
  );
});

test('design-track learners also land in persona_users', async () => {
  await createPersonaUser('uid-2', {
    ...baseLearnerProfile,
    track: PERSONA_TRACK_DESIGN,
    disciplines: ['ui-ux'],
    reasonsForJoining: ['portfolio'],
    contexts: ['product-teams'],
    focusAreas: ['layout'],
    endGoals: ['ship-portfolio'],
  });

  expect(doc).toHaveBeenCalledWith({}, PERSONA_USERS_COLLECTION, 'uid-2');
  expect(setDoc).toHaveBeenCalledWith(
    'doc-ref',
    expect.objectContaining({ track: PERSONA_TRACK_DESIGN }),
  );
});

test('still calls the task-creation backend before saving the profile', async () => {
  await createPersonaUser('uid-1', { ...baseLearnerProfile, track: PERSONA_TRACK_VOICE });

  expect(apiClient.post).toHaveBeenCalledWith(
    '/provn-api/task/create',
    expect.objectContaining({ track: PERSONA_TRACK_VOICE }),
    { toast: false },
  );
});
