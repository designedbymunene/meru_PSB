import { useRouter } from 'expo-router';
import {
    Award,
    BookOpen,
    Briefcase,
    CheckCircle2,
    ChevronRight,
    GraduationCap,
    ShieldCheck,
    User,
    Users
} from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/header';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { calculateProfileCompletion, type ProfileCompletionSummary, type ProfileSectionId } from '@meru/shared';

type SectionMeta = {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    path: string;
}

const SECTION_META: Partial<Record<ProfileSectionId, SectionMeta>> = {
    personal: {
        title: 'Personal Information',
        subtitle: 'Bio-data, contact and location details',
        icon: <User size={20} color="#004aad" />,
        path: '/profile/personal-details',
    },
    education: {
        title: 'Education History',
        subtitle: 'Degrees, diplomas and certificates',
        icon: <GraduationCap size={20} color="#004aad" />,
        path: '/profile/qualifications',
    },
    experience: {
        title: 'Employment History',
        subtitle: 'Past and present work records',
        icon: <Briefcase size={20} color="#004aad" />,
        path: '/profile/employment-history',
    },
    professional: {
        title: 'Professional Details',
        subtitle: 'Licenses and registrations',
        icon: <Award size={20} color="#004aad" />,
        path: '/profile/professional-details',
    },
    training: {
        title: 'Training & Short Courses',
        subtitle: 'Workshops and CPDs',
        icon: <BookOpen size={20} color="#004aad" />,
        path: '/profile/training',
    },
    memberships: {
        title: 'Memberships',
        subtitle: 'Bodies and associations',
        icon: <ShieldCheck size={20} color="#004aad" />,
        path: '/profile/memberships',
    },
    referees: {
        title: 'Referees',
        subtitle: 'Professional and academic contacts',
        icon: <Users size={20} color="#004aad" />,
        path: '/profile/referees',
    },
    /* documents: {
        title: 'Uploaded Documents',
        subtitle: 'ID, CV and other supporting documents',
        icon: <FileUp size={20} color="#004aad" />,
        path: '/profile/documents',
    }, */
}

export default function DigitalCVScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { data: profile } = useQuery({
        queryKey: ['profile-completion'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me');
            return response.data.data;
        },
    });

    if (profile === undefined) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
                <ActivityIndicator size="large" color="#004aad" />
            </View>
        );
    }

    const completion: ProfileCompletionSummary = profile?.profileCompletion || calculateProfileCompletion(profile);

    const handlePress = (path: string) => {
        router.push(path as any);
    };

    const requiredSections = completion?.groups?.required || [];
    const optionalSections = completion?.groups?.optional || [];

    return (
        <View className="flex-1 bg-white dark:bg-gray-950">
            <Header
                title=""
                showBackButton={false}
                leftAction={
                    <Text className="text-gray-900 dark:text-white font-black text-xl">Profile</Text>
                }
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                <View className="px-4 pb-10">
                    <View className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-[24px] mb-4 mt-4">
                        <View className="flex-row justify-between items-end mb-3">
                            <View>
                                <Text className="text-gray-400 dark:text-gray-500 text-[9px] font-black uppercase tracking-widest mb-0.5">Required to Apply</Text>
                                <Text className="text-gray-900 dark:text-white text-lg font-black">
                                    {completion.requiredPercentage}% Complete
                                </Text>
                            </View>
                            <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-bold">
                                {completion.canApply ? 'Ready' : 'Action Required'}
                            </Text>
                        </View>

                        <View className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                            <View className="h-full bg-[#004aad] dark:bg-blue-500 rounded-full" style={{ width: `${completion.requiredPercentage}%` }} />
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                                {completion.requiredCompleteCount}/{completion.requiredTotalCount} required sections complete
                            </Text>
                            <Text className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                                Optional: {completion.optionalPercentage}%
                            </Text>
                        </View>
                    </View>

                    <SectionGroup
                        title="Required to Apply"
                        sections={requiredSections}
                        onPressSection={handlePress}
                    />

                    <SectionGroup
                        title="Optional Enhancements"
                        sections={optionalSections}
                        onPressSection={handlePress}
                    />


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

function SectionGroup({
    title,
    sections,
    onPressSection,
}: {
    title: string;
    sections: ProfileCompletionSummary['groups']['required'];
    onPressSection: (path: string) => void;
}) {
    if (sections.length === 0) return null;

    return (
        <View className="mt-4">
            <Text className="text-lg font-black text-gray-900 dark:text-white mb-3 px-1">{title}</Text>
            <View className="space-y-3">
                {sections.map((section) => {
                    const meta = SECTION_META[section.id];
                    if (!meta) return null;

                    return (
                        <TouchableOpacity
                            key={section.id}
                            onPress={() => onPressSection(meta.path)}
                            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm flex-row items-center mb-3"
                        >
                            <View className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl mr-3">
                                {meta.icon}
                            </View>

                            <View className="flex-1">
                                <Text className="text-gray-900 dark:text-white font-bold text-sm">{meta.title}</Text>
                                <Text className="text-gray-400 dark:text-gray-500 text-[9px] mt-0.5" numberOfLines={1}>{meta.subtitle}</Text>
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
                    );
                })}
            </View>
        </View>
    );
}
