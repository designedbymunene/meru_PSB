import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { KeyRound, Mail, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, MailCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View, 
    Alert
} from 'react-native';
import * as z from 'zod';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { FormLayout } from '@/components/ui/form-layout';
import { FormField } from '@/components/ui/form-field';

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
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
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

    const onStep1Submit = async (data: Step1FormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.post('/auth/forgot-password/request', { email: data.email });
            setEmail(data.email);
            setStep(2);
        } catch (err: any) {
            setError(getApiErrorMessage(err, 'Failed to request reset code. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    const onStep2Submit = async (data: Step2FormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.post('/auth/reset-password', {
                email,
                otp: data.otp,
                newPassword: data.newPassword,
            });
            
            Alert.alert(
                "Success",
                "Your password has been reset successfully.",
                [{ text: "Log In Now", onPress: () => router.replace('/login') }]
            );
        } catch (err: any) {
            setError(getApiErrorMessage(err, 'Invalid or expired reset code'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormLayout
            title={step === 1 ? "Forgot Password" : "Verify Code"}
            onBack={() => step === 2 ? setStep(1) : router.back()}
            isLoading={isLoading}
            submitLabel={step === 1 ? "Get Reset Code" : "Update Password"}
            onSubmit={step === 1 ? form1.handleSubmit(onStep1Submit) : form2.handleSubmit(onStep2Submit)}
        >
            <View className="py-4">
                {step === 1 ? (
                    <>
                        <View className="mb-10">
                            <View className="bg-slate-50 dark:bg-gray-900 w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-gray-800">
                                <KeyRound size={40} color="#004aad" className="dark:text-blue-400" />
                            </View>
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Forgot Password?</Text>
                            <Text className="text-slate-500 dark:text-gray-400 text-lg mt-3 leading-7">
                                Enter your registered email address and we&apos;ll send you a 6-digit verification code.
                            </Text>
                        </View>

                        {error && (
                            <View className="mb-8 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20 flex-row items-center">
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
                                <Text className="text-slate-500 dark:text-gray-400 text-base">Remember password? <Text className="text-[#004aad] dark:text-blue-400 font-bold">Sign In</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <View className="mb-10">
                            <View className="bg-slate-50 dark:bg-gray-900 w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-gray-800">
                                <MailCheck size={40} color="#059669" />
                            </View>
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Check Your Inbox</Text>
                            <View className="mt-3 bg-slate-50 dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800">
                                <Text className="text-slate-600 dark:text-gray-400 text-base leading-6">
                                    We sent a code to <Text className="font-bold text-slate-900 dark:text-white">{email}</Text>. Please enter it below.
                                </Text>
                            </View>
                        </View>

                        {error && (
                            <View className="mb-8 bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20 flex-row items-center">
                                <Text className="text-red-600 dark:text-red-400 text-sm font-semibold flex-1">{error}</Text>
                            </View>
                        )}

                        <View className="space-y-6">
                            <Controller
                                control={form2.control}
                                name="otp"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        label="Verification Code"
                                        placeholder="000000"
                                        icon={ShieldCheck}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={form2.formState.errors.otp?.message}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        style={{ textAlign: 'center', letterSpacing: 8, fontWeight: '700', fontSize: 24 }}
                                    />
                                )}
                            />

                            <Controller
                                control={form2.control}
                                name="newPassword"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View>
                                        <FormField
                                            label="New Password"
                                            placeholder="••••••••"
                                            icon={Lock}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            error={form2.formState.errors.newPassword?.message}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity 
                                            onPress={() => setShowPassword(!showPassword)} 
                                            className="absolute right-4 top-[50px]"
                                        >
                                            {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />

                            <View className="flex-row items-center mt-1 ml-1">
                                <CheckCircle2 size={12} color="#94a3b8" />
                                <Text className="text-slate-400 text-[11px] ml-1 font-medium">
                                    Must be at least 8 characters long
                                </Text>
                            </View>
                        </View>

                        <View className="items-center mt-6">
                            <TouchableOpacity
                                className="py-2"
                                onPress={() => setStep(1)}
                            >
                                <Text className="text-[#004aad] dark:text-blue-400 font-bold text-base">Re-enter email address</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </FormLayout>
    );
}
