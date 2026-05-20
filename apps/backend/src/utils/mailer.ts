import nodemailer from 'nodemailer'
import { getApplicationStatusLabel } from './application-status'

type PasswordResetEmailInput = {
    to: string
    fullName: string
    otp: string
}

type RegistrationSuccessEmailInput = {
    to: string
    fullName: string
    profileUrl: string
}

type RegistrationSuccessMessageInput = Omit<RegistrationSuccessEmailInput, 'to'>

type ApplicationStatusEmailInput = {
    to: string
    fullName: string
    vacancyTitle: string
    status: string
    feedbackToApplicant?: string | null
    rejectionReason?: string | null
}

const LOGO_URL = 'https://recruitment.merucountypublicserviceboard.or.ke/_next/image?url=%2Flogo%2Fmerucountylogo.png&w=96&q=75'
const PRIMARY_COLOR = '#004aad'
const BG_COLOR = '#f6f9fc'

/**
 * Base email template with a minimalist Fortune 100 aesthetic (Stripe/NVIDIA style)
 */
const buildBaseEmailHtml = (contentHtml: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: ${BG_COLOR}; margin: 0; padding: 0; }
        .wrapper { background-color: ${BG_COLOR}; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); padding: 40px; }
        .header { margin-bottom: 32px; }
        .logo { height: 48px; margin-bottom: 16px; }
        .title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0; }
        .content { font-size: 16px; color: #333; }
        .greeting { font-size: 18px; font-weight: 600; color: #1a1a1a; margin-top: 0; margin-bottom: 24px; }
        p { margin-top: 0; margin-bottom: 24px; }
        .button { background-color: ${PRIMARY_COLOR}; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px; }
        .otp { font-size: 32px; font-weight: 700; letter-spacing: 4px; color: ${PRIMARY_COLOR}; margin: 24px 0; font-family: 'Courier New', Courier, monospace; }
        .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e6ebf1; font-size: 13px; color: #6b7280; }
        .footer a { color: ${PRIMARY_COLOR}; text-decoration: none; }
        .signature { margin-bottom: 8px; font-weight: 500; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <img src="${LOGO_URL}" alt="Meru County Logo" class="logo">
                <h1 class="title">Meru County PSB</h1>
            </div>
            <div class="content">
                ${contentHtml}
            </div>
            <div class="footer">
                <p class="signature">— The Meru County PSB team</p>
                <p>This email relates to your Meru County Public Service Board account.<br>
                Need help? Contact <a href="mailto:support@merupsb.go.ke">Support</a>.</p>
            </div>
        </div>
    </div>
</body>
</html>
`

const buildPasswordResetMessage = ({ fullName, otp }: PasswordResetEmailInput) => {
    const subject = 'Your Password Reset Code - Meru County PSB'
    const text = `Hello ${fullName},\n\nYour password reset code is ${otp}. It expires in 10 minutes.\n\nRegards,\nMeru County Public Service Board`
    
    const html = buildBaseEmailHtml(`
        <h2 class="greeting">Hello ${fullName},</h2>
        <p>We received a request to reset your password for your Meru County Public Service Board account. Use the verification code below to proceed:</p>
        <div class="otp">${otp}</div>
        <p>This code is valid for <strong>10 minutes</strong>. For your security, please do not share this code with anyone.</p>
        <p>If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    `)

    return { subject, text, html }
}

const buildRegistrationSuccessMessage = ({ fullName, profileUrl }: RegistrationSuccessMessageInput) => {
    const subject = 'Welcome to Meru County PSB'
    const text = `Hello ${fullName},\n\nYour account has been created successfully. Complete your profile here: ${profileUrl}\n\nRegards,\nMeru County Public Service Board`

    const html = buildBaseEmailHtml(`
        <h2 class="greeting">Hello ${fullName},</h2>
        <p>Your Meru County Public Service Board account has been created successfully. You can now complete your profile and continue with the application process.</p>
        <div style="margin: 32px 0;">
            <a href="${profileUrl}" class="button">Complete Your Profile</a>
        </div>
        <p style="font-size: 13px; color: #6b7280;">If the button above does not open, copy and paste this link into your browser:<br>${profileUrl}</p>
        <p>Keep your login details safe and make sure you complete your profile information to unlock the next steps.</p>
    `)

    return { subject, text, html }
}

const buildApplicationStatusMessage = ({
    fullName,
    vacancyTitle,
    status,
    feedbackToApplicant,
    rejectionReason,
}: Omit<ApplicationStatusEmailInput, 'to'>) => {
    const statusLabel = getApplicationStatusLabel(status)
    const subject = `Application Update: ${vacancyTitle} - ${statusLabel}`

    const messageLines = [
        `Hello ${fullName},`,
        '',
        `Your application for ${vacancyTitle} has been updated to ${statusLabel}.`,
    ]

    let guidance = ''
    if (statusLabel === 'Not Successful') {
        guidance = 'We appreciate the time and effort you invested in your application. Although you were not selected for this position, we encourage you to apply for future openings that match your qualifications.'
    } else if (statusLabel === 'Interview Scheduled') {
        guidance = 'Your interview has been scheduled. Please check the portal or mobile app for your interview date, time, venue, or virtual meeting link, and review the interview preparation guide.'
    } else if (statusLabel === 'Accepted') {
        guidance = 'Congratulations! Your application has been accepted. Please log in to the portal or open the mobile application to view the next steps and any required documentation.'
    } else {
        guidance = 'Your application is progressing through our recruitment pipeline. Please log in to the portal or open the mobile application to view detailed instructions or verify required documents.'
    }

    messageLines.push('', guidance)
    if (feedbackToApplicant) messageLines.push('', `Feedback: ${feedbackToApplicant}`)
    if (rejectionReason && statusLabel === 'Not Successful') messageLines.push('', `Reason: ${rejectionReason}`)
    messageLines.push('', 'Regards,', 'Meru County Public Service Board')

    const text = messageLines.join('\n')

    const html = buildBaseEmailHtml(`
        <h2 class="greeting">Hello ${fullName},</h2>
        <p>An update has been made to your application for <strong>${vacancyTitle}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <p style="margin-bottom: 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Current Status</p>
            <p style="font-size: 24px; font-weight: 800; color: ${PRIMARY_COLOR}; margin: 0;">${statusLabel}</p>
        </div>

        <p>${guidance}</p>

        ${feedbackToApplicant ? `
            <div style="margin-top: 24px; padding: 20px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; font-weight: 600; color: #92400e;">HR Feedback</p>
                <p style="margin: 8px 0 0; color: #b45309;">${feedbackToApplicant}</p>
            </div>
        ` : ''}

        ${rejectionReason && statusLabel === 'Not Successful' ? `
            <div style="margin-top: 24px; padding: 20px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <p style="margin: 0; font-weight: 600; color: #991b1b;">Reason</p>
                <p style="margin: 8px 0 0; color: #b91c1c;">${rejectionReason}</p>
            </div>
        ` : ''}
    `)

    return { subject, text, html }
}

const buildTwoFactorMessage = ({ fullName, otp }: PasswordResetEmailInput) => {
    const subject = 'Your Login Verification Code - Meru County PSB'
    const text = `Hello ${fullName},\n\nYour verification code is ${otp}. It expires in 5 minutes.\n\nRegards,\nMeru County Public Service Board`

    const html = buildBaseEmailHtml(`
        <h2 class="greeting">Hello ${fullName},</h2>
        <p>You are attempting to sign in to your Meru County PSB account. Use the following verification code to verify your identity:</p>
        <div class="otp">${otp}</div>
        <p>This code is valid for <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
        <p>If you did not attempt this sign in, please secure your account immediately.</p>
    `)

    return { subject, text, html }
}

const buildLoginOtpMessage = ({ fullName, otp }: PasswordResetEmailInput) => {
    const subject = 'Your Login Code - Meru County PSB'
    const text = `Hello ${fullName},\n\nYour login verification code is ${otp}. It expires in 5 minutes.\n\nRegards,\nMeru County Public Service Board`

    const html = buildBaseEmailHtml(`
        <h2 class="greeting">Hello ${fullName},</h2>
        <p>You requested a code to sign in to your Meru County PSB account. Use the following verification code to proceed:</p>
        <div class="otp">${otp}</div>
        <p>This code is valid for <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
        <p>If you did not request this code, you can safely ignore this email.</p>
    `)

    return { subject, text, html }
}

const buildUnlockAccountMessage = ({ fullName, unlockUrl }: { fullName: string; unlockUrl: string }) => {
    const subject = 'Account Locked - Meru County PSB'
    const text = `Hello ${fullName},\n\nYour account has been locked due to multiple failed login attempts. To unlock your account, please click the link below:\n\n${unlockUrl}\n\nRegards,\nMeru County Public Service Board`

    const html = buildBaseEmailHtml(`
        <h2 class="greeting">Hello ${fullName},</h2>
        <p>Your account has been temporarily locked due to multiple failed login attempts. To restore access, please click the button below:</p>
        <div style="margin: 32px 0;">
            <a href="${unlockUrl}" class="button">Unlock Account</a>
        </div>
        <p>If you did not attempt these logins, please secure your account by resetting your password once unlocked.</p>
    `)

    return { subject, text, html }
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

export const sendPasswordResetOtpEmail = async ({ to, fullName, otp }: PasswordResetEmailInput) => {
    console.log(`[Mailer] Attempting to send password reset email to: ${to}`)
    const { subject, text, html } = buildPasswordResetMessage({ fullName, otp })

    // If using the old webhook method for backward compatibility/legacy support
    const deliveryUrl = process.env.PASSWORD_RESET_EMAIL_WEBHOOK_URL
    if (deliveryUrl) {
        console.log(`[Mailer] Sending via Webhook to: ${deliveryUrl}`)
        const response = await fetch(deliveryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(process.env.PASSWORD_RESET_EMAIL_WEBHOOK_TOKEN
                    ? {
                          Authorization: `Bearer ${process.env.PASSWORD_RESET_EMAIL_WEBHOOK_TOKEN}`
                      }
                    : {})
            },
            body: JSON.stringify({ to, subject, text, html })
        })

        if (!response.ok) {
            console.error(`[Mailer] Webhook failed with status: ${response.status}`)
            throw new Error('Password reset email delivery failed via webhook')
        }

        console.log(`[Mailer] Webhook delivery successful`)
        return
    }

    // Try SMTP delivery if configured
    if (process.env.SMTP_HOST) {
        console.log(`[Mailer] Sending via SMTP: ${process.env.SMTP_HOST} as ${process.env.SMTP_USER}`)
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Meru County PSB" <noreply@merupsb.go.ke>',
                to,
                subject,
                text,
                html
            })
            console.log(`[Mailer] SMTP delivery successful to: ${to}`)
            return
        } catch (error: any) {
            console.error('[Mailer] SMTP email delivery failed!')
            console.error('[Mailer] Error code:', error.code)
            console.error('[Mailer] Error message:', error.message)
            
            if (process.env.NODE_ENV === 'production') {
                throw new Error(`Email delivery failed: ${error.message}`)
            }
            console.warn('[Mailer] Falling back to console log due to SMTP failure')
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        console.info(`[Mailer] Falling back to console log (NODE_ENV=${process.env.NODE_ENV})`)
        console.info(`[password-reset] OTP for ${to}: ${otp}`)
        return
    }

    console.error('[Mailer] No delivery method configured')
    throw new Error('Password reset email delivery is not configured')
}

export const sendTwoFactorOtpEmail = async ({ to, fullName, otp }: PasswordResetEmailInput) => {
    console.log(`[Mailer] Attempting to send 2FA email to: ${to}`)
    const { subject, text, html } = buildTwoFactorMessage({ fullName, otp })

    if (process.env.SMTP_HOST) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Meru County PSB" <noreply@merupsb.go.ke>',
                to,
                subject,
                text,
                html
            })
            console.log(`[Mailer] SMTP 2FA delivery successful to: ${to}`)
            return
        } catch (error: any) {
            console.error('[Mailer] SMTP 2FA delivery failed:', error.message)
            console.error('[Mailer] Error code:', error.code)
            if (process.env.NODE_ENV === 'production') {
                throw new Error(`Verification email delivery failed: ${error.message}`)
            }
            console.warn('[Mailer] Falling back to console log for 2FA due to SMTP failure')
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        console.info(`[2fa-verification] OTP for ${to}: ${otp}`)
        return
    }

    throw new Error('Verification email delivery is not configured')
}

export const sendApplicationStatusEmail = async ({ to, fullName, vacancyTitle, status, feedbackToApplicant, rejectionReason }: ApplicationStatusEmailInput) => {
    console.log(`[Mailer] Attempting to send application status email to: ${to}`)
    const { subject, text, html } = buildApplicationStatusMessage({
        fullName,
        vacancyTitle,
        status,
        feedbackToApplicant,
        rejectionReason,
    })

    if (process.env.SMTP_HOST) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Meru County PSB" <noreply@merupsb.go.ke>',
                to,
                subject,
                text,
                html
            })
            console.log(`[Mailer] Application status email sent to: ${to}`)
            return { success: true }
        } catch (error: any) {
            console.error('[Mailer] Application status email delivery failed:', error.message)
            if (process.env.NODE_ENV === 'production') {
                throw new Error(`Application status email delivery failed: ${error.message}`)
            }
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        console.info(`[application-status] Email to ${to}: ${subject}`)
        return { success: true }
    }

    throw new Error('Application status email delivery is not configured')
}

export const sendLoginOtpEmail = async ({ to, fullName, otp }: PasswordResetEmailInput) => {
    console.log(`[Mailer] Attempting to send login OTP email to: ${to}`)
    const { subject, text, html } = buildLoginOtpMessage({ fullName, otp })

    if (process.env.SMTP_HOST) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Meru County PSB" <noreply@merupsb.go.ke>',
                to,
                subject,
                text,
                html
            })
            console.log(`[Mailer] SMTP login OTP delivery successful to: ${to}`)
            return
        } catch (error: any) {
            console.error('[Mailer] SMTP login OTP delivery failed:', error.message)
            console.error('[Mailer] Error code:', error.code)
            if (process.env.NODE_ENV === 'production') {
                throw new Error(`Login email delivery failed: ${error.message}`)
            }
            console.warn('[Mailer] Falling back to console log for login OTP due to SMTP failure')
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        console.info(`[login-otp] OTP for ${to}: ${otp}`)
        return
    }

    throw new Error('Login verification email delivery is not configured')
}

export const sendUnlockAccountEmail = async ({ to, fullName, unlockUrl }: { to: string; fullName: string; unlockUrl: string }) => {
    console.log(`[Mailer] Attempting to send unlock email to: ${to}`)
    const { subject, text, html } = buildUnlockAccountMessage({ fullName, unlockUrl })

    if (process.env.SMTP_HOST) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Meru County PSB" <noreply@merupsb.go.ke>',
                to,
                subject,
                text,
                html
            })
            console.log(`[Mailer] SMTP unlock delivery successful to: ${to}`)
            return
        } catch (error: any) {
            console.error('[Mailer] SMTP unlock delivery failed:', error.message)
            if (process.env.NODE_ENV === 'production') {
                throw new Error(`Unlock email delivery failed: ${error.message}`)
            }
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        console.info(`[unlock-account] Link for ${to}: ${unlockUrl}`)
        return
    }

    throw new Error('Unlock email delivery is not configured')
}

export const sendRegistrationSuccessEmail = async ({ to, fullName, profileUrl }: RegistrationSuccessEmailInput) => {
    console.log(`[Mailer] Attempting to send registration success email to: ${to}`)
    const { subject, text, html } = buildRegistrationSuccessMessage({ fullName, profileUrl })

    if (process.env.SMTP_HOST) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Meru County PSB" <noreply@merupsb.go.ke>',
                to,
                subject,
                text,
                html
            })
            console.log(`[Mailer] SMTP registration success delivery successful to: ${to}`)
            return
        } catch (error: any) {
            console.error('[Mailer] SMTP registration success delivery failed:', error.message)
            if (process.env.NODE_ENV === 'production') {
                throw new Error(`Registration success email delivery failed: ${error.message}`)
            }
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        console.info(`[registration-success] Email for ${to}: ${profileUrl}`)
        return
    }

    throw new Error('Registration success email delivery is not configured')
}