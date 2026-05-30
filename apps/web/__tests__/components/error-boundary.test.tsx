import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '@/components/error-boundary'

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console.error to avoid noise in test output
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when a child component throws', () => {
    const ThrowError = () => {
      throw new Error('Test error message')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const fallback = <div>Custom error fallback</div>

    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument()
  })

  it('allows resetting error state with the reset button', async () => {
    const user = userEvent.setup()
    let shouldThrow = true

    const ConditionalError = () => {
      if (shouldThrow) {
        throw new Error('Conditional error')
      }
      return <div>Success</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Simulate fixing the underlying issue
    shouldThrow = false
    const resetButton = screen.getByRole('button', { name: /try again/i })
    await user.click(resetButton)

    rerender(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('has accessible reset button', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const resetButton = screen.getByRole('button', { name: /try again/i })
    expect(resetButton).toBeInTheDocument()
    expect(resetButton).toHaveAccessibleName()
  })
})
