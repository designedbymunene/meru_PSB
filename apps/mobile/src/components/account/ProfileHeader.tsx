import { Camera, ShieldCheck, Mail, User as UserIcon } from 'lucide-react-native';
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
        <View className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <View className="flex-row items-center">
                {/* Avatar with Ring */}
                <View className="relative">
                    <View className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 p-1 border border-blue-100 dark:border-blue-800">
                        <View className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <View className="w-full h-full justify-center items-center bg-[#004aad]">
                                    <UserIcon size={36} color="white" />
                                </View>
                            )}
                        </View>
                    </View>
                    {onEditAvatar && (
                        <TouchableOpacity
                            className="absolute bottom-0 right-0 bg-[#004aad] p-2 rounded-full border-2 border-white dark:border-gray-900 shadow-sm active:opacity-80"
                            onPress={onEditAvatar}
                        >
                            <Camera size={12} color="white" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* User Info */}
                <View className="flex-1 ml-5">
                    <View className="flex-row items-center mb-1">
                        <Text className="text-gray-900 dark:text-white text-xl font-bold" numberOfLines={1}>{name}</Text>
                        {isVerified && (
                            <View className="ml-2 bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                                <ShieldCheck size={14} color="#059669" />
                            </View>
                        )}
                    </View>
                    
                    <Text className="text-gray-500 dark:text-gray-400 text-sm mb-3">{email}</Text>

                    <View className="flex-row items-center space-x-3">
                        <View className="bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-lg border border-blue-100/50 dark:border-blue-800/50">
                            <Text className="text-[#004aad] dark:text-blue-300 text-xs font-bold uppercase tracking-wider">{role}</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => {}}
                            className="bg-gray-100 dark:bg-gray-800 px-4 py-1 rounded-lg border border-gray-200 dark:border-gray-700 active:opacity-70"
                        >
                            <Text className="text-gray-700 dark:text-gray-300 font-semibold text-xs">Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};
