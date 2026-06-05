import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Trash2, Edit2 } from 'lucide-react-native';

interface SectionCardProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    subtitle?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    variant?: 'default' | 'flat' | 'outline';
    hideHeader?: boolean;
    testID?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    icon,
    children,
    subtitle,
    onEdit,
    onDelete,
    variant = 'default',
    hideHeader = false,
    testID
}) => {
    const isFlat = variant === 'flat';
    const isOutline = variant === 'outline';
    // Generate safe testID from title if not provided
    const safeTestID = testID || title.toLowerCase().replace(/\s+/g, '-');

    return (
        <View
            className={`mb-4 rounded-[32px] p-6 ${
                isFlat ? 'bg-gray-50/50 dark:bg-gray-900/50' :
                isOutline ? 'border border-gray-100 dark:border-gray-800' :
                'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm'
            }`}
            testID={safeTestID}
        >
            <View>
                {!hideHeader && (
                    <View className="flex-row items-center justify-between mb-5">
                        <View className="flex-1 flex-row items-center">
                            {icon && (
                                <View className="mr-3 w-8 h-8 rounded-xl bg-white dark:bg-gray-800 items-center justify-center shadow-sm">
                                    {icon}
                                </View>
                            )}
                            <View className="flex-1">
                                <Text className="text-gray-900 dark:text-white font-black text-sm tracking-tight" numberOfLines={1}>
                                    {title}
                                </Text>
                                {subtitle && (
                                    <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mt-0.5 uppercase tracking-tighter">
                                        {subtitle}
                                    </Text>
                                )}
                            </View>
                        </View>
                        
                        <View className="flex-row space-x-2 ml-2">
                            {onEdit && (
                                <Pressable
                                    onPress={onEdit}
                                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                                    className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 items-center justify-center"
                                    testID={`${safeTestID}-edit`}
                                >
                                    <Edit2 size={14} color="#3b82f6" strokeWidth={2.5} />
                                </Pressable>
                            )}
                            {onDelete && (
                                <Pressable
                                    onPress={onDelete}
                                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                                    className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center"
                                    testID={`${safeTestID}-delete`}
                                >
                                    <Trash2 size={14} color="#ef4444" strokeWidth={2.5} />
                                </Pressable>
                            )}
                        </View>
                    </View>
                )}

                <View>
                    {children}
                </View>
            </View>
        </View>
    );
};
