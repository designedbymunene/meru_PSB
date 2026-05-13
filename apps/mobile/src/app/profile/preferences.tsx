import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Bell, Mail, Globe, MessageSquare, ShieldCheck } from 'lucide-react-native';
import { SectionCard, SettingRow } from '@/components/account';
import { FormPicker } from '@/components/ui/form-picker';
import { FormLayout } from '@/components/ui/form-layout';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';

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

    return (
        <FormLayout
            title="App Preferences"
            onBack={() => router.back()}
            bottomAction={
                <TouchableOpacity 
                    className="bg-[#004aad] dark:bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none active:opacity-80"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-black text-sm uppercase tracking-widest">Save Preferences</Text>
                </TouchableOpacity>
            }
        >
            <View className="space-y-12">
                {/* Notifications */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Notifications</Text>
                    <SectionCard title="Alerts & Updates" icon={<Bell size={18} color="#ec4899" strokeWidth={2.5} />}>
                        <SettingRow
                            icon={Bell}
                            title="Job Alerts"
                            subtitle="New job opportunities matching your profile"
                            color="#ec4899"
                            rightElement={
                                <Switch
                                    value={notifications.jobAlerts}
                                    onValueChange={() => toggleNotification('jobAlerts')}
                                    trackColor={{ false: '#f1f5f9', true: '#fbcfe8' }}
                                    thumbColor={notifications.jobAlerts ? '#ec4899' : '#f8fafc'}
                                />
                            }
                        />
                        <SettingRow
                            icon={ShieldCheck}
                            title="Application Updates"
                            subtitle="Status changes on your active applications"
                            color="#10b981"
                            rightElement={
                                <Switch
                                    value={notifications.applicationUpdates}
                                    onValueChange={() => toggleNotification('applicationUpdates')}
                                    trackColor={{ false: '#f1f5f9', true: '#d1fae5' }}
                                    thumbColor={notifications.applicationUpdates ? '#10b981' : '#f8fafc'}
                                />
                            }
                        />
                        <SettingRow
                            icon={MessageSquare}
                            title="Account Updates"
                            subtitle="Security alerts and account activity"
                            color="#f59e0b"
                            isLast={true}
                            rightElement={
                                <Switch
                                    value={notifications.accountUpdates}
                                    onValueChange={() => toggleNotification('accountUpdates')}
                                    trackColor={{ false: '#f1f5f9', true: '#fef3c7' }}
                                    thumbColor={notifications.accountUpdates ? '#f59e0b' : '#f8fafc'}
                                />
                            }
                        />
                    </SectionCard>
                </View>

                {/* Communication Channels */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Channels</Text>
                    <SectionCard title="Delivery Methods" icon={<Mail size={18} color="#3b82f6" strokeWidth={2.5} />}>
                        <SettingRow
                            icon={Mail}
                            title="Email Notifications"
                            subtitle="Receive detailed updates via email"
                            color="#3b82f6"
                            rightElement={
                                <Switch
                                    value={notifications.emailNotifications}
                                    onValueChange={() => toggleNotification('emailNotifications')}
                                    trackColor={{ false: '#f1f5f9', true: '#dbeafe' }}
                                    thumbColor={notifications.emailNotifications ? '#3b82f6' : '#f8fafc'}
                                />
                            }
                        />
                        <SettingRow
                            icon={MessageSquare}
                            title="SMS Notifications"
                            subtitle="Receive quick alerts via SMS"
                            color="#06b6d4"
                            isLast={true}
                            rightElement={
                                <Switch
                                    value={notifications.smsNotifications}
                                    onValueChange={() => toggleNotification('smsNotifications')}
                                    trackColor={{ false: '#f1f5f9', true: '#cffafe' }}
                                    thumbColor={notifications.smsNotifications ? '#06b6d4' : '#f8fafc'}
                                />
                            }
                        />
                    </SectionCard>
                </View>

                {/* Regional Preferences */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Regional Settings</Text>
                    <SectionCard title="Language & Contact" icon={<Globe size={18} color="#8b5cf6" strokeWidth={2.5} />}>
                        <View className="py-2">
                            <FormPicker
                                label="Preferred Language"
                                value={preferences.preferredLanguage}
                                onValueChange={(value) => setPreferences({ ...preferences, preferredLanguage: value })}
                                items={[
                                    { label: 'English', value: 'en' },
                                    { label: 'Swahili', value: 'sw' },
                                ]}
                            />

                            <View className="mt-6">
                                <FormPicker
                                    label="Primary Contact Method"
                                    value={preferences.preferredContactMethod}
                                    onValueChange={(value) => setPreferences({ ...preferences, preferredContactMethod: value })}
                                    items={[
                                        { label: 'Email', value: 'email' },
                                        { label: 'SMS', value: 'sms' },
                                        { label: 'Phone Call', value: 'phone' },
                                    ]}
                                />
                            </View>
                        </View>
                    </SectionCard>
                </View>

                {/* Marketing */}
                <View className="mb-12">
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Marketing</Text>
                    <SectionCard title="Newsletter & Offers" icon={<MessageSquare size={18} color="#10b981" strokeWidth={2.5} />}>
                        <SettingRow
                            icon={MessageSquare}
                            title="Subscribe to Newsletter"
                            subtitle="Stay updated with Meru County PSB news"
                            color="#10b981"
                            rightElement={
                                <Switch
                                    value={preferences.receiveNewsletter}
                                    onValueChange={() => setPreferences({ ...preferences, receiveNewsletter: !preferences.receiveNewsletter })}
                                    trackColor={{ false: '#f1f5f9', true: '#d1fae5' }}
                                    thumbColor={preferences.receiveNewsletter ? '#10b981' : '#f8fafc'}
                                />
                            }
                        />
                        <SettingRow
                            icon={Bell}
                            title="Promotional Content"
                            subtitle="Receive updates about career fairs and events"
                            color="#f59e0b"
                            isLast={true}
                            rightElement={
                                <Switch
                                    value={preferences.receivePromotions}
                                    onValueChange={() => setPreferences({ ...preferences, receivePromotions: !preferences.receivePromotions })}
                                    trackColor={{ false: '#f1f5f9', true: '#fef3c7' }}
                                    thumbColor={preferences.receivePromotions ? '#f59e0b' : '#f8fafc'}
                                />
                            }
                        />
                    </SectionCard>
                </View>
            </View>
        </FormLayout>
    );
}
