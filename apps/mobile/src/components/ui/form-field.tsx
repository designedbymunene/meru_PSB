import React, { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface FormFieldProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    rightElement?: React.ReactNode;
    nextFieldRef?: React.RefObject<TextInput | null>;
    testID?: string;
}

export const FormField = forwardRef<TextInput, FormFieldProps>(
    ({ label, error, icon: Icon, rightElement, nextFieldRef, testID, ...props }, ref) => {
        return (
            <View className="mb-4" testID={testID}>
                {label ? (
                    <Text className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 ml-1">
                        {label}
                    </Text>
                ) : null}
                <View 
                    className={`flex-row ${props.multiline ? 'items-start min-h-[112px]' : 'items-center h-14'} rounded-2xl border bg-slate-50 dark:bg-gray-900 px-4 ${
                        error 
                            ? 'border-red-500' 
                            : 'border-slate-200 dark:border-gray-800 focus:border-[#004aad] dark:focus:border-blue-500'
                    }`}
                >
                    {Icon && (
                        <View className={props.multiline ? 'mt-4' : ''}>
                            <Icon size={20} color={error ? '#ef4444' : '#64748b'} />
                        </View>
                    )}
                    <TextInput
                        ref={ref}
                        className={`flex-1 ${props.multiline ? 'py-3' : 'h-full'} text-slate-900 dark:text-white text-base ${Icon ? 'px-3' : 'px-1'} ${props.className || ''}`}
                        placeholderTextColor="#94a3b8"
                        testID={testID ? `${testID}-input` : 'form-field-input'}
                        textAlignVertical={props.multiline ? 'top' : 'center'}
                        returnKeyType={nextFieldRef ? 'next' : props.returnKeyType || 'done'}
                        onSubmitEditing={(e) => {
                            if (nextFieldRef?.current) {
                                nextFieldRef.current.focus();
                            }
                            if (props.onSubmitEditing) {
                                props.onSubmitEditing(e);
                            }
                        }}
                        blurOnSubmit={!nextFieldRef}
                        {...props}
                    />
                    {rightElement && (
                        <View className="ml-2">
                            {rightElement}
                        </View>
                    )}
                </View>
                {error && (
                    <Text className="mt-1 ml-1 text-xs text-red-500 font-medium">
                        {error}
                    </Text>
                )}
            </View>
        );
    }
);

FormField.displayName = 'FormField';
