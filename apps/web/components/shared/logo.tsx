import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'full' | 'short' | 'icon'
    text?: string
    href?: string
    className?: string
    showRecruitmentLabel?: boolean
}

const sizeMap = {
    sm: { width: 48, height: 48, textSize: 'text-sm' },
    md: { width: 64, height: 64, textSize: 'text-base' },
    lg: { width: 80, height: 80, textSize: 'text-lg' },
    xl: { width: 120, height: 120, textSize: 'text-xl' },
}

const variantTextMap = {
    full: 'Meru County Government',
    short: 'Meru County',
    icon: null,
}

export function Logo({
    size = 'md',
    variant = 'short',
    text,
    href,
    className,
    showRecruitmentLabel
}: LogoProps) {
    const { width, height, textSize } = sizeMap[size]
    const displayText = text ?? variantTextMap[variant]

    const logoImage = (
        <div className="relative inline-block">
            <Image
                src="/logo/merucountylogo.png"
                alt="Meru County Government"
                width={width}
                height={height}
                className={cn(
                    "object-contain drop-shadow-md",
                    className
                )}
                style={{ width: `${width}px`, height: 'auto' }}
                priority
            />
        </div>
    )

    const content = displayText ? (
        <div className="flex items-center gap-2">
            {logoImage}
            {showRecruitmentLabel ? (
                <div className="flex flex-col items-start justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500/80 dark:text-slate-400/80 leading-none mb-1">
                        Recruitment
                    </span>
                    <span className={cn("font-bold text-slate-900 dark:text-white leading-none", textSize)}>
                        {displayText}
                    </span>
                </div>
            ) : (
                <span className={cn("font-bold text-slate-900 dark:text-white", textSize)}>
                    {displayText}
                </span>
            )}
        </div>
    ) : (
        logoImage
    )

    if (href) {
        return (
            <Link href={href} className="flex items-center">
                {content}
            </Link>
        )
    }

    return content
}
