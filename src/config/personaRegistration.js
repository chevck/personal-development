import {
  SPEAKLY_ASSESSOR_FOCUS,
  SPEAKLY_ASSESSOR_QUALIFICATIONS,
  SPEAKLY_END_GOALS,
  SPEAKLY_FOCUS_AREAS,
  SPEAKLY_REASONS,
  SPEAKLY_SPEAKING_CONTEXTS,
} from './speaklyRegistration';

export const PERSONA_TRACK_VOICE = 'voice';
export const PERSONA_TRACK_DESIGN = 'design';

export const PERSONA_ROLE_LEARNER = 'learner';
export const PERSONA_ROLE_ASSESSOR = 'assessor';

/**
 * How experienced a learner already is—the same options regardless of
 * which skill track they picked, so it's a single shared bank rather than
 * something duplicated inside every track's question set.
 */
export const PERSONA_EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: "I'm just starting out.",
    icon: '🌱',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'I know the basics and want to get better.',
    icon: '🌿',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: "I'm skilled and want to refine further.",
    icon: '🌳',
  },
  {
    id: 'expert',
    label: 'Expert',
    description: 'I have deep experience and want to push my limits.',
    icon: '🏆',
  },
];

/** Currencies an assessor can request their mentoring charge in. */
export const PERSONA_CURRENCIES = [
  { id: 'USD', label: 'US Dollar (USD)' },
  { id: 'CAD', label: 'Canadian Dollar (CAD)' },
  { id: 'GBP', label: 'British Pound (GBP)' },
  { id: 'EUR', label: 'Euro (EUR)' },
  { id: 'NGN', label: 'Nigerian Naira (NGN)' },
  { id: 'AUD', label: 'Australian Dollar (AUD)' },
];

/** Highest mentoring charge an assessor can set, in their chosen currency. */
export const MAX_MENTORING_CHARGE = 25000;

/** How people join Persona: to train, or to review learners' work. */
export const PERSONA_ROLES = [
  {
    id: PERSONA_ROLE_LEARNER,
    label: 'Train a skill',
    description:
      'Daily programmes to grow your skills, with feedback from real assessors.',
    icon: '🎯',
  },
  {
    id: PERSONA_ROLE_ASSESSOR,
    label: 'Assess & give feedback',
    description:
      "Review learners' work and help them progress with scores and notes.",
    icon: '✓',
  },
];

/** What people want to train their voice for (single-select pills—one focus at a time). */
export const PERSONA_VOICE_DISCIPLINES = [
  { id: 'speech', label: 'Everyday speech & clarity' },
  { id: 'public-speaking', label: 'Public speaking & presentations' },
  { id: 'musical', label: 'Singing & musical performance' },
  { id: 'voice-over', label: 'Voice overs & narration' },
];

/** Design paths people can train (single-select pills—one focus at a time). */
export const PERSONA_DESIGN_DISCIPLINES = [
  { id: 'ui-ux', label: 'UI/UX design' },
  { id: 'graphics', label: 'Graphics design' },
  { id: 'illustration', label: 'Illustration design' },
];

/** Reasons people join design training (multi-select pills). */
export const PERSONA_DESIGN_REASONS = [
  { id: 'career-switch', label: 'I want to move into a design career' },
  { id: 'level-up', label: 'I want to sharpen skills I already have' },
  { id: 'portfolio', label: 'I need a stronger portfolio' },
  { id: 'freelance', label: 'I want to take on freelance work' },
  { id: 'side-projects', label: 'I design for my own projects' },
  { id: 'second-guess', label: 'I second-guess my design decisions' },
  { id: 'no-feedback', label: 'I rarely get useful feedback on my work' },
  { id: 'creative-habit', label: 'I want a daily creative habit' },
  { id: 'other', label: 'Other' },
];

