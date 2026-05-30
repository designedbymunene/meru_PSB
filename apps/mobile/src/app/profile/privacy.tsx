import React from 'react';
import { View, Text } from 'react-native';
import { ShieldCheck, Download, Trash2, FileText } from 'lucide-react-native';
import { SectionCard, SettingRow } from '@/components/account';
import { FormLayout } from '@/components/ui/form-layout';
import { router } from 'expo-router';
import { toast } from 'sonner-native';

export default function PrivacyScreen() {
    return (
        <FormLayout
            title="Data & Privacy"
            onBack={() => router.back()}
        >
            <View className="space-y-12">
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Transparency</Text>
                    <SectionCard title="" hideHeader={true}>
                        <SettingRow
                            icon={FileText}
                            title="Personal Data We Collect"
                            subtitle="View the list of data points we store"
                            onPress={() => router.push('/profile/documents')}
                            color="#3b82f6"
                        />
                        <SettingRow
                            icon={ShieldCheck}
                            title="Full Privacy Policy"
                            subtitle="Read our compliance with Data Protection Act"
                            onPress={() => router.push('/profile/privacy-policy')}
                            color="#10b981"
                            isLast={true}
                        />
                    </SectionCard>
                </View>

                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Data Controls</Text>
                    <SectionCard title="" hideHeader={true}>
                        <SettingRow
                            icon={Download}
                            title="Download My Data"
                            subtitle="Get a copy of all your profile information"
                            onPress={() => toast.info('Coming Soon', { description: 'Data export feature will be available soon.' })}
                            color="#8b5cf6"
                        />
                        <SettingRow
                            icon={Trash2}
                            title="Request Account Deletion"
                            subtitle="Permanently remove your account and data"
                            onPress={() => toast.info('Coming Soon', { description: 'Account deletion feature will be available soon.' })}
                            color="#ef4444"
                            destructive={true}
                            isLast={true}
                        />
                    </SectionCard>
                </View>

                <View className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 mb-12 shadow-sm">
                    <Text className="text-gray-900 dark:text-white font-black text-sm mb-2">Our Commitment</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold leading-5">
                        The Meru County Public Service Board is committed to protecting your privacy in accordance with the Data Protection Act, 2019. We use industry-standard encryption and security practices to ensure your personal data remains safe and is only used for legitimate recruitment and public service purposes.
                    </Text>
                </View>
            </View>
        </FormLayout>
    );
}
