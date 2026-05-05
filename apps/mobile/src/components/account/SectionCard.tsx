import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2, Edit2 } from 'lucide-react-native';

interface SectionCardProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    subtitle?: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    icon,
    children,
    subtitle,
    onEdit,
    onDelete,
}) => {
    return (
        <View className="mb-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
            <View className="flex-row items-start">
                {icon && (
                    <View className="mr-3 mt-0.5 justify-center items-center">
                        {icon}
                    </View>
                )}
                
                <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-wider" numberOfLines={1}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-tight mt-0.5">
                                    {subtitle}
                                </Text>
                            )}
                        </View>
                        
                        <View className="flex-row space-x-2 ml-2">
                            {onEdit && (
                                <TouchableOpacity 
                                    onPress={onEdit}
                                    className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                                >
                                    <Edit2 size={14} color="#3b82f6" />
                                </TouchableOpacity>
                            )}
                            {onDelete && (
                                <TouchableOpacity 
                                    onPress={onDelete}
                                    className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20"
                                >
                                    <Trash2 size={14} color="#ef4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View className="mt-2">
                        {children}
                    </View>
                </View>
            </View>
        </View>
    );
};
