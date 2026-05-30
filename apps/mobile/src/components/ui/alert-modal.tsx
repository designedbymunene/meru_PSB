import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

interface AlertModalProps {
    visible: boolean;
    title?: string;
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export function AlertModal({ visible, title = 'Alert', message = '', onConfirm, onCancel }: AlertModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View className="flex-1 bg-black/50 items-center justify-center px-6">
                <View className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6">
                    <Text className="text-gray-900 dark:text-white text-lg font-bold mb-2">{title}</Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm mb-6">{message}</Text>

                    <View className="flex-row justify-end space-x-3">
                        <TouchableOpacity onPress={onCancel} className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800">
                            <Text className="text-gray-700 dark:text-gray-200 font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onConfirm} className="px-4 py-2 rounded-2xl bg-[#004aad]">
                            <Text className="text-white font-bold">Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
