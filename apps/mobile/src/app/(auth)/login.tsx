import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming, 
    runOnJS,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { useAuth } from '@/context/auth-context';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { getApiErrorMessage } from '@/lib/api/client';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type FlowStep = 'splash' | 'email' | 'otp' | 'success';

export default function LoginScreen() {
    const router = useRouter();
    const { requestLoginOtp, loginWithOtp } = useAuth();
    
    const [step, setStep] = useState<FlowStep>('splash');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Animation values
    const logoY = useSharedValue(0);
    const logoScale = useSharedValue(1.5);
    const logoX = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const otpOpacity = useSharedValue(0);
    const emailOpacity = useSharedValue(0);

    const otpInputRef = useRef<TextInput>(null);

    useEffect(() => {
        // Initial splash delay
        const timer = setTimeout(() => {
            transitionToEmail();
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const transitionToEmail = () => {
        setStep('email');
        logoY.value = withSpring(-180, { damping: 15 });
        logoScale.value = withSpring(1, { damping: 15 });
        contentOpacity.value = withTiming(1, { duration: 500 });
        emailOpacity.value = withTiming(1, { duration: 500 });
    };

    const handleRequestOtp = async () => {
        if (!email || !email.includes('@')) {
            toast.error('Invalid Email', { description: 'Please enter a valid email address.' });
            return;
        }

        setIsLoading(true);
        try {
            await requestLoginOtp(email);
            setStep('otp');
            emailOpacity.value = withTiming(0, { duration: 300 }, () => {
                otpOpacity.value = withTiming(1, { duration: 300 });
            });
        } catch (err) {
            toast.error('Error', { description: getApiErrorMessage(err, 'Failed to send code.') });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (code: string) => {
        if (code.length !== 6) return;
        
        setIsLoading(true);
        try {
            await loginWithOtp({ email, otp: code });
            setStep('success');
            // Final transition: logo moves to top left
            logoX.value = withSpring(-(SCREEN_WIDTH / 2 - 32), { damping: 18, stiffness: 100 });
            logoY.value = withSpring(-(SCREEN_HEIGHT / 2 - 58), { damping: 18, stiffness: 100 });
            logoScale.value = withSpring(0.4, { damping: 18 });
            
            contentOpacity.value = withTiming(0, { duration: 600 }, () => {
                runOnJS(navigateToDashboard)();
            });
        } catch (err) {
            toast.error('Invalid Code', { description: getApiErrorMessage(err, 'Verification failed.') });
            setOtp('');
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToDashboard = () => {
        router.replace('/(tabs)');
    };

    const animatedLogoStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: logoY.value },
            { translateX: logoX.value },
            { scale: logoScale.value }
        ],
    }));

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: interpolate(contentOpacity.value, [0, 1], [20, 0]) }]
    }));

    const animatedEmailStyle = useAnimatedStyle(() => ({
        opacity: emailOpacity.value,
        display: emailOpacity.value === 0 && step !== 'email' ? 'none' : 'flex'
    }));

    const animatedOtpStyle = useAnimatedStyle(() => ({
        opacity: otpOpacity.value,
        display: otpOpacity.value === 0 && step !== 'otp' ? 'none' : 'flex'
    }));

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 items-center justify-center px-8"
            >
                {/* Subtle Professional Background - Light & Clean */}
                <View className="absolute inset-0 opacity-5 items-center justify-center">
                   <View className="w-full h-full bg-slate-100" />
                </View>

                {/* Logo */}
                <Animated.View style={[animatedLogoStyle, { zIndex: 50 }]}>
                    <View className="w-20 h-20 bg-slate-50 rounded-[28px] items-center justify-center border border-slate-100 shadow-sm">
                        <Image 
                            source={require('../../../assets/branding/merucountylogo.png')} 
                            style={{ width: 50, height: 50 }}
                            contentFit="contain"
                        />
                    </View>
                </Animated.View>

                {/* Main Content */}
                <Animated.View style={[animatedContentStyle, { width: '100%' }]}>
                    {/* Email Step */}
                    <Animated.View style={animatedEmailStyle}>
                        <View className="items-center mb-10">
                            <Text className="text-slate-900 text-3xl font-bold tracking-tight text-center">Meru County PSB Portal</Text>
                            <Text className="text-slate-500 mt-2 text-center text-base">Sign in to your professional account</Text>
                        </View>

                        <View className="w-full space-y-4">
                            <View className="bg-slate-50 border border-slate-200 h-16 rounded-2xl px-4 flex-row items-center">
                                <TextInput
                                    className="flex-1 text-slate-900 text-lg font-medium"
                                    placeholder="Email Address"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <Pressable 
                                className={`h-16 rounded-2xl items-center justify-center bg-[#004aad] shadow-lg shadow-blue-200 active:scale-95 transition-all ${isLoading ? 'opacity-70' : ''}`}
                                onPress={handleRequestOtp}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">Get login code</Text>
                                )}
                            </Pressable>
                        </View>
                    </Animated.View>

                    {/* OTP Step */}
                    <Animated.View style={animatedOtpStyle}>
                        <View className="items-center mb-8">
                            <Text className="text-slate-900 text-3xl font-bold tracking-tight">Check your email</Text>
                            <Text className="text-slate-500 mt-2 text-center text-base leading-6">We've sent a secure code to{"\n"}<Text className="text-[#004aad] font-semibold">{email}</Text></Text>
                        </View>

                        <View className="flex-row justify-between mb-8">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <View 
                                    key={index}
                                    className={`w-[14%] aspect-square rounded-xl border-2 items-center justify-center bg-slate-50 ${
                                        otp[index] ? 'border-[#004aad] bg-blue-50/50' : 'border-slate-100'
                                    }`}
                                >
                                    <Text className="text-slate-900 text-2xl font-bold">{otp[index] || ''}</Text>
                                </View>
                            ))}
                        </View>

                        <TextInput
                            ref={otpInputRef}
                            value={otp}
                            onChangeText={(text) => {
                                setOtp(text);
                                if (text.length === 6) handleVerifyOtp(text);
                            }}
                            keyboardType="number-pad"
                            maxLength={6}
                            className="absolute w-full h-16 opacity-0"
                            autoFocus={step === 'otp'}
                        />

                        <Pressable 
                            onPress={() => {
                                setStep('email');
                                otpOpacity.value = withTiming(0, { duration: 300 }, () => {
                                    emailOpacity.value = withTiming(1, { duration: 300 });
                                });
                            }}
                            className="items-center"
                        >
                            <Text className="text-slate-400 text-sm">Didn't get the code? <Text className="text-[#004aad] font-bold">Resend</Text></Text>
                        </Pressable>
                    </Animated.View>
                </Animated.View>

                {/* Footer Info */}
                <Animated.View 
                    style={[animatedContentStyle, { position: 'absolute', bottom: 40 }]}
                >
                    <Text className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
                        Official Meru County Government Portal
                    </Text>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
