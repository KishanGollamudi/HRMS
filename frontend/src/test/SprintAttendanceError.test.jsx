/**
 * Integration test — SprintAttendance error banner
 * Isolated in its own file to guarantee a fresh AttendanceContext module instance.
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, seedTrainerSession, clearSession } from './testUtils';
import SprintAttendance from '@/features/sprint/pages/SprintAttendance';
import { MOCK_SPRINT } from '../mocks/handlers';
import { Route, Routes } from 'react-router-dom';

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb) => setTimeout(cb, 0));
  seedTrainerSession();
});
afterEach(() => {
  vi.unstubAllGlobals();
  clearSession();
});

it('shows an error banner when the submit API fails', async () => {
  server.use(
    http.post('/api/attendance/submit', () =>
      HttpResponse.json(
        { success: false, message: 'Submission failed' },
        { status: 500 },
      ),
    ),
  );

  const user = userEvent.setup();
  renderWithProviders(
    <Routes>
      <Route path="/sprints/:id/attendance" element={<SprintAttendance />} />
    </Routes>,
    { initialEntries: [`/sprints/${MOCK_SPRINT.id}/attendance`] },
  );

  await screen.findByText('Alice Kumar');

  const submitBtn = screen.getByRole('button', { name: /submit attendance/i });
  expect(submitBtn).not.toBeDisabled();

  await user.click(submitBtn);

  await waitFor(() =>
    expect(screen.getByText(/submission failed/i)).toBeInTheDocument(),
  );
});
