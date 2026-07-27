import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import AssessorOverview from '../../src/pages/assessor/AssessorOverview';
import AssessorStudents from '../../src/pages/assessor/AssessorStudents';

jest.mock('../../src/lib/personaSkillProgress', () => {
  const actual = jest.requireActual('../../src/lib/personaSkillProgress');
  return {
    ...actual,
    reviewSkillSubmission: jest.fn(),
  };
});

const { reviewSkillSubmission } = require('../../src/lib/personaSkillProgress');

const learner = {
  uid: 'learner-1',
  skillId: 'design',
  track: 'design',
  answers: { name: 'Ada Lovelace' },
  streak: { current: 2, longest: 4 },
  tasks: [
    { day: 1, title: 'Sketch a login screen', completed: true, submission: { status: 'approved', link: '', imageUrls: [] } },
    {
      day: 2,
      title: 'Design a pricing page',
      completed: true,
      submission: {
        status: 'pending',
        link: 'https://example.com/work',
        imageUrls: [],
        note: 'First pass',
        submittedAt: '2026-07-20T00:00:00Z',
      },
    },
  ],
};

function StubLayout({ learners, reload }) {
  return <Outlet context={{ learners, loading: false, personaProfile: null, reload }} />;
}

function renderRoute(path, element, learners, reload = jest.fn()) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<StubLayout learners={learners} reload={reload} />}>
          <Route path={path} element={element} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('overview shows real student count and hours, and placeholder earnings', async () => {
  renderRoute('/assessor', <AssessorOverview />, [learner]);

  expect(await screen.findByText('Overview')).toBeInTheDocument();
  expect(screen.getByText('Amount earned')).toBeInTheDocument();
  expect(screen.getAllByText('Coming soon')).toHaveLength(2);

  const studentsCard = screen.getByText('Students').closest('div');
  expect(within(studentsCard).getByText('1')).toBeInTheDocument();
});

test('overview lists a pending submission and lets the assessor approve it', async () => {
  const reload = jest.fn();
  renderRoute('/assessor', <AssessorOverview />, [learner], reload);

  expect(await screen.findByText(/awaiting your review/i)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/design a pricing page/i));

  const drawer = await screen.findByRole('dialog', { name: /design a pricing page/i });
  expect(within(drawer).getByText('https://example.com/work')).toBeInTheDocument();

  reviewSkillSubmission.mockResolvedValue({ tasks: [], streak: {} });
  fireEvent.click(within(drawer).getByRole('button', { name: /^approve$/i }));

  await waitFor(() => {
    expect(reviewSkillSubmission).toHaveBeenCalledWith(
      'learner-1',
      'design',
      2,
      expect.objectContaining({ outcome: 'approved' }),
    );
  });
  await waitFor(() => expect(reload).toHaveBeenCalled());
});

test('students tab lists assigned learners with a pending badge', async () => {
  renderRoute('/assessor/students', <AssessorStudents />, [learner]);

  expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
  expect(screen.getByText('1 awaiting')).toBeInTheDocument();
});

test('clicking a student opens their task list, then a submitted task opens the review panel', async () => {
  renderRoute('/assessor/students', <AssessorStudents />, [learner]);

  fireEvent.click(await screen.findByText('Ada Lovelace'));
  const listDrawer = await screen.findByRole('dialog', { name: /ada lovelace details/i });
  expect(within(listDrawer).getByText(/design a pricing page/i)).toBeInTheDocument();

  fireEvent.click(within(listDrawer).getByText(/design a pricing page/i));

  const taskDrawer = await screen.findByRole('dialog', { name: /design a pricing page/i });
  expect(within(taskDrawer).getByText('First pass')).toBeInTheDocument();
});
