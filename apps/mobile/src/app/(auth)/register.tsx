import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Header } from '@/components/ui/header';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, HelpCircle, Shield } from 'lucide-react-native';
import { getApiErrorMessage } from '@/lib/api/client';
import { FormField } from '@/components/ui/form-field';
import { registerSchema } from '@meru/shared';

type RegisterFormValues = {
    email: string;
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    role?: 'applicant' | 'admin';
};

type RegisterFormData = RegisterFormValues & {
    role: 'applicant' | 'admin';
};

export default function RegisterScreen() {
    const { register: registerUser } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Refs for keyboard navigation
    const lastNameRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);
    const idRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues, any, RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phoneNumber: '',
            nationalId: '',
            email: '',
            password: '',
            role: 'applicant',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await registerUser(data);
        } catch (err: any) {
            setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-950">
            <Header title="Create Account" />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView 
                    className="flex-1" 
                    showsVerticalScrollIndicator={false} 
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                >
                    <View className="px-6 pt-4 pb-8">

                        <View className="mb-8">
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Join Public Service</Text>
                            <Text className="text-slate-500 dark:text-gray-400 mt-2 text-base leading-6">
                                Start your professional journey with Meru County Public Service Board.
                            </Text>
                        </View>

                        {error && (
                            <View className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl mb-8 border border-red-100 dark:border-red-900/20">
                                <Text className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</Text>
                            </View>
                        )}

                        <View className="space-y-4">
                            {/* First Name */}
                            <Controller
                                control={control}
                                name="firstName"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        label="First Name"
                                        placeholder="Enter your first name"
                                        icon={User}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={errors.firstName?.message}
                                        nextFieldRef={lastNameRef}
                                        testID="register-first-name"
                                    />
                                )}
                            />

                            {/* Last Name */}
                            <Controller
                                control={control}
                                name="lastName"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        ref={lastNameRef}
                                        label="Last Name"
                                        placeholder="Enter your last name"
                                        icon={User}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={errors.lastName?.message}
                                        nextFieldRef={phoneRef}
                                        testID="register-last-name"
                                    />
                                )}
                            />

                            {/* Phone Number */}
                            <Controller
                                control={control}
                                name="phoneNumber"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        ref={phoneRef}
                                        label="Phone Number"
                                        placeholder="700 000 000"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={errors.phoneNumber?.message}
                                        keyboardType="phone-pad"
                                        nextFieldRef={idRef}
                                        testID="register-phone"
                                    />
                                )}
                            />

                            {/* National ID */}
                            <Controller
                                control={control}
                                name="nationalId"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        ref={idRef}
                                        label="ID / Passport Number"
                                        placeholder="ID or Passport Number"
                                        icon={ShieldCheck}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={errors.nationalId?.message}
                                        nextFieldRef={emailRef}
                                        testID="register-id-number"
                                    />
                                )}
                            />

                            {/* Email */}
                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        ref={emailRef}
                                        label="Email Address"
                                        placeholder="example@mail.com"
                                        icon={Mail}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={errors.email?.message}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        nextFieldRef={passwordRef}
                                        testID="register-email"
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField
                                        ref={passwordRef}
                                        label="Password"
                                        placeholder="••••••••"
                                        icon={Lock}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        error={errors.password?.message}
                                        secureTextEntry={!showPassword}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSubmit(onSubmit)}
                                        testID="register-password"
                                        rightElement={
                                            <Pressable onPress={() => setShowPassword(!showPassword)} testID="register-password-toggle">
                                                {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                                            </Pressable>
                                        }
                                    />
                                )}
                            />

                            {/* Sign Up Button */}
                            <Pressable
                                className={`mt-8 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none  ${
                                    isLoading ? 'bg-[#004aad]/70' : 'bg-[#004aad] dark:bg-blue-600'
                                }`}
                                onPress={handleSubmit(onSubmit)}
                                disabled={isLoading}
                                testID="register-submit"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <View className="flex-row items-center">
                                        <Text className="text-white text-lg font-bold mr-2">Create Account</Text>
                                        <ArrowRight size={20} color="white" />
                                    </View>
                                )}
                            </Pressable>

                            <View className="flex-row justify-center mt-8 mb-6">
                                <Text className="text-slate-500 dark:text-gray-400 text-base">Already have an account? </Text>
                                <Link href="/login" asChild>
                                    <Pressable testID="register-login">
                                        <Text className="text-[#004aad] dark:text-blue-400 font-bold text-base">Sign In</Text>
                                    </Pressable>
                                </Link>
                            </View>

                            {/* Info Cards */}
                            <View className="flex-row gap-4 mb-10">
                                <View className="flex-1 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                                    <View className="bg-orange-50 dark:bg-orange-900/20 w-10 h-10 rounded-xl items-center justify-center mb-3">
                                        <HelpCircle size={20} color="#f97316" />
                                    </View>
                                    <Text className="font-bold text-slate-900 dark:text-white text-xs">Help Center</Text>
                                    <Text className="text-slate-500 dark:text-gray-400 text-[10px] mt-1">Registration guide</Text>
                                </View>
                                <View className="flex-1 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
                                    <View className="bg-blue-50 dark:bg-blue-900/20 w-10 h-10 rounded-xl items-center justify-center mb-3">
                                        <Shield size={20} color="#004aad" className="dark:text-blue-400" />
                                    </View>
                                    <Text className="font-bold text-slate-900 dark:text-white text-xs">Data Privacy</Text>
                                    <Text className="text-slate-500 dark:text-gray-400 text-[10px] mt-1">Policy & Terms</Text>
                                </View>
                            </View>

                            <Text className="text-center text-slate-400 text-[10px] mb-8">
                                © 2026 Meru County Public Service Board.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
