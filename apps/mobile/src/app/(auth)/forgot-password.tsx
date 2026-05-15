import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { KeyRound, Mail, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, MailCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View 
} from 'react-native';
import * as z from 'zod';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { FormLayout } from '@/components/ui/form-layout';
import { FormField } from '@/components/ui/form-field';
import { useMutation } from '@tanstack/react-query';

// Schemas
const step1Schema = z.object({
    email: z.string().email('Invalid email address'),
});

const step2Schema = z.object({
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be at most 100 characters'),
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form for Step 1
    const form1 = useForm<Step1FormData>({
        resolver: zodResolver(step1Schema),
        defaultValues: { email: '' },
    });

    // Form for Step 2
    const form2 = useForm<Step2FormData>({
        resolver: zodResolver(step2Schema),
        defaultValues: { otp: '', newPassword: '' },
    });

    const requestResetMutation = useMutation({
        mutationFn: async (data: Step1FormData) => {
            await apiClient.post('/auth/forgot-password/request', { email: data.email });
            return data.email;
        },
        onSuccess: (email) => {
            setEmail(email);
            setStep(2);
            setError(null);
        },
        onError: (err) => {
            setError(getApiErrorMessage(err, 'Failed to request reset code. Please try again.'));
        }
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async (data: Step2FormData) => {
            await apiClient.post('/auth/reset-password', {
                email,
                otp: data.otp,
                newPassword: data.newPassword,
            });
        },
        onSuccess: () => {
            setStep(3);
            setError(null);
        },
        onError: (err) => {
            setError(getApiErrorMessage(err, 'Invalid or expired reset code'));
        }
    });

    const onStep1Submit = (data: Step1FormData) => {
        requestResetMutation.mutate(data);
    };

    const onStep2Submit = (data: Step2FormData) => {
        resetPasswordMutation.mutate(data);
    };

    const isLoading = requestResetMutation.isPending || resetPasswordMutation.isPending;

    return (
        <FormLayout
            title={step === 1 ? "Forgot Password" : step === 2 ? "Verify Code" : "Success"}
            onBack={() => {
                if (step === 2) setStep(1);
                else if (step === 3) router.replace('/login');
                else router.back();
            }}
            isLoading={isLoading}
            submitLabel={step === 1 ? "Get Reset Code" : step === 2 ? "Update Password" : "Log In Now"}
            onSubmit={step === 1 ? form1.handleSubmit(onStep1Submit) : step === 2 ? form2.handleSubmit(onStep2Submit) : () => router.replace('/login')}
        >
            <View className="py-4">
                {step === 1 ? (
                    <>
                        <View className="mb-6">
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Forgot Password?</Text>
                            <Text className="text-slate-500 dark:text-gray-400 text-base mt-2 leading-6">
                                Enter your registered email address and we&apos;ll send you a 6-digit verification code.
                            </Text>
                        </View>

                        {error && (
                            <View className="mb-6 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20 flex-row items-center">
                                <Text className="text-red-600 dark:text-red-400 text-sm font-semibold flex-1">{error}</Text>
                            </View>
                        )}

                        <Controller
                            control={form1.control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormField
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    icon={Mail}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={form1.formState.errors.email?.message}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            )}
                        />

                        <View className="items-center mt-8">
                            <TouchableOpacity
                                className="py-2"
                                onPress={() => router.back()}
                            >
                                <Text className="text-slate-500 dark:text-gray-400 text-sm">Remember password? <Text className="text-[#004aad] dark:text-blue-400 font-bold">Sign In</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : step === 2 ? (
                    <>
                        <View className="mb-6">
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Verify Code</Text>
                            <Text className="text-slate-500 dark:text-gray-400 mt-2 text-base leading-6">
                                We sent a secure code to{"\n"}
                                <Text className="font-bold text-[#004aad] dark:text-blue-400">{email}</Text>. Please enter it below.
                            </Text>
                        </View>

                        {error && (
                            <View className="mb-6 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20 flex-row items-center">
                                <Text className="text-red-600 dark:text-red-400 text-sm font-semibold flex-1">{error}</Text>
                            </View>
                        )}

                        <View className="space-y-6">
                            <View>
                                <Text className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3 ml-1">
                                    Verification Code
                                </Text>
                                <Controller
                                    control={form2.control}
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
                                                    >
                                                        <Text className="text-xl font-bold text-slate-900 dark:text-white">
                                                            {value ? value[index] : ""}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                            <TextInput
                                                value={value}
                                                onChangeText={onChange}
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                className="absolute w-full h-full opacity-0"
                                                autoFocus
                                            />
                                            {form2.formState.errors.otp && (
                                                <Text className="mt-2 ml-1 text-xs text-red-500 font-medium">
                                                    {form2.formState.errors.otp.message}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                />
                            </View>

                            <Controller
                                control={form2.control}
                                name="newPassword"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        label="New Password"
                                        placeholder="Enter your new password"
                                        icon={Lock}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={form2.formState.errors.newPassword?.message}
                                        secureTextEntry={!showPassword}
                                        rightElement={
                                            <TouchableOpacity 
                                                onPress={() => setShowPassword(!showPassword)}
                                                className="w-10 h-10 items-center justify-center"
                                            >
                                                {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                                            </TouchableOpacity>
                                        }
                                    />
                                )}
                            />

                            <View className="flex-row items-center ml-1">
                                <View className={`w-4 h-4 rounded-full items-center justify-center ${form2.watch('newPassword')?.length >= 8 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-gray-800'}`}>
                                    <CheckCircle2 size={10} color="white" />
                                </View>
                                <Text className={`text-xs ml-2 font-medium ${form2.watch('newPassword')?.length >= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                    Must be at least 8 characters long
                                </Text>
                            </View>
                        </View>

                        <View className="items-center mt-8">
                            <TouchableOpacity
                                className="py-2 flex-row items-center"
                                onPress={() => setStep(1)}
                            >
                                <Text className="text-slate-500 dark:text-gray-400 text-sm">Wait, I want to </Text>
                                <Text className="text-[#004aad] dark:text-blue-400 font-bold text-sm underline">change my email</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <View className="flex-1 items-center justify-center py-10">
                        <View className="bg-emerald-50 dark:bg-emerald-900/20 w-24 h-24 rounded-full items-center justify-center mb-8 shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                            <CheckCircle2 size={56} color="#059669" />
                        </View>
                        <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-center">Success!</Text>
                        <Text className="text-slate-500 dark:text-gray-400 text-lg mt-4 leading-7 text-center px-4">
                            Your password has been reset successfully. You can now log in with your new credentials.
                        </Text>
                    </View>
                )}
            </View>
        </FormLayout>
    );
}
