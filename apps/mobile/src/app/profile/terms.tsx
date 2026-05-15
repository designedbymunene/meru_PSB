import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FormLayout } from '@/components/ui/form-layout';
import { router } from 'expo-router';

export default function TermsOfServiceScreen() {
    return (
        <FormLayout
            title="Terms of Service"
            onBack={() => router.back()}
        >
            <ScrollView className="px-4 pb-10" showsVerticalScrollIndicator={false}>
                <View className="space-y-6 mb-10">
                    <Text className="text-gray-900 dark:text-white font-black text-lg mb-2">Terms and Conditions</Text>
                    <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6">Last Updated: May 2026</Text>

                    <View className="space-y-4">
                        <Section title="1. Acceptance of Terms">
                            By accessing or using the Meru County Public Service Board (MCPSB) Recruitment Portal, you agree to be bound by these Terms of Service and all applicable laws and regulations of the Republic of Kenya.
                        </Section>

                        <Section title="2. Purpose of the Portal">
                            This portal is provided solely to facilitate the recruitment and human resource management processes of the Meru County Government. Any other use is strictly prohibited.
                        </Section>

                        <Section title="3. User Responsibilities">
                            You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during the registration and application process. Provision of false information is a criminal offense under the Public Officer Ethics Act and the Penal Code.
                        </Section>

                        <Section title="4. Prohibited Conduct">
                            Users shall not:
                            • Use the portal for any fraudulent or unlawful purpose.
                            • Attempt to gain unauthorized access to any part of the system.
                            • Upload or transmit viruses or any other type of malicious code.
                            • Impersonate any person or entity.
                        </Section>

                        <Section title="5. Intellectual Property">
                            All content, logos, and software associated with this portal are the property of the Meru County Public Service Board and are protected by Kenyan and international intellectual property laws.
                        </Section>

                        <Section title="6. Limitation of Liability">
                            The MCPSB provides this portal on an "as is" and "as available" basis. While we strive for accuracy, we do not warrant that the portal will be error-free or uninterrupted. The Board shall not be liable for any direct or indirect damages arising from your use of the portal.
                        </Section>

                        <Section title="7. Governing Law">
                            These terms shall be governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes shall be subject to the exclusive jurisdiction of the Kenyan courts.
                        </Section>

                        <Section title="8. Modifications">
                            The Board reserves the right to modify these terms at any time. Continued use of the portal after such changes constitutes your acceptance of the new terms.
                        </Section>
                    </View>

                    <View className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[24px] mt-8 border border-blue-100 dark:border-blue-800">
                        <Text className="text-blue-900 dark:text-blue-200 font-bold text-sm mb-2">Contact Information</Text>
                        <Text className="text-blue-700 dark:text-blue-300 text-xs leading-5">
                            Questions about the Terms of Service should be sent to the Secretary/CEO, Meru County Public Service Board at adminmerucpsb@meru.go.ke.
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
