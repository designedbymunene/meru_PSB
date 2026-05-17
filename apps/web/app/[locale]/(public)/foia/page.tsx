import React from 'react';

export const metadata = {
    title: 'Freedom of Information | Meru County Public Service Board',
    description: 'Freedom of Information procedures and request forms for the Meru County Public Service Board.',
};

export default function FoiaPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
                Freedom of Information
            </h1>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">Overview</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The Meru County Public Service Board is committed to transparency and accountability in its operations.
                        This page provides information on how to request access to public records held by the Board in accordance
                        with relevant Kenyan laws promoting access to information.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Your Right to Information</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        Every citizen has the right to access information held by public entities. You may request:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Records related to Board operations and decisions</li>
                        <li>Recruitment statistics and reports (anonymized where applicable)</li>
                        <li>Board meeting minutes and resolutions</li>
                        <li>Annual reports and financial disclosures</li>
                        <li>Policies and procedures governing public service recruitment</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">How to Make a Request</h2>
                    <div className="bg-muted p-6 rounded-lg border">
                        <h3 className="text-lg font-bold mb-4">Submit Your Request in Writing</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Your information request should include:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground mb-4">
                            <li>Your full name, physical address, and contact information</li>
                            <li>Clear description of the information requested</li>
                            <li>Preferred format for receiving the information</li>
                            <li>Signature and date of the request</li>
                        </ul>
                        <div className="space-y-2 text-sm">
                            <p><strong>Email:</strong> adminmerucpsb@meru.go.ke (Subject: FOIA Request)</p>
                            <p><strong>Postal Address:</strong> P.O. BOX 109-60200, Meru, Kenya</p>
                            <p><strong>Physical Address:</strong> Meru County Headquarters</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Response Timeline</h2>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li><strong>21 days:</strong> Standard response time for information requests</li>
                        <li><strong>Extension:</strong> Additional time may be required for complex requests</li>
                        <li><strong>Notification:</strong> You will be informed if your request requires more time</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Exemptions</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Certain information may be exempt from disclosure, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                        <li>Personal privacy information (third-party data)</li>
                        <li>Commercially sensitive or confidential information</li>
                        <li>Ongoing investigation or security-related information</li>
                        <li>Legal professional privilege communications</li>
                        <li>Information that could prejudice law enforcement</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Fees</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Reasonable fees may be charged for reproduction, copying, and delivery of requested information.
                        You will be informed of any applicable fees before processing your request. The first hour of
                        search and retrieval time is typically provided at no cost.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Appeals Process</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        If your information request is denied, you will receive written notification stating the reasons
                        for denial and information on the appeals process. You may appeal to the Commission on Administrative
                        Justice (Office of the Ombudsman) within 30 days of receiving a denial.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Proactively Available Information</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        The following information is routinely available without a formal request:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Board composition and member biographies</li>
                        <li>Annual reports and strategic plans</li>
                        <li>Recruitment guidelines and procedures</li>
                        <li>Approved vacancy advertisements</li>
                        <li>Contact information and office locations</li>
                    </ul>
                </section>

                <div className="bg-primary/10 p-6 rounded-lg mt-12 border border-primary/20">
                    <h3 className="text-lg font-bold mb-2">Contact for Information Requests</h3>
                    <p className="text-sm text-muted-foreground">
                        For questions about information requests or to submit an FOIA request:<br /><br />
                        <strong>Email:</strong> adminmerucpsb@meru.go.ke<br />
                        <strong>Phone:</strong> +254 776 733 322<br />
                        <strong>Address:</strong> Meru County Public Service Board<br />
                        P.O. BOX 109-60200, Meru, Kenya
                    </p>
                </div>
            </div>
        </div>
    );
}
