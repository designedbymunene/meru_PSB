import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ShieldCheck, Download, Trash2, Eye, Lock, FileText } from 'lucide-react-native';
import { SectionCard, SettingRow } from '@/components/account';
import { FormLayout } from '@/components/ui/form-layout';
import { router } from 'expo-router';

export default function PrivacyScreen() {
    return (
        <FormLayout
            title="Data & Privacy"
            onBack={() => router.back()}
        >
            <View className="space-y-12">
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Transparency</Text>
                    <SectionCard title="Your Data" icon={<Eye size={18} color="#3b82f6" strokeWidth={2.5} />}>
                        <SettingRow
                            icon={FileText}
                            title="Personal Data We Collect"
                            subtitle="View the list of data points we store"
                            onPress={() => {}}
                            color="#3b82f6"
                        />
                        <SettingRow
                            icon={ShieldCheck}
                            title="How We Use Your Data"
                            subtitle="Read our data usage policy"
                            onPress={() => {}}
                            color="#10b981"
                        />
                        <SettingRow
                            icon={Lock}
                            title="Third-Party Sharing"
                            subtitle="Who we share your information with"
                            onPress={() => {}}
                            color="#f59e0b"
                            isLast={true}
                        />
                    </SectionCard>
                </View>

                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Data Controls</Text>
                    <SectionCard title="Manage Account" icon={<Download size={18} color="#8b5cf6" strokeWidth={2.5} />}>
                        <SettingRow
                            icon={Download}
                            title="Download My Data"
                            subtitle="Get a copy of all your profile information"
                            onPress={() => {}}
                            color="#8b5cf6"
                        />
                        <SettingRow
                            icon={Trash2}
                            title="Request Account Deletion"
                            subtitle="Permanently remove your account and data"
                            onPress={() => {}}
                            color="#ef4444"
                            destructive={true}
                            isLast={true}
                        />
                    </SectionCard>
                </View>

                <View className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 mb-12 shadow-sm">
                    <Text className="text-gray-900 dark:text-white font-black text-sm mb-2">Our Commitment</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold leading-5">
                        Meru County Public Service Board is committed to protecting your privacy. We use industry-standard encryption and security practices to ensure your personal data remains safe and is only used for legitimate recruitment and public service purposes.
                    </Text>
                </View>
            </View>
        </FormLayout>
    );
}
