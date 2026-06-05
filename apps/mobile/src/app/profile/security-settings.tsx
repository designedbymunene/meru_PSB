import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, Alert, ScrollView, Linking, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { useColorScheme } from 'nativewind';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { 
    Lock, 
    ShieldAlert, 
    Key, 
    History, 
    ShieldCheck,
    Fingerprint
} from 'lucide-react-native';
import { SectionCard, SettingRow } from '@/components/account';
import { FormLayout } from '@/components/ui/form-layout';
import { ProfileFormLoadingState } from '@/components/ui/loading-skeletons';
import { router } from 'expo-router';
import { safeAsyncStorage } from '@/lib/storage';
import { authStorage } from '@/lib/auth/storage';
import { toast } from 'sonner-native';
import { formatDistanceToNow } from 'date-fns';

const BIOMETRICS_KEY = 'security_biometrics_enabled';

// Safely import LocalAuthentication to prevent crashes when native module is missing
const getLocalAuth = () => {
    try {
        return require('expo-local-authentication');
    } catch (e) {
        console.warn('ExpoLocalAuthentication not available');
        return null;
    }
};

export default function SecuritySettingsScreen() {
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const queryClient = useQueryClient();
    
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);
    const [isBiometricsSupported, setIsBiometricsSupported] = useState(false);
    const [isBiometricsEnrolled, setIsBiometricsEnrolled] = useState(false);

    useEffect(() => {
        const checkBiometrics = async () => {
            const LocalAuthentication = getLocalAuth();
            if (!LocalAuthentication) return;

            try {
                const hasHardware = await LocalAuthentication.hasHardwareAsync();
                const enrolled = await LocalAuthentication.isEnrolledAsync();
                setIsBiometricsSupported(hasHardware);
                setIsBiometricsEnrolled(enrolled);

                const enabled = await safeAsyncStorage.getItem(BIOMETRICS_KEY);
                setBiometricsEnabled(enabled === 'true' && enrolled);
            } catch (e) {
                console.warn('Biometrics check failed:', e);
            }
        };
        checkBiometrics();
    }, []);

    const { data: security, isLoading: isSecurityLoading } = useQuery({
        queryKey: ['security-settings'],
        queryFn: async () => {
            const response = await apiClient.get('/account/security');
            return response.data.data;
        },
    });

    // const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    //     queryKey: ['active-sessions'],
    //     queryFn: async () => {
    //         const response = await apiClient.get('/account/sessions');
    //         return response.data.data;
    //     },
    // });

    const toggle2faMutation = useMutation({
        mutationFn: async (enabled: boolean) => {
            await apiClient.post('/account/2fa/toggle', { enabled });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['security-settings'] });
            toast.success('Two-factor authentication updated');
        }
    });

    // const revokeSessionMutation = useMutation({
    //     mutationFn: async (id?: number) => {
    //         if (id) {
    //             await apiClient.delete(`/account/sessions/${id}`);
    //         } else {
    //             await apiClient.delete('/account/sessions');
    //         }
    //     },
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    //         queryClient.invalidateQueries({ queryKey: ['security-settings'] });
    //         toast.success('Session(s) revoked');
    //     }
    // });

    const handleToggleBiometrics = async (value: boolean) => {
        console.log('[Security] handleToggleBiometrics called with', value);
        const LocalAuthentication = getLocalAuth();
        if (!LocalAuthentication) {
            toast.error('Error', { description: 'Biometric authentication is not available on this device.' });
            setBiometricsEnabled(false);
            return;
        }

        if (value) {
            try {
                toast.info('Checking biometric prompt...');
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Confirm to enable biometric login',
                    fallbackLabel: 'Use Passcode',
                });
                console.log('[Security] LocalAuthentication result', result);
                
                if (result.success) {
                    // Ensure user has a refresh token available to store
                    const currentRefresh = await authStorage.getRefreshToken();
                    console.log('[Security] currentRefresh present?', !!currentRefresh);
                    if (!currentRefresh) {
                        toast.error('Error', { description: 'No active session found. Please sign in before enabling biometrics.' });
                        setBiometricsEnabled(false);
                        return;
                    }

                    try {
                        // Store the refresh token separately for biometric-protected login
                        await authStorage.setBiometricRefreshToken(currentRefresh);
                        console.log('[Security] Biometric refresh token saved');
                    } catch (saveErr) {
                        console.error('[Security] Failed to save biometric token', saveErr);
                        toast.error('Error', { description: 'Failed to enable biometric login. Storage error.' });
                        setBiometricsEnabled(false);
                        return;
                    }

                    setBiometricsEnabled(true);
                    await safeAsyncStorage.setItem(BIOMETRICS_KEY, 'true');
                    toast.success('Biometric login enabled');
                } else {
                    console.log('[Security] LocalAuthentication returned success=false');
                    setBiometricsEnabled(false);
                    toast.error('Biometric authentication failed or was cancelled');
                }
            } catch (e) {
                console.error('Biometric toggle failed', e);
                setBiometricsEnabled(false);
                toast.error('Error', { description: 'Biometric authentication is not available on this device.' });
            }
        } else {
            try {
                setBiometricsEnabled(false);
                await authStorage.deleteBiometricRefreshToken();
                await safeAsyncStorage.setItem(BIOMETRICS_KEY, 'false');
                toast.success('Biometric login disabled');
                console.log('[Security] Biometric login disabled and token removed');
            } catch (err) {
                console.error('[Security] Failed to disable biometric login', err);
                toast.error('Error', { description: 'Failed to disable biometric login.' });
            }
        }
    };

    const openSecuritySettings = async () => {
        try {
            if (Platform.OS === 'android') {
                await IntentLauncher.startActivityAsync('android.settings.SECURITY_SETTINGS');
            } else {
                await Linking.openSettings();
            }
        } catch (e) {
            console.error('[Security] openSecuritySettings failed', e);
            toast.error('Unable to open device settings');
        }
    };

    // const handleLogoutAll = () => {
    //     Alert.alert(
    //         'Sign out from all devices?',
    //         'This will sign you out from all other active sessions except this one.',
    //         [
    //             { text: 'Cancel', style: 'cancel' },
    //             { 
    //                 text: 'Logout All', 
    //                 style: 'destructive', 
    //                 onPress: () => revokeSessionMutation.mutate() 
    //             },
    //         ]
    //     );
    // };

    if (isSecurityLoading) {
        return <ProfileFormLoadingState title="Security" />;
    }

    const lastChanged = security?.passwordLastChanged && security.passwordLastChanged !== 'Never' 
        ? formatDistanceToNow(new Date(security.passwordLastChanged), { addSuffix: true })
        : 'Never';

    return (
        <FormLayout
            title="Security Settings"
            onBack={() => router.back()}
        >
            <View className="space-y-12 mb-12">
                {/* Authentication Section */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Authentication</Text>
                    <SectionCard title="Password & Access" icon={<Lock size={18} color="#3b82f6" strokeWidth={2.5} />}>
                        <SettingRow 
                            icon={Key}
                            title="Update Password"
                            subtitle={`Last changed ${lastChanged}`}
                            onPress={() => router.push('/profile/update-password')}
                            color="#3b82f6"
                        />
                        {isBiometricsSupported && (
                            <SettingRow 
                                icon={Fingerprint}
                                title="Biometric Login"
                                subtitle={isBiometricsEnrolled ? 'Use FaceID or Fingerprint' : 'No biometrics enrolled on device'}
                                color="#8b5cf6"
                                rightElement={
                                    isBiometricsEnrolled ? (
                                        <Switch
                                            value={biometricsEnabled}
                                            onValueChange={handleToggleBiometrics}
                                            trackColor={{ false: '#f1f5f9', true: '#ddd6fe' }}
                                            thumbColor={biometricsEnabled ? '#8b5cf6' : '#f8fafc'}
                                            disabled={!isBiometricsEnrolled}
                                        />
                                    ) : (
                                        <Pressable onPress={openSecuritySettings} className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                                            <Text className="text-sm font-bold text-[#004aad] dark:text-blue-400">Set up</Text>
                                        </Pressable>
                                    )
                                }
                                isLast={true}
                            />
                        )}
                    </SectionCard>
                </View>

                {/* Two-Factor Authentication */}
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Advanced Security</Text>
                    <SectionCard title="Two-Step Verification" icon={<ShieldAlert size={18} color="#f59e0b" strokeWidth={2.5} />}>
                        <View className="py-2">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1 pr-4">
                                    <Text className="text-gray-900 dark:text-white font-black text-[13px]">Require code from email</Text>
                                    <Text className="text-gray-500 dark:text-gray-400 text-[10px] mt-1.5 font-bold leading-4">
                                        Protect your account by requiring an additional security code sent to your email during login.
                                    </Text>
                                </View>
                                <Switch
                                    value={security?.twoFactorEnabled}
                                    onValueChange={(val) => toggle2faMutation.mutate(val)}
                                    trackColor={{ false: '#f1f5f9', true: '#93c5fd' }}
                                    thumbColor={security?.twoFactorEnabled ? '#2563eb' : '#f8fafc'}
                                />
                            </View>
                        </View>
                    </SectionCard>
                </View>

                {/* Session Management disabled for applicant */}
                {/*
                <View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px] mb-5 ml-2">Active Sessions</Text>
                    <SectionCard title="Devices & Activity" icon={<Smartphone size={18} color="#ec4899" strokeWidth={2.5} />}>
                        {sessions?.map((session: any, index: number) => (
                            <View key={session.id} className={`flex-row items-center py-4 ${index === sessions.length - 1 ? '' : 'border-b border-gray-50 dark:border-gray-800'}`}>
                                <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 bg-gray-50 dark:bg-gray-800`}>
                                    <Smartphone size={20} color={session.isCurrent ? '#ec4899' : '#94a3b8'} strokeWidth={2} />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Text className="text-gray-900 dark:text-white font-black text-[13px]">
                                            {session.deviceName || 'Unknown Device'}
                                        </Text>
                                        {session.isCurrent && (
                                            <View className="ml-2 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                                <Text className="text-green-700 dark:text-green-400 text-[8px] font-black uppercase">Current</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-gray-500 dark:text-gray-400 text-[10px] mt-1 font-bold">
                                        {session.os || 'Unknown OS'} • {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                                    </Text>
                                </View>
                                {!session.isCurrent && (
                                    <Pressable 
                                        onPress={() => revokeSessionMutation.mutate(session.id)}
                                        className="p-2"
                                    >
                                        <Trash2 size={18} color="#ef4444" strokeWidth={2} />
                                    </Pressable>
                                )}
                            </View>
                        ))}
                        
                        {sessions?.length > 1 && (
                            <Pressable 
                                className="bg-red-50 dark:bg-red-900/10 p-5 rounded-[24px] mt-6 border border-red-100 dark:border-red-900/20  flex-row justify-center items-center"
                                onPress={handleLogoutAll}
                            >
                                <LogOut size={16} color="#ef4444" strokeWidth={2.5} className="mr-2" />
                                <Text className="text-red-600 dark:text-red-400 font-black text-[10px] uppercase tracking-[2px]">Revoke All Other Sessions</Text>
                            </Pressable>
                        )}
                    </SectionCard>
                </View>
                */}

                {/* Security Tips */}
                <View className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 flex-row items-start shadow-sm">
                    <View className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 items-center justify-center shadow-sm">
                        <ShieldCheck size={20} color="#004aad" strokeWidth={2.5} />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="text-gray-900 dark:text-white font-black text-sm">Security Pro-Tip</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-[10px] mt-1.5 font-bold leading-5">
                            Keep your account safe by enabling two-factor authentication and using biometrics for faster, more secure access.
                        </Text>
                    </View>
                </View>
            </View>
        </FormLayout>
    );
}
