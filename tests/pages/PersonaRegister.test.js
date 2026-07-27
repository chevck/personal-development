import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import PersonaRegister from '../../src/pages/PersonaRegister';

function renderRegister(initialEntry = '/register') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <PersonaRegister />
      </MemoryRouter>
    </AuthProvider>,
  );
}

function continueToNextStep() {
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
}

test('asks whether the user is a student or an assessor first', () => {
  renderRegister();
  expect(
    screen.getByRole('heading', { name: /how do you want to use provn/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /train a skill/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /assess & give feedback/i }),
  ).toBeInTheDocument();
});

test('learner flow asks what to train after the role step', () => {
  renderRegister();
  fireEvent.click(screen.getByRole('button', { name: /train a skill/i }));
  continueToNextStep();

  expect(
    screen.getByRole('heading', { name: /what would you like to train/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/train my voice/i)).toBeInTheDocument();
  expect(screen.getByText(/train my design skills/i)).toBeInTheDocument();
});

test('learner flow asks for experience level before the track questions', () => {
  renderRegister('/register?track=voice');

  continueToNextStep();

  expect(
    screen.getByRole('heading', { name: /what's your current level/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /beginner/i })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /intermediate/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /advanced/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /expert/i })).toBeInTheDocument();
});

test('level step requires a selection and only keeps one selected at a time', () => {
  renderRegister('/register?track=voice');

  continueToNextStep();
  continueToNextStep();

  // Blocked without a selection—still on the level step, not advanced.
  expect(
    screen.getByRole('heading', { name: /what's your current level/i }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /beginner/i }));
  fireEvent.click(screen.getByRole('button', { name: /advanced/i }));

  expect(screen.getByRole('button', { name: /beginner/i })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect(screen.getByRole('button', { name: /advanced/i })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('voice track asks what the voice is being trained for', () => {
  renderRegister('/register?track=voice');

  continueToNextStep();
  fireEvent.click(screen.getByRole('button', { name: /beginner/i }));
  continueToNextStep();

  expect(
    screen.getByRole('heading', {
      name: /what do you want to train your voice for/i,
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/singing & musical performance/i)).toBeInTheDocument();
  expect(screen.getByText(/voice overs & narration/i)).toBeInTheDocument();
  expect(
    screen.getByText(/public speaking & presentations/i),
  ).toBeInTheDocument();
});

test('design track offers UI/UX, graphics, and illustration', () => {
  renderRegister('/register?track=design');

  continueToNextStep();
  fireEvent.click(screen.getByRole('button', { name: /beginner/i }));
  continueToNextStep();

  expect(
    screen.getByRole('heading', {
      name: /which design skill do you want to train/i,
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/ui\/ux design/i)).toBeInTheDocument();
  expect(screen.getByText(/graphics design/i)).toBeInTheDocument();
  expect(screen.getByText(/illustration design/i)).toBeInTheDocument();
});

test('the discipline step is single-select—picking a second option replaces the first', () => {
  renderRegister('/register?track=design');

  continueToNextStep();
  fireEvent.click(screen.getByRole('button', { name: /beginner/i }));
  continueToNextStep();

  fireEvent.click(screen.getByRole('button', { name: /ui\/ux design/i }));
  fireEvent.click(screen.getByRole('button', { name: /^graphics design$/i }));

  expect(screen.getByRole('button', { name: /ui\/ux design/i })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect(screen.getByRole('button', { name: /^graphics design$/i })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('assessor flow asks what to assess, then qualifications', () => {
  renderRegister('/register?role=assessor');

  expect(
    screen.getByRole('heading', { name: /what would you like to assess/i }),
  ).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole('button', { name: /assess voice training/i }),
  );
  continueToNextStep();

  expect(
    screen.getByRole('heading', { name: /what are your qualifications/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/speech \/ voice coach/i)).toBeInTheDocument();
});

test('design assessors get design-specific qualifications', () => {
  renderRegister('/register?role=assessor');

  fireEvent.click(screen.getByRole('button', { name: /assess design work/i }));
  continueToNextStep();

  expect(
    screen.getByRole('heading', { name: /what are your qualifications/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/product \/ ux designer/i)).toBeInTheDocument();
  expect(screen.getByText(/art director/i)).toBeInTheDocument();
});

function navigateAssessorToPhotoStep() {
  renderRegister('/register?role=assessor');

  fireEvent.click(screen.getByRole('button', { name: /assess voice training/i }));
  continueToNextStep(); // -> qualifications
  fireEvent.click(screen.getByRole('button', { name: /speech \/ voice coach/i }));
  continueToNextStep(); // -> assessor-focus
  fireEvent.click(screen.getByRole('button', { name: /pace & clarity/i }));
  continueToNextStep(); // -> assessor-about
  fireEvent.click(screen.getByRole('button', { name: /happy to volunteer reviews/i }));
  continueToNextStep(); // -> assessor-photo
}

test('the experience-level step is single-select—picking a second option replaces the first', () => {
  renderRegister('/register?role=assessor');

  fireEvent.click(screen.getByRole('button', { name: /assess voice training/i }));
  continueToNextStep(); // -> qualifications
  fireEvent.click(screen.getByRole('button', { name: /speech \/ voice coach/i }));
  continueToNextStep(); // -> assessor-focus
  fireEvent.click(screen.getByRole('button', { name: /pace & clarity/i }));
  continueToNextStep(); // -> assessor-about

  fireEvent.click(screen.getByRole('button', { name: /happy to volunteer reviews/i }));
  fireEvent.click(screen.getByRole('button', { name: /10\+ years/i }));

  expect(
    screen.getByRole('button', { name: /happy to volunteer reviews/i }),
  ).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByRole('button', { name: /10\+ years/i })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('assessor flow includes an optional profile photo step before account creation', () => {
  navigateAssessorToPhotoStep();

  expect(
    screen.getByRole('heading', { name: /add a profile photo/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/choose a photo/i)).toBeInTheDocument();
});

test('the photo step can be skipped and still reach account creation—no KYC step in sign-up', () => {
  navigateAssessorToPhotoStep();

  continueToNextStep();

  expect(
    screen.getByRole('heading', { name: /create your provn account/i }),
  ).toBeInTheDocument();
});

test('uploading a photo still lets the assessor continue straight to account creation', () => {
  navigateAssessorToPhotoStep();

  const photoInput = document.querySelector(
    'input[type="file"][accept="image/png,image/jpeg"]',
  );
  fireEvent.change(photoInput, {
    target: { files: [new File(['photo-bytes'], 'photo.png', { type: 'image/png' })] },
  });
  continueToNextStep();

  expect(
    screen.getByRole('heading', { name: /create your provn account/i }),
  ).toBeInTheDocument();
});
