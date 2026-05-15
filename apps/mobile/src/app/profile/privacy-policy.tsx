import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FormLayout } from '@/components/ui/form-layout';
import { router } from 'expo-router';

export default function PrivacyPolicyScreen() {
    return (
        <FormLayout
            title="Privacy Policy"
            onBack={() => router.back()}
        >
            <ScrollView className="px-4 pb-10" showsVerticalScrollIndicator={false}>
                <View className="space-y-6 mb-10">
                    <Text className="text-gray-900 dark:text-white font-black text-lg mb-2">Privacy Policy</Text>
                    <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6">In compliance with the Data Protection Act, 2019</Text>

                    <View className="space-y-4">
                        <Section title="1. Introduction">
                            The Meru County Public Service Board (MCPSB) is committed to protecting the privacy and security of your personal data. This policy explains how we collect, use, and protect your information when you use our recruitment portal.
                        </Section>

                        <Section title="2. Information We Collect">
                            We collect personal data that you provide during the application process, including:
                            • Full name, ID/Passport number, and contact information.
                            • Academic qualifications and professional certifications.
                            • Employment history and professional references.
                            • Any other information relevant to your suitability for public service roles.
                        </Section>

                        <Section title="3. How We Use Your Data">
                            Your information is processed for the following purposes:
                            • Assessing your suitability for employment in the Meru County Government.
                            • Verifying your qualifications and background.
                            • Communicating with you regarding your applications.
                            • Statutory reporting and compliance with the County Governments Act.
                        </Section>

                        <Section title="4. Legal Basis for Processing">
                            We process your data based on:
                            • Your explicit consent provided during account creation.
                            • Performance of a task in the public interest or exercise of official authority.
                            • Compliance with legal obligations under Kenyan law.
                        </Section>

                        <Section title="5. Data Sharing and Disclosure">
                            We do not sell your data. We may share your information with:
                            • Relevant departments within the Meru County Government.
                            • Statutory bodies for verification purposes (e.g., KNEC, HELB, EACC).
                            • Law enforcement agencies where required by law.
                        </Section>

                        <Section title="6. Data Security">
                            We implement appropriate technical and organizational measures to protect your data against unauthorized access, loss, or alteration. This includes encryption, access controls, and regular security audits.
                        </Section>

                        <Section title="7. Your Rights">
                            Under the Data Protection Act, 2019, you have the right to:
                            • Access your personal data held by us.
                            • Request correction of inaccurate or incomplete data.
                            • Request erasure of your data (subject to legal retention requirements).
                            • Object to or restrict the processing of your data.
                        </Section>

                        <Section title="8. Data Retention">
                            We retain your data for as long as necessary to fulfill the recruitment process and comply with statutory records management policies of the Meru County Government.
                        </Section>
                    </View>

                    <View className="bg-green-50 dark:bg-green-900/20 p-6 rounded-[24px] mt-8 border border-green-100 dark:border-green-800">
                        <Text className="text-green-900 dark:text-green-200 font-bold text-sm mb-2">Data Protection Inquiries</Text>
                        <Text className="text-green-700 dark:text-green-300 text-xs leading-5">
                            For any inquiries regarding your data privacy, please contact our Data Protection Office at adminmerucpsb@meru.go.ke or visit our offices at the Meru County Headquarters.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </FormLayout>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <View className="mb-6">
            <Text className="text-gray-900 dark:text-white font-black text-sm mb-2">{title}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs leading-6 font-medium">
                {children}
            </Text>
        </View>
    );
}
