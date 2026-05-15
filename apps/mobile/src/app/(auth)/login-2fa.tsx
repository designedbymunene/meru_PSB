import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { getApiErrorMessage } from '@/lib/api/client';
import { FormLayout } from '@/components/ui/form-layout';
import { FormField } from '@/components/ui/form-field';

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
        <FormLayout
            title="Verification"
            onBack={() => router.back()}
            isLoading={isLoading}
            submitLabel="Verify & Login"
            onSubmit={handleVerify}
        >
            <View className="py-2">
                <View className="mb-6">
                    <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Verify Identity</Text>
                    <Text className="text-slate-500 dark:text-gray-400 mt-2 text-base leading-6">
                        Enter the secure 6-digit verification code sent to <Text className="font-bold text-[#004aad] dark:text-blue-400">{email}</Text>.
                    </Text>
                </View>

                {error && (
                    <View className="mb-6 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20 flex-row items-center">
                        <Text className="text-red-600 dark:text-red-400 text-sm font-semibold flex-1 text-center">{error}</Text>
                    </View>
                )}

                <View>
                    <Text className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-4 ml-1">
                        Verification Code
                    </Text>
                    <View>
                        <View className="flex-row justify-between">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <View 
                                    key={index} 
                                    className={`w-[15%] aspect-square rounded-xl border-2 items-center justify-center bg-white dark:bg-gray-900 ${
                                        otp && otp[index] 
                                            ? 'border-[#004aad] dark:border-blue-500' 
                                            : 'border-slate-100 dark:border-gray-800'
                                    }`}
                                >
                                    <Text className="text-xl font-bold text-slate-900 dark:text-white">
                                        {otp ? otp[index] : ""}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <TextInput
                            value={otp}
                            onChangeText={(text) => {
                                setOtp(text);
                                if (text.length === 6) handleVerify();
                            }}
                            keyboardType="number-pad"
                            maxLength={6}
                            className="absolute w-full h-full opacity-0"
                            autoFocus
                        />
                    </View>
                </View>

                <View className="mt-8 items-center">
                    <Text className="text-slate-500 dark:text-gray-400 text-sm">
                        Didn't receive the code?
                    </Text>
                    <TouchableOpacity className="mt-1">
                        <Text className="text-[#004aad] dark:text-blue-400 font-bold text-sm">Resend Code</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </FormLayout>
    );
}
