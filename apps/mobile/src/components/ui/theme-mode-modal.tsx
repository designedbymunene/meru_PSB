import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Moon, Sun, Smartphone, Check } from 'lucide-react-native';

interface ThemeModeModalProps {
    isVisible: boolean;
    onClose: () => void;
    selectedTheme: string | undefined;
    onSelect: (theme: string) => void;
}

const themes = [
    { label: 'System Default', value: 'system', icon: Smartphone, color: '#64748b' },
    { label: 'Light Mode', value: 'light', icon: Sun, color: '#f59e0b' },
    { label: 'Dark Mode', value: 'dark', icon: Moon, color: '#3b82f6' },
];

export function ThemeModeModal({ isVisible, onClose, selectedTheme, onSelect }: ThemeModeModalProps) {
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 items-center justify-end">
                <View className="w-full bg-white dark:bg-gray-900 rounded-t-[32px] p-6 pb-8">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-gray-900 dark:text-white text-2xl font-black">App Theme</Text>
                        <Pressable
                            onPress={onClose}
                            className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 dark:bg-gray-800"
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                        >
                            <Text className="text-gray-900 dark:text-white text-xl font-bold">×</Text>
                        </Pressable>
                    </View>

                    <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">
                        Choose how the app appears on your device
                    </Text>

                    <View className="space-y-3">
                        {themes.map((theme) => {
                            const Icon = theme.icon;
                            const isSelected = selectedTheme === theme.value;
                            
                            return (
                                <Pressable
                                    key={theme.value}
                                    onPress={() => {
                                        onSelect(theme.value);
                                        onClose();
                                    }}
                                    className={`flex-row items-center p-4 rounded-2xl border ${
                                        isSelected
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                                >
                                    <View 
                                        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                                        style={{ backgroundColor: theme.color + '20' }}
                                    >
                                        <Icon size={24} color={theme.color} />
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-gray-900 dark:text-white font-bold text-sm">
                                            {theme.label}
                                        </Text>
                                        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                            {theme.value === 'system' 
                                                ? 'Match your device settings' 
                                                : theme.value === 'light'
                                                ? 'Always light background'
                                                : 'Always dark background'}
                                        </Text>
                                    </View>

                                    {isSelected && (
                                        <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center ml-2">
                                            <Check size={16} color="#fff" strokeWidth={3} />
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
