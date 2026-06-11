import { addDoc, collection } from 'firebase/firestore';
import {
  PERSONA_ACCOUNTABILITY_OPTIONS,
  PERSONA_LEARNING_TOPICS,
  PERSONA_WAITLIST_HEARD_ABOUT,
  PERSONA_WAITLIST_PRICING_PREFERENCES,
} from '../config/personaWaitlist';
import { db, isFirebaseConfigured } from '../firebase/config';

export const PERSONA_WAITLIST_COLLECTION = 'persona_waitlist';

const VALID_TOPIC_IDS = new Set(PERSONA_LEARNING_TOPICS.map((option) => option.id));
const VALID_ACCOUNTABILITY_IDS = new Set(
  PERSONA_ACCOUNTABILITY_OPTIONS.map((option) => option.id),
);
const VALID_PRICING_PREFERENCE_IDS = new Set(
  PERSONA_WAITLIST_PRICING_PREFERENCES.map((option) => option.id),
);
const VALID_HEARD_ABOUT_IDS = new Set(
  PERSONA_WAITLIST_HEARD_ABOUT.map((option) => option.id),
);

const MAX_WILLING_TO_PAY_USD = 10_000;
const MAX_NOTES_LENGTH = 2_000;
const MAX_CUSTOM_LEARNING_LENGTH = 500;

function validateEmail(email) {
  const normalized = email?.trim() ?? '';
  if (!normalized) {
    throw new Error('Enter your email.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('Enter a valid email address.');
  }
  return normalized.toLowerCase();
}

function validateWillingToPayUsd(value) {
  if (value === '' || value === null || value === undefined) {
    throw new Error('Enter how much you would pay in US dollars.');
  }
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    throw new Error('Enter how much you would pay in US dollars.');
  }
  if (amount < 0) {
    throw new Error('Amount cannot be negative.');
  }
  if (amount > MAX_WILLING_TO_PAY_USD) {
    throw new Error(`Enter an amount up to $${MAX_WILLING_TO_PAY_USD.toLocaleString()}.`);
  }
  return Math.round(amount * 100) / 100;
}

function validateOptionalPillSelection({ values, validIds, label }) {
  if (!Array.isArray(values) || values.length === 0) return;
  const invalid = values.filter((id) => !validIds.has(id));
  if (invalid.length > 0) {
    throw new Error(`One or more ${label} options are invalid.`);
  }
}

export function validateWaitlistEntry(entry) {
  const name = entry.name?.trim() ?? '';
  if (!name) {
    throw new Error('Enter your name.');
  }
  if (name.length < 2) {
    throw new Error('Name must be at least 2 characters.');
  }

  const email = validateEmail(entry.email);

  const learningTopics = Array.isArray(entry.learningTopics) ? [...entry.learningTopics] : [];
  const customLearningInterest = entry.customLearningInterest?.trim() ?? '';

  if (learningTopics.length === 0 && !customLearningInterest) {
    throw new Error('Tell us what you would like to learn — pick a topic or describe your own.');
  }

  if (
    learningTopics.length === 0 &&
    customLearningInterest.length > 0 &&
    customLearningInterest.length < 10
  ) {
    throw new Error('Describe what you want to learn (at least 10 characters).');
  }

  const invalidTopics = learningTopics.filter((id) => !VALID_TOPIC_IDS.has(id));
  if (invalidTopics.length > 0) {
    throw new Error('One or more learning topic options are invalid.');
  }

  if (learningTopics.includes('other') && customLearningInterest.length < 10) {
    throw new Error('Describe what you want to learn (at least 10 characters).');
  }

  if (customLearningInterest.length > MAX_CUSTOM_LEARNING_LENGTH) {
    throw new Error(`Keep your learning description under ${MAX_CUSTOM_LEARNING_LENGTH} characters.`);
  }

  validateOptionalPillSelection({
    values: entry.accountabilityPreferences,
    validIds: VALID_ACCOUNTABILITY_IDS,
    label: 'accountability preference',
  });

  const willingToPayUsd = validateWillingToPayUsd(entry.willingToPayUsd);

  if (
    entry.pricingPreference &&
    !VALID_PRICING_PREFERENCE_IDS.has(entry.pricingPreference)
  ) {
    throw new Error('Choose a valid pricing preference.');
  }

  if (entry.heardAbout && !VALID_HEARD_ABOUT_IDS.has(entry.heardAbout)) {
    throw new Error('Choose a valid option for how you heard about us.');
  }

  if (entry.heardAbout === 'other' && !entry.heardAboutOther?.trim()) {
    throw new Error('Tell us how you heard about Persona.');
  }

  const additionalNotes = entry.additionalNotes?.trim() ?? '';
  if (additionalNotes.length > MAX_NOTES_LENGTH) {
    throw new Error(`Keep additional notes under ${MAX_NOTES_LENGTH} characters.`);
  }

  return {
    name,
    email,
    learningTopics,
    customLearningInterest,
    willingToPayUsd,
    additionalNotes,
  };
}

export function buildWaitlistDocument(entry) {
  const validated = validateWaitlistEntry(entry);
  const now = new Date().toISOString();

  return {
    name: validated.name,
    email: validated.email,
    learningTopics: validated.learningTopics,
    customLearningInterest: validated.customLearningInterest || null,
    accountabilityPreferences: Array.isArray(entry.accountabilityPreferences)
      ? [...entry.accountabilityPreferences]
      : [],
    willingToPayUsd: validated.willingToPayUsd,
    pricingPreference: entry.pricingPreference || null,
    heardAbout: entry.heardAbout || null,
    heardAboutOther:
      entry.heardAbout === 'other' ? entry.heardAboutOther?.trim() || null : null,
    additionalNotes: validated.additionalNotes || null,
    marketingOptIn: Boolean(entry.marketingOptIn),
    source: 'website',
    createdAt: now,
    updatedAt: now,
  };
}

export async function submitPersonaWaitlist(entry) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }

  const data = buildWaitlistDocument(entry);
  const docRef = await addDoc(collection(db, PERSONA_WAITLIST_COLLECTION), data);
  return { id: docRef.id, ...data };
}
