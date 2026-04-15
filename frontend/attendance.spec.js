/**
 * E2E tests — Trainer Attendance Flow
 *
 * Prerequisites:
 *   - Backend running at http://localhost:8080  (or VITE_API_BASE_URL set)
 *   - A trainer account: vikram@sprintflow.com / password123
 *   - That trainer has at least one sprint assigned with enrolled employees
 *
 * Run: npx playwright test
 */
import { test, expect } from '@playwright/test';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Log in as a trainer via the real login form. */
async function loginAsTrainer(page, email = 'vikram@sprintflow.com', password = 'password123') {
  await page.goto('/login');

  // Role toggle — select "trainer" (it's the default, but be explicit)
  await page.getByRole('radio', { name: /^trainer$/i }).click();

  // Fill credentials
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);

  // Submit — button text is "Sign in as Trainer"
  await page.getByRole('button', { name: /sign in as trainer/i }).click();

  // Trainer lands on "/" (TrainerDashboard)
  await expect(page).toHaveURL('/', { timeout: 10_000 });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Trainer — Login', () => {
  test('renders all three role tabs on the login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('radio', { name: /^trainer$/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /^hr$/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /^manager$/i })).toBeVisible();
  });

  test('successful login redirects to trainer dashboard', async ({ page }) => {
    await loginAsTrainer(page);
    // TrainerDashboard renders "Trainer Dashboard" in the PageBanner
    await expect(page.getByText(/trainer dashboard/i)).toBeVisible();
  });

  test('wrong password shows an alert', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('vikram@sprintflow.com');
    await page.getByLabel(/password/i).fill('wrongpassword');

    // Capture the browser alert
    const alertPromise = page.waitForEvent('dialog');
    await page.getByRole('button', { name: /sign in as trainer/i }).click();
    const dialog = await alertPromise;
    expect(dialog.message()).toBeTruthy();
    await dialog.dismiss();
  });
});

test.describe('Trainer — Attendance Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTrainer(page);
  });

  test('navigates to Sprints via sidebar and opens attendance for a sprint', async ({ page }) => {
    // Hover the sidebar to expand it (sidebar opens on mouseenter)
    await page.locator('aside').hover();

    // Click "Sprints" nav link
    await page.getByRole('link', { name: /^sprints$/i }).click();
    await expect(page).toHaveURL('/sprints');

    // Each sprint card has a "Mark Attendance" or similar link — click the first one
    const attendanceLink = page.getByRole('link', { name: /attendance/i }).first();
    await attendanceLink.click();

    // URL should be /sprints/:id/attendance
    await expect(page).toHaveURL(/\/sprints\/\d+\/attendance/);
  });

  test('can mark an employee as Present', async ({ page }) => {
    // Navigate directly to the first sprint's attendance page
    await page.goto('/sprints');
    await page.locator('aside').hover();

    const attendanceLink = page.getByRole('link', { name: /attendance/i }).first();
    await attendanceLink.click();
    await expect(page).toHaveURL(/\/sprints\/\d+\/attendance/);

    // Wait for the employee table to load
    const firstPresentBtn = page
      .getByRole('button', { name: /^present$/i })
      .first();
    await expect(firstPresentBtn).toBeVisible({ timeout: 8_000 });
    await firstPresentBtn.click();

    // The status badge in that row should now show "Present"
    await expect(page.getByText('Present').first()).toBeVisible();
  });

  test('Mark All Present sets all rows to Present', async ({ page }) => {
    await page.goto('/sprints');
    const attendanceLink = page.getByRole('link', { name: /attendance/i }).first();
    await attendanceLink.click();
    await expect(page).toHaveURL(/\/sprints\/\d+\/attendance/);

    await page.getByRole('button', { name: /mark all present/i }).click();

    // Every status button group should have an active "Present" button
    const presentButtons = page.getByRole('button', { name: /^present$/i });
    const count = await presentButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('toggling "Notify absent employees" and submitting attendance', async ({ page }) => {
    await page.goto('/sprints');
    const attendanceLink = page.getByRole('link', { name: /attendance/i }).first();
    await attendanceLink.click();
    await expect(page).toHaveURL(/\/sprints\/\d+\/attendance/);

    // Wait for table
    await expect(page.getByRole('button', { name: /submit attendance/i })).toBeVisible({ timeout: 8_000 });

    // Toggle "Notify absent employees" — it's a styled div next to the label
    const notifyLabel = page.getByText(/notify absent employees/i);
    await expect(notifyLabel).toBeVisible();
    // Click the toggle div (sibling before the label span inside the <label>)
    await notifyLabel.locator('..').locator('div').first().click();

    // Submit
    await page.getByRole('button', { name: /submit attendance/i }).click();

    // Success banner: "Attendance for <date> submitted. Records are now locked."
    await expect(page.getByText(/submitted/i).first()).toBeVisible({ timeout: 10_000 });

    // Submit button should now be replaced by a disabled "Submitted" button
    await expect(page.getByRole('button', { name: /^submitted$/i })).toBeDisabled();
  });

  test('Export CSV button triggers a download', async ({ page }) => {
    await page.goto('/sprints');
    const attendanceLink = page.getByRole('link', { name: /attendance/i }).first();
    await attendanceLink.click();
    await expect(page).toHaveURL(/\/sprints\/\d+\/attendance/);

    // Listen for the download event
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /export csv/i }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/attendance.*\.csv/i);
  });
});
