import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

interface SectionCardProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    subtitle?: string;
    action?: {
        label: string;
        onPress: () => void;
    };
}

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    icon,
    children,
    collapsible = false,
    defaultExpanded = true,
    subtitle,
    action,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const shouldShowCollapse = collapsible && isExpanded;
    const shouldShowExpand = collapsible && !isExpanded;

    return (
        <View className="mb-5">
            {/* Header */}
            <TouchableOpacity
                className="px-0.5 py-1.5 flex-row items-center justify-between active:opacity-70"
                onPress={() => collapsible && setIsExpanded(!isExpanded)}
                disabled={!collapsible}
                activeOpacity={collapsible ? 0.5 : 1}
            >
                <View className="flex-row items-center flex-1">
                    {icon && (
                        <View className="mr-3 justify-center items-center">
                            {icon}
                        </View>
                    )}
                    <View className="flex-1">
                        <Text className="text-gray-900 dark:text-white font-black text-[15px] uppercase tracking-widest">{title}</Text>
                        {subtitle && <Text className="text-gray-400 dark:text-gray-500 text-[11px] mt-0.5 font-bold">{subtitle}</Text>}
                    </View>
                </View>

                {action && (
                    <TouchableOpacity
                        className="ml-2 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                        onPress={action.onPress}
                    >
                        <Text className="text-gray-900 dark:text-gray-200 text-[11px] font-bold">{action.label}</Text>
                    </TouchableOpacity>
                )}

                {shouldShowCollapse && <ChevronUp size={18} color="#94a3b8" />}
                {shouldShowExpand && <ChevronDown size={18} color="#94a3b8" />}
            </TouchableOpacity>

            {/* Content */}
            {(!collapsible || isExpanded) && (
                <View className="mt-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 shadow-sm">
                    {children}
                </View>
            )}
        </View>
    );
};
