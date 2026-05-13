import nodemailer from 'nodemailer'

type PasswordResetEmailInput = {
    to: string
    fullName: string
    otp: string
}

const buildPasswordResetMessage = ({ fullName, otp }: PasswordResetEmailInput) => {
    const subject = 'Your Password Reset Code - Meru County PSB'
    const text = [
        `Hello ${fullName},`,
        '',
        `Your password reset code is ${otp}.`,
        'It expires in 10 minutes.',
        '',
        'If you did not request this reset, you can safely ignore this email.',
        '',
        'Regards,',
        'Meru County Public Service Board'
    ].join('\n')

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
                .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
                .title { color: #1e40af; font-size: 24px; font-weight: bold; margin: 0; }
                .otp-box { background-color: #f3f4f6; border-radius: 6px; padding: 15px; text-align: center; margin: 25px 0; }
                .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb; }
                .footer { margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
                .warning { color: #9da3ae; font-size: 13px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="title">Meru County PSB</h1>
                </div>
                <p>Hello <strong>${fullName}</strong>,</p>
                <p>We received a request to reset your password. Use the following code to proceed:</p>
                <div class="otp-box">
                    <span class="otp-code">${otp}</span>
                </div>
                <p>This code is valid for <strong>10 minutes</strong>. For your security, please do not share this code with anyone.</p>
                <p class="warning">If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
                <div class="footer">
                    <p>Regards,<br><strong>Meru County Public Service Board</strong></p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `

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
    const { subject, text, html } = buildPasswordResetMessage({ to, fullName, otp })

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
            console.error('[Mailer] SMTP email delivery failed:', error.message)
            if (process.env.NODE_ENV === 'production') {
                throw new Error('Password reset email delivery failed via SMTP')
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

const buildTwoFactorMessage = ({ fullName, otp }: PasswordResetEmailInput) => {
    const subject = 'Your Login Verification Code - Meru County PSB'
    const text = [
        `Hello ${fullName},`,
        '',
        `Your verification code is ${otp}.`,
        'It expires in 5 minutes.',
        '',
        'If you did not attempt to sign in, please secure your account immediately.',
        '',
        'Regards,',
        'Meru County Public Service Board'
    ].join('\n')

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
                .header { border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 20px; }
                .title { color: #059669; font-size: 24px; font-weight: bold; margin: 0; }
                .otp-box { background-color: #f0fdf4; border-radius: 6px; padding: 15px; text-align: center; margin: 25px 0; border: 1px solid #d1fae5; }
                .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #059669; }
                .footer { margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
                .warning { color: #9da3ae; font-size: 13px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="title">Security Verification</h1>
                </div>
                <p>Hello <strong>${fullName}</strong>,</p>
                <p>You are attempting to sign in to your Meru County PSB account. Use the following code to verify your identity:</p>
                <div class="otp-box">
                    <span class="otp-code">${otp}</span>
                </div>
                <p>This code is valid for <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
                <p class="warning">If you did not attempt this sign in, please secure your account or contact support if you have concerns.</p>
                <div class="footer">
                    <p>Regards,<br><strong>Meru County Public Service Board</strong></p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `

    return { subject, text, html }
}

export const sendTwoFactorOtpEmail = async ({ to, fullName, otp }: PasswordResetEmailInput) => {
    console.log(`[Mailer] Attempting to send 2FA email to: ${to}`)
    const { subject, text, html } = buildTwoFactorMessage({ to, fullName, otp })

    if (process.env.SMTP_HOST) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Meru County PSB" <noreply@merupsb.go.ke>',
                to,
                subject,
                text,
                html
            })
            return
        } catch (error: any) {
            console.error('[Mailer] SMTP 2FA delivery failed:', error.message)
            if (process.env.NODE_ENV === 'production') {
                throw new Error('Verification email delivery failed')
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