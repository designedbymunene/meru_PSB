# Meru County PSB Mobile App - E2E Test Plan

## Overview

This document outlines the comprehensive E2E testing strategy for the Meru County Public Service Board mobile application using Maestro.

### Test Configuration

- **App ID:** `com.nickm101.merucountypsb`
- **Platform:** React Native (iOS/Android)
- **Test Framework:** Maestro
- **Test Environment:** Configure via environment variables

### Environment Setup

```bash
# Install Maestro CLI
npm install -g @maestro-dev/tester

# Set environment variables for tests
export TEST_EMAIL="test@example.com"
export TEST_PASSWORD="TestPassword123!"
```

---

## Test Categories

### 1. Smoke Tests ✅

Critical path validation to ensure core functionality works.

| Test | File | Description |
|------|------|-------------|
| App Launch | `flows/smoke/app-launch.yaml` | Verify app launches and main tabs are accessible |

**Run Command:**
```bash
maestro test --appId com.nickm101.merucountypsb .maestro/flows/smoke/
```

---

### 2. Authentication Tests 🔐

Validate all authentication flows.

| Test | File | Description | Status |
|------|------|-------------|--------|
| Valid Login | `flows/auth/login-valid.yaml` | Login with valid credentials | ✅ Created |
| Invalid Login | `flows/auth/login-invalid.yaml` | Login shows error for invalid credentials | ✅ Created |
| Login with 2FA | `flows/auth/login-2fa.yaml` | Handle two-factor authentication flow | 📋 Pending |
| OTP Login | `flows/auth/login-otp.yaml` | Login via OTP flow | 📋 Pending |
| Biometric Login | `flows/auth/login-biometric.yaml` | Login using biometrics | 📋 Pending |
| Registration | `flows/auth/register.yaml` | New user registration flow | 📋 Pending |
| Forgot Password | `flows/auth/forgot-password.yaml` | Password reset flow | 📋 Pending |
| Logout | `flows/auth/logout.yaml` | Verify logout functionality | 📋 Pending |

**Run Command:**
```bash
maestro test --appId com.nickm101.merucountypsb .maestro/flows/auth/
```

---

### 3. Job Application Tests 💼

Validate vacancy browsing and application submission.

| Test | File | Description | Status |
|------|------|-------------|--------|
| Browse Vacancies | `flows/applications/browse-vacancies.yaml` | List, search, filter vacancies | ✅ Created |
| View Vacancy Detail | `flows/applications/view-vacancy-detail.yaml` | View full vacancy details | ✅ Created |
| View Applications | `flows/applications/view-applications.yaml` | View submitted applications list | ✅ Created |
| View Application Detail | `flows/applications/view-application-detail.yaml` | View application status & timeline | 📋 Pending |
| Apply for Job | `flows/applications/apply-for-job.yaml` | Complete application flow | 📋 Pending |
| Interview Prep Guide | `flows/applications/interview-prep.yaml` | Access prep guide when shortlisted | 📋 Pending |

**Run Command:**
```bash
maestro test --appId com.nickm101.merucountypsb .maestro/flows/applications/
```

---

### 4. Profile Management Tests 👤

Validate profile creation and editing.

| Test | File | Description | Status |
|------|------|-------------|--------|
| View Profile | `flows/profile/view-profile.yaml` | View profile screen | 📋 Pending |
| Edit Personal Details | `flows/profile/edit-personal.yaml` | Update personal information | 📋 Pending |
| Edit Employment History | `flows/profile/edit-employment.yaml` | Add/edit employment records | 📋 Pending |
| Edit Qualifications | `flows/profile/edit-qualifications.yaml` | Add/edit academic qualifications | 📋 Pending |
| Add Training | `flows/profile/add-training.yaml` | Add training courses | 📋 Pending |
| Add Referees | `flows/profile/add-referees.yaml` | Add referee contacts | 📋 Pending |
| Upload Documents | `flows/profile/upload-documents.yaml` | Upload profile documents | 📋 Pending |

**Run Command:**
```bash
maestro test --appId com.nickm101.merucountypsb .maestro/flows/profile/
```

---

### 5. Edge Cases & Error Handling ⚠️

Tests for error states and edge cases.

| Test | Description | Status |
|------|-------------|--------|
| Offline Mode | Verify app works offline with cached data | 📋 Pending |
| Network Errors | Handle API failures gracefully | 📋 Pending |
| Empty States | Verify UI when no vacancies/applications | 📋 Pending |
| Form Validation | Verify all form validations work | 📋 Pending |
| Profile Completion | Verify completion guardrails | 📋 Pending |

---

## Test ID Reference Guide

### Authentication Screen testIDs

**Login Screen (`login.tsx`)**
- `login-email` - Email input field
- `login-password` - Password input field
- `login-password-toggle` - Password show/hide button
- `login-submit` - Sign in button
- `login-biometric` - Biometric login button
- `login-otp` - Login with OTP button
- `login-forgot-password` - Forgot password link
- `login-register` - Create account link

