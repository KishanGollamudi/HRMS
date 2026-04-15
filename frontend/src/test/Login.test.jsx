/**
 * Integration tests — Login page
 */
import { screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, clearSession } from './testUtils';
import Login from '@/pages/Login';
import { Route, Routes } from 'react-router-dom';

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="*" element={<Login />} />
    </Routes>,
    { initialEntries: ['/login'] },
  );
}

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb) => setTimeout(cb, 0));
  clearSession();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Login page', () => {
  it('renders all three role buttons', () => {
    renderLogin();
    expect(screen.getByRole('radio', { name: /^trainer$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^hr$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^manager$/i })).toBeInTheDocument();
  });

  it('defaults to trainer role — submit button says "Sign in as Trainer"', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in as trainer/i })).toBeInTheDocument();
  });

  it('switches to HR role when HR button is clicked', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('radio', { name: /^hr$/i }));
    expect(screen.getByRole('button', { name: /sign in as hr/i })).toBeInTheDocument();
  });

  it('successful login stores the access token', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText(/trainer@company\.com/i), 'vikram@sprintflow.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in as trainer/i }));
    await waitFor(() => {
      expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
    });
  });

  it('failed login does not store a token', async () => {
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json({ success: false, message: 'Bad credentials' }, { status: 400 }),
      ),
    );
    renderLogin();
    // Use fireEvent to avoid userEvent timer interactions with the alert mock
    fireEvent.change(screen.getByPlaceholderText(/trainer@company\.com/i), {
      target: { value: 'bad@email.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'badpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in as trainer/i }));
    // After a failed login, no token should be stored
    await waitFor(() => {
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });
});
