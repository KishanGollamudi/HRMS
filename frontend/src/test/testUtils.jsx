import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AppDataProvider } from '@/context/AppDataContext';
import { SprintProvider } from '@/context/SprintContext';
import { AttendanceProvider } from '@/context/AttendanceContext';

/**
 * Renders a component inside all required context providers.
 *
 * @param {React.ReactElement} ui
 * @param {{ initialEntries?: string[], initialIndex?: number }} options
 */
export function renderWithProviders(ui, { initialEntries = ['/'], initialIndex = 0 } = {}) {
  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        <AuthProvider>
          <AppDataProvider>
            <SprintProvider>
              <AttendanceProvider>
                {children}
              </AttendanceProvider>
            </SprintProvider>
          </AppDataProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  }
  return render(ui, { wrapper: Wrapper });
}

/**
 * Seeds localStorage to simulate an already-authenticated trainer session.
 * Call this before rendering a protected component.
 */
export function seedTrainerSession() {
  const user = { id: 1, name: 'Vikram Singh', email: 'vikram@sprintflow.com', role: 'trainer', initials: 'VS' };
  localStorage.setItem('accessToken', 'mock-access-token');
  localStorage.setItem('refreshToken', 'mock-refresh-token');
  localStorage.setItem('user', JSON.stringify(user));
  return user;
}

export function clearSession() {
  localStorage.clear();
}
