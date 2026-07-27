import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders the Provn landing page', () => {
  render(<App />);
  expect(
    screen.getAllByRole('link', { name: /create your account/i }).length,
  ).toBeGreaterThan(0);
});
