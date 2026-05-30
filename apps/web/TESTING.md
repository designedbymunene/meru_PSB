# Testing Guide - Meru PSB Web App

## Overview
This guide covers the comprehensive testing infrastructure for the Meru PSB web application, including unit tests, component tests, integration tests, and end-to-end tests.

## Testing Stack

### Unit & Component Tests
- **Framework**: Vitest
- **Library**: React Testing Library
- **Configuration**: `vitest.config.ts`
- **Setup**: `vitest.setup.ts`

### End-to-End Tests
- **Framework**: Playwright
- **Configuration**: `playwright.config.ts`
- **Browsers**: Chromium, Firefox, WebKit

## Running Tests

### Unit Tests (Vitest)
```bash
# Run tests once
pnpm test

# Watch mode for development
pnpm test:watch

# UI dashboard for visual test running
pnpm test:ui
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
pnpm test:e2e

# Interactive UI mode
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e e2e/auth.spec.ts

# Run tests in specific browser
pnpm test:e2e --project=chromium
```

## Test Organization

### Unit Tests (`__tests__/`)

#### Components (`__tests__/components/`)
- `error-boundary.test.tsx` - Error boundary component tests
- `register-form.test.tsx` - Registration form tests (8 tests)
- `forgot-password-form.test.tsx` - Password reset form tests (4 tests)
- `department-form.test.tsx` - Admin department form tests (7 tests)
- `field-error.test.tsx` - Field-level error display tests (9 tests)

#### Hooks (`__tests__/hooks/`)
- `use-auth.test.tsx` - Authentication hook tests (1 test)
- `use-applications.test.tsx` - Applications hook tests (8 tests)
- `use-vacancies.test.tsx` - Vacancies hook tests (11 tests)
- `use-departments.test.tsx` - Departments hook tests (14 tests)

#### Integration (`__tests__/integration/`)
- `dashboard-pages.test.tsx` - Dashboard page integration tests (9 tests)

### E2E Tests (`e2e/`)
- `auth.spec.ts` - Authentication flow tests
  - Login form rendering
  - Form validation
  - Password visibility toggle
  - Navigation between login/register

## Test Statistics

### Current Coverage
- **Total Tests**: 67 unit tests
- **Form Tests**: 24 tests (covering LoginForm, RegisterForm, ForgotPasswordForm, DepartmentForm)
- **Hook Tests**: 34 tests (covering data fetching, mutations, error handling)
- **Component Tests**: 9 tests (error boundary, field-error components)
- **Integration Tests**: 9 tests (page-level auth flow)
- **E2E Tests**: In progress

### Test Results
All unit tests passing ✓
Build successful ✓

## Writing New Tests

### Unit Test Template
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders correctly', () => {
        render(<MyComponent />)
        expect(screen.getByText('Expected Text')).toBeInTheDocument()
    })
})
```

### Hook Test Template
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MyHook } from '@/hooks/my-hook'

const createWrapper = () => {
    const queryClient = new QueryClient()
    return ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('MyHook', () => {
    it('fetches data correctly', async () => {
        const { result } = renderHook(() => MyHook(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })
    })
})
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test'

test('user flow', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('button:has-text("Sign In")').click()
    
    await expect(page).toHaveURL('/dashboard')
})
```

## Testing Best Practices

### Unit Tests
1. **Mock External Dependencies**: Mock API calls, routers, and external hooks
2. **Test Behavior, Not Implementation**: Focus on what the component does, not how
3. **Use Descriptive Test Names**: Test names should clearly describe the scenario
4. **Test Accessibility**: Include ARIA attributes, labels, and roles in tests
5. **Avoid Implementation Details**: Don't test private functions or internal state

### Component Tests
1. **Test Rendering**: Ensure component renders with expected elements
2. **Test User Interactions**: Simulate user actions (typing, clicking)
3. **Test Form Submission**: Validate form submission and validation
4. **Test Error States**: Verify error messages and loading states
5. **Test Accessibility**: Check keyboard navigation, focus management, ARIA

### E2E Tests
1. **Test User Workflows**: Cover complete user journeys
2. **Test Critical Paths**: Authentication, core features, error scenarios
3. **Avoid Test Data Flakiness**: Use stable data or setup/teardown
4. **Test in Multiple Browsers**: Verify cross-browser compatibility
5. **Screenshot on Failure**: Use Playwright's screenshot feature for debugging

## Continuous Integration

### Local Testing
Run all tests before committing:
```bash
# Unit tests
pnpm test

# E2E tests (requires running dev server)
pnpm dev & pnpm test:e2e
```

### CI/CD Pipeline
- Unit tests run on every commit
- E2E tests run before deployment
- Coverage reports generated for unit tests
- Test results archived in CI system

## Debugging Tests

### Debug Unit Tests
```bash
# Run tests in watch mode
pnpm test:watch

# Use Vitest UI
pnpm test:ui
```

### Debug E2E Tests
```bash
# Run with Playwright Inspector
pnpm test:e2e:debug

# View test report
pnpm test:e2e
# Reports in: playwright-report/
```

### Inspect Test Failures
- Check `test-results/` for failure details
- Review `playwright-report/` for E2E test videos
- Enable `trace: 'on-first-retry'` in Playwright config
- Add `.only()` to run single test

## Future Improvements

### Planned
- [ ] Visual regression testing with Percy or Chromatic
- [ ] Performance testing with Lighthouse
- [ ] Accessibility testing with axe-core
- [ ] Load testing with k6
- [ ] Mobile app testing (React Native Testing Library)

### Coverage Targets
- Web Unit Tests: 80% statement coverage
- E2E Tests: Cover all critical user journeys
- Accessibility: WCAG AA compliance

## Troubleshooting

### Tests Not Running
1. Check Node version compatibility
2. Run `pnpm install` to ensure dependencies
3. Check for port conflicts (Playwright uses port 3000)
4. Clear `.next` and `node_modules` and reinstall

### Flaky E2E Tests
1. Increase timeout values
2. Add explicit waits for elements
3. Use `waitForTimeout` sparingly
4. Consider test data isolation

### Mock Issues
1. Verify mock paths match import paths
2. Check that mocks are cleared between tests
3. Use `vi.importActual()` for partial mocks
4. Verify mock return values match expected types

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
