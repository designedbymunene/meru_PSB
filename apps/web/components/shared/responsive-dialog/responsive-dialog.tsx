'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  mobileLayout?: 'sheet' | 'modal'
  contentClassName?: string
}

/**
 * ResponsiveDialog - Switches between Sheet (mobile) and Modal (desktop)
 * 
 * Desktop (≥768px): Shows as centered modal
 * Mobile (<768px): Shows as bottom sheet
 * 
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 * 
 * <ResponsiveDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Apply for Job"
 *   description="Fill out the application form"
 * >
 *   <ApplicationForm onClose={() => setOpen(false)} />
 * </ResponsiveDialog>
 * ```
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = 'max-w-2xl',
  mobileLayout = 'sheet',
  contentClassName = 'max-h-[70vh] overflow-y-auto',
}: ResponsiveDialogProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!mounted) return null

  // Mobile: Bottom Sheet
  if (isMobile && mobileLayout === 'sheet') {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[90vh] rounded-t-2xl flex flex-col"
        >
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl">{title}</SheetTitle>
            {description && (
              <SheetDescription className="text-sm text-slate-500">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>
          <div className="overflow-y-auto flex-1 py-6">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Modal Dialog (or mobile if mobileLayout='modal')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className={contentClassName}>{children}</div>
      </DialogContent>
    </Dialog>
  )
}
