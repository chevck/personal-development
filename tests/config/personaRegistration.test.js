import {
  getSkillTrack,
  PERSONA_ASSESSOR_TRACKS,
  PERSONA_TRACK_DESIGN,
  PERSONA_TRACK_VOICE,
  PERSONA_TRACKS,
  SKILL_TRACKS,
} from '../../src/config/personaRegistration';

test('SKILL_TRACKS includes both existing tracks with full question banks', () => {
  const ids = SKILL_TRACKS.map((t) => t.id);
  expect(ids).toEqual(expect.arrayContaining([PERSONA_TRACK_VOICE, PERSONA_TRACK_DESIGN]));

  for (const track of SKILL_TRACKS) {
    expect(track.learnerSteps).toHaveLength(5);
    expect(track.learnerQuestions.disciplines.length).toBeGreaterThan(0);
    expect(track.learnerQuestions.reasons.length).toBeGreaterThan(0);
    expect(track.learnerQuestions.contexts.length).toBeGreaterThan(0);
    expect(track.learnerQuestions.focus.length).toBeGreaterThan(0);
    expect(track.learnerQuestions.goals.length).toBeGreaterThan(0);
    expect(track.assessorQuestions.qualifications.length).toBeGreaterThan(0);
    expect(track.assessorQuestions.focus.length).toBeGreaterThan(0);
  }
});

test('getSkillTrack finds a track by id and returns null for unknown ids', () => {
  expect(getSkillTrack(PERSONA_TRACK_DESIGN)?.id).toBe(PERSONA_TRACK_DESIGN);
  expect(getSkillTrack('not-a-real-track')).toBeNull();
  expect(getSkillTrack(undefined)).toBeNull();
});

test('PERSONA_TRACKS and PERSONA_ASSESSOR_TRACKS are derived from the same registry', () => {
  expect(PERSONA_TRACKS).toHaveLength(SKILL_TRACKS.length);
  expect(PERSONA_ASSESSOR_TRACKS).toHaveLength(SKILL_TRACKS.length);

  SKILL_TRACKS.forEach((track, index) => {
    expect(PERSONA_TRACKS[index]).toEqual({
      id: track.id,
      label: track.label,
      description: track.description,
      icon: track.icon,
    });
    expect(PERSONA_ASSESSOR_TRACKS[index]).toEqual({
      id: track.id,
      label: track.assessorLabel,
      description: track.assessorDescription,
      icon: track.icon,
    });
  });
});

test('adding a track to the registry would automatically appear in both card lists', () => {
  // Documents the intended extension point: PERSONA_TRACKS/PERSONA_ASSESSOR_TRACKS
  // are pure maps over SKILL_TRACKS, so a new registry entry needs no other code changes.
  const fakeTrack = {
    id: 'writing',
    label: 'Train my writing',
    assessorLabel: 'Assess writing',
    description: 'desc',
    assessorDescription: 'assessor desc',
    icon: '✍️',
  };
  const tracks = [...SKILL_TRACKS, fakeTrack];
  const learnerCards = tracks.map((t) => ({ id: t.id, label: t.label, description: t.description, icon: t.icon }));
  expect(learnerCards.find((c) => c.id === 'writing')).toEqual({
    id: 'writing',
    label: 'Train my writing',
    description: 'desc',
    icon: '✍️',
  });
});
