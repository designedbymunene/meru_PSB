import { useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink, FileText, HelpCircle, Mail, MessageSquare, Phone, Shield } from 'lucide-react-native';
import React from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Header } from '../components/ui/header';

export default function SupportScreen() {
    const router = useRouter();

    const contactMethods = [
        {
            icon: <Phone size={24} color="#004aad" />,
            title: 'Call Support',
            value: '+254 700 000 000',
            action: () => Linking.openURL('tel:+254700000000')
        },
        {
            icon: <Mail size={24} color="#004aad" />,
            title: 'Email Us',
            value: 'support@meru.go.ke',
            action: () => Linking.openURL('mailto:support@meru.go.ke')
        },
        {
            icon: <MessageSquare size={24} color="#004aad" />,
            title: 'Live Chat',
            value: 'Chat with an agent',
            action: () => { }
        }
    ];

    const resources = [
        { icon: <HelpCircle size={20} color="#64748b" />, title: 'Frequently Asked Questions' },
        { icon: <Shield size={20} color="#64748b" />, title: 'Privacy Policy' },
        { icon: <FileText size={20} color="#64748b" />, title: 'Terms of Service' },
        { icon: <ExternalLink size={20} color="#64748b" />, title: 'Meru County Website' }
    ];

    return (
        <View className="flex-1 bg-white dark:bg-gray-950">
            <Header title="Support Center" />
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-8">
                    <View className="mb-10">
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white">How can we help?</Text>
                        <Text className="text-gray-500 dark:text-gray-400 mt-2 text-base">
                            Our team is here to support you with your recruitment journey and public service inquiries.
                        </Text>
                    </View>

                    <View className="space-y-4 mb-10">
                        {contactMethods.map((method, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={method.action}
                                className="flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl"
                            >
                                <View className="bg-white dark:bg-gray-800 w-12 h-12 rounded-xl items-center justify-center shadow-sm">
                                    {method.icon}
                                </View>
                                <View className="ml-4">
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">{method.title}</Text>
                                    <Text className="font-bold text-gray-900 dark:text-white text-base">{method.value}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View>
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resources</Text>
                        <View className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                            {resources.map((resource, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className={`flex-row items-center justify-between p-5 ${index !== resources.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}
                                >
                                    <View className="flex-row items-center">
                                        {resource.icon}
                                        <Text className="ml-3 text-gray-700 dark:text-gray-300 font-medium">{resource.title}</Text>
                                    </View>
                                    <ArrowLeft size={16} color="#cbd5e1" style={{ transform: [{ rotate: '180deg' }] }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <Text className="text-center text-gray-400 text-xs mt-12 mb-8">
                        Available Monday to Friday, 8:00 AM - 5:00 PM
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
