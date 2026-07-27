import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PersonaSkillTasks from '../../src/pages/PersonaSkillTasks';

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/lib/personaSkillProgress', () => ({
  getSkillProgress: jest.fn(),
  submitSkillTask: jest.fn(),
}));

jest.mock('../../src/lib/provnProgrammes', () => ({
  getProvnProgramme: jest.fn(),
  startProgrammeTraining: jest.fn(),
  submitProgrammeTask: jest.fn(),
}));

jest.mock('../../src/lib/personaTaskSubmissions', () => ({
  MAX_SUBMISSION_IMAGES: 4,
  normalizeSubmissionLink: (link) => (link?.trim() ? `https://${link.trim()}` : ''),
  uploadTaskSubmissionImage: jest.fn(),
}));

jest.mock('../../src/pages/PersonaSpeakingTasks', () => () => (
  <div>Speaking tasks page</div>
));

const { useAuth } = require('../../src/contexts/AuthContext');
const { getSkillProgress, submitSkillTask } = require('../../src/lib/personaSkillProgress');
const {
  getProvnProgramme,
  startProgrammeTraining,
  submitProgrammeTask,
} = require('../../src/lib/provnProgrammes');
const { uploadTaskSubmissionImage } = require('../../src/lib/personaTaskSubmissions');

