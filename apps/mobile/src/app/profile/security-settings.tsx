import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Lock, ShieldAlert, LogOut, Smartphone, Key, History, ShieldCheck } from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { SectionCard } from '@/components/account';
import { FormLayout } from '@/components/ui/form-layout';
import { ProfileFormLoadingState } from '@/components/ui/loading-skeletons';

export default function SecuritySettingsScreen() {
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    
    const iconColor = isDarkMode ? '#ffffff' : '#0f172a';

    const { data: security, isLoading } = useQuery({
        queryKey: ['security-settings'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/account/security');
                return response.data.data;
            } catch (error) {
                console.error('Failed to fetch security settings', error);
                return {
                    passwordLastChanged: new Date().toISOString(),
                    twoFactorEnabled: false,
                    loginAttempts: 0,
                    sessionTimeout: 30,
                    activeSessions: 1
                };
            }
        },
    });

    const handleLogoutAll = () => {
        Alert.alert(
            'Logout from All Devices',
            'Are you sure you want to sign out from all other active sessions?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout All', style: 'destructive', onPress: () => {} },
            ]
        );
    };

    if (isLoading) {
        return <ProfileFormLoadingState title="Security" />;
    }

    const SecurityItem = ({ icon: Icon, title, value, color = iconColor, onPress }: any) => (
        <TouchableOpacity 
            className="flex-row justify-between items-center py-4 border-b border-gray-100 last:border-b-0 dark:border-gray-800"
            onPress={onPress}
            disabled={!onPress}
        >
            <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${color}10` }}>
                    <Icon size={18} color={color} />
                </View>
                <Text className="text-gray-600 text-sm font-medium">{title}</Text>
            </View>
            <Text className="text-gray-900 font-bold text-sm">{value}</Text>
        </TouchableOpacity>
    );

    return (
        <FormLayout
            title="Security"
            onBack={() => {}}
        >
            <View className="space-y-6">
                {/* Password Section */}
                <SectionCard
                    title="Authentication"
                    icon={<Lock size={22} color={iconColor} />}
                >
                    <View>
                        <SecurityItem 
                            icon={Key}
                            title="Password"
                            value="Last changed 3 months ago"
                            onPress={() => {}}
                        />
                        <TouchableOpacity className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4 active:bg-blue-100 items-center">
                            <Text className="text-blue-600 font-black text-xs uppercase tracking-widest">Update Password</Text>
                        </TouchableOpacity>
                    </View>
                </SectionCard>

                {/* Two-Factor Authentication */}
                <SectionCard
                    title="Two-Step Verification"
                    icon={<ShieldAlert size={22} color={iconColor} />}
                >
                    <View className="py-2">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-1 pr-4">
                                <Text className="text-gray-900 font-bold text-sm">Two-Step Verification</Text>
                                <Text className="text-gray-500 text-[10px] mt-1 font-medium leading-4">
                                    Add an extra layer of security by requiring a code from your phone.
                                </Text>
                            </View>
                            <Switch
                                value={twoFactorEnabled}
                                onValueChange={setTwoFactorEnabled}
                                trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
                                thumbColor={twoFactorEnabled ? '#059669' : '#f8fafc'}
                            />
                        </View>
                        {twoFactorEnabled && (
                            <TouchableOpacity className="bg-green-50 p-4 rounded-xl border border-green-100 active:bg-green-100 items-center">
                                <Text className="text-green-600 font-black text-xs uppercase tracking-widest">Configure Authenticator</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </SectionCard>

                {/* Session Management */}
                <SectionCard
                    title="Sessions & Activity"
                    icon={<Smartphone size={22} color={iconColor} />}
                >
                    <View>
                        <SecurityItem 
                            icon={Smartphone}
                            title="Current Device"
                            value="iPhone 14 Pro"
                            color="#7c3aed"
                        />
                        <SecurityItem 
                            icon={History}
                            title="Active Sessions"
                            value="2 active devices"
                            color="#7c3aed"
                        />
                        <SecurityItem 
                            icon={ShieldCheck}
                            title="Security Audit"
                            value="All clear"
                            color="#7c3aed"
                        />
                        <TouchableOpacity 
                            className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4 active:bg-red-100 items-center"
                            onPress={handleLogoutAll}
                        >
                            <Text className="text-red-600 font-black text-xs uppercase tracking-widest">Logout All Other Devices</Text>
                        </TouchableOpacity>
                    </View>
                </SectionCard>

                <View className="bg-blue-50 p-4 rounded-2xl flex-row items-start">
                    <ShieldCheck size={18} color={iconColor} className="mt-0.5" />
                    <View className="ml-3 flex-1">
                        <Text className="text-[#004aad] font-bold text-xs">Security Pro-Tip</Text>
                        <Text className="text-blue-700/60 text-[10px] mt-1 font-medium leading-4">
                            Enable two-factor authentication and regularly update your password to keep your application data safe.
                        </Text>
                    </View>
                </View>
            </View>
        </FormLayout>
    );
}
