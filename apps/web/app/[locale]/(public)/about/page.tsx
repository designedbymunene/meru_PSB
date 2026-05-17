import React from 'react';

export const metadata = {
    title: 'About the Board | Meru County Public Service Board',
    description: 'Learn about the Meru County Public Service Board, its mandate, functions, and commitment to professional public service.',
};

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
                About Meru County Public Service Board
            </h1>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">Our Mandate</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The Meru County Public Service Board (MCPSB) is established under Article 235 of the Constitution of Kenya 2010
                        and the County Governments Act, 2012. We are mandated to oversee the establishment and administration
                        of a competent, efficient, and responsive public service for Meru County.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Our Vision</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        To be a leading public service board that delivers excellence in county governance through a professional,
                        motivated, and ethical workforce that serves the people of Meru County with integrity and dedication.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        To recruit, develop, and manage a competent public service workforce that efficiently implements
                        county policies and delivers quality services to the residents of Meru County.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Core Values</h2>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li><strong>Integrity:</strong> We uphold the highest standards of honesty and ethical conduct.</li>
                        <li><strong>Professionalism:</strong> We deliver services with competence and excellence.</li>
                        <li><strong>Equity:</strong> We ensure fair treatment and equal opportunities for all.</li>
                        <li><strong>Transparency:</strong> We operate openly and are accountable to the public.</li>
                        <li><strong>Inclusivity:</strong> We embrace diversity and serve all communities without discrimination.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Key Functions</h2>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>Recruitment and selection of qualified personnel for county public service positions</li>
                        <li>Human resource planning and capacity development for county departments</li>
                        <li>Monitoring and evaluation of public service performance</li>
                        <li>Advising the county government on human resource management matters</li>
                        <li>Facilitating career progression and professional development</li>
                        <li>Promoting values and principles of public service as outlined in Article 232 of the Constitution</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Service Commitment</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        MCPSB is committed to delivering professional, timely, and courteous service to all applicants
                        and stakeholders. We maintain transparent recruitment processes, provide equal opportunities
                        for qualified candidates, and ensure that no fees are charged for any job applications or
                        recruitment services. Our board operates independently and in accordance with all relevant
                        laws and regulations governing public service in Kenya.
                    </p>
                </section>

                <div className="bg-muted p-6 rounded-lg mt-12 border">
                    <h3 className="text-lg font-bold mb-2">Contact Information</h3>
                    <p className="text-sm text-muted-foreground">
                        <strong>Email:</strong> adminmerucpsb@meru.go.ke<br />
                        <strong>Phone:</strong> +254 776 733 322<br />
                        <strong>Address:</strong> P.O. BOX 109-60200, Meru, Kenya<br />
                        <strong>Location:</strong> Meru County Headquarters
                    </p>
                </div>
            </div>
        </div>
    );
}
