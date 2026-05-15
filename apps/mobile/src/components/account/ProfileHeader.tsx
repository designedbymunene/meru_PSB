import { Camera, ShieldCheck, Mail, User as UserIcon, MapPin, Calendar } from 'lucide-react-native';
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
        <View className="bg-white dark:bg-gray-900 py-5 px-5 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none">
            <View className="flex-row items-center">
                {/* Avatar with Premium Ring */}
                <View className="relative">
                    <View className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/10 p-1 border border-blue-100/50 dark:border-blue-800/50">
                        <View className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-900">
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <View className="w-full h-full justify-center items-center bg-[#004aad]">
                                    <UserIcon size={32} color="white" />
                                </View>
                            )}
                        </View>
                    </View>
                    {onEditAvatar && (
                        <TouchableOpacity
                            className="absolute bottom-0 right-0 bg-[#004aad] p-2 rounded-full border-2 border-white dark:border-gray-900 shadow-md active:opacity-80"
                            onPress={onEditAvatar}
                        >
                            <Camera size={12} color="white" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* User Info */}
                <View className="flex-1 ml-4">
                    <View className="flex-row items-center mb-0.5">
                        <Text className="text-gray-900 dark:text-white text-xl font-black tracking-tight" numberOfLines={1}>{name}</Text>
                        {isVerified && (
                            <View className="ml-1.5 bg-blue-500 p-0.5 rounded-full">
                                <ShieldCheck size={10} color="white" />
                            </View>
                        )}
                    </View>
                    
                    <View className="flex-row items-center mb-3">
                        <Mail size={10} color="#94a3b8" />
                        <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1 font-medium">{email}</Text>
                    </View>

                    <View className="flex-row items-center space-x-2">
                        <View className="bg-[#004aad]/10 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">
                            <Text className="text-[#004aad] dark:text-blue-300 text-[9px] font-black uppercase tracking-widest">{role}</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => {}}
                            className="bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-700 active:opacity-70"
                        >
                            <Text className="text-gray-600 dark:text-gray-300 font-bold text-[10px]">Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};
