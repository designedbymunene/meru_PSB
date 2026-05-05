import { useRouter } from 'expo-router';
import {
    Award,
    Bell,
    Briefcase,
    ChevronRight,
    GraduationCap,
    HelpCircle,
    Info,
    Lock,
    LogOut,
    MapPin,
    Moon,
    Sun,
    UserCircle,
    Sparkles,
    CheckCircle2
} from 'lucide-react-native';
import React, { useState } from 'react';
import { useColorScheme } from 'nativewind';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileHeader, SectionCard, CompletionProgress } from '@/components/account';
import { useAuth } from '@/context/auth-context';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { colorScheme, setColorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me');
            return response.data.data;
        },
    });

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout of your account?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
            ]
        );
    };

    const SectionButton = ({ icon: Icon, title, subtitle, onPress, color = "#64748b", rightElement, isComplete }: any) => (
        <TouchableOpacity
            className="flex-row items-center py-2.5 active:opacity-70"
            onPress={onPress}
            disabled={!onPress}
        >
            <View
                className="w-9 h-9 rounded-lg justify-center items-center mr-3.5"
                style={{ backgroundColor: isComplete ? '#10b98110' : `${color}10` }}
            >
                <Icon size={18} color={isComplete ? '#10b981' : color} />
            </View>
            <View className="flex-1">
                <Text className="text-gray-900 dark:text-white font-bold text-sm">{title}</Text>
                {subtitle && <Text className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5 font-bold uppercase tracking-tight">{subtitle}</Text>}
            </View>
            {isComplete ? (
                <CheckCircle2 size={16} color="#10b981" />
            ) : (
                rightElement ? rightElement : <ChevronRight size={16} color="#cbd5e1" />
            )}
        </TouchableOpacity>
    );

    const completion = profile?.profileCompletion?.overallPercentage || 0;
    const sections = profile?.profileCompletion?.sections || {};

    return (
        <View className="flex-1 bg-white dark:bg-gray-950">
            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView 
                    className="flex-1" 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                >
                    {/* Top Section */}
                    <View className="h-32 bg-[#004aad]">
                        <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 dark:bg-black/10" />
                    </View>

                    {/* Profile Header */}
                    <View className="mx-4 -mt-12 bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <ProfileHeader
                            name={user?.fullName || 'User'}
                            email={user?.email || ''}
                            role={user?.role || 'Applicant'}
                            avatarUrl={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=004aad&color=fff&size=256`}
                            isVerified={(user as any)?.isVerified || false}
                            onEditAvatar={() => { }}
                        />
                    </View>

                    <View className="px-5 pt-6">
                        {/* Completion Summary */}
                        <View className="mb-8">
                            <CompletionProgress percentage={completion} label="Overall Completion" />
                        </View>

                        {/* Profile Information Section */}
                        <View className="mb-4">
                            <SectionCard
                                title="Profile Details"
                                subtitle="Professional data"
                            >
                                <View>
                                    <SectionButton
                                        icon={UserCircle}
                                        title="Personal Info"
                                        subtitle="Bio-data & Contacts"
                                        onPress={() => router.push('/profile/wizard?step=personal')}
                                        isComplete={sections.personal === 100}
                                    />
                                    <SectionButton
                                        icon={MapPin}
                                        title="Location & Ethnicity"
                                        subtitle="Origin & Demographic"
                                        onPress={() => router.push('/profile/wizard?step=location')}
                                        isComplete={sections.location === 100}
                                    />
                                    <SectionButton
                                        icon={GraduationCap}
                                        title="Education"
                                        subtitle="Academic History"
                                        onPress={() => router.push('/profile/wizard?step=academic')}
                                        isComplete={(profile?.qualifications?.length || 0) > 0}
                                    />
                                    <SectionButton
                                        icon={Briefcase}
                                        title="Experience"
                                        subtitle="Work & Roles"
                                        onPress={() => router.push('/profile/wizard?step=experience')}
                                        isComplete={(profile?.employmentHistory?.length || 0) > 0}
                                    />
                                    <SectionButton
                                        icon={Award}
                                        title="Skills & Certs"
                                        subtitle="Professional Licensing"
                                        onPress={() => router.push('/profile/wizard?step=professional')}
                                        isComplete={sections.professional === 100}
                                    />
                                </View>
                            </SectionCard>
                        </View>

                        {/* Preferences & Settings Section */}
                        <View className="mb-4">
                            <SectionCard
                                title="Preferences"
                                subtitle="App behavior"
                            >
                                <View>
                                    <SectionButton
                                        icon={isDarkMode ? Moon : Sun}
                                        title="Appearance"
                                        subtitle={isDarkMode ? "Dark Theme" : "Light Theme"}
                                        color="#7c3aed"
                                        rightElement={
                                            <Switch
                                                value={isDarkMode}
                                                onValueChange={(value) => setColorScheme(value ? 'dark' : 'light')}
                                                trackColor={{ false: '#e2e8f0', true: '#c4b5fd' }}
                                                thumbColor={isDarkMode ? '#7c3aed' : '#f8fafc'}
                                            />
                                        }
                                    />
                                    <SectionButton
                                        icon={Bell}
                                        title="Notifications"
                                        subtitle="Alerts & Updates"
                                        onPress={() => router.push('/profile/preferences')}
                                        color="#7c3aed"
                                    />
                                    <SectionButton
                                        icon={Lock}
                                        title="Security"
                                        subtitle="Password & 2FA"
                                        onPress={() => router.push('/profile/security-settings')}
                                        color="#059669"
                                    />
                                </View>
                            </SectionCard>
                        </View>

                        {/* Logout */}
                        <TouchableOpacity
                            className="mt-4 mb-12 flex-row items-center justify-center py-5 rounded-3xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20"
                            onPress={handleLogout}
                        >
                            <LogOut size={18} color="#ef4444" />
                            <Text className="text-red-600 font-bold ml-2">Logout</Text>
                        </TouchableOpacity>

                        <Text className="text-center text-gray-300 text-xs mb-10">
                            Meru County PSB • Digital Portal
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

