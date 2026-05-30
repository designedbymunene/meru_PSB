import { useRouter } from 'expo-router';
import {
    Bell,
    Lock,
    LogOut,
    Moon,
    Sun,
    HelpCircle,
    Info,
    Settings2,
    UserRound,
    ExternalLink,
    ShieldAlert,
    MapPin
} from 'lucide-react-native';
import React, { useState } from 'react';
import { useColorScheme } from 'nativewind';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileHeader, SettingRow } from '@/components/account';
import { useAuth } from '@/context/auth-context';
import { AlertModal } from '@/components/ui/alert-modal';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { colorScheme, setColorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

    const handleLogout = () => {
        setIsLogoutModalVisible(true);
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
                >
                    <View className="px-6 pt-10">
                        {/* Profile Header */}
                        <View className="mb-8">
                            <ProfileHeader
                                    name={user?.fullName || 'User'}
                                    email={user?.email || ''}
                                    role={user?.role || 'Applicant'}
                                    avatarUrl={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=004aad&color=fff&size=256`}
                                    isVerified={(user as any)?.isVerified || false}
                                    onEditAvatar={() => { }}
                                />
                            </View>

                            {/* Settings Groups */}
                            <View className="space-y-14">
                            {/* Account & Security */}
                            <View>
                                <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mt-4 mb-2 ml-2">Account & Security</Text>
                                <View className="bg-white dark:bg-gray-900 rounded-[32px] px-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none">
                                    <SettingRow
                                        icon={UserRound}
                                        title="Personal Information"
                                        subtitle="Manage your identity and core bio-data"
                                        onPress={() => router.push('/profile/wizard?step=personal')}
                                        color="#3b82f6"
                                    />
                                    <SettingRow
                                        icon={MapPin}
                                        title="Location & Ethnicity"
                                        subtitle="Home county, ward and ethnicity"
                                        onPress={() => router.push('/profile/personal-details')}
                                        color="#06b6d4"
                                    />
                                    <SettingRow
                                        icon={Lock}
                                        title="Security Settings"
                                        subtitle="Password & 2FA"
                                        onPress={() => router.push('/profile/security-settings')}
                                        color="#f59e0b"
                                    />
                                    <SettingRow
                                        icon={ShieldAlert}
                                        title="Data & Privacy"
                                        subtitle="Transparency and data controls"
                                        onPress={() => router.push('/profile/privacy')}
                                        color="#10b981"
                                        isLast={true}
                                    />
                                </View>
                            </View>

                            {/* App Preferences */}
                            <View>
                                <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mt-4 mb-2 ml-2">App Preferences</Text>
                                <View className="bg-white dark:bg-gray-900 rounded-[32px] px-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none">
                                    <SettingRow
                                        icon={isDarkMode ? Moon : Sun}
                                        title="Appearance"
                                        subtitle={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
                                        color="#8b5cf6"
                                        rightElement={
                                            <Switch
                                                value={isDarkMode}
                                                onValueChange={(value) => setColorScheme(value ? 'dark' : 'light')}
                                                trackColor={{ false: '#f1f5f9', true: '#ddd6fe' }}
                                                thumbColor={isDarkMode ? '#8b5cf6' : '#f8fafc'}
                                            />
                                        }
                                    />
                                    <SettingRow
                                        icon={Bell}
                                        title="Notifications"
                                        subtitle="Job alerts and system updates"
                                        onPress={() => router.push('/profile/preferences')}
                                        color="#ec4899"
                                    />
                                    <SettingRow
                                        icon={Settings2}
                                        title="General Settings"
                                        subtitle="Theme, notifications & cache settings"
                                        onPress={() => router.push('/profile/general-settings')}
                                        color="#64748b"
                                        isLast={true}
                                    />
                                </View>
                            </View>

                            {/* Support & Legal */}
                            <View>
                                <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mt-4 mb-2 ml-2">Support & Legal</Text>
                                <View className="bg-white dark:bg-gray-900 rounded-[32px] px-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none">
                                    <SettingRow
                                        icon={HelpCircle}
                                        title="Help Center"
                                        subtitle="FAQs and technical support"
                                        onPress={() => router.push('/support')}
                                        color="#06b6d4"
                                    />
                                    <SettingRow
                                        icon={Info}
                                        title="About Meru PSB"
                                        subtitle="Our mission, values and version info"
                                        onPress={() => router.push('/profile/about')}
                                        color="#004aad"
                                    />
                                    <SettingRow
                                        icon={ExternalLink}
                                        title="Privacy Policy"
                                        onPress={() => { }}
                                        color="#64748b"
                                        isLast={true}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Logout Section */}
                        <TouchableOpacity
                            className="mt-12 flex-row items-center justify-center py-6 rounded-[32px] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 active:opacity-70"
                            onPress={handleLogout}
                        >
                            <LogOut size={20} color="#ef4444" strokeWidth={2.5} />
                            <Text className="text-red-600 dark:text-red-400 font-black ml-3 uppercase tracking-widest text-xs">Logout Session</Text>
                        </TouchableOpacity>

                        <AlertModal
                            visible={isLogoutModalVisible}
                            title="Logout Session"
                            message="Are you sure you want to logout of your account?"
                            onCancel={() => setIsLogoutModalVisible(false)}
                            onConfirm={() => { setIsLogoutModalVisible(false); logout(); }}
                        />

                        <View className="mt-12 items-center">
                            <Text className="text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                                Meru County PSB • Build 2.4.0
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