function renderTasksPage(skillId = 'design') {
  return render(
    <MemoryRouter initialEntries={[`/skills/${skillId}`]}>
      <Routes>
        <Route path='/skills/:skillId' element={<PersonaSkillTasks />} />
        <Route path='/skills/:skillId/setup' element={<div>Setup page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

const baseProgress = {
  track: 'design',
  assignedAssessorId: 'assessor-1',
  assignedAssessorName: 'Ada Lovelace',
  streak: { current: 3, longest: 5 },
  tasks: [
    { day: 1, title: 'Sketch a login screen', description: 'Warm up sketch', completed: true, completedAt: '2026-07-19' },
    { day: 2, title: 'Design a pricing page', description: 'Layout practice', completed: false, completedAt: null },
    { day: 3, title: 'Redesign a dashboard widget', description: 'Widget refresh', completed: false, completedAt: null },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { uid: 'learner-1' }, loading: false });
  getSkillProgress.mockResolvedValue(baseProgress);
  getProvnProgramme.mockResolvedValue(null);
});

test('renders each task as a card', async () => {
  renderTasksPage();

  expect(await screen.findByText('Sketch a login screen')).toBeInTheDocument();
  expect(screen.getByText('Design a pricing page')).toBeInTheDocument();
  expect(screen.getByText('Redesign a dashboard widget')).toBeInTheDocument();
});

test('clicking the actionable task opens a submission form', async () => {
  renderTasksPage();

  fireEvent.click(await screen.findByText('Design a pricing page'));

  const drawer = await screen.findByRole('dialog', { name: /design a pricing page/i });
  expect(within(drawer).getByText(/link to your work/i)).toBeInTheDocument();
  expect(within(drawer).getByRole('button', { name: /send to assessor/i })).toBeInTheDocument();
});

test('clicking a locked task shows a locked message instead of the form', async () => {
  renderTasksPage();

  fireEvent.click(await screen.findByText('Redesign a dashboard widget'));

  const drawer = await screen.findByRole('dialog', { name: /redesign a dashboard widget/i });
  expect(within(drawer).getByText(/finish your current task first/i)).toBeInTheDocument();
  expect(within(drawer).queryByRole('button', { name: /send to assessor/i })).not.toBeInTheDocument();
});

test('submitting a link sends it to the assessor and closes the drawer', async () => {
  submitSkillTask.mockResolvedValue({
    tasks: baseProgress.tasks.map((t) =>
      t.day === 2
        ? { ...t, completed: true, submission: { link: 'https://example.com', imageUrls: [], note: '', status: 'pending' } }
        : t,
    ),
    streak: { current: 4, longest: 5 },
  });

  renderTasksPage();

  fireEvent.click(await screen.findByText('Design a pricing page'));
  const drawer = await screen.findByRole('dialog', { name: /design a pricing page/i });

  fireEvent.change(within(drawer).getByPlaceholderText(/figma.com/i), {
    target: { value: 'example.com' },
  });
  fireEvent.click(within(drawer).getByRole('button', { name: /send to assessor/i }));

  await waitFor(() => {
    expect(submitSkillTask).toHaveBeenCalledWith('learner-1', 'design', 2, {
      link: 'https://example.com',
      imageUrls: [],
      note: '',
    });
  });

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

test('shows the "select assessors" prompt when none is assigned', async () => {
  getSkillProgress.mockResolvedValue({ ...baseProgress, assignedAssessorId: null });

  renderTasksPage();

  expect(
    await screen.findByRole('link', { name: /select assessors/i }),
  ).toHaveAttribute('href', '/skills/design/assessors');
});

test('redirects to setup when neither progress nor a programme exists yet', async () => {
  getSkillProgress.mockResolvedValue(null);
  getProvnProgramme.mockResolvedValue(null);

  renderTasksPage();

  expect(await screen.findByText('Setup page')).toBeInTheDocument();
});

test('renders a generated programme from the Provn backend when there is no progress doc', async () => {
  getSkillProgress.mockResolvedValue(null);
  getProvnProgramme.mockResolvedValue({
    track: 'design',
    skill: 'Design',
    userId: 'learner-1',
    programmeDuration: 14,
    role: 'learner',
    createdAt: '2026-07-01T00:00:00.000Z',
    encouragementNote: "You've got this—one brief at a time.",
    tasks: [
      { id: 1, title: 'Audit a login screen', subtitle: 'Spot layout issues', goal: 'Builds a critical eye' },
      { id: 2, title: 'Typography pass', subtitle: 'Pick a type scale', goal: 'Consistency matters' },
    ],
  });

  renderTasksPage();

  expect(await screen.findByText('Audit a login screen')).toBeInTheDocument();
  expect(screen.getByText('Typography pass')).toBeInTheDocument();
  expect(screen.getByText(/spot layout issues/i)).toBeInTheDocument();
  expect(screen.getByText(/14 days/i)).toBeInTheDocument();
  expect(screen.queryByText('Builds a critical eye')).not.toBeInTheDocument();
});

test('clicking a programme task card opens its details, including the goal hidden from the card', async () => {
  getSkillProgress.mockResolvedValue(null);
  getProvnProgramme.mockResolvedValue({
    track: 'design',
    skill: 'Design',
    userId: 'learner-1',
    tasks: [
      { id: 1, title: 'Audit a login screen', subtitle: 'Spot layout issues', goal: 'Builds a critical eye' },
    ],
  });

  renderTasksPage();

  fireEvent.click(await screen.findByText('Audit a login screen'));

  const drawer = await screen.findByRole('dialog', { name: /audit a login screen/i });
  expect(within(drawer).getByText('Day 1')).toBeInTheDocument();
  expect(within(drawer).getByText('Builds a critical eye')).toBeInTheDocument();
});

test('shows the assessor gate when a programme has no assessor assigned yet', async () => {
  getSkillProgress.mockResolvedValue(null);
  getProvnProgramme.mockResolvedValue({
    track: 'design',
    skill: 'Design',
    userId: 'learner-1',
    assignedAssessorId: null,
    trainingStarted: false,
    tasks: [
      { id: 1, title: 'Audit a login screen', subtitle: '', goal: '' },
      { id: 2, title: 'Typography pass', subtitle: '', goal: '' },
    ],
  });

  renderTasksPage();

  expect(
    await screen.findByRole('link', { name: /select assessors/i }),
  ).toHaveAttribute('href', '/skills/design/assessors');
  expect(screen.queryByRole('button', { name: /start training/i })).not.toBeInTheDocument();

  // Everything is locked until training starts, but details still open.
  const firstCard = screen.getByText('Audit a login screen').closest('button');
  expect(firstCard.className).toMatch(/border-dashed/);
});

test('shows a start-training prompt once an assessor is assigned, and starting it unlocks the first task', async () => {
  getSkillProgress.mockResolvedValue(null);
  getProvnProgramme.mockResolvedValue({
    id: 'programme-1',
    track: 'design',
    skill: 'Design',
    userId: 'learner-1',
    assignedAssessorId: 'assessor-1',
    assignedAssessorName: 'Ada Lovelace',
    trainingStarted: false,
    tasks: [
      { id: 1, title: 'Audit a login screen', subtitle: '', goal: '' },
      { id: 2, title: 'Typography pass', subtitle: '', goal: '' },
    ],
  });
  startProgrammeTraining.mockResolvedValue();

  renderTasksPage();

  expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /select assessors/i })).not.toBeInTheDocument();

  const firstCardBefore = screen.getByText('Audit a login screen').closest('button');
  expect(firstCardBefore.className).toMatch(/border-dashed/);

  fireEvent.click(screen.getByRole('button', { name: /start training/i }));

  await waitFor(() => {
    expect(startProgrammeTraining).toHaveBeenCalledWith('programme-1');
  });

  const firstCardAfter = await screen.findByText('Audit a login screen');
  expect(firstCardAfter.closest('button').className).toMatch(/border-persona-purple/);
  expect(screen.getByText('Typography pass').closest('button').className).toMatch(
    /border-dashed/,
  );
  expect(screen.queryByRole('button', { name: /start training/i })).not.toBeInTheDocument();
});

