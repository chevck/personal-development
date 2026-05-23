import { render, screen } from '@testing-library/react';
import App from './App';

test('renders project hub', () => {
  render(<App />);
  expect(screen.getByText(/Personal growth projects/i)).toBeInTheDocument();
});
