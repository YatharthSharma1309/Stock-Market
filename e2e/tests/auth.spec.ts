import { test, expect } from '@playwright/test'

/**
 * Auth guard tests — unauthenticated users should be redirected to /login.
 */
test.describe('Auth guard', () => {
  test('redirects /dashboard to /login when not logged in', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('redirects /markets to /login when not logged in', async ({ page }) => {
    await page.goto('/markets')
    await expect(page).toHaveURL(/\/login/)
  })

  test('redirects /portfolio to /login when not logged in', async ({ page }) => {
    await page.goto('/portfolio')
    await expect(page).toHaveURL(/\/login/)
  })

  test('redirects /leaderboard to /login when not logged in', async ({ page }) => {
    await page.goto('/leaderboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('/login page renders registration link', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: /sign up|register/i })).toBeVisible()
  })

  test('/register page renders login link', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('link', { name: /sign in|log in/i })).toBeVisible()
  })
})
