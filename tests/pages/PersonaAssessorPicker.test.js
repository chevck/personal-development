import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PersonaAssessorPicker from '../../src/pages/PersonaAssessorPicker';

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/lib/personaSkillProgress', () => ({
  getSkillProgress: jest.fn(),
  assignSkillAssessor: jest.fn(),
}));

jest.mock('../../src/lib/provnProgrammes', () => ({
  getProvnProgramme: jest.fn(),
  assignProgrammeAssessor: jest.fn(),
}));

jest.mock('../../src/lib/personaAssessorDirectory', () => ({
  listAssessorsForTrack: jest.fn(),
}));

const { useAuth } = require('../../src/contexts/AuthContext');
const {
  getSkillProgress,
  assignSkillAssessor,
} = require('../../src/lib/personaSkillProgress');
const {
  getProvnProgramme,
  assignProgrammeAssessor,
} = require('../../src/lib/provnProgrammes');
const { listAssessorsForTrack } = require('../../src/lib/personaAssessorDirectory');

const assessorAda = {
  uid: 'assessor-ada',
  name: 'Ada Lovelace',
  focusLabels: ['UI/UX & product design'],
  qualificationLabels: ['Product / UX designer'],
  backgroundLabels: ['5-10 years'],
  bio: 'I love reviewing onboarding flows.',
  ratingSum: 20,
  ratingCount: 5,
  studentsCount: 12,
};

const assessorBola = {
  uid: 'assessor-bola',
  name: 'Bola Adeyemi',
  focusLabels: ['Illustration'],
  qualificationLabels: ['Professional illustrator'],
  backgroundLabels: ['10+ years'],
  bio: 'Illustration and brand identity specialist.',
  ratingSum: 0,
  ratingCount: 0,
  studentsCount: 0,
};

function renderPicker() {
  return render(
    <MemoryRouter initialEntries={['/skills/design/assessors']}>
      <Routes>
        <Route path='/skills/:skillId/assessors' element={<PersonaAssessorPicker />} />
        <Route path='/skills/:skillId' element={<div>Tasks page</div>} />
        <Route path='/skills/:skillId/setup' element={<div>Setup page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { uid: 'learner-1' }, loading: false });
  getSkillProgress.mockResolvedValue({
    track: 'design',
    assignedAssessorId: null,
  });
  getProvnProgramme.mockResolvedValue(null);
  listAssessorsForTrack.mockResolvedValue([assessorAda, assessorBola]);
});

test('lists assessors as cards, showing rating and mentee count', async () => {
  renderPicker();

  expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
  expect(screen.getByText('Bola Adeyemi')).toBeInTheDocument();
  expect(screen.getByText('4.0')).toBeInTheDocument();
  expect(screen.getByText('12 mentored')).toBeInTheDocument();
  // Bola has no ratings/students yet.
  expect(screen.getByText('New assessor')).toBeInTheDocument();
});

test('clicking a card opens a drawer with their details', async () => {
  renderPicker();

  fireEvent.click(await screen.findByText('Ada Lovelace'));

  const drawer = await screen.findByRole('dialog', { name: /ada lovelace details/i });
  expect(within(drawer).getByText('I love reviewing onboarding flows.')).toBeInTheDocument();
  expect(within(drawer).getByText('Product / UX designer')).toBeInTheDocument();
  // Shown twice by design: once in the quick-glance stat tile, once in the
  // detailed "Experience level" section below.
  expect(within(drawer).getAllByText('5-10 years').length).toBeGreaterThan(0);
  expect(within(drawer).getByText('12')).toBeInTheDocument();
});

test('clicking the same card again closes the drawer', async () => {
  renderPicker();

  const card = await screen.findByText('Ada Lovelace');
  fireEvent.click(card);
  expect(await screen.findByRole('dialog')).toBeInTheDocument();

  fireEvent.click(card);
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

test('selecting an assessor requires confirmation, then assigns and navigates to tasks', async () => {
  assignSkillAssessor.mockResolvedValue();
  renderPicker();

  fireEvent.click(await screen.findByText('Ada Lovelace'));
  fireEvent.click(screen.getByRole('button', { name: /select this assessor/i }));

  expect(screen.getByText(/can't be changed later/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /^confirm$/i }));

  await waitFor(() => {
    expect(assignSkillAssessor).toHaveBeenCalledWith('learner-1', 'design', {
      assessorId: 'assessor-ada',
      assessorName: 'Ada Lovelace',
    });
  });
  expect(await screen.findByText('Tasks page')).toBeInTheDocument();
});

test('redirects to tasks page if an assessor is already assigned', async () => {
  getSkillProgress.mockResolvedValue({
    track: 'design',
    assignedAssessorId: 'assessor-ada',
    assignedAssessorName: 'Ada Lovelace',
  });

  renderPicker();

  expect(await screen.findByText('Tasks page')).toBeInTheDocument();
});

test('redirects to setup when neither progress nor a programme exists yet', async () => {
  getSkillProgress.mockResolvedValue(null);
  getProvnProgramme.mockResolvedValue(null);

  renderPicker();

  expect(await screen.findByText('Setup page')).toBeInTheDocument();
});

describe('falling back to a provn_programmes doc', () => {
  beforeEach(() => {
    getSkillProgress.mockResolvedValue(null);
    getProvnProgramme.mockResolvedValue({
      id: 'programme-1',
      track: 'design',
      assignedAssessorId: null,
    });
  });

  test('lists assessors for the programme track', async () => {
    renderPicker();

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(listAssessorsForTrack).toHaveBeenCalledWith('design');
  });

  test('confirming assigns the assessor to the programme doc and navigates to tasks', async () => {
    assignProgrammeAssessor.mockResolvedValue();
    renderPicker();

    fireEvent.click(await screen.findByText('Ada Lovelace'));
    fireEvent.click(screen.getByRole('button', { name: /select this assessor/i }));
    fireEvent.click(screen.getByRole('button', { name: /^confirm$/i }));

    await waitFor(() => {
      expect(assignProgrammeAssessor).toHaveBeenCalledWith('programme-1', {
        assessorId: 'assessor-ada',
        assessorName: 'Ada Lovelace',
      });
    });
    expect(assignSkillAssessor).not.toHaveBeenCalled();
    expect(await screen.findByText('Tasks page')).toBeInTheDocument();
  });

  test('redirects to tasks page if the programme already has an assessor assigned', async () => {
    getProvnProgramme.mockResolvedValue({
      id: 'programme-1',
      track: 'design',
      assignedAssessorId: 'assessor-ada',
      assignedAssessorName: 'Ada Lovelace',
    });

    renderPicker();

    expect(await screen.findByText('Tasks page')).toBeInTheDocument();
  });
});
