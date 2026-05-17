import React from 'react';

export const metadata = {
    title: 'Accessibility Statement | Meru County Public Service Board',
    description: 'Accessibility commitment and information for the Meru County Public Service Board Recruitment Portal.',
};

export default function AccessibilityPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
                Accessibility Statement
            </h1>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">Our Commitment</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The Meru County Public Service Board is committed to ensuring digital accessibility for people with disabilities.
                        We are continually improving the user experience for everyone and applying the relevant accessibility standards
                        to ensure we provide an inclusive online environment for all users.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Accessibility Standards</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        We strive to comply with the following accessibility guidelines and standards:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li><strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines</li>
                        <li><strong>Persons with Disabilities Act, 2023:</strong> Kenya's accessibility legislation</li>
                        <li><strong>Constitution of Kenya 2010:</strong> Article 54 on rights of persons with disabilities</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Clear color contrast ratios for text and background</li>
                        <li>Scalable text that can be enlarged up to 200% without loss of content</li>
                        <li>Full keyboard navigation support for all interactive elements</li>
                        <li>Alternative text for images and descriptive link text</li>
                        <li>Proper heading structure for screen reader navigation</li>
                        <li>Skip-to-content links for efficient keyboard navigation</li>
                        <li>Forms with clear labels and error messages</li>
                        <li>Responsive design that works with screen magnification tools</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Technical Specifications</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        Our portal is built to work with the following assistive technologies:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
                        <li>Screen magnification software</li>
                        <li>Speech recognition software</li>
                        <li>Alternative input devices</li>
                        <li>Keyboard-only navigation</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Ongoing Efforts</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We regularly review and test our portal for accessibility compliance. Our team includes accessibility
                        considerations in all new features and improvements. We conduct periodic audits using both automated
                        testing tools and manual testing with users who have disabilities.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Known Limitations</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        While we strive for full accessibility, some third-party content and documents (such as PDF forms)
                        may have limitations. We are working to provide alternative formats where possible and encourage
                        users to contact us if they encounter accessibility barriers.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        If you experience difficulty accessing any content or functionality on our portal, or if you have
                        suggestions for improving accessibility, please contact us:
                    </p>
                    <div className="bg-muted p-6 rounded-lg border">
                        <p className="text-sm text-muted-foreground">
                            <strong>Email:</strong> adminmerucpsb@meru.go.ke<br />
                            <strong>Phone:</strong> +254 776 733 322<br />
                            <strong>Subject Line:</strong> Accessibility Inquiry<br /><br />
                            We will respond to your inquiry within 3 business days and provide alternative access methods
                            when needed.
                        </p>
                    </div>
                </section>

                <div className="bg-primary/10 p-6 rounded-lg mt-8 border border-primary/20">
                    <h3 className="text-lg font-bold mb-2">Equal Opportunity Commitment</h3>
                    <p className="text-sm text-muted-foreground">
                        Meru County Public Service Board is an equal opportunity employer. We encourage applications from
                        qualified individuals with disabilities and provide reasonable accommodations throughout the
                        recruitment process.
                    </p>
                </div>
            </div>
        </div>
    );
}
