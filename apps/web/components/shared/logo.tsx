import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'full' | 'short' | 'icon'
    text?: string
    href?: string
    className?: string
}

const sizeMap = {
    sm: { width: 32, height: 32, textSize: 'text-sm' },
    md: { width: 40, height: 40, textSize: 'text-base' },
    lg: { width: 56, height: 56, textSize: 'text-lg' },
    xl: { width: 80, height: 80, textSize: 'text-xl' },
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
    className
}: LogoProps) {
    const { width, height, textSize } = sizeMap[size]
    const displayText = text ?? variantTextMap[variant]

    const logoImage = (
        <Image
            src="/logo/merucountylogo.png"
            alt="Meru County Government"
            width={width}
            height={height}
            className={cn("object-contain", className)}
            priority
        />
    )

    const content = displayText ? (
        <div className="flex items-center gap-2">
            {logoImage}
            <span className={cn("font-bold", textSize)}>
                {displayText}
            </span>
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