**2FA Screen (`login-2fa.tsx`)**
- `otp-input-{0-5}` - 6 OTP input boxes
- `otp-submit` - Verify button
- `otp-resend` - Resend code link

**OTP Login Screen (`otp-login.tsx`)**
- `otp-email` - Email input field
- `otp-send` - Send code button
- `otp-code-input-{0-5}` - 6 OTP input boxes
- `otp-verify` - Verify button
- `otp-resend` - Resend OTP link

**Registration Screen (`register.tsx`)**
- `register-first-name` - First name input
- `register-last-name` - Last name input
- `register-phone` - Phone number input
- `register-id-number` - National ID input
- `register-email` - Email input
- `register-password` - Password input
- `register-password-toggle` - Password show/hide
- `register-submit` - Create account button
- `register-login` - Sign in link

**Forgot Password Screen (`forgot-password.tsx`)**
- `forgot-email-input` - Email input field
- `forgot-submit` - Get reset code button
- `forgot-login` - Sign in link
- `reset-otp-input-{0-5}` - 6 OTP input boxes
- `reset-password-input` - New password input
- `reset-password-toggle` - Password show/hide
- `reset-submit` - Update password button
- `reset-success-login` - Log in now button (success screen)

### Application Screen testIDs

**Vacancies List (`vacancies.tsx`)**
- `vacancies-search` - Search input field
- `vacancies-filter` - Filter button
- `vacancies-clear-search` - Clear search button
- `vacancy-card-{id}` - Individual vacancy card (pressable)
- `vacancies-retry` - Retry button (error state)
- `vacancies-clear-filters` - Clear filters button

**Vacancy Detail (`vacancies/[id].tsx`)**
- `vacancy-back` - Back button
- `vacancy-share` - Share button
- `vacancy-download-{docId}` - Document download button
- `vacancy-apply` - Apply button
- `vacancy-retry` - Retry button (error state)

**Applications List (`applications.tsx`)**
- `application-card-{id}` - Individual application card (pressable)
- `applications-retry` - Retry button (error state)

**Application Detail (`applications/[id].tsx`)**
- `application-back` - Back button
- `application-prep-guide` - Interview prep guide button
- `application-retry` - Retry button (error state)

---

## Running Tests

### Run All Tests

```bash
maestro test --appId com.nickm101.merucountypsb .maestro/flows/
```

### Run Specific Category

```bash
# Smoke tests only
maestro test --appId com.nickm101.merucountypsb .maestro/flows/smoke/

# Auth tests only
maestro test --appId com.nickm101.merucountypsb .maestro/flows/auth/

# Application tests only
maestro test --appId com.nickm101.merucountypsb .maestro/flows/applications/
```

### Run Single Test

```bash
maestro test --appId com.nickm101.merucountypsb .maestro/flows/smoke/app-launch.yaml
```

### Generate Report

```bash
maestro test --appId com.nickm101.merucountypsb .maestro/flows/ --report=html --output=maestro-report.html
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd apps/mobile
          npm ci
          
      - name: Install Maestro
        run: npm install -g @maestro-dev/tester
        
      - name: Build app
        run: |
          cd apps/mobile
          npx expo prebuild --clean
          
      - name: Run on iOS Simulator
        run: |
          npx expo run:ios
          
      - name: Run E2E Tests
        run: |
          maestro test --appId com.nickm101.merucountypsb .maestro/flows/
        env:
          TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

---

## Best Practices

### 1. Use Conditional Waits
Always use `waitForAnimationToEnd` or `waitForElement` instead of fixed delays.

### 2. Reuse Helper Flows
Use `runFlow:` to call common actions like login instead of duplicating code.

### 3. Use Regex for Dynamic Content
Use `contains: true` or regex patterns for text that may vary.

### 4. Handle Optional Elements
Use `runScript` with `when:` conditions for elements that may or may not appear.

### 5. Clean State
Ensure tests start from a clean state or handle existing data appropriately.

---

## Maintenance

### Adding New Tests

1. Create test file in appropriate category folder
2. Follow naming convention: `{action}-{description}.yaml`
3. Add test ID props to any new components
4. Update this test plan document

### Updating testID Props

When adding new components:
1. Add `testID` prop to component interface
2. Apply testID to root or key interactive elements
3. Use kebab-case naming: `component-action`
4. Document in this test plan

---

## Test Status Legend

- ✅ Created - Test file exists
- 📋 Pending - Test needs to be created
- 🚧 WIP - Test is being worked on
- ❌ Broken - Test needs fixing
- ⚠️ Unstable - Test is flaky

---

## Last Updated

2025-01-XX - Initial test plan created with smoke, auth, and application tests
