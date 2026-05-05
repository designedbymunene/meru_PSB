'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface UnifiedCardProps {
  title: ReactNode
  subtitle?: ReactNode
  metadata?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  badge?: ReactNode
  icon?: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  variant?: 'default' | 'hover-actions' | 'inline-actions'
  headerClassName?: string
  contentClassName?: string
  actionsClassName?: string
}

/**
 * UnifiedCard - Standard card component for consistent styling
 *
 * Features:
 * - Modern gradient background (light/dark modes)
 * - Flexible layout with title, subtitle, metadata
 * - Icon support with background container
 * - Badge/status indicators
 * - Action buttons with hover or inline placement
 * - Clickable states for navigation
 *
 * @example
 * ```tsx
 * <UnifiedCard
 *   title="Software Engineer"
 *   subtitle="Engineering"
 *   badge={<StatusBadge status="applied" />}
 *   metadata={
 *     <div className="flex items-center gap-2">
 *       <Calendar className="h-3.5 w-3.5" />
 *       <span>Applied: May 5, 2024</span>
 *     </div>
 *   }
 *   icon={<Code className="h-5 w-5 text-primary" />}
 *   actions={<Button>View</Button>}
 *   variant="hover-actions"
 *   onClick={() => router.push('/applications/123')}
 * />
 * ```
 */
export function UnifiedCard({
  title,
  subtitle,
  metadata,
  children,
  actions,
  badge,
  icon,
  href,
  onClick,
  className,
  variant = 'default',
  headerClassName,
  contentClassName,
  actionsClassName,
}: UnifiedCardProps) {
  const isClickable = href || onClick

  return (
    <Card
      className={cn(
        'group relative transition-all duration-200',
        'bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900',
        'border border-slate-200 dark:border-slate-700/50',
        'shadow-sm hover:shadow-lg',
        isClickable && 'hover:border-primary/40 cursor-pointer',
        className
      )}
      {...(onClick && { onClick })}
    >
      {/* Header Section */}
      <CardHeader className={cn('pb-3', headerClassName)}>
        <div className="flex items-start justify-between gap-4">
          {/* Title + Subtitle + Icon */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {icon && (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Badge - Always visible on top right */}
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
      </CardHeader>

      {/* Content Section */}
      {(metadata || children) && (
        <CardContent className={cn('space-y-3', contentClassName)}>
          {metadata && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {metadata}
            </div>
          )}
          {children && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {children}
            </div>
          )}
        </CardContent>
      )}

      {/* Hover Actions - Only show on desktop with variant */}
      {actions && variant === 'hover-actions' && (
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {actions}
        </div>
      )}

      {/* Inline Actions - Always visible */}
      {actions && variant === 'inline-actions' && (
        <div
          className={cn(
            'px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2',
            actionsClassName
          )}
        >
          {actions}
        </div>
      )}
    </Card>
  )
}
