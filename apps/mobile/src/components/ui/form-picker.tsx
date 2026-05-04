import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { Platform, Text, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

interface FormPickerProps {
    label: string;
    value: string;
    onValueChange: (value: any) => void;
    items: { label: string; value: string }[];
    placeholder?: string;
    error?: string;
}

export function FormPicker({ label, value, onValueChange, items, placeholder, error }: FormPickerProps) {
    const placeholderValue = placeholder ? { label: placeholder, value: null } : {};

    return (
        <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 ml-1">{label}</Text>
            <View 
                className={`h-14 rounded-2xl border bg-slate-50 dark:bg-gray-900 overflow-hidden ${
                    error ? 'border-red-500' : 'border-slate-200 dark:border-gray-800'
                }`}
            >
                <RNPickerSelect
                    onValueChange={onValueChange}
                    items={items}
                    value={value}
                    placeholder={placeholderValue}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => (
                        <View className="pr-4 justify-center h-full">
                            <ChevronDown size={20} color={error ? '#ef4444' : '#64748b'} />
                        </View>
                    )}
                    style={{
                        inputIOS: {
                            fontSize: 16,
                            paddingVertical: 16,
                            paddingHorizontal: 16,
                            color: '#0f172a',
                            paddingRight: 40,
                        },
                        inputAndroid: {
                            fontSize: 16,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            color: '#0f172a',
                            paddingRight: 40,
                        },
                    }}
                />
            </View>
            {error && <Text className="mt-1 ml-1 text-xs text-red-500 font-medium">{error}</Text>}
        </View>
    );
}
