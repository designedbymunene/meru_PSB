import React, { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface FormFieldProps extends TextInputProps {
    label: string;
    error?: string;
    icon?: LucideIcon;
    nextFieldRef?: React.RefObject<TextInput>;
}

export const FormField = forwardRef<TextInput, FormFieldProps>(
    ({ label, error, icon: Icon, nextFieldRef, ...props }, ref) => {
        return (
            <View className="mb-4">
                <Text className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 ml-1">
                    {label}
                </Text>
                <View 
                    className={`flex-row items-center h-14 rounded-2xl border bg-slate-50 dark:bg-gray-900 px-4 ${
                        error 
                            ? 'border-red-500' 
                            : 'border-slate-200 dark:border-gray-800 focus:border-[#004aad] dark:focus:border-blue-500'
                    }`}
                >
                    {Icon && <Icon size={20} color={error ? '#ef4444' : '#64748b'} />}
                    <TextInput
                        ref={ref}
                        className={`flex-1 h-full text-slate-900 dark:text-white text-base ${Icon ? 'px-3' : 'px-1'}`}
                        placeholderTextColor="#94a3b8"
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