/** Settings where learners want their design skills to shine (multi-select pills). */
export const PERSONA_DESIGN_CONTEXTS = [
  { id: 'product-teams', label: 'Product teams & startups' },
  { id: 'freelance-clients', label: 'Freelance & client work' },
  { id: 'agency', label: 'Agency & studio work' },
  { id: 'marketing', label: 'Marketing & campaigns' },
  { id: 'personal-brand', label: 'Personal brand & social media' },
  { id: 'print', label: 'Print & packaging' },
  { id: 'games-media', label: 'Games, comics & media' },
  { id: 'other', label: 'Other' },
];

/** Areas design learners can focus on (multi-select pills). */
export const PERSONA_DESIGN_FOCUS_AREAS = [
  { id: 'layout', label: 'Layout & composition' },
  { id: 'typography', label: 'Typography' },
  { id: 'color', label: 'Colour & contrast' },
  { id: 'wireframing', label: 'User flows & wireframing' },
  { id: 'prototyping', label: 'Prototyping & interactions' },
  { id: 'design-systems', label: 'Design systems & components' },
  { id: 'brand-identity', label: 'Logos & brand identity' },
  { id: 'drawing', label: 'Drawing & sketching fundamentals' },
  { id: 'style', label: 'Finding my own style' },
  { id: 'tools', label: 'Tool fluency (Figma, Illustrator, Procreate…)' },
  { id: 'critique', label: 'Giving & receiving critique' },
  { id: 'other', label: 'Other' },
];

/** Design assessor qualifications (multi-select pills). */
export const PERSONA_DESIGN_ASSESSOR_QUALIFICATIONS = [
  { id: 'product-designer', label: 'Product / UX designer' },
  { id: 'graphic-designer', label: 'Graphic designer' },
  { id: 'illustrator', label: 'Professional illustrator' },
  { id: 'art-director', label: 'Art director / creative lead' },
  { id: 'design-educator', label: 'Design teacher or educator' },
  { id: 'design-manager', label: 'Design manager' },
  { id: 'freelancer', label: 'Freelance designer' },
  { id: 'other', label: 'Other' },
];

/** What design assessors are comfortable reviewing (multi-select pills). */
export const PERSONA_DESIGN_ASSESSOR_FOCUS = [
  { id: 'ui-ux', label: 'UI/UX & product design' },
  { id: 'graphics', label: 'Graphics & brand design' },
  { id: 'illustration', label: 'Illustration' },
  { id: 'typography', label: 'Typography & layout' },
  { id: 'portfolios', label: 'Portfolio reviews' },
  { id: 'critique', label: 'Structured critique & feedback' },
  { id: 'other', label: 'Other' },
];

/** End goals for design learners (multi-select pills). */
export const PERSONA_DESIGN_END_GOALS = [
  { id: 'land-job', label: 'Land a design job or internship' },
  { id: 'ship-portfolio', label: "Ship a portfolio I'm proud of" },
  { id: 'client-ready', label: 'Take on paid client work' },
  { id: 'design-products', label: 'Design polished apps & websites' },
  { id: 'brand-identities', label: 'Create full brand identities' },
  { id: 'illustrate-confidently', label: 'Illustrate confidently in my own style' },
  { id: 'daily-habit', label: 'Make design a daily habit' },
  { id: 'other', label: 'Other' },
];

/**
 * Single source of truth for every skill track Provn offers. Registration
 * (step copy, question banks), the track-selection cards, and the
 * completion screen are all driven from this list—adding a new track
 * (a third, a fourth, a hundredth) means adding one entry here, not a new
 * branch anywhere in the registration wizard.
 */
