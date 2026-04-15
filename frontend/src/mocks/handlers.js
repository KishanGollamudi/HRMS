import { http, HttpResponse } from 'msw';

// ─── Shared fixtures ────────────────────────────────────────────────────────

export const MOCK_TRAINER = {
  id: 1,
  name: 'Vikram Singh',
  email: 'vikram@sprintflow.com',
  role: 'trainer',
  department: 'Java',
  initials: 'VS',
};

export const MOCK_SPRINT = {
  id: 10,
  title: 'Java',
  status: 'Scheduled',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  sprintStart: '09:00',
  sprintEnd: '17:00',
  timeSlot: '09:00 - 17:00',
  room: 'Room A - Sandeepa',
  cohort: 'Java cohort 1',
  trainerId: 1,
  trainer: 'Vikram Singh',
  cohorts: [{ technology: 'Java', cohort: 'Java cohort 1' }],
};

export const MOCK_EMPLOYEES = [
  {
    id: 101,
    empId: 'EMP001',
    name: 'Alice Kumar',
    technology: 'Java',
    cohort: 'Java cohort 1',
  },
  {
    id: 102,
    empId: 'EMP002',
    name: 'Bob Sharma',
    technology: 'Java',
    cohort: 'Java cohort 1',
  },
];

// api.js response interceptor returns `response.data` directly.
// Backend wraps everything as: { success, data, message, statusCode }
const ok = (data) => ({ success: true, data, message: 'OK', statusCode: 200 });

// ─── Handlers ───────────────────────────────────────────────────────────────

export const handlers = [
  // Auth — login
  http.post('/api/auth/login', async ({ request }) => {
    const { email } = await request.json();
    const role = email?.includes('hr') ? 'hr' : email?.includes('manager') ? 'manager' : 'trainer';
    return HttpResponse.json(
      ok({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { id: 1, name: 'Vikram Singh', email, role, initials: 'VS' },
      }),
    );
  }),

  // Auth — logout
  http.post('/api/auth/logout', () => HttpResponse.json(ok(null))),

  // Employees
  http.get('/api/employees', () => HttpResponse.json(ok(MOCK_EMPLOYEES))),

  // Sprints — all
  http.get('/api/sprints', () => HttpResponse.json(ok([MOCK_SPRINT]))),

  // Sprints — by trainer
  http.get('/api/sprints/trainer/:trainerId', () =>
    HttpResponse.json(ok([MOCK_SPRINT])),
  ),

  // Attendance — get by sprint + date (returns empty = no prior submission)
  http.get('/api/attendance', ({ request }) => {
    const url = new URL(request.url);
    const sprintId = url.searchParams.get('sprintId');
    const date = url.searchParams.get('date');
    // Return empty list → fresh session, not yet submitted
    return HttpResponse.json(ok([]));
  }),

  // Attendance — get all by sprint (for dashboard charts)
  http.get('/api/attendance/all', () => HttpResponse.json(ok([]))),

  // Attendance — submit
  http.post('/api/attendance/submit', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      ok({
        message: `Attendance submitted for sprint ${body.sprintId} on ${body.attendanceDate}. Emails: ${body.sendAbsenceEmails}`,
        sprintId: body.sprintId,
        attendanceDate: body.attendanceDate,
        recordsCount: body.records?.length ?? 0,
      }),
    );
  }),

  // Attendance — stats
  http.get('/api/attendance/stats', () => HttpResponse.json(ok([]))),

  // Attendance — cohort stats
  http.get('/api/attendance/cohort-stats', () => HttpResponse.json(ok([]))),

  // Users — trainers (manager only; 403 for others is fine — AppDataContext ignores errors)
  http.get('/api/users/trainers', () => HttpResponse.json(ok([MOCK_TRAINER]))),

  // Users — HRBPs
  http.get('/api/users/hrbps', () => HttpResponse.json(ok([]))),
];
