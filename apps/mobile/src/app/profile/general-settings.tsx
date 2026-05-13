import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Settings2, Globe, Trash2, RotateCcw, Monitor, Database } from 'lucide-react-native';
import { SectionCard, SettingRow } from '@/components/account';
import { FormLayout } from '@/components/ui/form-layout';
import { FormPicker } from '@/components/ui/form-picker';
import { router } from 'expo-router';

export default function GeneralSettingsScreen() {
    const [language, setLanguage] = useState('en');

    const handleClearCache = () => {
        Alert.alert(
            'Clear Cache',
            'Are you sure you want to clear the application cache? This will free up space but might make initial loading slower.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: () => {} },
            ]
        );
    };

    const handleResetSettings = () => {
        Alert.alert(
            'Reset Settings',
            'This will reset all app preferences to their default values. Your profile data will not be affected.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: () => {} },
            ]
        );
    };

    return (
        <FormLayout
            title="General Settings"
            onBack={() => router.back()}
        >
            <View className="space-y-12">
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Regional</Text>
                    <SectionCard title="Language & Locale" icon={<Globe size={18} color="#3b82f6" strokeWidth={2.5} />}>
                        <View className="py-2">
                            <FormPicker
                                label="App Language"
                                value={language}
                                onValueChange={setLanguage}
                                items={[
                                    { label: 'English', value: 'en' },
                                    { label: 'Swahili', value: 'sw' },
                                ]}
                            />
                        </View>
                    </SectionCard>
                </View>

                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Storage & Performance</Text>
                    <SectionCard title="App Maintenance" icon={<Database size={18} color="#10b981" strokeWidth={2.5} />}>
                        <SettingRow
                            icon={Trash2}
                            title="Clear Cache"
                            subtitle="Free up storage space (24.5 MB)"
                            onPress={handleClearCache}
                            color="#ef4444"
                        />
                        <SettingRow
                            icon={RotateCcw}
                            title="Reset All Preferences"
                            subtitle="Revert to factory settings"
                            onPress={handleResetSettings}
                            color="#f59e0b"
                            isLast={true}
                        />
                    </SectionCard>
                </View>

                <View className="mb-12">
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">System</Text>
                    <SectionCard title="Information" icon={<Monitor size={18} color="#64748b" strokeWidth={2.5} />}>
                        <SettingRow
                            icon={Monitor}
                            title="Device Information"
                            subtitle="iPhone 15 Pro (iOS 17.4)"
                            color="#64748b"
                        />
                        <SettingRow
                            icon={Settings2}
                            title="App Environment"
                            subtitle="Production (Stable)"
                            color="#64748b"
                            isLast={true}
                        />
                    </SectionCard>
                </View>
            </View>
        </FormLayout>
    );
}