const startedProgramme = {
  id: 'programme-1',
  track: 'design',
  skill: 'Design',
  userId: 'learner-1',
  assignedAssessorId: 'assessor-1',
  assignedAssessorName: 'Ada Lovelace',
  trainingStarted: true,
  tasks: [
    { id: 1, title: 'Audit a login screen', subtitle: 'Spot layout issues', goal: 'Builds a critical eye' },
    { id: 2, title: 'Typography pass', subtitle: 'Pick a type scale', goal: 'Consistency matters' },
  ],
};

test('the unlocked programme task opens a submission form with a link and image upload', async () => {
  getSkillProgress.mockResolvedValue(null);
  getProvnProgramme.mockResolvedValue(startedProgramme);

  renderTasksPage();

  fireEvent.click(await screen.findByText('Audit a login screen'));

  const drawer = await screen.findByRole('dialog', { name: /audit a login screen/i });
  expect(within(drawer).getByText(/link to your work/i)).toBeInTheDocument();
  expect(within(drawer).getByText('Images')).toBeInTheDocument();
  expect(within(drawer).getByRole('button', { name: /send to assessor/i })).toBeInTheDocument();
});

test('the locked programme task shows details but no submission form', async () => {
  getSkillProgress.mockResolvedValue(null);
  getProvnProgramme.mockResolvedValue(startedProgramme);

  renderTasksPage();

  fireEvent.click(await screen.findByText('Typography pass'));

  const drawer = await screen.findByRole('dialog', { name: /typography pass/i });
  expect(within(drawer).getByText(/unlocks once you reach it/i)).toBeInTheDocument();
  expect(within(drawer).queryByText(/link to your work/i)).not.toBeInTheDocument();
});

