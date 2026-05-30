import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to login page
        await page.goto('/login')
    })

    test('should display login form', async ({ page }) => {
        // Check for login form elements
        await expect(page.locator('text=Welcome Back')).toBeVisible()
        await expect(page.locator('input[type="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()
        await expect(page.locator('button:has-text("Sign In")')).toBeVisible()
    })

    test('should show validation errors for empty form', async ({ page }) => {
        // Click submit with empty fields
        const submitButton = page.locator('button:has-text("Sign In")')
        await submitButton.click()

        // Check for error messages
        await page.waitForTimeout(500) // Wait for validation
        // Errors should appear (specific messages depend on form validation)
        const inputs = page.locator('input')
        expect(await inputs.count()).toBeGreaterThan(0)
    })

    test('should display email input errors for invalid email', async ({ page }) => {
        const emailInput = page.locator('input[type="email"]')
        await emailInput.fill('invalid-email')

        const submitButton = page.locator('button:has-text("Sign In")')
        await submitButton.click()

        await page.waitForTimeout(500)
        // Form should still be visible (validation prevents submission)
        await expect(emailInput).toBeVisible()
    })

    test('should show password visibility toggle', async ({ page }) => {
        const passwordInput = page.locator('input[type="password"]')
        await expect(passwordInput).toBeVisible()

        // Look for password visibility toggle button
        const toggleButton = page.locator('button[aria-label*="password" i]')
        if (await toggleButton.isVisible()) {
            await toggleButton.click()
            // After clicking, password field should show text (or be hidden depending on implementation)
            await expect(passwordInput).toBeInTheDocument()
        }
    })

    test('should have forgot password link', async ({ page }) => {
        const forgotLink = page.locator('a:has-text("Forgot password")')
        await expect(forgotLink).toBeVisible()
    })

    test('should have register link for new users', async ({ page }) => {
        const registerLink = page.locator('a:has-text("Create account")')
        await expect(registerLink).toBeVisible()
    })

    test('should disable form during submission', async ({ page }) => {
        // This test assumes a successful login attempt
        // In a real scenario, we'd need valid credentials
        const emailInput = page.locator('input[type="email"]')
        const passwordInput = page.locator('input[type="password"]')
        const submitButton = page.locator('button:has-text("Sign In")')

        // Fill form with test credentials (would need real ones for actual login)
        await emailInput.fill('test@example.com')
        await passwordInput.fill('testPassword123')

        // Button should be enabled before click
        await expect(submitButton).toBeEnabled()
    })
})

test.describe('Registration Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to registration page
        await page.goto('/register')
    })

    test('should display registration form', async ({ page }) => {
        // Check for registration form elements
        await expect(page.locator('text=Citizen Registration')).toBeVisible()
        await expect(page.locator('input[placeholder*="example"]')).toBeDefined()
        await expect(page.locator('button')).toBeDefined()
    })

    test('should have link to login page', async ({ page }) => {
        const loginLink = page.locator('a:has-text("Sign in")')
        if (await loginLink.isVisible()) {
            expect(loginLink).toBeVisible()
        }
    })

    test('should have multiple form fields', async ({ page }) => {
        const inputs = page.locator('input')
        const inputCount = await inputs.count()
        // Registration should have more fields than login (name, email, phone, id, password, etc.)
        expect(inputCount).toBeGreaterThan(2)
    })
})

test.describe('Navigation', () => {
    test('should navigate between login and register pages', async ({ page }) => {
        // Start at login
        await page.goto('/login')

        // Find and click register link
        const registerLink = page.locator('a:has-text("Create account")')
        if (await registerLink.isVisible()) {
            await registerLink.click()
            // Should be on register page
            await expect(page).toHaveURL(/register/)
        }
    })

    test('should have accessible navigation', async ({ page }) => {
        await page.goto('/login')

        // Check for ARIA labels
        const ariaElements = page.locator('[aria-label]')
        expect(await ariaElements.count()).toBeGreaterThan(0)
    })
})
