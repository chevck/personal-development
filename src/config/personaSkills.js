import { SPEECH_TRAINING_PROJECT_ID } from './projects';

/** Skills on the Persona platform. Extend as new programmes launch. */
export const PERSONA_SKILLS = [
  {
    id: SPEECH_TRAINING_PROJECT_ID,
    name: 'Speakly',
    title: 'Speak With Intention',
    description:
      'Train pace, clarity, and confident delivery with daily exercises, recordings, and assessor feedback.',
    tag: 'Available now',
    durationLabel: '7–60 days',
    status: 'available',
    marketingPath: '/speakly/welcome',
    registerPath: '/speakly/register',
    icon: '🎙️',
    highlights: ['Daily exercises', 'Voice recordings', 'Assessor feedback'],
  },
  {
    id: 'content-creation',
    name: 'Content creation',
    title: 'Content creation',
    description:
      'Build a daily rhythm for ideas, drafts, and publishing—structured practice for writing, video, and social.',
    tag: 'Coming soon',
    durationLabel: '7–60 days',
    status: 'coming-soon',
    icon: '✍️',
  },
];

export const availableSkills = PERSONA_SKILLS.filter((s) => s.status === 'available');
