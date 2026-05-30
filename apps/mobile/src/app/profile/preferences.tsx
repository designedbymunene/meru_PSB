import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Bell, Mail, MessageSquare, ShieldCheck } from 'lucide-react-native';
import { SectionCard, SettingRow } from '@/components/account';
import { FormPicker } from '@/components/ui/form-picker';
import { FormLayout } from '@/components/ui/form-layout';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';

export default function PreferencesScreen() {
    const [notifications, setNotifications] = useState({
        jobAlerts: true,
        applicationUpdates: true,
        accountUpdates: true,
        emailNotifications: true,
    });

    const [preferences, setPreferences] = useState({
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
                    <SectionCard title="" hideHeader={true}>
                        <SettingRow
                            icon={Bell}
                            title="Job Alerts"
                            subtitle="New job opportunities matching your profile"
                            color="#004aad"
                            rightElement={
                                <Switch
                                    value={notifications.jobAlerts}
                                    onValueChange={() => toggleNotification('jobAlerts')}
                                    trackColor={{ false: '#f1f5f9', true: '#bfdbfe' }}
                                    thumbColor={notifications.jobAlerts ? '#004aad' : '#f8fafc'}
                                />
                            }
                        />
                        <SettingRow
                            icon={ShieldCheck}
                            title="Application Updates"
                            subtitle="Status changes on your active applications"
                            color="#004aad"
                            rightElement={
                                <Switch
                                    value={notifications.applicationUpdates}
                                    onValueChange={() => toggleNotification('applicationUpdates')}
                                    trackColor={{ false: '#f1f5f9', true: '#bfdbfe' }}
                                    thumbColor={notifications.applicationUpdates ? '#004aad' : '#f8fafc'}
                                />
                            }
                        />
                        <SettingRow
                            icon={MessageSquare}
                            title="Account Updates"
                            subtitle="Security alerts and account activity"
                            color="#004aad"
                            isLast={true}
                            rightElement={
                                <Switch
                                    value={notifications.accountUpdates}
                                    onValueChange={() => toggleNotification('accountUpdates')}
                                    trackColor={{ false: '#f1f5f9', true: '#bfdbfe' }}
                                    thumbColor={notifications.accountUpdates ? '#004aad' : '#f8fafc'}
                                />
                            }
                        />
                    </SectionCard>
                </View>

                {/* Communication Channels */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Channels</Text>
                    <SectionCard title="" hideHeader={true}>
                        <SettingRow
                            icon={Mail}
                            title="Email Notifications"
                            subtitle="Receive detailed updates via email"
                            color="#004aad"
                            isLast={true}
                            rightElement={
                                <Switch
                                    value={notifications.emailNotifications}
                                    onValueChange={() => toggleNotification('emailNotifications')}
                                    trackColor={{ false: '#f1f5f9', true: '#bfdbfe' }}
                                    thumbColor={notifications.emailNotifications ? '#004aad' : '#f8fafc'}
                                />
                            }
                        />
                    </SectionCard>
                </View>

                {/* Marketing */}
                <View className="mb-12">
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Marketing</Text>
                    <SectionCard title="" hideHeader={true}>
                        <SettingRow
                            icon={MessageSquare}
                            title="Subscribe to Newsletter"
                            subtitle="Stay updated with Meru County PSB news"
                            color="#004aad"
                            rightElement={
                                <Switch
                                    value={preferences.receiveNewsletter}
                                    onValueChange={() => setPreferences({ ...preferences, receiveNewsletter: !preferences.receiveNewsletter })}
                                    trackColor={{ false: '#f1f5f9', true: '#bfdbfe' }}
                                    thumbColor={preferences.receiveNewsletter ? '#004aad' : '#f8fafc'}
                                />
                            }
                        />
                        <SettingRow
                            icon={Bell}
                            title="Promotional Content"
                            subtitle="Receive updates about career fairs and events"
                            color="#004aad"
                            isLast={true}
                            rightElement={
                                <Switch
                                    value={preferences.receivePromotions}
                                    onValueChange={() => setPreferences({ ...preferences, receivePromotions: !preferences.receivePromotions })}
                                    trackColor={{ false: '#f1f5f9', true: '#bfdbfe' }}
                                    thumbColor={preferences.receivePromotions ? '#004aad' : '#f8fafc'}
                                />
                            }
                        />
                    </SectionCard>
                </View>
            </View>
        </FormLayout>
    );
}
