import {
  formatLearnerReasonLabels,
  formatSpeakingContextLabels,
  learnerNeedsReasons,
  validateRegistrationProfile,
  buildSpeaklyUserDocument,
} from '../../src/lib/speaklyUsers';
import { SPEAKLY_ROLE_ASSESSOR, SPEAKLY_ROLE_LEARNER } from '../../src/config/speaklyRegistration';

const validLearnerProfile = {
  role: SPEAKLY_ROLE_LEARNER,
  name: 'Alex Morgan',
  email: 'alex@example.com',
  reasonsForJoining: ['freeze-meetings', 'more-confident'],
  reasonsForJoiningOther: '',
  speakingContexts: ['professional', 'meetings'],
  speakingContextsOther: '',
  focusAreas: ['clarity', 'confidence'],
  focusAreasOther: '',
  endGoals: ['present-confidently', 'speak-clearly'],
  endGoalsOther: '',
  programDuration: 21,
};

const validAssessorProfile = {
  role: SPEAKLY_ROLE_ASSESSOR,
  name: 'Jordan Lee',
  email: 'jordan@example.com',
  qualifications: ['speech-coach', 'corporate-trainer'],
  qualificationsOther: '',
  assessorFocus: ['pace-clarity', 'presentations'],
  assessorFocusOther: '',
  assessorBackground: ['years-5-10', 'volunteer'],
  assessorBio: 'I coach executives on presentation skills.',
};

describe('speaklyUsers', () => {
  test('accepts valid learner registration profile', () => {
    expect(() => validateRegistrationProfile(validLearnerProfile)).not.toThrow();
    const doc = buildSpeaklyUserDocument('uid-1', validLearnerProfile);
    expect(doc.role).toBe(SPEAKLY_ROLE_LEARNER);
    expect(doc.reasonsForJoining).toEqual(['freeze-meetings', 'more-confident']);
    expect(doc.speakingContexts).toEqual(['professional', 'meetings']);
    expect(doc.qualifications).toBeUndefined();
  });

  test('accepts valid assessor registration profile', () => {
    expect(() => validateRegistrationProfile(validAssessorProfile)).not.toThrow();
    const doc = buildSpeaklyUserDocument('uid-2', validAssessorProfile);
    expect(doc.role).toBe(SPEAKLY_ROLE_ASSESSOR);
    expect(doc.qualifications).toEqual(['speech-coach', 'corporate-trainer']);
    expect(doc.assessorBio).toBe('I coach executives on presentation skills.');
    expect(doc.programDuration).toBeUndefined();
  });

  test('requires at least one speaking context for learners', () => {
    expect(() =>
      validateRegistrationProfile({ ...validLearnerProfile, speakingContexts: [] }),
    ).toThrow(/at least one option for context/i);
  });

  test('requires at least one reason for learners', () => {
    expect(() =>
      validateRegistrationProfile({ ...validLearnerProfile, reasonsForJoining: [] }),
    ).toThrow(/at least one option for reasons/i);
  });

  test('requires qualifications for assessors', () => {
    expect(() =>
      validateRegistrationProfile({ ...validAssessorProfile, qualifications: [] }),
    ).toThrow(/at least one option for qualifications/i);
  });

  test('requires assessor background', () => {
    expect(() =>
      validateRegistrationProfile({ ...validAssessorProfile, assessorBackground: [] }),
    ).toThrow(/at least one option for background/i);
  });

  test('normalizes programme length for learners', () => {
    const doc = buildSpeaklyUserDocument('uid-1', { ...validLearnerProfile, programDuration: 14 });
    expect(doc.programDuration).toBe(14);
  });

  test('requires other text when other is selected', () => {
    expect(() =>
      validateRegistrationProfile({
        ...validLearnerProfile,
        focusAreas: ['other'],
        focusAreasOther: '',
      }),
    ).toThrow(/other.*focus area/i);
  });

  test('formatSpeakingContextLabels maps ids to labels', () => {
    expect(formatSpeakingContextLabels(['professional', 'social'], '')).toEqual([
      'Professional / work settings',
      'Social & casual conversation',
    ]);
  });

  test('formatLearnerReasonLabels maps ids to labels', () => {
    expect(
      formatLearnerReasonLabels(['freeze-meetings', 'more-confident'], ''),
    ).toEqual(['I freeze up in meetings', 'I want to feel more confident']);
    expect(formatLearnerReasonLabels(['other'], 'Speaking at weddings')).toEqual([
      'Speaking at weddings',
    ]);
    expect(formatLearnerReasonLabels([], '')).toEqual([]);
  });

  test('learnerNeedsReasons when reasons missing', () => {
    expect(learnerNeedsReasons(null)).toBe(true);
    expect(learnerNeedsReasons({ role: SPEAKLY_ROLE_LEARNER })).toBe(true);
    expect(learnerNeedsReasons({ role: SPEAKLY_ROLE_LEARNER, reasonsForJoining: [] })).toBe(true);
    expect(
      learnerNeedsReasons({
        role: SPEAKLY_ROLE_LEARNER,
        reasonsForJoining: ['more-confident'],
      }),
    ).toBe(false);
    expect(learnerNeedsReasons(validAssessorProfile)).toBe(false);
  });

  describe('track-generic learner validation', () => {
    test('a profile with no track defaults to voice question banks', () => {
      expect(() => validateRegistrationProfile(validLearnerProfile)).not.toThrow();
    });

    test('a design-track profile validates against design question banks, not voice', () => {
      const designLearnerProfile = {
        role: SPEAKLY_ROLE_LEARNER,
        name: 'Chidi Okafor',
        email: 'chidi@example.com',
        track: 'design',
        disciplines: ['ui-ux'],
        reasonsForJoining: ['portfolio'],
        reasonsForJoiningOther: '',
        contexts: ['product-teams'],
        contextsOther: '',
        focusAreas: ['layout'],
        focusAreasOther: '',
        endGoals: ['ship-portfolio'],
        endGoalsOther: '',
        programDuration: 21,
      };

      expect(() => validateRegistrationProfile(designLearnerProfile)).not.toThrow();
    });

    test('a voice-track profile still rejects design-only option ids', () => {
      expect(() =>
        validateRegistrationProfile({
          ...validLearnerProfile,
          track: 'voice',
          speakingContexts: ['product-teams'], // a design-only context id
        }),
      ).toThrow(/context/i);
    });

    test('a design-track profile rejects voice-only option ids', () => {
      expect(() =>
        validateRegistrationProfile({
          role: SPEAKLY_ROLE_LEARNER,
          name: 'Chidi Okafor',
          email: 'chidi@example.com',
          track: 'design',
          reasonsForJoining: ['portfolio'],
          contexts: ['professional'], // a voice-only context id
          focusAreas: ['layout'],
          endGoals: ['ship-portfolio'],
          programDuration: 21,
        }),
      ).toThrow(/context/i);
    });
  });

  describe('experience level validation', () => {
    test('accepts a learner profile with a valid level', () => {
      expect(() =>
        validateRegistrationProfile({ ...validLearnerProfile, level: 'beginner' }),
      ).not.toThrow();
    });

    test('rejects an invalid level id', () => {
      expect(() =>
        validateRegistrationProfile({ ...validLearnerProfile, level: 'wizard' }),
      ).toThrow(/valid experience level/i);
    });

    test('does not require a level for callers that predate the level step', () => {
      expect(() => validateRegistrationProfile(validLearnerProfile)).not.toThrow();
    });
  });
});
