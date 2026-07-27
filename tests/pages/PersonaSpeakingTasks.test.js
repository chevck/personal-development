import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PersonaSpeakingTasks from '../../src/pages/PersonaSpeakingTasks';
import { setProgrammePhases } from '../../src/lib/speechTrainingProgram';

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/hooks/useSpeaklyProgramme', () => ({
  useSpeaklyProgramme: jest.fn(),
}));

jest.mock('../../src/hooks/useSpeechTrainingProgress', () => ({
  useSpeechTrainingProgress: jest.fn(),
}));

const { useAuth } = require('../../src/contexts/AuthContext');
const { useSpeaklyProgramme } = require('../../src/hooks/useSpeaklyProgramme');
const { useSpeechTrainingProgress } = require('../../src/hooks/useSpeechTrainingProgress');

// getProgramWeeks reads day content from the module-level `activePhases`
// singleton in speechTrainingProgram.js (normally set as a side effect of
// the real useSpeaklyProgramme hook), so it must be primed explicitly here.
const phases = [
  {
    id: 1,
    title: 'Phase 1',
    days: [
      { day: 1, title: 'The Pause Breath', type: 'Awareness', description: 'Breathe first.', exercise: 'Say your name.' },
      { day: 2, title: 'Syllable Stamping', type: 'Articulation', description: 'Stamp syllables.', exercise: 'Read a paragraph.' },
      { day: 3, title: 'The Long Vowel', type: 'Resonance', description: 'Hold vowels.', exercise: 'Hum a tune.' },
      { day: 4, title: 'Steady Pacing', type: 'Rhythm', description: 'Keep pace.', exercise: 'Read slowly.' },
      { day: 5, title: 'The Diaphragm Anchor', type: 'Breath', description: 'Anchor breath.', exercise: 'Breathe deep.' },
      { day: 6, title: 'Consonant Clarity', type: 'Articulation', description: 'Sharpen consonants.', exercise: 'Enunciate.' },
      { day: 7, title: 'The Weekly Reflection', type: 'Reflection', description: 'Reflect on the week.', exercise: 'Journal.' },
    ],
  },
];

function renderSpeakingTasks() {
  return render(
    <MemoryRouter initialEntries={['/skills/speech-training']}>
      <PersonaSpeakingTasks />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  setProgrammePhases(phases);
  useAuth.mockReturnValue({ user: { uid: 'learner-1' }, loading: false });
  useSpeaklyProgramme.mockReturnValue({ loading: false, phases });
  useSpeechTrainingProgress.mockReturnValue({
    completed: { 1: true },
    assessments: {},
    programStartDate: '2026-07-20',
    programDuration: 7,
    now: new Date('2026-07-21T12:00:00'),
    loading: false,
  });
});

test('renders each speaking day as a card', async () => {
  renderSpeakingTasks();

  expect(await screen.findByText('The Pause Breath')).toBeInTheDocument();
  expect(screen.getByText('Syllable Stamping')).toBeInTheDocument();
  expect(screen.getByText('The Long Vowel')).toBeInTheDocument();
});

test('clicking the next allowed day opens details with a record CTA', async () => {
  renderSpeakingTasks();

  fireEvent.click(await screen.findByText('Syllable Stamping'));

  const drawer = await screen.findByRole('dialog', { name: /syllable stamping/i });
  expect(within(drawer).getByText('Read a paragraph.')).toBeInTheDocument();
  expect(
    within(drawer).getByRole('link', { name: /record your response/i }),
  ).toHaveAttribute('href', '/speakly');
});

test('a locked day shows a locked message instead of a record CTA', async () => {
  renderSpeakingTasks();

  fireEvent.click(await screen.findByText('The Long Vowel'));

  const drawer = await screen.findByRole('dialog', { name: /the long vowel/i });
  expect(within(drawer).getByText(/isn't open yet/i)).toBeInTheDocument();
  expect(within(drawer).queryByRole('link', { name: /record/i })).not.toBeInTheDocument();
});

test('a completed day offers to review in Speakly', async () => {
  renderSpeakingTasks();

  fireEvent.click(await screen.findByText('The Pause Breath'));

  const drawer = await screen.findByRole('dialog', { name: /the pause breath/i });
  expect(
    within(drawer).getByRole('link', { name: /review in speakly/i }),
  ).toBeInTheDocument();
});