export const SKILL_TRACKS = [
  {
    id: PERSONA_TRACK_VOICE,
    label: 'Train my voice',
    assessorLabel: 'Assess voice training',
    description:
      'Everyday speech, public speaking, singing, or voice overs—daily exercises with recordings and assessor feedback.',
    assessorDescription:
      "Review learners' speech, public speaking, singing, and voice over practice with scores and notes.",
    icon: '🎙️',
    learnerSteps: [
      {
        id: 'disciplines',
        title: 'What do you want to train your voice for?',
        subtitle:
          'Speech, stage, or studio—pick the one you want to focus on first.',
      },
      {
        id: 'reasons',
        title: "What's bringing you to voice training?",
        subtitle:
          'Pick anything that resonates—no need to overthink it. Choose as many as you like.',
      },
      {
        id: 'contexts',
        title: 'Where do you want your voice to shine?',
        subtitle:
          'Choose the settings that matter most—work, stage, studio, social, and more.',
      },
      {
        id: 'focus',
        title: 'What would you like to work on?',
        subtitle: 'These shape the exercises we focus on. Select all that apply.',
      },
      {
        id: 'goals',
        title: 'Where do you want to end up?',
        subtitle: 'Tell us your goals and how long you want to train.',
      },
    ],
    learnerQuestions: {
      disciplines: PERSONA_VOICE_DISCIPLINES,
      reasons: SPEAKLY_REASONS,
      contexts: SPEAKLY_SPEAKING_CONTEXTS,
      focus: SPEAKLY_FOCUS_AREAS,
      goals: SPEAKLY_END_GOALS,
    },
    assessorQuestions: {
      qualifications: SPEAKLY_ASSESSOR_QUALIFICATIONS,
      focus: SPEAKLY_ASSESSOR_FOCUS,
    },
    successCopy: {
      learner: {
        body: "Your voice profile is saved. We're crafting your daily programme—speech, stage, and studio exercises built around what you told us.",
      },
      assessor: {
        body: "Your assessor profile is saved. We'll email you as soon as learners are ready for your reviews.",
      },
    },
  },
  {
    id: PERSONA_TRACK_DESIGN,
    label: 'Train my design skills',
    assessorLabel: 'Assess design work',
    description:
      'UI/UX, graphics design, or illustration—daily briefs that sharpen your eye and build your portfolio.',
    assessorDescription:
      'Critique UI/UX, graphics, and illustration briefs and help designers sharpen their craft.',
    icon: '🎨',
    learnerSteps: [
      {
        id: 'disciplines',
        title: 'Which design skill do you want to train?',
        subtitle:
          'UI/UX, graphics, illustration—pick the one path you want to focus on first.',
      },
      {
        id: 'reasons',
        title: "What's bringing you to design training?",
        subtitle:
          'Pick anything that resonates—no need to overthink it. Choose as many as you like.',
      },
      {
        id: 'contexts',
        title: 'Where will you use your design skills?',
        subtitle:
          'Choose the settings that matter most—product work, clients, print, and more.',
      },
      {
        id: 'focus',
        title: 'What would you like to work on?',
        subtitle: 'These shape the daily briefs we focus on. Select all that apply.',
      },
      {
        id: 'goals',
        title: 'Where do you want to end up?',
        subtitle: 'Tell us your goals and how long you want to train.',
      },
    ],
    learnerQuestions: {
      disciplines: PERSONA_DESIGN_DISCIPLINES,
      reasons: PERSONA_DESIGN_REASONS,
      contexts: PERSONA_DESIGN_CONTEXTS,
      focus: PERSONA_DESIGN_FOCUS_AREAS,
      goals: PERSONA_DESIGN_END_GOALS,
    },
    assessorQuestions: {
      qualifications: PERSONA_DESIGN_ASSESSOR_QUALIFICATIONS,
      focus: PERSONA_DESIGN_ASSESSOR_FOCUS,
    },
    successCopy: {
      learner: {
        body: "Your design profile is saved. We're crafting your daily programme—UI/UX, graphics, and illustration briefs built around what you told us.",
      },
      assessor: {
        body: "Your assessor profile is saved. We'll email you as soon as learners are ready for your reviews.",
      },
    },
  },
];

export function getSkillTrack(trackId) {
  return SKILL_TRACKS.find((track) => track.id === trackId) ?? null;
}

/** Skill tracks people can register for on Persona. */
export const PERSONA_TRACKS = SKILL_TRACKS.map((track) => ({
  id: track.id,
  label: track.label,
  description: track.description,
  icon: track.icon,
}));

/** The same tracks, described for assessors. */
export const PERSONA_ASSESSOR_TRACKS = SKILL_TRACKS.map((track) => ({
  id: track.id,
  label: track.assessorLabel,
  description: track.assessorDescription,
  icon: track.icon,
}));
