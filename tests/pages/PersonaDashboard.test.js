import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PersonaDashboard from '../../src/pages/PersonaDashboard';

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/lib/personaDashboard', () => ({
  getUserSkillSubscriptions: jest.fn(),
}));

const { useAuth } = require('../../src/contexts/AuthContext');
const { getUserSkillSubscriptions } = require('../../src/lib/personaDashboard');
const { PERSONA_SKILLS } = require('../../src/config/personaSkills');

const voiceSkill = PERSONA_SKILLS.find((s) => s.name === 'Speakly');
const designSkill = PERSONA_SKILLS.find((s) => s.id === 'design');

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <PersonaDashboard />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useAuth.mockReturnValue({
    user: { uid: 'user-1' },
    signOut: jest.fn(),
  });
});

test('lists subscribed skills and links into their tasks', async () => {
  getUserSkillSubscriptions.mockResolvedValue({
    subscriptions: [
      {
        skill: voiceSkill,
        role: 'learner',
        taskPath: `/skills/${voiceSkill.id}`,
        displayName: 'Ada Lovelace',
      },
    ],
    displayName: 'Ada Lovelace',
  });

  renderDashboard();

  expect(
    await screen.findByRole('heading', { name: /welcome back, ada/i }),
  ).toBeInTheDocument();

  const skillLink = screen.getByRole('link', { name: /open your speakly tasks/i });
  expect(skillLink).toHaveAttribute('href', `/skills/${voiceSkill.id}`);
  expect(screen.getByText(/view your tasks/i)).toBeInTheDocument();
});

test('design subscription shows a coming-soon card instead of a link', async () => {
  getUserSkillSubscriptions.mockResolvedValue({
    subscriptions: [
      {
        skill: designSkill,
        role: 'learner',
        taskPath: null,
        displayName: 'Chidi',
      },
    ],
    displayName: 'Chidi',
  });

  renderDashboard();

  expect(await screen.findByText(/daily tasks coming soon/i)).toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: /open your design tasks/i }),
  ).not.toBeInTheDocument();
});

test('unsubscribed available skills appear under explore with a guided setup link', async () => {
  getUserSkillSubscriptions.mockResolvedValue({
    subscriptions: [
      {
        skill: voiceSkill,
        role: 'learner',
        taskPath: `/skills/${voiceSkill.id}`,
        displayName: 'Ada',
      },
    ],
    displayName: 'Ada',
  });

  renderDashboard();

  expect(
    await screen.findByRole('heading', { name: /explore more skills/i }),
  ).toBeInTheDocument();

  const addLinks = screen.getAllByRole('link', { name: /add this skill/i });
  expect(addLinks).toHaveLength(1);
  expect(addLinks[0]).toHaveAttribute('href', `/skills/${designSkill.id}/setup`);
});

test('points users with no subscriptions to registration', async () => {
  getUserSkillSubscriptions.mockResolvedValue({
    subscriptions: [],
    displayName: null,
  });

  renderDashboard();

  expect(
    await screen.findByText(/not subscribed to any skills yet/i),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /choose your first skill/i }),
  ).toHaveAttribute('href', '/register');
});
