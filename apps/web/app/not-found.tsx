import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
            <div className="space-y-6 max-w-md">
                <div className="flex justify-center">
                    <div className="bg-muted p-6 rounded-full">
                        <FileQuestion className="h-12 w-12 text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
                    <p className="text-muted-foreground text-lg">
                        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                        <Link href="/">
                            Go to Home
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/dashboard">
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
