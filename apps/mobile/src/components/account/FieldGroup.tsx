import React from 'react';
import { View, Text } from 'react-native';

interface FieldGroupProps {
    label: string;
    description?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({ label, description, children, icon }) => {
    return (
        <View className="mb-5 pb-5 border-b border-gray-100 dark:border-gray-800 last:border-b-0 last:mb-0 last:pb-0">
            <View className="flex-row items-start mb-3">
                {icon && <View className="mr-3">{icon}</View>}
                <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-semibold text-base">{label}</Text>
                    {description && <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">{description}</Text>}
                </View>
            </View>
            <View className="ml-0">{children}</View>
        </View>
    );
};
