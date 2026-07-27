jest.mock('../../src/lib/personaUsers', () => ({
  getPersonaUser: jest.fn(),
}));
jest.mock('../../src/lib/personaSkillProgress', () => ({
  getSkillProgress: jest.fn(),
}));
jest.mock('../../src/lib/provnProgrammes', () => ({
  getProvnProgramme: jest.fn(),
}));
jest.mock('../../src/lib/speaklyUsers', () => {
  const actual = jest.requireActual('../../src/lib/speaklyUsers');
  return {
    ...actual,
    getSpeaklyUser: jest.fn(),
  };
});

import {
  buildSkillSubscriptions,
  getUserSkillSubscriptions,
} from '../../src/lib/personaDashboard';
import {
  PERSONA_ROLE_ASSESSOR,
  PERSONA_ROLE_LEARNER,
  PERSONA_TRACK_DESIGN,
  PERSONA_TRACK_VOICE,
} from '../../src/config/personaRegistration';
import { SPEECH_TRAINING_PROJECT_ID } from '../../src/config/projects';
import {
  SPEAKLY_ROLE_ASSESSOR,
  SPEAKLY_ROLE_LEARNER,
} from '../../src/config/speaklyRegistration';
import { getPersonaUser } from '../../src/lib/personaUsers';
import { getSkillProgress } from '../../src/lib/personaSkillProgress';
import { getProvnProgramme } from '../../src/lib/provnProgrammes';
import { getSpeaklyUser } from '../../src/lib/speaklyUsers';

test('no profiles means no subscriptions', () => {
  expect(
    buildSkillSubscriptions({ personaProfile: null, speaklyProfile: null }),
  ).toEqual([]);
});

test('speakly learner subscribes to the voice skill with the learner task path', () => {
  const subs = buildSkillSubscriptions({
    personaProfile: null,
    speaklyProfile: { name: 'Ada', role: SPEAKLY_ROLE_LEARNER },
  });

  expect(subs).toHaveLength(1);
  expect(subs[0].skill.id).toBe(SPEECH_TRAINING_PROJECT_ID);
  expect(subs[0].role).toBe(PERSONA_ROLE_LEARNER);
  expect(subs[0].taskPath).toBe(`/skills/${SPEECH_TRAINING_PROJECT_ID}`);
  expect(subs[0].displayName).toBe('Ada');
});

test('speakly assessor gets the assessor dashboard path', () => {
  const subs = buildSkillSubscriptions({
    personaProfile: null,
    speaklyProfile: { name: 'Bola', role: SPEAKLY_ROLE_ASSESSOR },
  });

  expect(subs).toHaveLength(1);
  expect(subs[0].role).toBe(PERSONA_ROLE_ASSESSOR);
  expect(subs[0].taskPath).toBe('/speakly/assessor');
});

test('design learner subscribes to design with no task path yet', () => {
  const subs = buildSkillSubscriptions({
    personaProfile: {
      name: 'Chidi',
      track: PERSONA_TRACK_DESIGN,
      role: PERSONA_ROLE_LEARNER,
    },
    speaklyProfile: null,
  });

  expect(subs).toHaveLength(1);
  expect(subs[0].skill.id).toBe(PERSONA_TRACK_DESIGN);
  expect(subs[0].role).toBe(PERSONA_ROLE_LEARNER);
  expect(subs[0].taskPath).toBeNull();
  expect(subs[0].displayName).toBe('Chidi');
});

test('design learner with generated tasks routes into the task page', () => {
  const subs = buildSkillSubscriptions({
    personaProfile: {
      name: 'Chidi',
      track: PERSONA_TRACK_DESIGN,
      role: PERSONA_ROLE_LEARNER,
    },
    speaklyProfile: null,
    hasGuidedTasks: true,
  });

  expect(subs[0].taskPath).toBe(`/skills/${PERSONA_TRACK_DESIGN}`);
});

test('design assessor routes into the assessor portal, not the task page', () => {
  const subs = buildSkillSubscriptions({
    personaProfile: {
      name: 'Priya',
      track: PERSONA_TRACK_DESIGN,
      role: PERSONA_ROLE_ASSESSOR,
    },
    speaklyProfile: null,
    hasGuidedTasks: false,
  });

  expect(subs).toHaveLength(1);
  expect(subs[0].role).toBe(PERSONA_ROLE_ASSESSOR);
  expect(subs[0].taskPath).toBe('/assessor');
});

