"use client"

import React from 'react';
import { useDownloads } from '@/hooks/use-downloads';
import { Download, FileText, AlertCircle, Folder } from 'lucide-react';
import type { CategoryWithFiles } from '@/lib/api/downloads';

export default function DownloadsPage() {
    const { data: downloadsData, isLoading, error } = useDownloads(true);
    const downloadCategories = downloadsData?.data || [];

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                Downloads & Resources
            </h1>
            <p className="text-muted-foreground mb-12">
                Access forms, shortlists, guides, and other resources to support your application process.
            </p>

            {isLoading ? (
                <div className="space-y-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-muted/30 rounded-lg p-6 animate-pulse">
                            <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                            <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="h-16 bg-muted rounded"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-lg">
                    <p className="font-medium">Failed to load downloads</p>
                    <p className="text-sm mt-1">Please try again later or contact support.</p>
                </div>
            ) : downloadCategories.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <Folder className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No downloads available</h3>
                    <p className="text-sm text-muted-foreground">
                        Check back later for downloadable resources.
                    </p>
                </div>
            ) : (
                <>
                    {/* Notice */}
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-6 rounded-lg mb-12">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-2">Important Notice</h3>
                                <p className="text-sm text-amber-800 dark:text-amber-400">
                                    All downloads are provided free of charge. If you encounter any issues accessing these files,
                                    please contact us at adminmerucpsb@meru.go.ke or call +254 776 733 322.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Download Categories */}
                    <div className="space-y-8">
                        {downloadCategories.map((category) => (
                            <div key={category.id} className="bg-muted/30 rounded-lg p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{category.title}</h2>
                                        <p className="text-sm text-muted-foreground">{category.description}</p>
                                    </div>
                                </div>

                                {category.files && category.files.length > 0 ? (
                                    <div className="space-y-3">
                                        {category.files.map((file) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-sm">{file.name}</h3>
                                                        <p className="text-xs text-muted-foreground">{file.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className="text-xs font-medium">{file.fileSize}</span>
                                                        <p className="text-xs text-muted-foreground">Updated {file.updatedDate}</p>
                                                    </div>
                                                    <a
                                                        href={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/downloads/files/${file.id}/download`}
                                                        download
                                                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                                        aria-label={`Download ${file.name}`}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No files available in this category yet.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Help Section */}
                    <div className="mt-12 bg-muted p-6 rounded-lg">
                        <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            If you need assistance with downloads or have questions about any documents:
                        </p>
                        <div className="space-y-2 text-sm">
                            <p><strong>Email:</strong> adminmerucpsb@meru.go.ke</p>
                            <p><strong>Phone:</strong> +254 776 733 322</p>
                            <p>
                                <a href="/support" className="text-primary hover:underline">
                                    Visit Help Center →
                                </a>
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
