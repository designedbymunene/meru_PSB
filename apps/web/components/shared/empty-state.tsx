import { FileIcon } from 'lucide-react'

interface EmptyStateProps {
    title: string
    description?: string
    icon?: React.ElementType
}

export function EmptyState({ title, description, icon: Icon = FileIcon }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20 min-h-[300px]">
            <div className="p-4 bg-muted rounded-full">
                <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            {description && (
                <p className="mt-2 text-muted-foreground max-w-sm">
                    {description}
                </p>
            )}
        </div>
    )
}
