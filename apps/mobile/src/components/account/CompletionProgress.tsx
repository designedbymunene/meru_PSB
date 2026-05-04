import React from 'react';
import { View, Text } from 'react-native';

interface CompletionProgressProps {
    percentage: number;
    label?: string;
    showPercentage?: boolean;
}

export const CompletionProgress: React.FC<CompletionProgressProps> = ({
    percentage,
    label = 'Profile Complete',
    showPercentage = true,
}) => {
    const clampedPercentage = Math.min(100, Math.max(0, percentage));
    const isComplete = clampedPercentage === 100;
    const isHighProgress = clampedPercentage >= 75;

    return (
        <View className="w-full">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</Text>
                {showPercentage && (
                    <Text className={`text-sm font-bold ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {clampedPercentage}%
                    </Text>
                )}
            </View>
            <View className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <View
                    className={`h-full rounded-full transition-all ${
                        isComplete ? 'bg-green-500' : isHighProgress ? 'bg-blue-500' : 'bg-blue-400'
                    }`}
                    style={{ width: `${clampedPercentage}%` }}
                />
            </View>
            {!isComplete && (
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {Math.round(clampedPercentage)}% complete. Complete your profile to unlock all features.
                </Text>
            )}
        </View>
    );
};