test('a user with both profiles gets both skills', () => {
  const subs = buildSkillSubscriptions({
    personaProfile: {
      name: 'Dele',
      track: PERSONA_TRACK_DESIGN,
      role: PERSONA_ROLE_LEARNER,
    },
    speaklyProfile: { name: 'Dele', role: SPEAKLY_ROLE_LEARNER },
  });

  expect(subs.map((s) => s.skill.id)).toEqual([
    SPEECH_TRAINING_PROJECT_ID,
    PERSONA_TRACK_DESIGN,
  ]);
});

test('a speakly-collection learner registered for design is NOT shown as voice', () => {
  const subs = buildSkillSubscriptions({
    personaProfile: null,
    speaklyProfile: {
      name: 'Femi',
      role: SPEAKLY_ROLE_LEARNER,
      track: PERSONA_TRACK_DESIGN,
    },
  });

  expect(subs).toHaveLength(1);
  expect(subs[0].skill.id).toBe(PERSONA_TRACK_DESIGN);
  expect(subs[0].role).toBe(PERSONA_ROLE_LEARNER);
  expect(subs[0].taskPath).toBeNull();
  expect(subs[0].displayName).toBe('Femi');
});

test('a speakly-collection design learner with generated tasks routes into the task page', () => {
  const subs = buildSkillSubscriptions({
    personaProfile: null,
    speaklyProfile: {
      name: 'Femi',
      role: SPEAKLY_ROLE_LEARNER,
      track: PERSONA_TRACK_DESIGN,
    },
    hasGuidedTasks: true,
  });

  expect(subs[0].taskPath).toBe(`/skills/${PERSONA_TRACK_DESIGN}`);
});

test('a speakly-collection design assessor routes into the assessor portal', () => {
  const subs = buildSkillSubscriptions({
    personaProfile: null,
    speaklyProfile: {
      name: 'Grace',
      role: SPEAKLY_ROLE_ASSESSOR,
      track: PERSONA_TRACK_DESIGN,
    },
  });

  expect(subs).toHaveLength(1);
  expect(subs[0].role).toBe(PERSONA_ROLE_ASSESSOR);
  expect(subs[0].taskPath).toBe('/assessor');
});

test('duplicate skill entries across both profiles are deduped', () => {
  const subs = buildSkillSubscriptions({
    personaProfile: {
      name: 'Habib',
      track: PERSONA_TRACK_DESIGN,
      role: PERSONA_ROLE_LEARNER,
    },
    speaklyProfile: {
      name: 'Habib',
      role: SPEAKLY_ROLE_LEARNER,
      track: PERSONA_TRACK_DESIGN,
    },
  });

  expect(subs).toHaveLength(1);
});

test('a persona voice profile counts as a voice subscription even without a speakly doc', () => {
  const subs = buildSkillSubscriptions({
    personaProfile: {
      name: 'Efe',
      track: PERSONA_TRACK_VOICE,
      role: PERSONA_ROLE_LEARNER,
    },
    speaklyProfile: null,
  });

  expect(subs).toHaveLength(1);
  expect(subs[0].skill.id).toBe(SPEECH_TRAINING_PROJECT_ID);
  expect(subs[0].taskPath).toBe(`/skills/${SPEECH_TRAINING_PROJECT_ID}`);
  expect(subs[0].displayName).toBe('Efe');
});

describe('getUserSkillSubscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getPersonaUser.mockResolvedValue(null);
    getSpeaklyUser.mockResolvedValue(null);
    getSkillProgress.mockResolvedValue(null);
    getProvnProgramme.mockResolvedValue(null);
  });

  test('unlocks the task page once a provn_programmes doc exists, even with no persona_skill_progress doc', async () => {
    getSpeaklyUser.mockResolvedValue({
      name: 'Femi',
      role: SPEAKLY_ROLE_LEARNER,
      track: PERSONA_TRACK_DESIGN,
    });
    getProvnProgramme.mockResolvedValue({ id: 'programme-1', track: PERSONA_TRACK_DESIGN });

    const { subscriptions } = await getUserSkillSubscriptions('uid-1');

    expect(getProvnProgramme).toHaveBeenCalledWith('uid-1', PERSONA_TRACK_DESIGN);
    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0].taskPath).toBe(`/skills/${PERSONA_TRACK_DESIGN}`);
  });

  test('stays locked when neither a progress doc nor a programme doc exists', async () => {
    getSpeaklyUser.mockResolvedValue({
      name: 'Femi',
      role: SPEAKLY_ROLE_LEARNER,
      track: PERSONA_TRACK_DESIGN,
    });

    const { subscriptions } = await getUserSkillSubscriptions('uid-1');

    expect(subscriptions[0].taskPath).toBeNull();
  });
});
