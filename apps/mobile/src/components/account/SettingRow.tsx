import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface SettingRowProps {
    icon: any;
    title: string;
    subtitle?: string;
    value?: string;
    onPress?: () => void;
    color?: string;
    rightElement?: React.ReactNode;
    isLast?: boolean;
    destructive?: boolean;
}

export const SettingRow: React.FC<SettingRowProps> = ({
    icon: Icon,
    title,
    subtitle,
    value,
    onPress,
    color = "#64748b",
    rightElement,
    isLast = false,
    destructive = false,
}) => {
    return (
        <TouchableOpacity
            className={`flex-row items-center py-5 ${!isLast ? 'border-b border-gray-50 dark:border-gray-800' : ''} active:opacity-60`}
            onPress={onPress}
            disabled={!onPress && !rightElement}
        >
            <View
                className="w-10 h-10 rounded-2xl justify-center items-center mr-4"
                style={{ backgroundColor: destructive ? '#fee2e2' : `${color}10` }}
            >
                <Icon size={18} color={destructive ? '#ef4444' : color} strokeWidth={2.5} />
            </View>
            
            <View className="flex-1">
                <Text 
                    className={`text-[13px] font-black ${destructive ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}
                >
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-gray-500 dark:text-gray-400 text-[10px] mt-1 font-bold leading-4">
                        {subtitle}
                    </Text>
                )}
            </View>

            <View className="flex-row items-center ml-2">
                {value && (
                    <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-black mr-2 uppercase tracking-tighter">
                        {value}
                    </Text>
                )}
                {rightElement ? (
                    rightElement
                ) : (
                    onPress && <ChevronRight size={14} color="#cbd5e1" strokeWidth={3} />
                )}
            </View>
        </TouchableOpacity>
    );
};
