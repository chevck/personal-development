import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AssessorPortalLayout from '../../../src/pages/assessor/AssessorPortalLayout';

jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../src/lib/personaSkillProgress', () => ({
  getAssignedLearners: jest.fn(),
}));

jest.mock('../../../src/lib/personaUsers', () => ({
  getPersonaUser: jest.fn(),
}));

const { useAuth } = require('../../../src/contexts/AuthContext');
const { getAssignedLearners } = require('../../../src/lib/personaSkillProgress');
const { getPersonaUser } = require('../../../src/lib/personaUsers');

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/assessor']}>
      <Routes>
        <Route path='/assessor' element={<AssessorPortalLayout />}>
          <Route index element={<div>Overview page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { uid: 'assessor-1' }, loading: false, signOut: jest.fn() });
  getAssignedLearners.mockResolvedValue([]);
});

test('shows the unverified banner with a link to complete KYC', async () => {
  getPersonaUser.mockResolvedValue({ name: 'Ada', kycStatus: 'unverified' });

  renderLayout();

  expect(await screen.findByText(/your account is unverified/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /complete kyc/i })).toHaveAttribute(
    'href',
    '/assessor/verify',
  );
});

test('shows the pending banner with no action button', async () => {
  getPersonaUser.mockResolvedValue({ name: 'Ada', kycStatus: 'pending' });

  renderLayout();

  expect(await screen.findByText(/pending review/i)).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /complete kyc/i })).not.toBeInTheDocument();
});

test('shows no banner once the account is active', async () => {
  getPersonaUser.mockResolvedValue({ name: 'Ada', kycStatus: 'active' });

  renderLayout();

  // Wait for the profile to actually load before asserting its absence.
  await screen.findByText('Ada');
  expect(screen.queryByText(/unverified|pending review/i)).not.toBeInTheDocument();
});

test('shows no banner while the profile is still loading', () => {
  getPersonaUser.mockImplementation(() => new Promise(() => {}));

  renderLayout();

  expect(screen.queryByText(/unverified|pending review/i)).not.toBeInTheDocument();
});
