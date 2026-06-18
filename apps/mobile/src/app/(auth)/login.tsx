import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { useRouter, Link } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Easing,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { useAuth } from '@/context/auth-context';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { getApiErrorMessage } from '@/lib/api/client';
import { Mail, ArrowRight, ShieldCheck, Lock, Eye, EyeOff, KeyRound, Fingerprint } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormField } from '@/components/ui/form-field';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OTP_BOX_SIZE = 48;
const OTP_GAP = 8;

type FlowStep = 'splash' | 'login' | 'otp' | 'success';
type LoginMethod = 'otp' | 'password';

const RESEND_COOLDOWN = 30; // seconds

const PREMIUM_EASING = Easing.bezier(0.2, 0, 0, 1);

export default function LoginScreen() {
    const router = useRouter();
    const { requestLoginOtp, loginWithOtp, login, verify2fa, isBiometricAvailable, isBiometricEnabled, loginWithBiometric, setupBiometric } = useAuth();
    const insets = useSafeAreaInsets();

    const [step, setStep] = useState<FlowStep>('splash');
    const [loginMethod, setLoginMethod] = useState<LoginMethod>('otp');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [isFocused, setIsFocused] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [isTwoFactorAuth, setIsTwoFactorAuth] = useState(false);
    const [isBiometricLoading, setIsBiometricLoading] = useState(false);

    const progress = useSharedValue(0);
    const keyboardProgress = useSharedValue(0);
    const otpInputRef = useRef<TextInput>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            transitionToLogin();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSubscription = Keyboard.addListener(showEvent, () => {
            setKeyboardVisible(true);
            keyboardProgress.value = withTiming(1, {
                duration: 250,
                easing: PREMIUM_EASING
            });
        });
        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setKeyboardVisible(false);
            keyboardProgress.value = withTiming(0, {
                duration: 250,
                easing: PREMIUM_EASING
            });
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    // Resend countdown timer
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => {
                setResendCountdown(resendCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    const transitionToLogin = () => {
        setStep('login');
        progress.value = withTiming(1, {
            duration: 700,
            easing: PREMIUM_EASING
        });
    };

    const handleRequestOtp = async () => {
        if (!email || !email.includes('@')) {
            toast.error('Invalid Email', { description: 'Please enter a valid email address.' });
            return;
        }

        setIsLoading(true);
        try {
            setIsTwoFactorAuth(false); // Reset to OTP login mode
            await requestLoginOtp(email);
            setStep('otp');
            setResendCountdown(RESEND_COOLDOWN);
        } catch (err) {
            toast.error('Error', { description: getApiErrorMessage(err, 'Failed to send code.') });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) return;

        setIsResending(true);
        try {
            await requestLoginOtp(email);
            toast.success('Code Resent', { description: 'A new verification code has been sent.' });
            setResendCountdown(RESEND_COOLDOWN);
            setOtp(''); // Clear OTP input for new code
        } catch (err) {
            toast.error('Error', { description: getApiErrorMessage(err, 'Failed to resend code.') });
        } finally {
            setIsResending(false);
        }
    };

    const handlePasswordLogin = async () => {
        if (!email || !email.includes('@')) {
            toast.error('Invalid Email', { description: 'Please enter a valid email address.' });
            return;
        }
        if (!password || password.length < 6) {
            toast.error('Invalid Password', { description: 'Please enter a valid password (min 6 characters).' });
            return;
        }

        setIsLoading(true);
        try {
            const result = await login({ email, password });

            if (result.twoFactorRequired) {
                // Transition to OTP step for 2FA verification
                setIsTwoFactorAuth(true);
                setStep('otp');
                setResendCountdown(RESEND_COOLDOWN);
            } else {
                // Login successful, complete the flow
                completeLogin();
            }
        } catch (err) {
            toast.error('Login Failed', { description: getApiErrorMessage(err, 'Invalid email or password.') });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (code: string) => {
        if (code.length !== 6) return;

        setIsLoading(true);
        try {
            if (isTwoFactorAuth) {
                // Verifying 2FA code after password login
                await verify2fa({ email, otp: code });
            } else {
                // OTP-only login flow
                await loginWithOtp({ email, otp: code });
            }
            completeLogin();
        } catch (err) {
            toast.error('Invalid Code', { description: getApiErrorMessage(err, 'Verification failed. Please try again.') });
            setOtp('');
        } finally {
            setIsLoading(false);
        }
    };

    const completeLogin = () => {
        setStep('success');
        progress.value = withTiming(2, { duration: 800, easing: PREMIUM_EASING });
        setTimeout(() => router.replace('/(tabs)'), 600);
    };

    const handleBiometricLogin = async () => {
        if (isBiometricEnabled) {
            // Auto login with biometric
            setIsBiometricLoading(true);
            try {
                await loginWithBiometric();
            } finally {
                setIsBiometricLoading(false);
            }
        } else if (isBiometricAvailable) {
            // Setup biometric
            setIsBiometricLoading(true);
            try {
                await setupBiometric();
            } finally {
                setIsBiometricLoading(false);
            }
        }
    };

    const animatedLogoStyle = useAnimatedStyle(() => {
        const splashSize = 150;
        const loginSize = interpolate(keyboardProgress.value, [0, 1], [110, 56]);
        const size = interpolate(progress.value, [0, 1, 2], [splashSize, loginSize, loginSize], 'clamp');

        const splashTop = SCREEN_HEIGHT / 2 - splashSize / 2;
        const splashLeft = SCREEN_WIDTH / 2 - splashSize / 2;

        const loginTop = interpolate(keyboardProgress.value, [0, 1], [insets.top + 60, insets.top + 20]);
        const loginLeft = SCREEN_WIDTH / 2 - loginSize / 2;

        const top = interpolate(progress.value, [0, 1, 2], [splashTop, loginTop, loginTop], 'clamp');
        const left = interpolate(progress.value, [0, 1, 2], [splashLeft, loginLeft, loginLeft], 'clamp');

        return {
            position: 'absolute',
            width: size,
            height: size,
            top,
            left,
            zIndex: 50,
        };
    });

    const placeholderLogoStyle = useAnimatedStyle(() => {
        const size = interpolate(keyboardProgress.value, [0, 1], [110, 56]);
        const marginBottom = interpolate(keyboardProgress.value, [0, 1], [16, 6]);

        return {
            width: size,
            height: size,
            marginBottom,
        };
    });

    const contentContainerStyle = useAnimatedStyle(() => {
        // Reduce vertical padding in contentContainer when keyboard is active to maximize space
        const paddingTop = interpolate(keyboardProgress.value, [0, 1], [60, 20]);
        const paddingBottom = interpolate(keyboardProgress.value, [0, 1], [60, 10]);

        return {
            paddingTop,
            paddingBottom,
        };
    });

    const contentStyle = useAnimatedStyle(() => {
        // Opacity: 0 at splash (0), fades in for login/otp (1), fades out for success (2)
        const opacity = interpolate(progress.value, [0, 0.6, 1, 1.4, 2], [0, 0, 1, 1, 0], 'clamp');
        // Translate Y: slides up from 30 to 0 on enter, slides down to 50 on exit
        const translateY = interpolate(progress.value, [0, 1, 2], [30, 0, 50], 'clamp');

        return {
            opacity,
            transform: [{ translateY }]
        };
    });

    const bottomLinksStyle = useAnimatedStyle(() => {
        // Fade out and slide down bottom actions and legal links when keyboard is visible
        const opacity = interpolate(keyboardProgress.value, [0, 1], [1, 0]);
        const translateY = interpolate(keyboardProgress.value, [0, 1], [0, 40]);

        return {
            opacity,
            transform: [{ translateY }],
        };
    });

    return (
        <View style={styles.container}>
            {/* Unified Animated Logo with Shared Element Transition */}
            <Animated.Image
                sharedTransitionTag="appLogo"
                source={require('../../../assets/branding/merucountylogo.png')}
                style={animatedLogoStyle}
                resizeMode="contain"
                pointerEvents="none"
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    keyboardVerticalOffset={insets.bottom}
                >
                    <Animated.View style={[styles.contentContainer, contentContainerStyle]}>
                        <Animated.View style={contentStyle}>
                            {/* Login Form */}
                            {step === 'login' && (
                                <Animated.View style={styles.stepContent} entering={FadeIn.duration(400)}>
                                    <View style={styles.header}>
                                        {/* Reserved space for absolute logo overlay */}
                                        <Animated.View style={placeholderLogoStyle} />
                                        <Text style={styles.title}>Sign In</Text>
                                        <Text style={styles.subtitle}>
                                            Build your future with Meru County
                                        </Text>
                                    </View>

                                    <View style={styles.formContainer}>
                                        {/* Email (shared) */}
                                        <FormField
                                            placeholder="Email Address"
                                            value={email}
                                            onChangeText={setEmail}
                                            icon={Mail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            editable={!isLoading}
                                            testID="login-email"
                                        />

                                        {/* Password field (only when password mode) */}
                                        {loginMethod === 'password' && (
                                            <Animated.View entering={FadeIn.duration(300)}>
                                                <FormField
                                                    placeholder="Password"
                                                    value={password}
                                                    onChangeText={setPassword}
                                                    icon={Lock}
                                                    secureTextEntry={!showPassword}
                                                    autoCapitalize="none"
                                                    testID="login-password"
                                                    rightElement={
                                                        <TouchableOpacity
                                                            onPress={() => setShowPassword(!showPassword)}
                                                            style={styles.eyeIcon}
                                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                            testID="login-password-toggle"
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff size={20} color="#94a3b8" />
                                                            ) : (
                                                                <Eye size={20} color="#94a3b8" />
                                                            )}
                                                        </TouchableOpacity>
                                                    }
                                                />

                                                <TouchableOpacity
                                                    style={styles.forgotPassword}
                                                    onPress={() => router.push('/forgot-password')}
                                                >
                                                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        )}

                                        {/* Primary Action Button */}
                                        <TouchableOpacity
                                            style={[
                                                styles.primaryButton,
                                                isLoading && styles.primaryButtonDisabled
                                            ]}
                                            onPress={loginMethod === 'otp' ? handleRequestOtp : handlePasswordLogin}
                                            disabled={isLoading}
                                            activeOpacity={0.8}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <>
                                                    <Text style={styles.primaryButtonText}>
                                                        {loginMethod === 'otp' ? 'Get Login Code' : 'Sign In'}
                                                    </Text>
                                                    <ArrowRight size={20} color="white" strokeWidth={2.5} />
                                                </>
                                            )}
                                        </TouchableOpacity>

                                        {/* Login Method Switch */}
                                        {loginMethod === 'otp' ? (
                                            <TouchableOpacity
                                                onPress={() => setLoginMethod('password')}
                                                style={styles.secondaryButton}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.secondaryButtonText}>Sign in with password</Text>
                                                <Lock size={16} color="#64748b" strokeWidth={2} />
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => setLoginMethod('otp')}
                                                style={styles.secondaryButton}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.secondaryButtonText}>Sign in with code</Text>
                                                <KeyRound size={16} color="#64748b" strokeWidth={2} />
                                            </TouchableOpacity>
                                        )}

                                        {/* Biometric Login */}
                                        {isBiometricAvailable && (
                                            <TouchableOpacity
                                                onPress={handleBiometricLogin}
                                                style={[
                                                    styles.secondaryButton,
                                                    isBiometricEnabled && styles.biometricEnabledButton
                                                ]}
                                                activeOpacity={0.8}
                                                disabled={isBiometricLoading}
                                            >
                                                {isBiometricLoading ? (
                                                    <ActivityIndicator size="small" color="#004aad" />
                                                ) : (
                                                    <>
                                                        <Fingerprint size={16} color={isBiometricEnabled ? "#10b981" : "#64748b"} strokeWidth={2} />
                                                        <Text style={[styles.secondaryButtonText, isBiometricEnabled && styles.biometricEnabledText]}>
                                                            {isBiometricEnabled ? 'Login with Biometric' : 'Enable Biometric Login'}
                                                        </Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </Animated.View>
                            )}

                            {/* OTP Verification Step */}
                            {step === 'otp' && (
                                <Animated.View style={styles.stepContent} entering={FadeIn.duration(400)}>
                                    <View style={styles.header}>
                                        {/* Reserved space for absolute logo overlay */}
                                        <Animated.View style={placeholderLogoStyle} />
                                        <Text style={styles.title}>Verification</Text>
                                        <Text style={styles.otpSubtitle}>Code sent to {email}</Text>
                                        <TouchableOpacity
                                            style={styles.editEmailButton}
                                            onPress={() => setStep('login')}
                                        >
                                            <Text style={styles.editEmailText}>Change email</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.otpContainer}>
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <View
                                                key={index}
                                                style={[
                                                    styles.otpBox,
                                                    otp.length > index && styles.otpBoxFilled
                                                ]}
                                            >
                                                <Text style={styles.otpText}>{otp[index] || ''}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <TextInput
                                        ref={otpInputRef}
                                        value={otp}
                                        onChangeText={(text) => {
                                            const numericText = text.replace(/[^0-9]/g, '');
                                            setOtp(numericText);
                                            if (numericText.length === 6) handleVerifyOtp(numericText);
                                        }}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        style={styles.hiddenInput}
                                        autoFocus
                                    />

                                    {/* Resend Code Button */}
                                    <TouchableOpacity
                                        style={styles.resendButton}
                                        onPress={handleResendOtp}
                                        disabled={resendCountdown > 0 || isResending}
                                        activeOpacity={0.7}
                                    >
                                        {isResending ? (
                                            <ActivityIndicator size="small" color="#004aad" />
                                        ) : (
                                            <Text style={styles.resendButtonText}>
                                                {resendCountdown > 0
                                                    ? `Resend in ${resendCountdown}s`
                                                    : 'Resend code'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            )}

                            {/* Global Actions */}
                            {step === 'login' && (
                                <View style={styles.globalActions}>
                                </View>
                            )}
                        </Animated.View>
                    </Animated.View>

                    {/* Legal Links at bottom - outside animated view */}
                    {step === 'login' && (
                        <>
                            <Animated.View 
                                style={[styles.signupBottom, { bottom: insets.bottom + 50 }, bottomLinksStyle]}
                                pointerEvents={keyboardVisible ? 'none' : 'auto'}
                            >
                                <Text style={styles.signupText}>Don't have an account? </Text>
                                <Link href="/register" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.signupLink}>Create Account</Text>
                                    </TouchableOpacity>
                                </Link>
                            </Animated.View>
                            <Animated.View 
                                style={[styles.legalLinksBottom, { bottom: insets.bottom + 8 }, bottomLinksStyle]}
                                pointerEvents={keyboardVisible ? 'none' : 'auto'}
                            >
                                <TouchableOpacity>
                                    <Text style={styles.legalLink}>Privacy Policy</Text>
                                </TouchableOpacity>
                                <Text style={styles.legalSeparator}>•</Text>
                                <TouchableOpacity>
                                    <Text style={styles.legalLink}>Terms of Service</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </>
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 100,
        paddingBottom: 60,
    },
    // Header Logo (small, at top)
    headerLogo: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    headerLogoImage: {
        width: 180,
        height: 180,
    },
    // Splash Logo (centered, large)
    splashLogo: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -75,
        marginTop: -75,
    },
    splashLogoImage: {
        width: 150,
        height: 150,
    },
    // Step Content
    stepContent: {
        width: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0f172a',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    // Method Toggle
    methodToggle: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    methodOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
        borderRadius: 10,
    },
    methodOptionActive: {
        backgroundColor: '#004aad',
        shadowColor: '#004aad',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    methodOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    methodOptionTextActive: {
        color: '#fff',
    },
    // Form
    formContainer: {
        width: '100%',
    },
    eyeIcon: {
        padding: 8,
    },
    // Buttons
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#004aad',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 24,
        gap: 8,
        minHeight: 54,
        shadowColor: '#004aad',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
        marginTop: 8,
    },
    primaryButtonDisabled: {
        opacity: 0.7,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    methodSwitchLink: {
        alignItems: 'center',
        paddingVertical: 8,
        marginTop: 4,
    },
    methodSwitchBorder: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    methodSwitchText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#004aad',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 8,
        minHeight: 48,
        marginTop: 12,
        zIndex: 1,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#64748b',
    },
    // Forgot Password
    forgotPassword: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#004aad',
    },
    // OTP
    otpHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    otpIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    otpSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'center',
    },
    editEmailButton: {
        marginTop: 12,
    },
    editEmailText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#004aad',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    otpBox: {
        width: OTP_BOX_SIZE,
        height: OTP_BOX_SIZE,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpBoxFilled: {
        borderColor: '#004aad',
        backgroundColor: '#eff6ff',
    },
    otpText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0f172a',
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
    resendButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
        minHeight: 44,
    },
    resendButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#004aad',
    },
    // Global Actions
    globalActions: {
        marginTop: 32,
        alignItems: 'center',
    },
    signupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    signupText: {
        fontSize: 14,
        color: '#64748b',
    },
    signupLink: {
        fontSize: 14,
        fontWeight: '700',
        color: '#004aad',
    },
    signupBottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    legalLinksBottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    legalLink: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94a3b8',
        textDecorationLine: 'underline',
    },
    legalSeparator: {
        fontSize: 12,
        color: '#cbd5e1',
    },
    biometricEnabledButton: {
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4',
    },
    biometricEnabledText: {
        color: '#10b981',
    },
    headerLogoContainer: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerLogoImageInside: {
        width: '100%',
        height: '100%',
    },
});
