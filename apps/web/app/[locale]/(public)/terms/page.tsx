import React from 'react';

export const metadata = {
    title: 'Terms of Service | Meru County Public Service Board',
    description: 'Terms and conditions for using the Meru County Public Service Board recruitment portal.',
};

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
                Terms of Service
            </h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        By accessing, registering for, or using the Meru County Public Service Board (MCPSB) Recruitment Portal, 
                        you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
                        If you do not agree, you must immediately cease use of the portal.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">2. Eligibility and Registration</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        This portal is intended for individuals seeking employment within the Meru County Government. 
                        You must provide accurate and truthful information during registration. 
                        You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">3. Accuracy of Information</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Applicants are strictly required to provide authentic documentation. 
                        The provision of false information, forged certificates, or deceptive professional histories is a 
                        serious violation of the <strong>Public Officer Ethics Act</strong> and the <strong>Penal Code</strong> of Kenya. 
                        Such actions will lead to automatic disqualification and potential criminal prosecution.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">4. Prohibited Use</h2>
                    <p className="text-muted-foreground mb-4">
                        You agree not to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Use the portal for any purpose that is unlawful or prohibited by these terms.</li>
                        <li>Attempt to interfere with the proper working of the portal or bypass any security measures.</li>
                        <li>Use automated systems (bots, scrapers) to access the portal without prior authorization.</li>
                        <li>Impersonate any individual or misrepresent your affiliation with any entity.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        All content on this portal, including text, graphics, logos, and software, is the property of the 
                        Meru County Public Service Board and is protected by Kenyan and international copyright and trademark laws.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">6. Limitation of Liability</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The MCPSB provides this portal on an "as is" basis. While we strive to maintain the highest system availability and data accuracy, 
                        the Board shall not be held liable for any technical interruptions, data loss, or indirect damages arising from the use of this system.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">7. Governing Law</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        These terms and conditions are governed by and construed in accordance with the laws of the Republic of Kenya. 
                        Any legal action or proceeding related to this portal shall be brought exclusively in the courts of Kenya.
                    </p>
                </section>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mt-12 border border-blue-100 dark:border-blue-800">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">Legal Disclaimer</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        The Meru County Public Service Board reserves the right to update these terms at any time without prior notice. 
                        Users are encouraged to review this page periodically to stay informed of any changes.
                    </p>
                </div>
            </div>
        </div>
    );
}
