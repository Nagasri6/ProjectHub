import { test, expect } from '@playwright/test';

test('login, dashboard, project, task, and activity workflow', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: /Good / })).toBeVisible();

  await page.getByRole('link', { name: 'Projects' }).first().click();
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  await page.getByRole('link', { name: 'Samba Academy Platform' }).first().click();
  await expect(page.getByRole('heading', { name: 'Samba Academy Platform' })).toBeVisible();

  await page.getByRole('link', { name: 'Tasks' }).click();
  await page.getByRole('button', { name: 'Create task' }).click();
  await page.getByLabel('Task title').fill('Review partner onboarding copy');
  await page.getByRole('button', { name: 'Save task' }).click();
  await expect(page.getByText('Review partner onboarding copy')).toBeVisible();

  await page.getByRole('link', { name: 'Activity' }).click();
  await expect(page.getByText(/created task|Review partner onboarding copy/i)).toBeVisible();
});
