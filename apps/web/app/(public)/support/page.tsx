import React from 'react';
import { Mail, MapPin, Phone, Clock, MessageSquare, ExternalLink } from 'lucide-react';

export const metadata = {
    title: 'Support & Help | Meru County Public Service Board',
    description: 'Contact information and support resources for the Meru County Public Service Board recruitment portal.',
};

export default function SupportPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                    How can we help?
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Our support team is dedicated to assisting you with your recruitment journey and ensuring a seamless experience on our portal.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <ContactCard 
                    icon={<Phone className="h-6 w-6 text-primary" />}
                    title="Call Support"
                    description="Speak directly with our recruitment officers for urgent inquiries."
                    value="+254 776 733 322"
                    href="tel:+254776733322"
                />
                <ContactCard 
                    icon={<Mail className="h-6 w-6 text-primary" />}
                    title="Email Us"
                    description="For technical issues or detailed queries. Average response: 24h."
                    value="adminmerucpsb@meru.go.ke"
                    href="mailto:adminmerucpsb@meru.go.ke"
                />
                <ContactCard 
                    icon={<MapPin className="h-6 w-6 text-primary" />}
                    title="Visit Our Office"
                    description="Meru County Headquarters, County Public Service Board Office."
                    value="Meru Town, Kenya"
                    href="https://www.google.com/maps?q=Meru+County+Headquarters"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-card rounded-2xl p-8 border shadow-sm">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        Operating Hours
                    </h2>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">Monday - Friday</span>
                            <span className="text-muted-foreground">8:00 AM – 5:00 PM</span>
                        </li>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">Saturday - Sunday</span>
                            <span className="text-red-500 font-medium">Closed</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="font-medium">Public Holidays</span>
                            <span className="text-red-500 font-medium">Closed</span>
                        </li>
                    </ul>
                    <p className="mt-6 text-sm text-muted-foreground italic">
                        * All times are in East Africa Time (EAT).
                    </p>
                </div>

                <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        <FaqItem 
                            question="How do I reset my password?"
                            answer="Go to the login page and click 'Forgot Password'. Follow the instructions sent to your registered email address."
                        />
                        <FaqItem 
                            question="What do I do if my certificates are not uploading?"
                            answer="Ensure your files are in PDF or JPEG format and do not exceed 2MB per file. Clear your browser cache if the issue persists."
                        />
                        <FaqItem 
                            question="Can I apply for multiple positions?"
                            answer="Yes, you can apply for any vacancy for which you meet the requirements, but you must submit a separate application for each."
                        />
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center">
                <p className="text-muted-foreground mb-4">Looking for official county information?</p>
                <a 
                    href="https://meru.go.ke" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-bold text-primary hover:underline"
                >
                    Visit Meru County Official Website
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}

function ContactCard({ icon, title, description, value, href }: { icon: any, title: string, description: string, value: string, href: string }) {
    return (
        <a href={href} className="group p-8 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all">
            <div className="mb-4">{icon}</div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            <p className="font-semibold text-primary group-hover:underline">{value}</p>
        </a>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div>
            <h4 className="font-bold text-foreground mb-1">{question}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </div>
    );
}
