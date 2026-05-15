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
    TouchableOpacity
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
}

export function FormLayout({ 
    children, 
    title, 
    onBack, 
    bottomAction,
    isLoading,
    submitLabel,
    onSubmit
}: FormLayoutProps) {
    const insets = useSafeAreaInsets();
    
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
                            <TouchableOpacity
                                className={`h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none ${
                                    isLoading ? 'bg-[#004aad]/70' : 'bg-[#004aad] dark:bg-blue-600'
                                }`}
                                onPress={onSubmit}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">{submitLabel || 'Submit'}</Text>
                                )}
                            </TouchableOpacity>
                        ) : (
                            bottomAction
                        )}
                    </View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}
