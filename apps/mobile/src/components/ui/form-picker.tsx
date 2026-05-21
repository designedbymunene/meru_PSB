import { ChevronDown, LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Platform, Text, View, ActivityIndicator } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useColorScheme } from 'nativewind';

interface FormPickerProps {
    label: string;
    value: any;
    onValueChange: (value: any) => void;
    items: { label: string; value: any }[];
    placeholder?: string;
    error?: string;
    icon?: LucideIcon;
    enabled?: boolean;
    isLoading?: boolean;
}

export function FormPicker({ 
    label, 
    value, 
    onValueChange, 
    items, 
    placeholder, 
    error, 
    icon: Icon,
    enabled = true,
    isLoading = false
}: FormPickerProps) {
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const placeholderValue = placeholder ? { label: placeholder, value: null } : { label: 'Select option', value: null };

    return (
        <View className={`mb-5 ${!enabled ? 'opacity-60' : ''}`}>
            <Text className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 ml-1">{label}</Text>
            <View 
                className={`h-14 rounded-2xl border bg-slate-50 dark:bg-gray-900/50 flex-row items-center ${
                    error ? 'border-red-500' : 'border-slate-200 dark:border-gray-800'
                }`}
            >
                {Icon && (
                    <View className="pl-4">
                        <Icon size={20} color={error ? '#ef4444' : '#64748b'} />
                    </View>
                )}
                
                <View className="flex-1 justify-center">
                    <RNPickerSelect
                        onValueChange={onValueChange}
                        items={items}
                        value={value}
                        placeholder={placeholderValue}
                        disabled={!enabled || isLoading}
                        useNativeAndroidPickerStyle={false}
                        Icon={() => (
                            <View style={{ position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' }}>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#004aad" />
                                ) : (
                                    <ChevronDown size={18} color={error ? '#ef4444' : '#94a3b8'} />
                                )}
                            </View>
                        )}
                        style={{
                            inputIOS: {
                                fontSize: 16,
                                paddingVertical: 16,
                                paddingHorizontal: Icon ? 12 : 16,
                                color: (isLoading || !enabled) ? '#94a3b8' : (value ? (isDarkMode ? '#ffffff' : '#0f172a') : '#94a3b8'),
                                paddingRight: 45,
                                fontWeight: '500',
                            },
                            inputAndroid: {
                                fontSize: 16,
                                paddingVertical: 12,
                                paddingHorizontal: Icon ? 12 : 16,
                                color: (isLoading || !enabled) ? '#94a3b8' : (value ? (isDarkMode ? '#ffffff' : '#0f172a') : '#94a3b8'),
                                paddingRight: 45,
                                fontWeight: '500',
                            },
                            placeholder: {
                                color: '#94a3b8',
                            },
                            iconContainer: {
                                top: 0,
                                bottom: 0,
                                right: 0,
                                justifyContent: 'center',
                                paddingRight: 4,
                            },
                        }}
                    />
                    {isLoading && Platform.OS === 'android' && (
                        <View className="absolute left-4 flex-row items-center pointer-events-none">
                             <Text className="text-slate-400 text-base font-medium">Loading...</Text>
                        </View>
                    )}
                </View>
            </View>
            {error && <Text className="mt-1.5 ml-1 text-xs text-red-500 font-medium tracking-tight">{error}</Text>}
        </View>
    );
}
