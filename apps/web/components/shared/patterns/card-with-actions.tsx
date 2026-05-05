'use client'

import { useState } from 'react'
import { UnifiedCard, UnifiedCardProps } from '@/components/shared/cards/unified-card'
import { ResponsiveDialog } from '@/components/shared/responsive-dialog/responsive-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CardAction {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: 'default' | 'destructive' | 'secondary'
  disabled?: boolean
}

export interface CardWithActionsProps
  extends Omit<UnifiedCardProps, 'actions'> {
  primaryAction?: CardAction
  secondaryActions?: CardAction[]
  dialogContent?: {
    title: string
    description?: string
    render: (onClose: () => void) => React.ReactNode
  }
  actionPlacement?: 'hover' | 'inline' | 'dialog'
}

/**
 * CardWithActions - Composite pattern combining UnifiedCard with action patterns
 *
 * Supports three action placement strategies:
 * - 'hover': Actions appear on hover (desktop-friendly)
 * - 'inline': Actions always visible below card
 * - 'dialog': Primary action opens a responsive dialog
 *
 * @example
 * ```tsx
 * <CardWithActions
 *   title="Software Engineer"
 *   primaryAction={{
 *     label: "View",
 *     icon: <Eye />,
 *     onClick: () => handleView()
 *   }}
 *   secondaryActions={[
 *     {
 *       label: "Edit",
 *       icon: <Edit />,
 *       onClick: () => handleEdit()
 *     }
 *   ]}
 *   actionPlacement="hover"
 *   dialogContent={{
 *     title: "Edit Application",
 *     render: (onClose) => <EditForm onClose={onClose} />
 *   }}
 * />
 * ```
 */
export function CardWithActions({
  primaryAction,
  secondaryActions,
  dialogContent,
  actionPlacement = 'hover',
  ...cardProps
}: CardWithActionsProps) {
  const [open, setOpen] = useState(false)

  const handlePrimaryAction = () => {
    if (dialogContent) {
      setOpen(true)
    } else if (primaryAction?.onClick) {
      primaryAction.onClick()
    }
  }

  const renderActions = () => {
    if (!primaryAction && !secondaryActions) return null

    return (
      <div className="flex gap-1">
        {primaryAction && (
          <Button
            size="sm"
            variant={primaryAction.variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handlePrimaryAction}
            disabled={primaryAction.disabled}
            className={cn(
              'h-8 w-8 rounded-lg hover:bg-primary/10',
              primaryAction.variant === 'destructive' && 'bg-transparent text-destructive hover:bg-destructive/10'
            )}
            title={primaryAction.label}
          >
            {primaryAction.icon || primaryAction.label}
          </Button>
        )}
        {secondaryActions?.map((action, idx) => (
          <Button
            key={idx}
            size="sm"
            variant={action.variant === 'destructive' ? 'ghost' : 'ghost'}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              'h-8 w-8 rounded-lg',
              action.variant === 'destructive' && 'text-destructive hover:bg-destructive/10'
            )}
            title={action.label}
          >
            {action.icon || action.label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <>
      <UnifiedCard
        {...cardProps}
        variant={actionPlacement === 'hover' ? 'hover-actions' : actionPlacement === 'inline' ? 'inline-actions' : 'default'}
        actions={renderActions()}
      />

      {dialogContent && (
        <ResponsiveDialog
          open={open}
          onOpenChange={setOpen}
          title={dialogContent.title}
          description={dialogContent.description}
          mobileLayout="sheet"
        >
          {dialogContent.render(() => setOpen(false))}
        </ResponsiveDialog>
      )}
    </>
  )
}
