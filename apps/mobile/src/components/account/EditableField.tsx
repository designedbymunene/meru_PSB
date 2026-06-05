import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Edit2, Check, X } from 'lucide-react-native';

interface EditableFieldProps {
    label: string;
    value: string;
    onSave: (newValue: string) => Promise<void> | void;
    editable?: boolean;
    icon?: React.ReactNode;
    placeholder?: string;
    multiline?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
    label,
    value,
    onSave,
    editable = true,
    icon,
    placeholder,
    multiline = false,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        try {
            setError(null);
            setIsSaving(true);
            await onSave(editValue);
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
        setError(null);
    };

    if (isEditing) {
        return (
            <View className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                <View className="flex-row items-center mb-3">
                    {icon}
                    <Text className="text-gray-900 dark:text-white font-semibold ml-2">{label}</Text>
                </View>
                <TextInput
                    value={editValue}
                    onChangeText={setEditValue}
                    placeholder={placeholder || 'Enter value'}
                    placeholderTextColor="#94a3b8"
                    multiline={multiline}
                    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white ${
                        multiline ? 'min-h-20' : ''
                    }`}
                    editable={!isSaving}
                />
                {error && <Text className="text-red-500 text-xs mt-2">{error}</Text>}
                <View className="flex-row justify-end space-x-2 mt-3">
                    <Pressable
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 flex-row items-center"
                        onPress={handleCancel}
                        disabled={isSaving}
                    >
                        <X size={16} color="#6b7280" />
                        <Text className="text-gray-600 dark:text-gray-400 font-medium ml-1">Cancel</Text>
                    </Pressable>
                    <Pressable
                        className="px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 flex-row items-center "
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Check size={16} color="white" />
                                <Text className="text-white font-medium ml-1">Save</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex-row items-center justify-between">
            <View className="flex-1">
                <View className="flex-row items-center mb-1">
                    {icon}
                    <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium ml-2 uppercase tracking-wide">{label}</Text>
                </View>
                <Text className="text-gray-900 dark:text-white font-semibold text-base">{value || 'Not set'}</Text>
            </View>
            {editable && (
                <Pressable
                    className="ml-3 p-2  dark: rounded-lg"
                    onPress={() => setIsEditing(true)}
                >
                    <Edit2 size={18} color="#2563eb" />
                </Pressable>
            )}
        </View>
    );
};
