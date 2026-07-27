import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AssessorVerify from '../../../src/pages/assessor/AssessorVerify';

jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../src/lib/personaAssessorMedia', () => ({
  uploadAssessorIdDocument: jest.fn(),
  validateAssessorIdDocument: jest.fn(),
}));

jest.mock('../../../src/lib/personaUsers', () => ({
  getPersonaUser: jest.fn(),
  submitAssessorKyc: jest.fn(),
}));

const { useAuth } = require('../../../src/contexts/AuthContext');
const {
  uploadAssessorIdDocument,
  validateAssessorIdDocument,
} = require('../../../src/lib/personaAssessorMedia');
const { getPersonaUser, submitAssessorKyc } = require('../../../src/lib/personaUsers');

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/assessor/verify']}>
      <Routes>
        <Route path='/assessor/verify' element={<AssessorVerify />} />
        <Route path='/assessor' element={<div>Assessor portal</div>} />
        <Route path='/dashboard' element={<div>Dashboard</div>} />
        <Route path='/login' element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { uid: 'assessor-1' }, loading: false });
});

test('shows the KYC form for an unverified assessor', async () => {
  getPersonaUser.mockResolvedValue({ role: 'assessor', kycStatus: 'unverified' });

  renderPage();

  expect(
    await screen.findByRole('heading', { name: /finish setting up your assessor account/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/upload your id/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
});

test('redirects to the assessor portal once KYC is no longer unverified', async () => {
  getPersonaUser.mockResolvedValue({ role: 'assessor', kycStatus: 'pending' });

  renderPage();

  expect(await screen.findByText('Assessor portal')).toBeInTheDocument();
});

test('redirects learners to the dashboard—this page is assessor-only', async () => {
  getPersonaUser.mockResolvedValue({ role: 'learner', kycStatus: 'unverified' });

  renderPage();

  expect(await screen.findByText('Dashboard')).toBeInTheDocument();
});

test('"Skip for now" leaves the account unverified and goes straight to the portal', async () => {
  getPersonaUser.mockResolvedValue({ role: 'assessor', kycStatus: 'unverified' });

  renderPage();

  fireEvent.click(await screen.findByRole('button', { name: /skip for now/i }));

  expect(await screen.findByText('Assessor portal')).toBeInTheDocument();
  expect(submitAssessorKyc).not.toHaveBeenCalled();
});

test('submitting the form uploads the ID and moves the assessor to pending', async () => {
  getPersonaUser.mockResolvedValue({ role: 'assessor', kycStatus: 'unverified' });
  uploadAssessorIdDocument.mockResolvedValue('https://storage.example.com/id.pdf');
  submitAssessorKyc.mockResolvedValue({ kycStatus: 'pending' });

  renderPage();

  await screen.findByRole('heading', { name: /finish setting up your assessor account/i });

  const idInput = document.querySelector('input[type="file"]');
  fireEvent.change(idInput, {
    target: { files: [new File(['id-bytes'], 'id.pdf', { type: 'application/pdf' })] },
  });
  fireEvent.change(screen.getByPlaceholderText(/e\.g\. 150/i), {
    target: { value: '150' },
  });
  fireEvent.click(screen.getByRole('button', { name: /us dollar/i }));
  fireEvent.click(screen.getByRole('button', { name: /submit for review/i }));

  await waitFor(() => {
    expect(uploadAssessorIdDocument).toHaveBeenCalledWith('assessor-1', expect.any(File));
  });
  await waitFor(() => {
    expect(submitAssessorKyc).toHaveBeenCalledWith('assessor-1', {
      idDocumentUrl: 'https://storage.example.com/id.pdf',
      mentoringCharge: '150',
      mentoringCurrency: 'USD',
    });
  });
  expect(await screen.findByText('Assessor portal')).toBeInTheDocument();
});
