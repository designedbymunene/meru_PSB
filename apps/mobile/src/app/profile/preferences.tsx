import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Bell, Mail, Sliders, Globe, MessageSquare } from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { SectionCard } from '@/components/account';
import { FormPicker } from '@/components/ui/form-picker';
import { FormLayout } from '@/components/ui/form-layout';
import { useColorScheme } from 'nativewind';

export default function PreferencesScreen() {
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [notifications, setNotifications] = useState({
        jobAlerts: true,
        applicationUpdates: true,
        accountUpdates: true,
        emailNotifications: true,
        smsNotifications: false,
    });

    const [preferences, setPreferences] = useState({
        preferredLanguage: 'en',
        preferredContactMethod: 'email',
        receiveNewsletter: true,
        receivePromotions: false,
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications({ ...notifications, [key]: !notifications[key] });
    };

    const iconColor = isDarkMode ? '#ffffff' : '#0f172a';

    const NotificationToggle = ({ label, description, value, onToggle }: any) => (
        <View className="flex-row justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
            <View className="flex-1 pr-4">
                <Text className="text-gray-900 font-bold text-sm">{label}</Text>
                {description && <Text className="text-gray-500 text-[10px] mt-1 font-medium">{description}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
                thumbColor={value ? '#2563eb' : '#f8fafc'}
            />
        </View>
    );

    return (
        <FormLayout
            title="Preferences"
            onBack={() => {}}
            bottomAction={
                <TouchableOpacity className="bg-blue-600 p-5 rounded-[24px] items-center shadow-sm active:bg-blue-700">
                    <Text className="text-white font-black text-base uppercase tracking-widest">Save Preferences</Text>
                </TouchableOpacity>
            }
        >
            <View className="space-y-6">
                {/* Notifications */}
                <SectionCard
                    title="Notifications"
                    icon={<Bell size={22} color={iconColor} />}
                >
                    <View>
                        <NotificationToggle
                            label="Job Alerts"
                            description="Get notified about new job opportunities"
                            value={notifications.jobAlerts}
                            onToggle={() => toggleNotification('jobAlerts')}
                        />
                        <NotificationToggle
                            label="Application Updates"
                            description="Updates on your job applications"
                            value={notifications.applicationUpdates}
                            onToggle={() => toggleNotification('applicationUpdates')}
                        />
                        <NotificationToggle
                            label="Account Updates"
                            description="Important account and security updates"
                            value={notifications.accountUpdates}
                            onToggle={() => toggleNotification('accountUpdates')}
                        />
                    </View>
                </SectionCard>

                {/* Notification Methods */}
                <SectionCard
                    title="Communication Channels"
                    icon={<Mail size={22} color={iconColor} />}
                >
                    <View>
                        <NotificationToggle
                            label="Email Notifications"
                            description="Receive updates via email"
                            value={notifications.emailNotifications}
                            onToggle={() => toggleNotification('emailNotifications')}
                        />
                        <NotificationToggle
                            label="SMS Notifications"
                            description="Receive updates via SMS"
                            value={notifications.smsNotifications}
                            onToggle={() => toggleNotification('smsNotifications')}
                        />
                    </View>
                </SectionCard>

                {/* Regional Preferences */}
                <SectionCard
                    title="Regional & App Settings"
                    icon={<Globe size={22} color={iconColor} />}
                >
                    <View className="py-2">
                        <FormPicker
                            label="Preferred Language"
                            value={preferences.preferredLanguage}
                            onValueChange={(value) => setPreferences({ ...preferences, preferredLanguage: value })}
                            items={[
                                { label: 'English', value: 'en' },
                            ]}
                        />

                        <FormPicker
                            label="Preferred Contact Method"
                            value={preferences.preferredContactMethod}
                            onValueChange={(value) => setPreferences({ ...preferences, preferredContactMethod: value })}
                            items={[
                                { label: 'Email', value: 'email' },
                                { label: 'SMS', value: 'sms' },
                                { label: 'Phone Call', value: 'phone' },
                            ]}
                        />
                    </View>
                </SectionCard>

                {/* Marketing Preferences */}
                <SectionCard
                    title="Marketing & Newsletter"
                    icon={<MessageSquare size={22} color={iconColor} />}
                >
                    <View>
                        <NotificationToggle
                            label="Subscribe to Newsletter"
                            description="Stay updated with PSB news and announcements"
                            value={preferences.receiveNewsletter}
                            onToggle={() => setPreferences({ ...preferences, receiveNewsletter: !preferences.receiveNewsletter })}
                        />
                        <NotificationToggle
                            label="Promotional Content"
                            description="Special offers and partner announcements"
                            value={preferences.receivePromotions}
                            onToggle={() => setPreferences({ ...preferences, receivePromotions: !preferences.receivePromotions })}
                        />
                    </View>
                </SectionCard>
            </View>
        </FormLayout>
    );
}
