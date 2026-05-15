import React from 'react';

export const metadata = {
    title: 'Privacy Policy | Meru County Public Service Board',
    description: 'Privacy Policy of the Meru County Public Service Board Recruitment Portal, compliant with the Data Protection Act, 2019.',
};

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
                Privacy Policy
            </h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The Meru County Public Service Board (MCPSB) is committed to protecting the privacy and security of your personal data. 
                        This policy explains how we collect, use, and protect your information when you use our recruitment portal, 
                        in strict compliance with the <strong>Data Protection Act, 2019</strong> of the Republic of Kenya.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
                    <p className="text-muted-foreground mb-4">
                        We collect personal data that you provide during the account registration and job application process, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li><strong>Identification Information:</strong> Full name, National ID number, Passport number, and KRA PIN.</li>
                        <li><strong>Contact Details:</strong> Email address, phone number, and postal address.</li>
                        <li><strong>Academic & Professional Data:</strong> Educational background, certifications, and licenses.</li>
                        <li><strong>Employment History:</strong> Previous roles, responsibilities, and performance records.</li>
                        <li><strong>References:</strong> Information about your professional referees.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">3. Purpose of Data Processing</h2>
                    <p className="text-muted-foreground mb-4">
                        Your information is processed for the following legitimate purposes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Evaluating your suitability for public service positions.</li>
                        <li>Verifying academic and professional credentials through statutory bodies.</li>
                        <li>Conducting background checks and ethical clearances.</li>
                        <li>Communicating updates regarding your applications.</li>
                        <li>Maintaining a database of potential candidates for future vacancies.</li>
                        <li>Compliance with statutory reporting requirements under the County Governments Act.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">4. Legal Basis for Processing</h2>
                    <p className="text-muted-foreground">
                        The MCPSB processes your personal data based on:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                        <li><strong>Consent:</strong> Your explicit agreement when creating an account.</li>
                        <li><strong>Public Task:</strong> Performance of functions in the public interest as mandated by Article 235 of the Constitution.</li>
                        <li><strong>Legal Obligation:</strong> Compliance with Kenyan laws governing public service recruitment.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">5. Data Subject Rights</h2>
                    <p className="text-muted-foreground mb-4">
                        Under the Data Protection Act, you have the following rights:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li><strong>Right to be Informed:</strong> To know why and how your data is being processed.</li>
                        <li><strong>Right of Access:</strong> To request a copy of your personal data held by us.</li>
                        <li><strong>Right to Rectification:</strong> To correct inaccurate or incomplete information.</li>
                        <li><strong>Right to Erasure:</strong> To request deletion of data where it is no longer required.</li>
                        <li><strong>Right to Object:</strong> To oppose processing based on specific grounds.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">6. Data Security and Retention</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We implement industry-standard encryption and security protocols to safeguard your information. 
                        Data is retained for as long as necessary to complete the recruitment cycle and satisfy legal audit requirements 
                        as per the Meru County Government records management policies.
                    </p>
                </section>

                <div className="bg-muted p-6 rounded-lg mt-12 border">
                    <h3 className="text-lg font-bold mb-2">Contact Our Data Protection Office</h3>
                    <p className="text-sm text-muted-foreground">
                        If you have any questions about your privacy or wish to exercise your rights, please contact us at:
                        <br /><br />
                        <strong>Email:</strong> adminmerucpsb@meru.go.ke<br />
                        <strong>Address:</strong> P.O. BOX 109-60200, Meru, Kenya<br />
                        <strong>Location:</strong> Meru County Headquarters
                    </p>
                </div>
            </div>
        </div>
    );
}
