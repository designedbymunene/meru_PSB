import nodemailer from 'nodemailer'

type PasswordResetEmailInput = {
    to: string
    fullName: string
    otp: string
}

const buildPasswordResetMessage = ({ fullName, otp }: PasswordResetEmailInput) => {
    const subject = 'Your Password Reset Code - Meru County PSB'
    const logoUrl = 'https://recruitment.merucountypublicserviceboard.or.ke/_next/image?url=%2Flogo%2Fmerucountylogo.png&w=96&q=75'
    
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
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0; }
                .wrapper { background-color: #f9fafb; padding: 40px 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .header { background-color: #004aad; padding: 32px; text-align: center; }
                .logo { width: 64px; height: 64px; margin-bottom: 12px; }
                .header-title { color: #ffffff; font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 0.5px; }
                .content { padding: 40px; }
                .greeting { font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px; }
                .description { font-size: 16px; color: #4b5563; margin-bottom: 32px; }
                .otp-container { background-color: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }
                .otp-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
                .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #004aad; font-family: 'Courier New', Courier, monospace; }
                .expiry { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 32px; }
                .warning { font-size: 13px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 24px; margin-top: 8px; }
                .footer { padding: 0 40px 40px; text-align: left; }
                .signature { font-size: 15px; color: #374151; font-weight: 600; margin-bottom: 4px; }
                .org { color: #004aad; font-size: 14px; font-weight: 700; margin: 0; }
                .automated { font-size: 12px; color: #9ca3af; margin-top: 24px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <img src="${logoUrl}" alt="Meru County Logo" class="logo">
                        <h1 class="header-title">Meru County PSB</h1>
                    </div>
                    <div class="content">
                        <h2 class="greeting">Hello ${fullName},</h2>
                        <p class="description">We received a request to reset your password for your Meru County Public Service Board account. Use the following verification code to proceed:</p>
                        <div class="otp-container">
                            <span class="otp-label">Verification Code</span>
                            <span class="otp-code">${otp}</span>
                        </div>
                        <p class="expiry">This code is valid for <strong>10 minutes</strong>. For your security, please do not share this code with anyone.</p>
                        <p class="warning">If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                    </div>
                    <div class="footer">
                        <p class="signature">Regards,</p>
                        <p class="org">Meru County Public Service Board</p>
                        <p class="automated">This is an automated message, please do not reply.</p>
                    </div>
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

const buildTwoFactorMessage = ({ fullName, otp }: PasswordResetEmailInput) => {
    const subject = 'Your Login Verification Code - Meru County PSB'
    const logoUrl = 'https://recruitment.merucountypublicserviceboard.or.ke/_next/image?url=%2Flogo%2Fmerucountylogo.png&w=96&q=75'

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
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0; }
                .wrapper { background-color: #f9fafb; padding: 40px 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .header { background-color: #10b981; padding: 32px; text-align: center; }
                .logo { width: 64px; height: 64px; margin-bottom: 12px; }
                .header-title { color: #ffffff; font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 0.5px; }
                .content { padding: 40px; }
                .greeting { font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px; }
                .description { font-size: 16px; color: #4b5563; margin-bottom: 32px; }
                .otp-container { background-color: #f0fdf4; border: 1px solid #d1fae5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }
                .otp-label { font-size: 12px; font-weight: 600; color: #059669; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
                .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #059669; font-family: 'Courier New', Courier, monospace; }
                .expiry { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 32px; }
                .warning { font-size: 13px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 24px; margin-top: 8px; }
                .footer { padding: 0 40px 40px; text-align: left; }
                .signature { font-size: 15px; color: #374151; font-weight: 600; margin-bottom: 4px; }
                .org { color: #059669; font-size: 14px; font-weight: 700; margin: 0; }
                .automated { font-size: 12px; color: #9ca3af; margin-top: 24px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <img src="${logoUrl}" alt="Meru County Logo" class="logo">
                        <h1 class="header-title">Security Verification</h1>
                    </div>
                    <div class="content">
                        <h2 class="greeting">Hello ${fullName},</h2>
                        <p class="description">You are attempting to sign in to your Meru County PSB account. Use the following verification code to verify your identity:</p>
                        <div class="otp-container">
                            <span class="otp-label">Verification Code</span>
                            <span class="otp-code">${otp}</span>
                        </div>
                        <p class="expiry">This code is valid for <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
                        <p class="warning">If you did not attempt this sign in, please secure your account or contact support if you have concerns.</p>
                    </div>
                    <div class="footer">
                        <p class="signature">Regards,</p>
                        <p class="org">Meru County Public Service Board</p>
                        <p class="automated">This is an automated message, please do not reply.</p>
                    </div>
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

const buildLoginOtpMessage = ({ fullName, otp }: PasswordResetEmailInput) => {
    const subject = 'Your Login Code - Meru County PSB'
    const logoUrl = 'https://recruitment.merucountypublicserviceboard.or.ke/_next/image?url=%2Flogo%2Fmerucountylogo.png&w=96&q=75'

    const text = [
        `Hello ${fullName},`,
        '',
        `Your login verification code is ${otp}.`,
        'It expires in 5 minutes.',
        '',
        'If you did not request this code, you can safely ignore this email.',
        '',
        'Regards,',
        'Meru County Public Service Board'
    ].join('\n')

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0; }
                .wrapper { background-color: #f9fafb; padding: 40px 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .header { background-color: #004aad; padding: 32px; text-align: center; }
                .logo { width: 64px; height: 64px; margin-bottom: 12px; }
                .header-title { color: #ffffff; font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 0.5px; }
                .content { padding: 40px; }
                .greeting { font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px; }
                .description { font-size: 16px; color: #4b5563; margin-bottom: 32px; }
                .otp-container { background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }
                .otp-label { font-size: 12px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
                .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #004aad; font-family: 'Courier New', Courier, monospace; }
                .expiry { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 32px; }
                .footer { padding: 0 40px 40px; text-align: left; }
                .signature { font-size: 15px; color: #374151; font-weight: 600; margin-bottom: 4px; }
                .org { color: #004aad; font-size: 14px; font-weight: 700; margin: 0; }
                .automated { font-size: 12px; color: #9ca3af; margin-top: 24px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <img src="${logoUrl}" alt="Meru County Logo" class="logo">
                        <h1 class="header-title">Login Verification</h1>
                    </div>
                    <div class="content">
                        <h2 class="greeting">Hello ${fullName},</h2>
                        <p class="description">You requested a code to sign in to your Meru County PSB account. Use the following verification code to proceed:</p>
                        <div class="otp-container">
                            <span class="otp-label">Verification Code</span>
                            <span class="otp-code">${otp}</span>
                        </div>
                        <p class="expiry">This code is valid for <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
                    </div>
                    <div class="footer">
                        <p class="signature">Regards,</p>
                        <p class="org">Meru County Public Service Board</p>
                        <p class="automated">This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `

    return { subject, text, html }
}

export const sendLoginOtpEmail = async ({ to, fullName, otp }: PasswordResetEmailInput) => {
    console.log(`[Mailer] Attempting to send login OTP email to: ${to}`)
    const { subject, text, html } = buildLoginOtpMessage({ to, fullName, otp })

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

const buildUnlockAccountMessage = ({ fullName, unlockUrl }: { fullName: string; unlockUrl: string }) => {
    const subject = 'Account Locked - Meru County PSB'
    const logoUrl = 'https://recruitment.merucountypublicserviceboard.or.ke/_next/image?url=%2Flogo%2Fmerucountylogo.png&w=96&q=75'

    const text = [
        `Hello ${fullName},`,
        '',
        'Your Meru County PSB account has been locked due to multiple failed login attempts.',
        'To unlock your account, please click the link below:',
        '',
        unlockUrl,
        '',
        'If you did not attempt to log in, please consider changing your password.',
        '',
        'Regards,',
        'Meru County Public Service Board'
    ].join('\n')

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0; }
                .wrapper { background-color: #f9fafb; padding: 40px 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .header { background-color: #dc2626; padding: 32px; text-align: center; }
                .logo { width: 64px; height: 64px; margin-bottom: 12px; }
                .header-title { color: #ffffff; font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 0.5px; }
                .content { padding: 40px; }
                .greeting { font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px; }
                .description { font-size: 16px; color: #4b5563; margin-bottom: 32px; }
                .button-container { text-align: center; margin-bottom: 32px; }
                .button { background-color: #004aad; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; }
                .warning { font-size: 13px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 24px; margin-top: 8px; }
                .footer { padding: 0 40px 40px; text-align: left; }
                .signature { font-size: 15px; color: #374151; font-weight: 600; margin-bottom: 4px; }
                .org { color: #004aad; font-size: 14px; font-weight: 700; margin: 0; }
                .automated { font-size: 12px; color: #9ca3af; margin-top: 24px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <img src="${logoUrl}" alt="Meru County Logo" class="logo">
                        <h1 class="header-title">Security Alert</h1>
                    </div>
                    <div class="content">
                        <h2 class="greeting">Hello ${fullName},</h2>
                        <p class="description">Your account has been temporarily locked due to 5 consecutive failed login attempts. To restore access, please click the button below:</p>
                        <div class="button-container">
                            <a href="${unlockUrl}" class="button">Unlock Account</a>
                        </div>
                        <p class="warning">If you did not attempt these logins, please secure your account by resetting your password once unlocked.</p>
                    </div>
                    <div class="footer">
                        <p class="signature">Regards,</p>
                        <p class="org">Meru County Public Service Board</p>
                        <p class="automated">This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `

    return { subject, text, html }
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