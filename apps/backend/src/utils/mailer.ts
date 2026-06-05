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

const buildPasswordResetMessage = ({ fullName, otp }: Omit<PasswordResetEmailInput, 'to'>) => {
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

const buildTwoFactorMessage = ({ fullName, otp }: Omit<PasswordResetEmailInput, 'to'>) => {
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

const buildLoginOtpMessage = ({ fullName, otp }: Omit<PasswordResetEmailInput, 'to'>) => {
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

import { getSmtpConfig } from './env'
import { logger } from './logger'

let transporter: nodemailer.Transporter | null = null

const getTransporter = () => {
    if (transporter) return transporter
    const config = getSmtpConfig()
    if (!config.SMTP_HOST) return null
    transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE,
        auth: config.SMTP_USER && config.SMTP_PASS ? {
            user: config.SMTP_USER,
            pass: config.SMTP_PASS
        } : undefined
    })
    return transporter
}

const sendEmail = async ({
    to,
    subject,
    text,
    html,
    webhookUrl,
    webhookToken,
    consoleFallbackLabel
}: {
    to: string
    subject: string
    text: string
    html: string
    webhookUrl?: string
    webhookToken?: string
    consoleFallbackLabel: string
}) => {
    logger.info({ to, subject }, `[Mailer] Sending ${consoleFallbackLabel} email`)
    
    // Check webhook delivery
    if (webhookUrl) {
        logger.info({ webhookUrl }, '[Mailer] Sending via Webhook')
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(webhookToken ? { Authorization: `Bearer ${webhookToken}` } : {})
            },
            body: JSON.stringify({ to, subject, text, html })
        })

        if (!response.ok) {
            logger.error({ status: response.status }, '[Mailer] Webhook delivery failed')
            throw new Error(`Email delivery failed via webhook with status ${response.status}`)
        }

        logger.info('[Mailer] Webhook delivery successful')
        return { success: true }
    }

    // Try SMTP delivery
    const transport = getTransporter()
    if (transport) {
        const config = getSmtpConfig()
        logger.info({ host: config.SMTP_HOST }, '[Mailer] Sending via SMTP')
        try {
            await transport.sendMail({
                from: config.SMTP_FROM,
                to,
                subject,
                text,
                html
            })
            logger.info({ to }, '[Mailer] SMTP delivery successful')
            return { success: true }
        } catch (error: any) {
            logger.error({ err: error }, '[Mailer] SMTP delivery failed')
            if (process.env.NODE_ENV === 'production') {
                throw new Error(`Email delivery failed: ${error.message}`)
            }
            logger.warn('[Mailer] Falling back to console log due to SMTP failure')
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        logger.info(`[Mailer] Console fallback for ${consoleFallbackLabel} to ${to}`)
        return { success: true }
    }

    logger.error('[Mailer] No email delivery method configured')
    throw new Error('Email delivery is not configured')
}

export const sendPasswordResetOtpEmail = async ({ to, fullName, otp }: PasswordResetEmailInput) => {
    const { subject, text, html } = buildPasswordResetMessage({ fullName, otp })
    return sendEmail({
        to,
        subject,
        text,
        html,
        webhookUrl: process.env.PASSWORD_RESET_EMAIL_WEBHOOK_URL,
        webhookToken: process.env.PASSWORD_RESET_EMAIL_WEBHOOK_TOKEN,
        consoleFallbackLabel: 'password-reset'
    })
}

export const sendTwoFactorOtpEmail = async ({ to, fullName, otp }: PasswordResetEmailInput) => {
    const { subject, text, html } = buildTwoFactorMessage({ fullName, otp })
    return sendEmail({
        to,
        subject,
        text,
        html,
        consoleFallbackLabel: '2fa-verification'
    })
}

export const sendApplicationStatusEmail = async ({ to, fullName, vacancyTitle, status, feedbackToApplicant, rejectionReason }: ApplicationStatusEmailInput) => {
    const { subject, text, html } = buildApplicationStatusMessage({
        fullName,
        vacancyTitle,
        status,
        feedbackToApplicant,
        rejectionReason,
    })
    return sendEmail({
        to,
        subject,
        text,
        html,
        consoleFallbackLabel: 'application-status'
    })
}

export const sendLoginOtpEmail = async ({ to, fullName, otp }: PasswordResetEmailInput) => {
    const { subject, text, html } = buildLoginOtpMessage({ fullName, otp })
    return sendEmail({
        to,
        subject,
        text,
        html,
        consoleFallbackLabel: 'login-otp'
    })
}

export const sendUnlockAccountEmail = async ({ to, fullName, unlockUrl }: { to: string; fullName: string; unlockUrl: string }) => {
    const { subject, text, html } = buildUnlockAccountMessage({ fullName, unlockUrl })
    return sendEmail({
        to,
        subject,
        text,
        html,
        consoleFallbackLabel: 'unlock-account'
    })
}

export const sendRegistrationSuccessEmail = async ({ to, fullName, profileUrl }: RegistrationSuccessEmailInput) => {
    const { subject, text, html } = buildRegistrationSuccessMessage({ fullName, profileUrl })
    return sendEmail({
        to,
        subject,
        text,
        html,
        consoleFallbackLabel: 'registration-success'
    })
}

export const sendAccountDeletionOtpEmail = async ({ to, fullName, otp }: PasswordResetEmailInput) => {
    const subject = 'Confirm Account Deletion - Meru County PSB'
    const text = `Hello ${fullName},\n\nYou requested to delete your Meru County PSB account and associated data. Your verification code is ${otp}. It expires in 10 minutes.\n\nRegards,\nMeru County Public Service Board`
    
    const html = buildBaseEmailHtml(`
        <h2 class="greeting">Hello ${fullName},</h2>
        <p>We received a request to permanently delete your Meru County PSB account and all associated personal data.</p>
        <p>To proceed, please enter the verification code below on the account deletion page:</p>
        <div class="otp">${otp}</div>
        <p>This code is valid for <strong>10 minutes</strong>. For your security, do not share this code with anyone.</p>
        <p><strong>Warning:</strong> Account deletion is permanent and cannot be undone. Once deleted, you will lose access to all your applications and profiles.</p>
        <p>If you did not request this account deletion, you can safely ignore this email and secure your account.</p>
    `)

    return sendEmail({
        to,
        subject,
        text,
        html,
        consoleFallbackLabel: 'account-deletion-otp'
    })
}