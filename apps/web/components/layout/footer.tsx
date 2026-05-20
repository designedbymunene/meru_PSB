"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MailIcon, MapPinIcon, PhoneIcon, ArrowUp } from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { cn } from "@/lib/utils"

export function Footer() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <>
            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={cn(
                    "fixed bottom-6 right-6 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 transform",
                    isVisible
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                        : "opacity-0 translate-y-4 scale-75 pointer-events-none"
                )}
                aria-label="Back to top"
            >
                <ArrowUp className="h-5 w-5" />
            </button>

            <footer className="border-t border-border bg-slate-50 dark:bg-slate-950" role="contentinfo">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Main Footer */}
                    <div className="py-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Column 1: Official Identity */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Logo size="sm" variant="icon" />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-base">County Government of Meru</span>
                                        <span className="text-xs text-muted-foreground">Public Service Board</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    An official website of the Meru County Government.
                                    Recruitment and career opportunities for public service.
                                </p>
                                <div className="pt-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded">
                                        <span className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full"></span>
                                        <span className="text-xs font-medium text-green-800 dark:text-green-300">Official Government Website</span>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Services */}
                            <div>
                                <h3 className="font-semibold text-sm mb-4 text-foreground">Services</h3>
                                <ul className="space-y-2.5 text-sm">
                                    <li>
                                        <Link href="/vacancies" className="text-muted-foreground hover:text-primary hover:underline">
                                            Job Vacancies
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/dashboard/applications" className="text-muted-foreground hover:text-primary hover:underline">
                                            Application Portal
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/login" className="text-muted-foreground hover:text-primary hover:underline">
                                            Staff Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/register" className="text-muted-foreground hover:text-primary hover:underline">
                                            Create Account
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/downloads" className="text-muted-foreground hover:text-primary hover:underline">
                                            Downloads & Forms
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 3: Information */}
                            <div>
                                <h3 className="font-semibold text-sm mb-4 text-foreground">Information</h3>
                                <ul className="space-y-2.5 text-sm">
                                    <li>
                                        <Link href="/support" className="text-muted-foreground hover:text-primary hover:underline">
                                            Help & FAQs
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/about" className="text-muted-foreground hover:text-primary hover:underline">
                                            About the Board
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/accessibility" className="text-muted-foreground hover:text-primary hover:underline">
                                            Accessibility
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 4: Legal & Contact */}
                            <div>
                                <h3 className="font-semibold text-sm mb-4 text-foreground">Legal & Contact</h3>
                                <ul className="space-y-2.5 text-sm">
                                    <li>
                                        <Link href="/terms" className="text-muted-foreground hover:text-primary hover:underline">
                                            Terms of Use
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/privacy" className="text-muted-foreground hover:text-primary hover:underline">
                                            Privacy Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/contact" className="text-muted-foreground hover:text-primary hover:underline">
                                            Contact Information
                                        </Link>
                                    </li>
                                    <li>
                                        <a href="tel:+254776733322" className="text-muted-foreground hover:text-primary hover:underline">
                                            +254 776 733 322
                                        </a>
                                    </li>
                                    <li>
                                        <a href="mailto:adminmerucpsb@meru.go.ke" className="text-muted-foreground hover:text-primary hover:underline">
                                            adminmerucpsb@meru.go.ke
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Footer Bar */}
                    <div className="border-t border-slate-200 dark:border-slate-800 py-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            {/* Official Contact Details */}
                            <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                    <MapPinIcon className="h-3.5 w-3.5" />
                                    <span>Meru County Headquarters, P.O. BOX 109-60200, Meru, Kenya</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PhoneIcon className="h-3.5 w-3.5" />
                                    <span>+254 776 733 322</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MailIcon className="h-3.5 w-3.5" />
                                    <span>adminmerucpsb@meru.go.ke</span>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">Connect with us:</span>
                                <div className="flex gap-3">
                                    <a
                                        href="https://facebook.com/MeruCounty"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                        aria-label="Facebook"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </a>
                                    <a
                                        href="https://twitter.com/MeruCounty"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                        aria-label="Twitter"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </a>
                                    <a
                                        href="https://linkedin.com/company/meru-county"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        aria-label="LinkedIn"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Legal Bar */}
                    <div className="border-t border-slate-200 dark:border-slate-800 py-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
                                <span>&copy; {new Date().getFullYear()} County Government of Meru. All rights reserved.</span>
                                <span className="hidden md:inline">•</span>
                                <span>Meru County Public Service Board</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/accessibility" className="hover:underline">Accessibility Statement</Link>
                                <Link href="/foia" className="hover:underline">Freedom of Information</Link>
                                <Link href="/sitemap" className="hover:underline">Sitemap</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}
