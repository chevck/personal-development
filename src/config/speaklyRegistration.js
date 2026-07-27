export const SPEAKLY_ROLE_LEARNER = 'learner';
export const SPEAKLY_ROLE_ASSESSOR = 'assessor';

export const SPEAKLY_ROLES = [
  {
    id: SPEAKLY_ROLE_LEARNER,
    label: 'Learner',
    description: 'Train your voice with a daily programme, recordings, and assessor feedback.',
    icon: '🎙️',
  },
  {
    id: SPEAKLY_ROLE_ASSESSOR,
    label: 'Assessor',
    description: 'Review learners’ practice recordings and help them progress with scores and notes.',
    icon: '✓',
  },
];

/** Reasons people join (multi-select pills). */
export const SPEAKLY_REASONS = [
  { id: 'rush-nervous', label: 'I rush or muddle words when nervous' },
  { id: 'freeze-meetings', label: 'I freeze up in meetings' },
  { id: 'presentation-anxiety', label: 'Presentations make me anxious' },
  { id: 'repeat-myself', label: 'People often ask me to repeat myself' },
  { id: 'interview-prep', label: 'Preparing for interviews' },
  { id: 'more-confident', label: 'I want to feel more confident' },
  { id: 'career-visibility', label: 'Career growth and visibility' },
  { id: 'too-many-fillers', label: 'Too many filler words (um, uh, like)' },
  { id: 'improve-singing', label: 'I want to improve my singing' },
  { id: 'voice-over-work', label: "I'm pursuing voice over work" },
  { id: 'other', label: 'Other' },
];

/** Settings where learners want to speak better (multi-select pills). */
export const SPEAKLY_SPEAKING_CONTEXTS = [
  { id: 'professional', label: 'Professional / work settings' },
  { id: 'meetings', label: 'Meetings & team discussions' },
  { id: 'presentations', label: 'Presentations & public speaking' },
  { id: 'interviews', label: 'Interviews & introductions' },
  { id: 'social', label: 'Social & casual conversation' },
  { id: 'online', label: 'Video calls & online meetings' },
  { id: 'education', label: 'Classroom & teaching' },
  { id: 'content', label: 'Podcasts, videos & recorded content' },
  { id: 'stage', label: 'Stage & live performance' },
  { id: 'studio', label: 'Studio recording & voice overs' },
  { id: 'other', label: 'Other' },
];

/** End goals (multi-select pills). */
export const SPEAKLY_END_GOALS = [
  { id: 'present-confidently', label: 'Present confidently to any audience' },
  { id: 'speak-clearly', label: 'Speak clearly and articulately' },
  { id: 'calm-under-pressure', label: 'Stay calm under pressure' },
  { id: 'lead-meetings', label: 'Lead meetings and discussions' },
  { id: 'ace-interviews', label: 'Ace interviews' },
  { id: 'create-content', label: 'Create podcasts or videos with ease' },
  { id: 'everyday-conversation', label: 'Better everyday conversations' },
  { id: 'perform-music', label: 'Sing or perform music confidently' },
  { id: 'voice-over-career', label: 'Land voice over & narration work' },
  { id: 'other', label: 'Other' },
];

/** Areas learners can select (multi-select pills). */
export const SPEAKLY_FOCUS_AREAS = [
  { id: 'clarity', label: 'Clarity & articulation' },
  { id: 'pacing', label: 'Slowing down my pace' },
  { id: 'confidence', label: 'Confidence in groups' },
  { id: 'presentations', label: 'Presentations & public speaking' },
  { id: 'interviews', label: 'Interviews & introductions' },
  { id: 'conversation', label: 'Everyday conversation' },
  { id: 'fillers', label: 'Reducing filler words' },
  { id: 'structure', label: 'Structuring my thoughts' },
  { id: 'nerves', label: 'Nervousness & anxiety' },
  { id: 'voice', label: 'Voice, tone & presence' },
  { id: 'content', label: 'Recorded content' },
  { id: 'breath', label: 'Breath control & projection' },
  { id: 'pitch', label: 'Pitch, range & vocal control' },
  { id: 'other', label: 'Other' },
];

/** Assessor qualifications (multi-select pills). */
export const SPEAKLY_ASSESSOR_QUALIFICATIONS = [
  { id: 'speech-coach', label: 'Speech / voice coach' },
  { id: 'teacher', label: 'Teacher or educator' },
  { id: 'corporate-trainer', label: 'Corporate trainer' },
  { id: 'therapist', label: 'Therapist or counsellor' },
  { id: 'communications', label: 'Communications professional' },
  { id: 'theatre-media', label: 'Theatre, media, or broadcasting' },
  { id: 'peer-mentor', label: 'Experienced peer mentor' },
  { id: 'other', label: 'Other' },
];

/** What assessors are comfortable reviewing (multi-select pills). */
export const SPEAKLY_ASSESSOR_FOCUS = [
  { id: 'pace-clarity', label: 'Pace & clarity' },
  { id: 'presentations', label: 'Presentations' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'confidence', label: 'Confidence & delivery' },
  { id: 'fillers', label: 'Filler words' },
  { id: 'structure', label: 'Structure & storytelling' },
  { id: 'nerves', label: 'Nervousness under pressure' },
  { id: 'other', label: 'Other' },
];

/** Casual background pills for assessors. */
export const SPEAKLY_ASSESSOR_BACKGROUND = [
  { id: 'years-2', label: 'Under 2 years experience' },
  { id: 'years-2-5', label: '2–5 years' },
  { id: 'years-5-10', label: '5–10 years' },
  { id: 'years-10-plus', label: '10+ years' },
  { id: 'volunteer', label: 'Happy to volunteer reviews' },
  { id: 'paid', label: 'Open to paid review work' },
];
