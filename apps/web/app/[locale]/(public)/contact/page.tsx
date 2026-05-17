import React from 'react';
import { MailIcon, MapPinIcon, PhoneIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Contact Us | Meru County Public Service Board',
    description: 'Contact the Meru County Public Service Board for recruitment inquiries and support.',
};

export default function ContactPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
                Contact Us
            </h1>

            <div className="space-y-12">
                {/* Introduction */}
                <section>
                    <p className="text-muted-foreground leading-relaxed">
                        We are here to assist you with any questions about job opportunities, applications, or recruitment
                        processes. Please reach out to us through any of the channels below.
                    </p>
                </section>

                {/* Main Contact Information */}
                <section className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Get in Touch</h2>

                        {/* Office Address */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <MapPinIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">Office Address</h3>
                                <p className="text-sm text-muted-foreground">
                                    Meru County Headquarters<br />
                                    P.O. BOX 109-60200<br />
                                    Meru, Kenya
                                </p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <PhoneIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">Phone</h3>
                                <a href="tel:+254776733322" className="text-sm text-primary hover:underline">
                                    +254 776 733 322
                                </a>
                                <p className="text-xs text-muted-foreground mt-1">Mon-Fri: 8:00 AM - 5:00 PM</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <MailIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">Email</h3>
                                <a href="mailto:adminmerucpsb@meru.go.ke" className="text-sm text-primary hover:underline">
                                    adminmerucpsb@meru.go.ke
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Working Hours & Map */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Office Hours</h2>

                        <div className="bg-muted p-6 rounded-lg border">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Monday - Friday</span>
                                    <span className="text-sm text-muted-foreground">8:00 AM - 5:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Saturday</span>
                                    <span className="text-sm text-muted-foreground">9:00 AM - 12:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Sunday</span>
                                    <span className="text-sm text-muted-foreground">Closed</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Public Holidays</span>
                                    <span className="text-sm text-muted-foreground">Closed</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Applications are accepted 24/7 through our online portal.
                                    For urgent matters during office hours, please call us directly.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Button variant="outline" asChild className="justify-start">
                            <a href="/support">FAQ & Help Center</a>
                        </Button>
                        <Button variant="outline" asChild className="justify-start">
                            <a href="/vacancies">View Current Vacancies</a>
                        </Button>
                        <Button variant="outline" asChild className="justify-start">
                            <a href="/register">Create an Account</a>
                        </Button>
                        <Button variant="outline" asChild className="justify-start">
                            <a href="/about">About the Board</a>
                        </Button>
                    </div>
                </section>

                {/* Important Notice */}
                <section className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-6 rounded-lg">
                    <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-2">Important Notice</h3>
                    <p className="text-sm text-amber-800 dark:text-amber-400">
                        <strong>Meru County Public Service Board does not charge any fees</strong> for job applications,
                        shortlisting, interviews, or recruitment services. Beware of individuals or agencies claiming to
                        facilitate recruitment for a fee. All official communications come from our official email domain
                        (@meru.go.ke) and phone numbers listed on this website.
                    </p>
                </section>
            </div>
        </div>
    );
}
