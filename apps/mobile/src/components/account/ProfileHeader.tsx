import { Camera, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface ProfileHeaderProps {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    isVerified?: boolean;
    onEditAvatar?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    name,
    email,
    role,
    avatarUrl,
    isVerified = false,
    onEditAvatar,
}) => {
    return (
        <View className="bg-white dark:bg-gray-900 px-5 pt-8 pb-4">
            <View className="flex-row items-center">
                {/* Avatar */}
                <View className="relative">
                    <View className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-gray-100 dark:border-gray-800 overflow-hidden">
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <View className="w-full h-full justify-center items-center bg-[#004aad]">
                                <Text className="text-white text-xl font-black">
                                    {name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .substring(0, 2)}
                                </Text>
                            </View>
                        )}
                    </View>
                    {onEditAvatar && (
                        <TouchableOpacity
                            className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 p-1.5 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm active:bg-gray-50"
                            onPress={onEditAvatar}
                        >
                            <Camera size={10} color="#64748b" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* User Info */}
                <View className="ml-4 flex-1">
                    <View className="flex-row items-center">
                        <Text className="text-gray-900 dark:text-white text-lg font-black tracking-tight">{name}</Text>
                        {isVerified && (
                            <View className="ml-2 bg-blue-50 dark:bg-blue-900/40 p-0.5 rounded-full">
                                <ShieldCheck size={14} color="#004aad" />
                            </View>
                        )}
                    </View>
                    <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{role}</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-1">{email}</Text>
                </View>

                <TouchableOpacity className="bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                    <Text className="text-gray-900 dark:text-gray-200 font-bold text-[10px]">Edit Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
