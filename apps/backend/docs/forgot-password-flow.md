# Forgot Password Flow for Mobile

This document describes the password reset flow that the mobile app should implement against the backend.

## Overview

The flow is a two-step OTP reset process:

1. The user requests a password reset code using their email.
2. The user enters the OTP from email together with a new password.

The backend does not expose whether an email exists when the reset code is requested.

## Endpoints

Base path: `/api/auth`

### 1) Request reset code

`POST /forgot-password/request`

Request body:

```json
{
  "email": "user@example.com"
}
```

Validation:

- `email` is required
- must be a valid email address

Success response:

```json
{
  "success": true,
  "message": "If the account exists, a reset code has been sent",
  "data": null
}
```

Notes:

- If the email matches a user, the backend generates a 6-digit OTP.
- The OTP is sent to the user’s email address.
- The OTP expires after 10 minutes.
- Any previous reset sessions for that user are removed before creating a new one.
- In non-production environments, the OTP may also be logged to the server console if email delivery is not configured.

### 2) Confirm reset code and set new password

`POST /reset-password`

Request body:

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123"
}
```

Validation:

- `email` is required and must be valid
- `otp` must be exactly 6 characters
- `newPassword` must be at least 8 characters and at most 100 characters

Success response:

```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

Error response for invalid or expired code:

```json
{
  "success": false,
  "message": "Invalid or expired reset code"
}
```

## Mobile UI Flow

1. Show a screen that asks for the user’s email.
2. Submit the email to `POST /api/auth/forgot-password/request`.
3. Show a success message even if the account does not exist.
4. Move the user to an OTP entry screen.
5. Collect the 6-digit code and the new password.
6. Submit both to `POST /api/auth/reset-password`.
7. On success, send the user back to the login screen.

## Important Behavior

- The app should not reveal whether the email exists based on the request response.
- The OTP is single-use and expires after 10 minutes.
- After a successful reset, all existing JWTs are invalidated because the backend increments the user’s token version.
- If the user enters the wrong OTP repeatedly, the reset session is eventually marked as used after 5 failed attempts.

## Recommended Mobile States

- Idle
- Loading
- Code sent
- Invalid email
- Invalid or expired code
- Password reset success
- Network or server error

## Suggested UX Copy

- Request screen: "Enter your email address to receive a reset code."
- Success message after request: "If an account exists for this email, a reset code has been sent."
- Reset screen: "Enter the 6-digit code from your email and choose a new password."

## Security Notes

- Do not cache the OTP on the device.
- Do not log the OTP in the app.
- Treat the request response as success regardless of whether the email exists.
- After a successful reset, force the user to log in again.
