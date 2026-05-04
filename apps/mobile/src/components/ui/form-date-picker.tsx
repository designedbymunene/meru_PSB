import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface FormDatePickerProps {
    label: string;
    value: string; // ISO format or empty
    onChange: (date: string) => void;
    error?: string;
    placeholder?: string;
    mode?: 'date' | 'time' | 'datetime';
}

export function FormDatePicker({
    label,
    value,
    onChange,
    error,
    placeholder = 'Select date',
    mode = 'date'
}: FormDatePickerProps) {
    const [isPickerVisible, setPickerVisibility] = useState(false);

    const showPicker = () => setPickerVisibility(true);
    const hidePicker = () => setPickerVisibility(false);

    const handleConfirm = (date: Date) => {
        onChange(date.toISOString());
        hidePicker();
    };

    const displayValue = value ? new Date(value).toLocaleDateString() : '';

    return (
        <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 ml-1">{label}</Text>
            <TouchableOpacity
                onPress={showPicker}
                className={`flex-row items-center h-14 rounded-2xl border bg-slate-50 dark:bg-gray-900 px-4 ${
                    error ? 'border-red-500' : 'border-slate-200 dark:border-gray-800'
                }`}
                activeOpacity={0.7}
            >
                <Text className={`flex-1 ${displayValue ? 'text-slate-900 dark:text-white' : 'text-slate-400'} text-base`}>
                    {displayValue || placeholder}
                </Text>
                <Calendar size={20} color={error ? '#ef4444' : '#64748b'} />
            </TouchableOpacity>

            <DateTimePickerModal
                isVisible={isPickerVisible}
                mode={mode}
                onConfirm={handleConfirm}
                onCancel={hidePicker}
                date={value ? new Date(value) : new Date()}
            />

            {error && <Text className="mt-1 ml-1 text-xs text-red-500 font-medium">{error}</Text>}
        </View>
    );
}
