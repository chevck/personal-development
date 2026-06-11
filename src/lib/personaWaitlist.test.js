import {
  buildWaitlistDocument,
  validateWaitlistEntry,
} from './personaWaitlist';

const validWaitlistEntry = {
  name: 'Alex Morgan',
  email: 'alex@example.com',
  learningTopics: ['speech-communication'],
  customLearningInterest: '',
  accountabilityPreferences: ['daily-practice', 'progress-tracking'],
  willingToPayUsd: 49,
  pricingPreference: 'monthly',
  heardAbout: 'persona',
  heardAboutOther: '',
  additionalNotes: 'I want structured daily practice with streaks.',
  marketingOptIn: true,
};

describe('personaWaitlist', () => {
  test('accepts valid waitlist entry', () => {
    expect(() => validateWaitlistEntry(validWaitlistEntry)).not.toThrow();
    const doc = buildWaitlistDocument(validWaitlistEntry);
    expect(doc.email).toBe('alex@example.com');
    expect(doc.learningTopics).toEqual(['speech-communication']);
    expect(doc.willingToPayUsd).toBe(49);
    expect(doc.source).toBe('website');
  });

  test('accepts custom learning interest without listed topics', () => {
    expect(() =>
      validateWaitlistEntry({
        ...validWaitlistEntry,
        learningTopics: [],
        customLearningInterest: 'I want to learn conversational French for travel.',
      }),
    ).not.toThrow();
  });

  test('requires learning topic or custom description', () => {
    expect(() =>
      validateWaitlistEntry({
        ...validWaitlistEntry,
        learningTopics: [],
        customLearningInterest: '',
      }),
    ).toThrow(/what you would like to learn/i);
  });

  test('requires willing to pay amount in USD', () => {
    expect(() =>
      validateWaitlistEntry({ ...validWaitlistEntry, willingToPayUsd: '' }),
    ).toThrow(/pay in us dollars/i);
  });

  test('requires description when other topic is selected', () => {
    expect(() =>
      validateWaitlistEntry({
        ...validWaitlistEntry,
        learningTopics: ['other'],
        customLearningInterest: 'short',
      }),
    ).toThrow(/at least 10 characters/i);
  });
});
