import React, { useRef } from 'react';
import { View, Text, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { FormLayout } from '@/components/ui/form-layout';
import { FormField } from '@/components/ui/form-field';

import { useAuth } from '@/context/auth-context';
import { getApiErrorMessage } from '@/lib/api/client';
import { useMutation } from '@tanstack/react-query';

const emailSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function OtpLoginScreen() {
    const router = useRouter();
    const { requestLoginOtp, loginWithOtp } = useAuth();
    const [step, setStep] = React.useState<'email' | 'otp'>('email');
    const [userEmail, setUserEmail] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '' },
    });

    const otpForm = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    const requestOtpMutation = useMutation({
        mutationFn: async (data: EmailFormData) => {
            await requestLoginOtp(data.email);
            return data.email;
        },
        onSuccess: (email) => {
            setUserEmail(email);
            setStep('otp');
            setError(null);
        },
        onError: (err) => {
            setError(getApiErrorMessage(err, 'Failed to send verification code.'));
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async (data: OtpFormData) => {
            await loginWithOtp({ email: userEmail, otp: data.otp });
        },
        onError: (err) => {
            setError(getApiErrorMessage(err, 'Invalid or expired verification code.'));
        }
    });

    const onEmailSubmit = (data: EmailFormData) => {
        requestOtpMutation.mutate(data);
    };

    const onOtpSubmit = (data: OtpFormData) => {
        verifyOtpMutation.mutate(data);
    };

    const isLoading = requestOtpMutation.isPending || verifyOtpMutation.isPending;

    return (
        <FormLayout
            title={step === 'email' ? 'OTP Login' : 'Verification'}
            onBack={() => step === 'otp' ? setStep('email') : router.back()}
            isLoading={isLoading}
            submitLabel={step === 'email' ? 'Send Code' : 'Verify & Continue'}
            onSubmit={step === 'email' ? emailForm.handleSubmit(onEmailSubmit) : otpForm.handleSubmit(onOtpSubmit)}
            testID={step === 'email' ? 'otp-email' : 'otp-verify'}
        >
            <View className="py-2">
                {step === 'email' ? (
                    <>
                        <View className="mb-10">
                            <View className="bg-slate-50 dark:bg-gray-900 w-20 h-20 rounded-[32px] items-center justify-center mb-8 shadow-sm border border-slate-100 dark:border-gray-800">
                                <Mail size={36} color="#004aad" strokeWidth={1.5} className="dark:text-blue-400" />
                            </View>
                            <Text className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Login with OTP</Text>
                            <Text className="text-slate-500 dark:text-gray-400 mt-3 text-lg leading-7">
                                Enter your registered email address and we'll send you a secure 6-digit code.
                            </Text>
                        </View>

                        {error && (
                            <View className="mb-6 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20">
                                <Text className="text-red-600 dark:text-red-400 text-sm font-semibold">{error}</Text>
                            </View>
                        )}

                        <Controller
                            control={emailForm.control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormField
                                    label="Email Address"
                                    placeholder="your@email.com"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={emailForm.formState.errors.email?.message}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    testID="otp-email-input"
                                />
                            )}
                        />
                    </>
                ) : (
                    <>
                        <View className="mb-6">
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Check your inbox</Text>
                            <Text className="text-slate-500 dark:text-gray-400 mt-2 text-base leading-6">
                                We've sent a 6-digit verification code to <Text className="font-bold text-[#004aad] dark:text-blue-400">{userEmail}</Text>.
                            </Text>
                        </View>

                        {error && (
                            <View className="mb-6 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20">
                                <Text className="text-red-600 dark:text-red-400 text-sm font-semibold text-center">{error}</Text>
                            </View>
                        )}

                        <View>
                            <Text className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-4 ml-1">
                                Verification Code
                            </Text>
                            <Controller
                                control={otpForm.control}
                                name="otp"
                                render={({ field: { onChange, value } }) => (
                                    <View>
                                        <View className="flex-row justify-between">
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <View
                                                    key={index}
                                                    className={`w-[15%] aspect-square rounded-xl border-2 items-center justify-center bg-white dark:bg-gray-900 ${
                                                        value && value[index]
                                                            ? 'border-[#004aad] dark:border-blue-500'
                                                            : 'border-slate-100 dark:border-gray-800'
                                                    }`}
                                                    testID={`otp-code-input-${index}`}
                                                >
                                                    <Text className="text-xl font-bold text-slate-900 dark:text-white">
                                                        {value ? value[index] : ""}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                        <TextInput
                                            value={value}
                                            onChangeText={(text) => {
                                                onChange(text);
                                                if (text.length === 6) otpForm.handleSubmit(onOtpSubmit)();
                                            }}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            className="absolute w-full h-full opacity-0"
                                            autoFocus
                                        />
                                        {otpForm.formState.errors.otp && (
                                            <Text className="mt-2 ml-1 text-xs text-red-500 font-medium">
                                                {otpForm.formState.errors.otp.message}
                                            </Text>
                                        )}
                                    </View>
                                )}
                            />
                        </View>

                        <View className="mt-8 items-center">
                            <Text className="text-slate-500 dark:text-gray-400 text-sm">
                                Didn't receive the code?
                            </Text>
                            <Pressable className="mt-1" onPress={() => setStep('email')} testID="otp-resend">
                                <Text className="text-[#004aad] dark:text-blue-400 font-bold text-sm">Resend OTP</Text>
                            </Pressable>
                        </View>
                    </>
                )}
            </View>
        </FormLayout>
    );
}
