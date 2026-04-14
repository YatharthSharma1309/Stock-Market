import { test, expect } from '@playwright/test'

/**
 * Happy-path E2E: register → buy stock → view portfolio → check leaderboard.
 *
 * Each run generates a unique email so tests are independent of DB state.
 */

function uniqueUser() {
  const ts = Date.now()
  return {
    email: `e2e_${ts}@test.com`,
    username: `e2e${ts}`,
    password: 'TestPassword1',
  }
}

test.describe('Happy path', () => {
  test('register, buy a stock, view portfolio, check leaderboard', async ({ page }) => {
    const user = uniqueUser()

    // ── 1. Register ───────────────────────────────────────────────────────────
    await page.goto('/register')
    await page.getByLabel(/email/i).fill(user.email)
    await page.getByLabel(/username/i).fill(user.username)
    await page.getByLabel(/password/i).fill(user.password)
    await page.getByRole('button', { name: /register|sign up|create/i }).click()

    // Should land on dashboard after successful registration
    await expect(page).toHaveURL(/\/(dashboard)?$/, { timeout: 10_000 })
    await expect(page.getByText(/welcome|dashboard|portfolio/i)).toBeVisible()

    // ── 2. Navigate to Markets and find a stock ───────────────────────────────
    await page.getByRole('link', { name: /markets/i }).click()
    await expect(page).toHaveURL(/\/markets/)

    // Wait for stock table to load (prices fetched from yfinance)
    const stockRow = page.getByRole('table').getByRole('row').nth(1)
    await expect(stockRow).toBeVisible({ timeout: 20_000 })

    // Click Trade button on the first row
    await stockRow.getByRole('button', { name: /trade/i }).click()

    // ── 3. Buy a stock ────────────────────────────────────────────────────────
    const modal = page.getByRole('dialog').or(page.locator('.fixed').filter({ hasText: /buy|sell/i }))
    await expect(modal).toBeVisible()

    // Enter quantity
    await page.getByPlaceholder('0').fill('1')

    // Confirm it's a Buy action and submit
    await page.getByRole('button', { name: /buy/i }).last().click()

    // Toast success or modal closes
    await expect(modal).not.toBeVisible({ timeout: 10_000 })

    // ── 4. View Portfolio ─────────────────────────────────────────────────────
    await page.getByRole('link', { name: /portfolio/i }).click()
    await expect(page).toHaveURL(/\/portfolio/)

    // Portfolio should show the new holding
    await expect(page.getByText(/total portfolio/i)).toBeVisible({ timeout: 10_000 })

    // ── 5. Check Leaderboard ──────────────────────────────────────────────────
    await page.getByRole('link', { name: /leaderboard/i }).click()
    await expect(page).toHaveURL(/\/leaderboard/)

    // New user should appear on the leaderboard
    await expect(page.getByText(user.username, { exact: false })).toBeVisible({ timeout: 10_000 })
  })

  test('health check endpoint is reachable', async ({ request }) => {
    const res = await request.get('http://localhost:8000/api/health')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.database).toBe('connected')
    expect(body.redis).toBe('connected')
  })
})
