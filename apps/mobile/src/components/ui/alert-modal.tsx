import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';

interface AlertModalProps {
    visible: boolean;
    title?: string;
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    testID?: string;
}

export function AlertModal({ visible, title = 'Alert', message = '', onConfirm, onCancel, testID }: AlertModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View className="flex-1 bg-black/50 items-center justify-center px-6" testID={testID ? `${testID}-backdrop` : 'alert-backdrop'}>
                <View className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6" testID={testID ? `${testID}-container` : 'alert-container'}>
                    <Text className="text-gray-900 dark:text-white text-lg font-bold mb-2" testID={testID ? `${testID}-title` : 'alert-title'}>{title}</Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm mb-6" testID={testID ? `${testID}-message` : 'alert-message'}>{message}</Text>

                    <View className="flex-row justify-end space-x-3">
                        <Pressable onPress={onCancel} className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800" testID={testID ? `${testID}-cancel` : 'alert-cancel'}>
                            <Text className="text-gray-700 dark:text-gray-200 font-semibold">Cancel</Text>
                        </Pressable>
                        <Pressable onPress={onConfirm} className="px-4 py-2 rounded-2xl bg-[#004aad]" testID={testID ? `${testID}-confirm` : 'alert-confirm'}>
                            <Text className="text-white font-bold">Confirm</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
