import { SPEECH_TRAINING_PROJECT_ID } from './projects';

/** Skills on the Persona platform. Extend as new programmes launch. */
export const PERSONA_SKILLS = [
  {
    id: SPEECH_TRAINING_PROJECT_ID,
    name: 'Speakly',
    title: 'Train Your Voice',
    description:
      'Everyday speech, public speaking, singing, or voice overs—daily exercises, recordings, and assessor feedback.',
    tag: 'Available now',
    durationLabel: '7–60 days',
    status: 'available',
    registerPath: '/register?track=voice',
    icon: '🎙️',
    ctaLabel: 'Start training',
    highlights: ['Speech & public speaking', 'Singing & musical', 'Voice overs'],
  },
  {
    id: 'design',
    name: 'Design',
    title: 'Train Your Design Skills',
    description:
      'UI/UX, graphics design, or illustration—daily briefs that sharpen your eye and build your portfolio.',
    tag: 'Enrolling now',
    durationLabel: '7–60 days',
    status: 'available',
    registerPath: '/register?track=design',
    icon: '🎨',
    ctaLabel: 'Start designing',
    highlights: ['UI/UX design', 'Graphics design', 'Illustration'],
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
