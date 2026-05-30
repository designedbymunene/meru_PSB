import { render, screen, waitFor } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AnalyticsProvider } from '@/providers/analytics-provider'
import * as analyticsLib from '@/lib/analytics'

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
}))

// Mock analytics library
vi.mock('@/lib/analytics', () => ({
    initializeGA: vi.fn(),
    trackPageView: vi.fn(),
}))

describe('AnalyticsProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('initializes GA4 when measurement ID is provided', () => {
        vi.mocked(usePathname).mockReturnValue('/')

        render(
            <AnalyticsProvider measurementId="G-TEST123">
                <div>Test content</div>
            </AnalyticsProvider>
        )

        expect(analyticsLib.initializeGA).toHaveBeenCalledWith('G-TEST123')
    })

    it('does not initialize GA4 when measurement ID is not provided', () => {
        vi.mocked(usePathname).mockReturnValue('/')

        render(
            <AnalyticsProvider>
                <div>Test content</div>
            </AnalyticsProvider>
        )

        expect(analyticsLib.initializeGA).not.toHaveBeenCalled()
    })

    it('tracks page view on pathname change', async () => {
        const mockPathname = '/test-page'
        vi.mocked(usePathname).mockReturnValue(mockPathname)

        render(
            <AnalyticsProvider>
                <div>Test content</div>
            </AnalyticsProvider>
        )

        await waitFor(() => {
            expect(analyticsLib.trackPageView).toHaveBeenCalledWith(
                mockPathname,
                expect.any(String)
            )
        })
    })

    it('renders children correctly', () => {
        vi.mocked(usePathname).mockReturnValue('/')

        render(
            <AnalyticsProvider>
                <div data-testid="test-child">Test content</div>
            </AnalyticsProvider>
        )

        expect(screen.getByTestId('test-child')).toBeInTheDocument()
    })

    it('tracks page view when pathname changes', async () => {
        const { rerender } = render(
            <AnalyticsProvider measurementId="G-TEST123">
                <div>Test content</div>
            </AnalyticsProvider>
        )

        vi.mocked(usePathname).mockReturnValue('/new-page')

        rerender(
            <AnalyticsProvider measurementId="G-TEST123">
                <div>Test content</div>
            </AnalyticsProvider>
        )

        await waitFor(() => {
            expect(analyticsLib.trackPageView).toHaveBeenCalled()
        })
    })
})
