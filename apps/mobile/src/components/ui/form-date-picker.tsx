import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Calendar } from 'lucide-react-native';
import { format } from 'date-fns';

interface FormDatePickerProps {
    label: string;
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    error?: string;
    mode?: 'date' | 'time' | 'datetime';
    maximumDate?: Date;
    minimumDate?: Date;
    testID?: string;
}

export function FormDatePicker({
    label,
    value,
    onChange,
    placeholder = 'Select date',
    error,
    mode = 'date',
    maximumDate,
    minimumDate,
    testID
}: FormDatePickerProps) {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date: Date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        onChange(formattedDate);
        hideDatePicker();
    };

    const displayValue = value ? format(new Date(value), 'PPP') : placeholder;

    return (
        <View className="mb-5" testID={testID}>
            <Text className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 ml-1">{label}</Text>

            <Pressable
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                onPress={showDatePicker}
                className={`h-14 rounded-2xl border flex-row items-center px-4 bg-slate-50 dark:bg-gray-900/50 ${
                    error ? 'border-red-500' : 'border-slate-200 dark:border-gray-800'
                }`}
                testID={testID ? `${testID}-trigger` : 'date-picker-trigger'}
            >
                <View className="mr-3">
                    <Calendar size={20} color={error ? '#ef4444' : '#64748b'} />
                </View>
                
                <Text 
                    className={`flex-1 text-base ${
                        value ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-gray-500'
                    }`}
                >
                    {displayValue}
                </Text>
            </Pressable>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode={mode}
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                date={value ? new Date(value) : new Date()}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
            />

            {error && <Text className="mt-1.5 ml-1 text-xs text-red-500 font-medium tracking-tight">{error}</Text>}
        </View>
    );
}
