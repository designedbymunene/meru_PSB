import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff, Fingerprint, Headphones, Lock, Mail } from 'lucide-react-native';
import React, { useRef, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { getApiErrorMessage } from '@/lib/api/client';
import { FormField } from '@/components/ui/form-field';
import { safeAsyncStorage } from '@/lib/storage';
import { toast } from 'sonner-native';

// Safely import LocalAuthentication to prevent crashes when native module is missing
const getLocalAuth = () => {
    try {
        return require('expo-local-authentication');
    } catch (e) {
        console.warn('ExpoLocalAuthentication not available');
        return null;
    }
};

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const { login, user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    const passwordRef = useRef<TextInput>(null);

    const { control, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        const checkBiometrics = async () => {
            const LocalAuthentication = getLocalAuth();
            if (!LocalAuthentication) return;

            try {
                const hasHardware = await LocalAuthentication.hasHardwareAsync();
                const isEnrolled = await LocalAuthentication.isEnrolledAsync();
                const enabled = await safeAsyncStorage.getItem('security_biometrics_enabled');

                if (hasHardware && isEnrolled && enabled === 'true') {
                    setIsBiometricAvailable(true);
                }
            } catch (e) {
                console.warn('Biometrics not available:', e);
            }
        };
        checkBiometrics();
    }, []);

    const handleBiometricLogin = async () => {
        const LocalAuthentication = getLocalAuth();
        if (!LocalAuthentication) {
            toast.error('Error', { description: 'Biometric authentication is not available on this device.' });
            return;
        }

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Sign in with Biometrics',
                fallbackLabel: 'Use Password',
            });

            if (result.success) {
                const storedEmail = await safeAsyncStorage.getItem('last_login_email');
                if (storedEmail) {
                    setValue('email', storedEmail);
                }
                toast.success('Identity Verified');
            }
        } catch (e) {
            console.error('Biometric auth failed', e);
            toast.error('Error', { description: 'Biometric authentication failed or was cancelled.' });
        }
    };

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await login(data);
            await safeAsyncStorage.setItem('last_login_email', data.email);
            
            if (result?.twoFactorRequired) {
                router.push({ pathname: '/(auth)/login-2fa', params: { email: data.email } });
            }
        } catch (err: any) {
            setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    className="px-6"
                >
                    <View className="flex-1 justify-center py-12">
                        {/* Logo and Header */}
                        <View className="items-center mb-10">
                            <View className="h-24 w-24 rounded-3xl bg-slate-50 dark:bg-gray-900 items-center justify-center shadow-sm mb-6 border border-slate-100 dark:border-gray-800">
                                <Image
                                    source={require('../../../assets/branding/merucountylogo.png')}
                                    style={{ width: 64, height: 64 }}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {user?.fullName ? `Welcome back, ${user.fullName.split(' ')[0]}` : 'Sign In'}
                            </Text>
                            <Text className="mt-2 text-slate-500 dark:text-gray-400 text-center text-base">
                                Meru County Public Service Board Portal
                            </Text>
                        </View>

                        {/* Form Card */}
                        <View className="space-y-2">
                            {error && (
                                <View className="rounded-2xl bg-red-50 dark:bg-red-900/10 p-4 border border-red-100 dark:border-red-900/20 mb-6">
                                    <Text className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</Text>
                                </View>
                            )}

                            {/* Email Input */}
                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        label="Email Address"
                                        placeholder="Enter your email"
                                        icon={Mail}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={errors.email?.message}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        nextFieldRef={passwordRef}
                                    />
                                )}
                            />

                            {/* Password Input */}
                            <View className="mt-2">
                                <View className="flex-row justify-between items-center mb-2 ml-1">
                                    <Text className="text-sm font-semibold text-slate-700 dark:text-gray-300">Password</Text>
                                    <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                                        <Text className="text-sm font-bold text-[#004aad] dark:text-blue-400">Forgot password?</Text>
                                    </TouchableOpacity>
                                </View>
                                <View className="relative">
                                    <Controller
                                        control={control}
                                        name="password"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <FormField
                                                ref={passwordRef}
                                                label=""
                                                placeholder="••••••••"
                                                icon={Lock}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                error={errors.password?.message}
                                                secureTextEntry={!showPassword}
                                                returnKeyType="done"
                                                onSubmitEditing={handleSubmit(onSubmit)}
                                            />
                                        )}
                                    />
                                    <TouchableOpacity 
                                        onPress={() => setShowPassword(!showPassword)} 
                                        className="absolute right-4 top-[14px]"
                                    >
                                        {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Sign In Button */}
                            <TouchableOpacity
                                className={`mt-8 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none active:opacity-90 ${
                                    isLoading ? 'bg-[#004aad]/70' : 'bg-[#004aad] dark:bg-blue-600'
                                }`}
                                onPress={handleSubmit(onSubmit)}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">Sign In</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View className="my-10 flex-row items-center">
                            <View className="h-[1px] flex-1 bg-slate-100 dark:bg-gray-800" />
                            <Text className="mx-4 text-xs font-bold text-slate-400 dark:text-gray-500 tracking-widest">OR CONTINUE WITH</Text>
                            <View className="h-[1px] flex-1 bg-slate-100 dark:bg-gray-800" />
                        </View>

                        {/* Quick Login Options */}
                        <View className="flex-row gap-4">
                            {isBiometricAvailable && (
                                <TouchableOpacity 
                                    onPress={handleBiometricLogin}
                                    className="flex-1 flex-row items-center justify-center h-14 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 active:bg-slate-50 dark:active:bg-gray-800 shadow-sm"
                                >
                                    <Fingerprint size={22} color="#004aad" className="dark:text-blue-400" />
                                    <Text className="ml-2 font-bold text-slate-700 dark:text-gray-300">Biometrics</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity 
                                onPress={() => router.push('/(auth)/otp-login')}
                                className="flex-1 flex-row items-center justify-center h-14 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 active:bg-slate-50 dark:active:bg-gray-800 shadow-sm"
                            >
                                <Mail size={22} color="#004aad" className="dark:text-blue-400" />
                                <Text className="ml-2 font-bold text-slate-700 dark:text-gray-300">OTP</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Register Link */}
                        <View className="mt-12 flex-row justify-center">
                            <Text className="text-slate-500 dark:text-gray-400 text-base">New here? </Text>
                            <Link href="/register" asChild>
                                <TouchableOpacity>
                                    <Text className="text-base font-bold text-[#004aad] dark:text-blue-400">Create account</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>

                    {/* Footer Links */}
                    <View className="pb-8 flex-row justify-center gap-4">
                        <TouchableOpacity onPress={() => router.push('/support')}>
                            <Text className="text-xs font-medium text-slate-400">Support</Text>
                        </TouchableOpacity>
                        <Text className="text-xs text-slate-300">•</Text>
                        <TouchableOpacity>
                            <Text className="text-xs font-medium text-slate-400">Privacy</Text>
                        </TouchableOpacity>
                        <Text className="text-xs text-slate-300">•</Text>
                        <TouchableOpacity>
                            <Text className="text-xs font-medium text-slate-400">Terms</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Floating Support Button */}
            <TouchableOpacity
                onPress={() => router.push('/support')}
                className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-slate-900 dark:bg-gray-800 shadow-xl active:scale-95"
            >
                <Headphones color="white" size={24} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
