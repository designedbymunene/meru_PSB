import Link from "next/link"
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"
import { Logo } from "@/components/shared/logo"

export function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* About Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Logo size="sm" variant="icon" />
                            <h3 className="font-bold text-lg">Meru County</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The official recruitment portal for Meru County Government.
                            Building a professional workforce committed to serving our community.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/vacancies" className="text-foreground/80 hover:text-foreground transition-colors">
                                    Current Vacancies
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/applications" className="text-foreground/80 hover:text-foreground transition-colors">
                                    My Applications
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-foreground/80 hover:text-foreground transition-colors">
                                    Applicant Login
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-foreground/80 hover:text-foreground transition-colors">
                                    Create Account
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                            Resources
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a
                                    href="/downloads/shortlist-general.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary font-medium hover:underline"
                                >
                                    General Shortlist
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/downloads/shortlist-promotion.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary font-medium hover:underline"
                                >
                                    Promotion Shortlist
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/downloads/shortlist-internal-advertisement.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary font-medium hover:underline"
                                >
                                    Internal Advert Shortlist
                                </a>
                            </li>
                            <li>
                                <Link href="/support" className="text-foreground/80 hover:text-foreground transition-colors">
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="text-foreground/80 hover:text-foreground transition-colors">
                                    Application Guide
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-foreground/80 hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-foreground/80 hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                            Contact Us
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPinIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-foreground/80">
                                    Meru County HQ<br />
                                    P.O. BOX 109-60200, Meru
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <PhoneIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <a href="tel:+254776733322" className="text-foreground/80 hover:text-foreground transition-colors">
                                    +254 776 733 322
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <MailIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <a href="mailto:adminmerucpsb@meru.go.ke" className="text-foreground/80 hover:text-foreground transition-colors">
                                    adminmerucpsb@meru.go.ke
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground text-center md:text-left">
                            &copy; {new Date().getFullYear()} County Government of Meru. All rights reserved.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Meru County Public Service Board - An Equal Opportunity Employer
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
