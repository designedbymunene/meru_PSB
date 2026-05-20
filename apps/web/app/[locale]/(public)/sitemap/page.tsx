import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Sitemap | Meru County Public Service Board',
    description: 'Sitemap of the Meru County Public Service Board Recruitment Portal.',
};

export default function SitemapPage() {
    const sitemapSections = [
        {
            title: 'Main Navigation',
            links: [
                { href: '/', label: 'Home' },
                { href: '/vacancies', label: 'Job Vacancies' },
                { href: '/login', label: 'Login' },
                { href: '/register', label: 'Create Account' },
            ]
        },
        {
            title: 'Applicant Dashboard',
            links: [
                { href: '/dashboard', label: 'Dashboard Home' },
                { href: '/dashboard/applications', label: 'My Applications' },
                { href: '/dashboard/profile', label: 'My Profile' },
                { href: '/dashboard/settings', label: 'Account Settings' },
                { href: '/dashboard/interviews', label: 'My Interviews' },
            ]
        },
        {
            title: 'Information & Support',
            links: [
                { href: '/about', label: 'About the Board' },
                { href: '/support', label: 'Help & FAQs' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/downloads', label: 'Downloads & Forms' },
            ]
        },
        {
            title: 'Legal & Policies',
            links: [
                { href: '/terms', label: 'Terms of Service' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/accessibility', label: 'Accessibility Statement' },
                { href: '/foia', label: 'Freedom of Information' },
            ]
        },
        {
            title: 'Quick Resources',
            links: [
                { href: '/downloads/shortlist-general.pdf', label: 'General Shortlist (PDF)', external: true },
                { href: '/downloads/shortlist-promotion.pdf', label: 'Promotion Shortlist (PDF)', external: true },
                { href: '/downloads/shortlist-internal-advertisement.pdf', label: 'Internal Advertisement Shortlist (PDF)', external: true },
            ]
        },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                Sitemap
            </h1>
            <p className="text-muted-foreground mb-12">
                Browse all pages and sections of the Meru County Public Service Board Recruitment Portal.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sitemapSections.map((section, index) => (
                    <div key={index} className="bg-muted/30 rounded-lg p-6">
                        <h2 className="font-bold text-lg mb-4 text-foreground">{section.title}</h2>
                        <ul className="space-y-3">
                            {section.links.map((link, linkIndex) => (
                                <li key={linkIndex}>
                                    {(link as any).external ? (
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Additional Information */}
            <div className="mt-12 bg-primary/10 p-6 rounded-lg border border-primary/20">
                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    If you cannot find what you are looking for, please contact our support team.
                </p>
                <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> adminmerucpsb@meru.go.ke</p>
                    <p><strong>Phone:</strong> +254 776 733 322</p>
                    <p>
                        <Link href="/contact" className="text-primary hover:underline">
                            Visit Contact Page →
                        </Link>
                    </p>
                </div>
            </div>

            {/* Technical Note */}
            <div className="mt-8 text-center">
                <p className="text-xs text-muted-foreground">
                    XML Sitemap available at{' '}
                    <Link href="/sitemap.xml" className="text-primary hover:underline">
                        /sitemap.xml
                    </Link>
                    {' '}for search engines
                </p>
            </div>
        </div>
    );
}
