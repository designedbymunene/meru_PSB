'use client'

/**
 * Google Analytics 4 Integration
 * Tracks key recruitment metrics and user flows
 */

interface GAEventParams {
    [key: string]: string | number | boolean
}

/**
 * Initialize Google Analytics 4
 * Should be called once on app load
 */
export function initializeGA(measurementId: string) {
    if (typeof window === 'undefined') return

    // Create script element
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`

    const dataLayer = window.dataLayer ?? (window.dataLayer = [])

    function gtag(
        ...args: [string, string, object?] | [string, object?]
    ) {
        dataLayer.push(arguments)
    }

    window.gtag = gtag
    gtag('js', new Date() as any)
    gtag('config', measurementId)

    // Append script to head
    document.head.appendChild(script)
}

/**
 * Track custom event in GA4
 */
export function trackEvent(eventName: string, params?: GAEventParams) {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', eventName, params)
}

/**
 * Recruitment-specific event tracking
 */

/** Track when user views a job vacancy */
export function trackVacancyViewed(vacancyId: number, title: string) {
    trackEvent('vacancy_viewed', {
        vacancy_id: vacancyId,
        vacancy_title: title,
    })
}

/** Track when user starts application */
export function trackApplicationStarted(vacancyId: number, title: string) {
    trackEvent('application_started', {
        vacancy_id: vacancyId,
        vacancy_title: title,
    })
}

/** Track when user completes and submits application */
export function trackApplicationSubmitted(vacancyId: number, title = '') {
    trackEvent('application_submitted', {
        vacancy_id: vacancyId,
        vacancy_title: title,
    })
}

/** Track application status change */
export function trackApplicationStatusChanged(
    applicationId: number,
    oldStatus: string,
    newStatus: string
) {
    trackEvent('application_status_changed', {
        application_id: applicationId,
        old_status: oldStatus,
        new_status: newStatus,
    })
}

/** Track when user views their application */
export function trackApplicationViewed(applicationId: number) {
    trackEvent('application_viewed', {
        application_id: applicationId,
    })
}

/** Track interview scheduled */
export function trackInterviewScheduled(
    applicationId: number,
    interviewDate: string
) {
    trackEvent('interview_scheduled', {
        application_id: applicationId,
        interview_date: interviewDate,
    })
}

/** Track admin actions */
export function trackAdminAction(action: string, targetType: string, targetId?: number) {
    trackEvent('admin_action', {
        action,
        target_type: targetType,
        ...(targetId && { target_id: targetId }),
    })
}

/** Track shortlisting action */
export function trackShortlistingAction(
    vacancyId: number,
    criteria: string,
    applicantsCount: number
) {
    trackEvent('shortlisting_performed', {
        vacancy_id: vacancyId,
        criteria,
        applicants_count: applicantsCount,
    })
}

/** Track user logout */
export function trackLogout() {
    trackEvent('logout', {
        timestamp: new Date().toISOString(),
    })
}

/** Track form errors */
export function trackFormError(formName: string, errorType: string) {
    trackEvent('form_error', {
        form_name: formName,
        error_type: errorType,
    })
}

/** Track page view (called automatically by GA4 in most cases) */
export function trackPageView(pagePath: string, pageTitle: string) {
    trackEvent('page_view', {
        page_path: pagePath,
        page_title: pageTitle,
    })
}

// Type augmentation for window object
declare global {
    interface Window {
        dataLayer?: any[]
        gtag?: (...args: any[]) => void
    }
}

export default {
    initializeGA,
    trackEvent,
    trackVacancyViewed,
    trackApplicationStarted,
    trackApplicationSubmitted,
    trackApplicationStatusChanged,
    trackApplicationViewed,
    trackInterviewScheduled,
    trackAdminAction,
    trackShortlistingAction,
    trackLogout,
    trackFormError,
    trackPageView,
}
