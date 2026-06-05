import React, { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { Settings2, Trash2, RotateCcw, Monitor, Database, Bell, Palette, Info, RefreshCw } from 'lucide-react-native';
import { AlertModal } from '@/components/ui/alert-modal';
import { SectionCard, SettingRow } from '@/components/account';
import { FormLayout } from '@/components/ui/form-layout';
import { ThemeModeModal } from '@/components/ui/theme-mode-modal';
import { router } from 'expo-router';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useColorScheme } from 'nativewind';
import { useOtaUpdates } from '@/hooks/use-ota-updates';

export default function GeneralSettingsScreen() {
    // const [language, setLanguage] = useState('en');
    const { colorScheme, setColorScheme } = useColorScheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
    const [isClearModalVisible, setIsClearModalVisible] = useState(false);
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const { isChecking, isDownloading, checkForUpdates } = useOtaUpdates();

    const deviceInfo = `${Device.modelName || 'Device'} (${Platform.OS} ${Device.osVersion})`;
    const appVersion = `${Constants.expoConfig?.version || '1.0.0'} (${Constants.expoConfig?.extra?.buildNumber || '1'})`;

    const getThemeLabel = () => {
        switch (colorScheme) {
            case 'light':
                return 'Light Mode';
            case 'dark':
                return 'Dark Mode';
            default:
                return 'System Default';
        }
    };

    const handleClearCache = () => {
        setIsClearModalVisible(true);
    };

    const handleResetSettings = () => {
        setIsResetModalVisible(true);
    };

    return (
        <FormLayout
            title="General Settings"
            onBack={() => router.back()}
        >
            <View className="space-y-10 pb-10">
                {/* Appearance Section */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Appearance</Text>
                    <SectionCard title="Look & Feel" icon={<Palette size={18} color="#8b5cf6" strokeWidth={2.5} />} hideHeader>
                        <SettingRow
                            icon={Palette}
                            title="App Theme"
                            subtitle={getThemeLabel()}
                            color="#8b5cf6"
                            onPress={() => setIsThemeModalVisible(true)}
                        />
                        <SettingRow
                            icon={Bell}
                            title="Push Notifications"
                            subtitle="Stay updated on job matches"
                            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                            rightElement={
                                <View className={`px-2 py-1 rounded-full ${notificationsEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    <Text className={`text-[10px] font-black uppercase ${notificationsEnabled ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>
                                        {notificationsEnabled ? 'Enabled' : 'Disabled'}
                                    </Text>
                                </View>
                            }
                            isLast={true}
                        />
                    </SectionCard>
                </View>

                {/* Regional Section disabled for applicant */}
                {/*
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Regional</Text>
                    <SectionCard title="Language & Locale" icon={<Globe size={18} color="#3b82f6" strokeWidth={2.5} />}>
                        <View className="py-2">
                            <FormPicker
                                label="App Language"
                                value={language}
                                onValueChange={setLanguage}
                                items={[
                                    { label: 'English (UK)', value: 'en' },
                                    { label: 'Kiswahili', value: 'sw' },
                                ]}
                            />
                        </View>
                    </SectionCard>
                </View>
                */}

                {/* Storage Section */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Maintenance</Text>
                    <SectionCard title="App Storage" icon={<Database size={18} color="#10b981" strokeWidth={2.5} />} hideHeader>
                        <SettingRow
                            icon={Trash2}
                            title="Clear Cache"
                            subtitle="Free up storage space (24.5 MB)"
                            onPress={handleClearCache}
                            color="#ef4444"
                        />
                        <SettingRow
                            icon={RotateCcw}
                            title="Reset Preferences"
                            subtitle="Revert to factory defaults"
                            onPress={handleResetSettings}
                            color="#f59e0b"
                            isLast={true}
                        />
                    </SectionCard>
                </View>

                {/* System Section */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">System Information</Text>
                    <SectionCard title="Device & App" icon={<Info size={18} color="#64748b" strokeWidth={2.5} />} hideHeader>
                        <SettingRow
                            icon={Monitor}
                            title="Device Information"
                            subtitle={deviceInfo}
                            color="#64748b"
                        />
                        <SettingRow
                            icon={Settings2}
                            title="App Version"
                            subtitle={appVersion}
                            color="#64748b"
                        />
                        <SettingRow
                            icon={RefreshCw}
                            title={isChecking ? "Checking for Updates..." : "Check for Updates"}
                            subtitle={isDownloading ? "Downloading updates..." : "Manually check for OTA updates"}
                            color="#3b82f6"
                            onPress={checkForUpdates}
                            isLast={true}
                        />
                    </SectionCard>
                </View>
            </View>

            <AlertModal
                visible={isClearModalVisible}
                title="Clear Cache"
                message={'Are you sure you want to clear the application cache? This will free up space but might make initial loading slower.'}
                onCancel={() => setIsClearModalVisible(false)}
                onConfirm={() => { setIsClearModalVisible(false); /* implement clear cache action */ }}
            />

            <AlertModal
                visible={isResetModalVisible}
                title="Reset Settings"
                message={'This will reset all app preferences to their default values. Your profile data will not be affected.'}
                onCancel={() => setIsResetModalVisible(false)}
                onConfirm={() => { setIsResetModalVisible(false); /* implement reset action */ }}
            />

            <ThemeModeModal
                isVisible={isThemeModalVisible}
                onClose={() => setIsThemeModalVisible(false)}
                selectedTheme={colorScheme}
                onSelect={setColorScheme}
            />
        </FormLayout>
    );
}
