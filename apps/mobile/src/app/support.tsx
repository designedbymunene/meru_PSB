import { useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink, FileText, HelpCircle, Mail, MessageSquare, Phone, Shield, ShieldCheck, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Header } from '@/components/ui/header';
import { SectionCard, SettingRow } from '@/components/account';
import { FormLayout } from '@/components/ui/form-layout';

export default function SupportScreen() {
    const router = useRouter();
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const contactMethods = [
        {
            icon: Phone,
            title: 'Call Support',
            subtitle: 'Available Mon-Fri, 8am-5pm',
            value: '+254 700 000 000',
            color: '#3b82f6',
            action: () => Linking.openURL('tel:+254700000000')
        },
        {
            icon: Mail,
            title: 'Email Us',
            subtitle: 'Response within 24 hours',
            value: 'support@meru.go.ke',
            color: '#10b981',
            action: () => Linking.openURL('mailto:support@meru.go.ke')
        },
        {
            icon: MessageSquare,
            title: 'Live Chat',
            subtitle: 'Chat with our support bot',
            value: 'Start Conversation',
            color: '#8b5cf6',
            action: () => { }
        }
    ];

    const faqs = [
        { q: 'How do I track my application?', a: 'You can track all your active applications from the "Applications" tab on the main dashboard.' },
        { q: 'Can I edit my profile after applying?', a: 'Yes, your profile can be updated at any time, but please note that some applications may use a snapshot of your profile at the time of submission.' },
        { q: 'What documents are required?', a: 'Commonly required documents include your ID, academic certificates, and professional licenses.' }
    ];

    return (
        <FormLayout
            title="Support Center"
            onBack={() => router.back()}
        >
            <View className="space-y-10">
                {/* Header Intro */}
                <View className="px-2">
                    <Text className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">How can we help?</Text>
                    <Text className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-6">
                        Our team is here to assist you with your recruitment journey and public service inquiries.
                    </Text>
                </View>

                {/* Contact Methods */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-4 ml-2">Direct Contact</Text>
                    <SectionCard variant="flat" title="Get in Touch" icon={<MessageSquare size={20} color="#3b82f6" />}>
                        {contactMethods.map((method, index) => (
                            <SettingRow
                                key={index}
                                icon={method.icon}
                                title={method.title}
                                subtitle={method.subtitle}
                                value={method.value}
                                onPress={method.action}
                                color={method.color}
                                isLast={index === contactMethods.length - 1}
                            />
                        ))}
                    </SectionCard>
                </View>

                {/* FAQ Section */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-4 ml-2">Knowledge Base</Text>
                    <View className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none px-6">
                        <Text className="text-gray-900 dark:text-white font-bold text-base mt-6 mb-2">Frequently Asked Questions</Text>
                        <View className="pb-4">
                            {faqs.map((faq, index) => (
                                <TouchableOpacity 
                                    key={index}
                                    onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    className={`py-4 ${index !== faqs.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-gray-700 dark:text-gray-300 font-semibold text-sm flex-1 mr-4">{faq.q}</Text>
                                        <ChevronRight 
                                            size={16} 
                                            color="#cbd5e1" 
                                            style={{ transform: [{ rotate: expandedFaq === index ? '90deg' : '0deg' }] }} 
                                        />
                                    </View>
                                    {expandedFaq === index && (
                                        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-3 leading-5">
                                            {faq.a}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Resources */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-4 ml-2">Legal & Resources</Text>
                    <SectionCard variant="flat" title="Official Documents" icon={<FileText size={20} color="#64748b" />}>
                        <SettingRow icon={Shield} title="Privacy Policy" onPress={() => {}} />
                        <SettingRow icon={FileText} title="Terms of Service" onPress={() => {}} />
                        <SettingRow icon={ExternalLink} title="Meru County Website" onPress={() => Linking.openURL('https://meru.go.ke')} isLast={true} />
                    </SectionCard>
                </View>

                <View className="items-center pb-10">
                    <Text className="text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                        Standard Response Time: 24 Hours
                    </Text>
                </View>
            </View>
        </FormLayout>
    );
}
