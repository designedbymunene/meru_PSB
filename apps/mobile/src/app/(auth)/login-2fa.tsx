import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { getApiErrorMessage } from '@/lib/api/client';

export default function Login2faScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const { verify2fa } = useAuth();
    const router = useRouter();
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async () => {
        if (otp.length !== 6) return;
        
        setIsLoading(true);
        setError(null);
        try {
            await verify2fa({ email: email!, otp });
        } catch (err: any) {
            setError(getApiErrorMessage(err, 'Invalid verification code.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
            <View className="px-6 flex-1">
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="mt-4 w-10 h-10 items-center justify-center rounded-full bg-slate-50 dark:bg-gray-900"
                >
                    <ArrowLeft size={20} color="#64748b" />
                </TouchableOpacity>

                <View className="flex-1 justify-center -mt-20">
                    <View className="items-center mb-10">
                        <View className="h-20 w-20 rounded-3xl bg-green-50 dark:bg-green-900/10 items-center justify-center mb-6">
                            <ShieldCheck size={40} color="#10b981" />
                        </View>
                        <Text className="text-3xl font-bold text-slate-900 dark:text-white">Verify Identity</Text>
                        <Text className="mt-2 text-slate-500 dark:text-gray-400 text-center text-base px-10">
                            Enter the 6-digit code sent to {email}
                        </Text>
                    </View>

                    <View className="space-y-4">
                        {error && (
                            <View className="rounded-2xl bg-red-50 dark:bg-red-900/10 p-4 border border-red-100 dark:border-red-900/20 mb-4">
                                <Text className="text-sm text-red-600 dark:text-red-400 text-center font-medium">{error}</Text>
                            </View>
                        )}

                        <TextInput
                            className="h-16 bg-slate-50 dark:bg-gray-900 rounded-2xl px-6 text-2xl font-bold text-center tracking-[10px] text-slate-900 dark:text-white border border-slate-100 dark:border-gray-800"
                            placeholder="000000"
                            placeholderTextColor="#94a3b8"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={(text) => {
                                setOtp(text);
                                if (text.length === 6) handleVerify();
                            }}
                            autoFocus
                        />

                        <TouchableOpacity
                            className={`mt-6 h-14 rounded-2xl items-center justify-center shadow-lg shadow-green-200 dark:shadow-none ${
                                isLoading || otp.length !== 6 ? 'bg-green-500/50' : 'bg-green-600'
                            }`}
                            onPress={handleVerify}
                            disabled={isLoading || otp.length !== 6}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-lg font-bold">Verify & Login</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity className="mt-6 items-center">
                            <Text className="text-slate-500 dark:text-gray-400 font-medium">
                                Didn't receive a code? <Text className="text-[#004aad] dark:text-blue-400 font-bold">Resend</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
