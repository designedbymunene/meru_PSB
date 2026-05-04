import { useRouter } from 'expo-router';
import {
    Award,
    Briefcase,
    CheckCircle2,
    ChevronRight,
    FileText,
    FileUp,
    GraduationCap,
    Plus,
    ShieldCheck,
    User,
    Users
} from 'lucide-react-native';
import React from 'react';
import { useColorScheme } from 'nativewind';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/header';
import { useAuth } from '@/context/auth-context';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export default function DigitalCVScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile-completion'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles');
            return response.data.data;
        },
    });

    const handlePress = (index: number) => {
        const routes = [
            '/profile/personal-details',
            '/profile/qualifications',
            '/profile/employment-history',
            '/profile/professional-details',
            '/profile/qualifications' // Placeholder for referees/declarations
        ];
        router.push(routes[index] as any);
    };

    const completion = profile?.profileCompletion || {
        overallPercentage: 0,
        sections: {
            personal: 0,
            education: 0,
            experience: 0,
            professional: 0,
            referees: 0
        }
    };

    const sections = [
        {
            id: 'bio',
            title: 'Personal Bio-Data',
            subtitle: 'ID, Home County, Ethnicity & Gender',
            icon: <User size={20} color={isDarkMode ? '#3b82f6' : '#004aad'} />,
            completed: (completion.sections?.personal || 0) === 100,
            percentage: completion.sections?.personal || 0
        },
        {
            id: 'education',
            title: 'Academic History',
            subtitle: 'Tertiary, Secondary & Primary',
            icon: <GraduationCap size={20} color={isDarkMode ? '#3b82f6' : '#004aad'} />,
            completed: (completion.sections?.education || 0) === 100,
            percentage: completion.sections?.education || 0
        },
        {
            id: 'experience',
            title: 'Work Experience',
            subtitle: 'Roles, Companies & Job Groups',
            icon: <Briefcase size={20} color={isDarkMode ? '#3b82f6' : '#004aad'} />,
            completed: (completion.sections?.experience || 0) === 100,
            percentage: completion.sections?.experience || 0
        },
        {
            id: 'professional',
            title: 'Professional Skills',
            subtitle: 'Memberships, Licenses & Certs',
            icon: <Award size={20} color={isDarkMode ? '#3b82f6' : '#004aad'} />,
            completed: (completion.sections?.professional || 0) === 100,
            percentage: completion.sections?.professional || 0
        },
        {
            id: 'referees',
            title: 'Referees & Declarations',
            subtitle: 'Chapter 6 & Professional Contacts',
            icon: <Users size={20} color={isDarkMode ? '#3b82f6' : '#004aad'} />,
            completed: (completion.sections?.referees || 0) === 100,
            percentage: completion.sections?.referees || 0
        }
    ];

    const overallCompleteness = completion.overallPercentage || 0;

    return (
        <View className="flex-1 bg-white dark:bg-gray-950">
            <Header
                title=""
                showBackButton={false}
                leftAction={
                    <Text className="text-gray-900 dark:text-white font-black text-xl">Digital CV</Text>
                }
                rightAction={
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity className="bg-gray-50 dark:bg-gray-900 p-2 flex-row items-center rounded-xl border border-gray-100 dark:border-gray-800">
                            <FileText size={18} color={isDarkMode ? '#3b82f6' : '#004aad'} />
                            <Text className="text-gray-900 dark:text-gray-200 font-bold text-[10px] ml-2">Download CV</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                <View className="px-4 pb-10">
                    {/* Minimalist Status Section */}
                    <View className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-[24px] mb-4 mt-4">
                        <View className="flex-row justify-between items-end mb-3">
                            <View>
                                <Text className="text-gray-400 dark:text-gray-500 text-[9px] font-black uppercase tracking-widest mb-0.5">Profile Strength</Text>
                                <Text className="text-gray-900 dark:text-white text-lg font-black">
                                    {overallCompleteness}% Complete
                                </Text>
                            </View>
                            <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold">
                                {overallCompleteness === 100 ? 'Verified' : 'Action Required'}
                            </Text>
                        </View>

                        <View className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <View className="h-full bg-[#004aad] dark:bg-blue-500 rounded-full" style={{ width: `${overallCompleteness}%` }} />
                        </View>
                    </View>

                    {/* Section Buttons */}
                    <View className="mt-4">
                        <Text className="text-lg font-black text-gray-900 dark:text-white mb-3 px-1">Profile Sections</Text>

                        <View className="space-y-3">
                            {sections.map((section, index) => (
                                <TouchableOpacity
                                    key={section.id}
                                    onPress={() => handlePress(index)}
                                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm flex-row items-center mb-3"
                                >
                                    <View className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl mr-3">
                                        {section.icon}
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-gray-900 dark:text-white font-bold text-sm">{section.title}</Text>
                                        <Text className="text-gray-400 dark:text-gray-500 text-[9px] mt-0.5" numberOfLines={1}>{section.subtitle}</Text>
                                    </View>

                                    <View className="items-end">
                                        {section.completed ? (
                                            <View className="bg-green-50 dark:bg-green-900/20 p-0.5 rounded-full">
                                                <CheckCircle2 size={16} color="#16a34a" />
                                            </View>
                                        ) : (
                                            <View className="bg-gray-50 dark:bg-gray-800 p-0.5 rounded-full">
                                                <ChevronRight size={16} color="#94a3b8" />
                                            </View>
                                        )}
                                        <Text className={`text-[8px] mt-0.5 font-bold ${section.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {section.percentage}%
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Optional Uploads Section */}
                    <View className="mt-6">
                        <View className="flex-row justify-between items-center mb-4 px-1">
                            <Text className="text-lg font-black text-gray-900 dark:text-white">Optional Uploads</Text>
                            <TouchableOpacity className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                                <Text className="text-[#004aad] dark:text-blue-400 font-bold text-[9px]">Manage</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-[24px] border-dashed items-center">
                            <View className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm mb-3">
                                <FileUp size={22} color="#64748b" />
                            </View>
                            <Text className="text-gray-900 dark:text-white font-bold text-sm text-center">Add Supporting Documents</Text>
                            <Text className="text-gray-400 dark:text-gray-500 text-[10px] text-center mt-1 px-6 leading-4">
                                Optionally upload your physical CV or certs for additional proof.
                            </Text>

                            <TouchableOpacity className="mt-5 flex-row items-center bg-gray-900 px-5 py-3 rounded-xl">
                                <Plus size={16} color="white" />
                                <Text className="text-white font-bold text-xs ml-2">Upload Files</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Verification Notice */}
                    <View className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-4 rounded-2xl flex-row items-start mt-8 mb-5">
                        <ShieldCheck size={18} color="#004aad" className="mt-0.5" />
                        <View className="ml-3 flex-1">
                            <Text className="text-[#004aad] dark:text-blue-400 font-bold text-xs">Integrity Agreement</Text>
                            <Text className="text-blue-700/60 dark:text-blue-400/60 text-[10px] mt-1 leading-4">
                                Information provided is subject to verification. False info leads to disqualification.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
