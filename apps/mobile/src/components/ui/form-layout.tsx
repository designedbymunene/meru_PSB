import React from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    View,
    ActivityIndicator,
    Text,
    Pressable
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from './header';

interface FormLayoutProps {
    children: React.ReactNode;
    title: string;
    onBack?: () => void;
    bottomAction?: React.ReactNode;
    isLoading?: boolean;
    submitLabel?: string;
    onSubmit?: () => void;
    testID?: string;
}

export function FormLayout({
    children,
    title,
    onBack,
    bottomAction,
    isLoading,
    submitLabel,
    onSubmit,
    testID
}: FormLayoutProps) {
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = React.useState(0);

    React.useEffect(() => {
        if (Platform.OS === 'android') {
            const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            });
            const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardHeight(0);
            });
            return () => {
                showSubscription.remove();
                hideSubscription.remove();
            };
        }
    }, []);
    
    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header title={title} onBack={onBack} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ 
                            flexGrow: 1,
                            paddingBottom: bottomAction || onSubmit ? 0 : insets.bottom + 20
                        }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                    >
                        <View className="p-6 pt-4">
                            {children}
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
                
                {(bottomAction || onSubmit) && (
                    <View 
                        className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950"
                        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
                    >
                        {onSubmit ? (
                            <Pressable
                                className={`h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none ${
                                    isLoading ? 'bg-[#004aad]/70' : 'bg-[#004aad] dark:bg-blue-600'
                                }`}
                                onPress={onSubmit}
                                disabled={isLoading}
                                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                                testID={testID ? `${testID}-submit` : 'form-layout-submit'}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">{submitLabel || 'Submit'}</Text>
                                )}
                            </Pressable>
                        ) : (
                            bottomAction
                        )}
                    </View>
                )}
                {Platform.OS === 'android' && <View style={{ height: keyboardHeight }} />}
            </KeyboardAvoidingView>
        </View>
    );
}