test('uploaded images preview before sending, and submitting a programme task saves it', async () => {
  getSkillProgress.mockResolvedValue(null);
  getProvnProgramme.mockResolvedValue(startedProgramme);
  uploadTaskSubmissionImage.mockResolvedValue({ downloadUrl: 'https://storage.example.com/img.png' });
  submitProgrammeTask.mockResolvedValue([
    {
      ...startedProgramme.tasks[0],
      submission: {
        link: 'https://example.com',
        imageUrls: ['https://storage.example.com/img.png'],
        note: '',
        status: 'pending',
      },
    },
    startedProgramme.tasks[1],
  ]);

  renderTasksPage();

  fireEvent.click(await screen.findByText('Audit a login screen'));
  const drawer = await screen.findByRole('dialog', { name: /audit a login screen/i });

  const file = new File(['img-bytes'], 'screenshot.png', { type: 'image/png' });
  const fileInput = within(drawer).getByLabelText('+');
  fireEvent.change(fileInput, { target: { files: [file] } });

  // The image preview is visible before sending.
  expect(await within(drawer).findByAltText('')).toHaveAttribute('src', expect.any(String));

  fireEvent.change(within(drawer).getByPlaceholderText(/figma.com/i), {
    target: { value: 'example.com' },
  });
  fireEvent.click(within(drawer).getByRole('button', { name: /send to assessor/i }));

  await waitFor(() => {
    expect(submitProgrammeTask).toHaveBeenCalledWith('programme-1', 1, {
      link: 'https://example.com',
      imageUrls: ['https://storage.example.com/img.png'],
      note: '',
    });
  });

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

test('a submitted programme task shows a read-only summary instead of the form', async () => {
  getSkillProgress.mockResolvedValue(null);
  getProvnProgramme.mockResolvedValue({
    ...startedProgramme,
    tasks: [
      {
        ...startedProgramme.tasks[0],
        submission: {
          link: 'https://example.com/work',
          imageUrls: [],
          note: 'Here is my take',
          status: 'pending',
        },
      },
      startedProgramme.tasks[1],
    ],
  });

  renderTasksPage();

  fireEvent.click(await screen.findByText('Audit a login screen'));
  const drawer = await screen.findByRole('dialog', { name: /audit a login screen/i });

  expect(within(drawer).getByText(/pending review/i)).toBeInTheDocument();
  expect(within(drawer).getByText('https://example.com/work')).toBeInTheDocument();
  expect(within(drawer).getByText('Here is my take')).toBeInTheDocument();
  expect(within(drawer).queryByRole('button', { name: /send to assessor/i })).not.toBeInTheDocument();
});

test('a progress doc takes priority over a programme doc when both exist', async () => {
  getProvnProgramme.mockResolvedValue({
    track: 'design',
    skill: 'Design',
    userId: 'learner-1',
    tasks: [{ id: 1, title: 'Audit a login screen', subtitle: '', goal: '' }],
  });

  renderTasksPage();

  expect(await screen.findByText('Sketch a login screen')).toBeInTheDocument();
  expect(screen.queryByText('Audit a login screen')).not.toBeInTheDocument();
});

test('an already-submitted task shows a read-only summary', async () => {
  getSkillProgress.mockResolvedValue({
    ...baseProgress,
    tasks: [
      {
        ...baseProgress.tasks[0],
        submission: {
          link: 'https://example.com/work',
          imageUrls: [],
          note: 'Here is my take',
          status: 'pending',
        },
      },
      ...baseProgress.tasks.slice(1),
    ],
  });

  renderTasksPage();

  fireEvent.click(await screen.findByText('Sketch a login screen'));
  const drawer = await screen.findByRole('dialog', { name: /sketch a login screen/i });

  expect(within(drawer).getByText(/pending review/i)).toBeInTheDocument();
  expect(within(drawer).getByText('https://example.com/work')).toBeInTheDocument();
  expect(within(drawer).getByText('Here is my take')).toBeInTheDocument();
  expect(within(drawer).queryByRole('button', { name: /send to assessor/i })).not.toBeInTheDocument();
});

test('dispatches to the speaking tasks page for the voice skill', async () => {
  renderTasksPage('speech-training');

  expect(await screen.findByText('Speaking tasks page')).toBeInTheDocument();
});
