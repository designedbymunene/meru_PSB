import React, { useRef } from 'react';
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { FormLayout } from '@/components/ui/form-layout';
import { FormField } from '@/components/ui/form-field';

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
    const [step, setStep] = React.useState<'email' | 'otp'>('email');
    const [isLoading, setIsLoading] = React.useState(false);
    const [userEmail, setUserEmail] = React.useState('');

    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '' },
    });

    const otpForm = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    const onEmailSubmit = async (data: EmailFormData) => {
        setIsLoading(true);
        try {
            // Simulated API call to send OTP
            await new Promise(resolve => setTimeout(resolve, 1500));
            setUserEmail(data.email);
            setStep('otp');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const onOtpSubmit = async (data: OtpFormData) => {
        setIsLoading(true);
        try {
            // Simulated API call to verify OTP
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.replace('/');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormLayout
            title="Login via OTP"
            onBack={() => step === 'otp' ? setStep('email') : router.back()}
            isLoading={isLoading}
            submitLabel={step === 'email' ? 'Send OTP' : 'Verify & Login'}
            onSubmit={step === 'email' ? emailForm.handleSubmit(onEmailSubmit) : otpForm.handleSubmit(onOtpSubmit)}
        >
            <View className="py-4">
                {step === 'email' ? (
                    <>
                        <View className="mb-10">
                            <View className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-3xl items-center justify-center mb-6 shadow-sm">
                                <Mail size={32} color="#004aad" className="dark:text-blue-400" />
                            </View>
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Email Login</Text>
                            <Text className="text-slate-500 dark:text-gray-400 mt-2 text-base leading-6">
                                Enter your registered email address and we&apos;ll send you a 6-digit one-time password (OTP).
                            </Text>
                        </View>

                        <Controller
                            control={emailForm.control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormField
                                    label="Email Address"
                                    placeholder="example@mail.com"
                                    icon={Mail}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={emailForm.formState.errors.email?.message}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            )}
                        />
                    </>
                ) : (
                    <>
                        <View className="mb-10">
                            <View className="bg-green-50 dark:bg-green-900/20 w-16 h-16 rounded-3xl items-center justify-center mb-6 shadow-sm">
                                <ShieldCheck size={32} color="#16a34a" />
                            </View>
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Verify OTP</Text>
                            <Text className="text-slate-500 dark:text-gray-400 mt-2 text-base leading-6">
                                A 6-digit code has been sent to <Text className="font-bold text-slate-900 dark:text-white">{userEmail}</Text>.
                            </Text>
                        </View>

                        <Controller
                            control={otpForm.control}
                            name="otp"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormField
                                    label="One-Time Password"
                                    placeholder="000000"
                                    icon={ShieldCheck}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    error={otpForm.formState.errors.otp?.message}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    style={{ textAlign: 'center', letterSpacing: 8, fontWeight: '700', fontSize: 24 }}
                                />
                            )}
                        />

                        <TouchableOpacity className="mt-8 items-center" onPress={() => setStep('email')}>
                            <Text className="text-slate-500 dark:text-gray-400">
                                Didn&apos;t receive code? <Text className="text-[#004aad] dark:text-blue-400 font-bold">Resend OTP</Text>
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </FormLayout>
    );
}
