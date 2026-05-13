import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle, CheckCircle2, ChevronRight, Info } from 'lucide-react-native';

interface Section {
    id: string;
    title: string;
    percentage: number;
    description: string;
}

interface CompletionGuardProps {
    completion: {
        overallPercentage: number;
        sections: Record<string, number>;
    };
    onJumpToStep: (stepId: string) => void;
}

export function CompletionGuard({ completion, onJumpToStep }: CompletionGuardProps) {
    const isComplete = completion.overallPercentage === 100;

    const sections: Section[] = [
        { id: 'personal', title: 'Personal Details', percentage: completion.sections.personal, description: 'Basic identification and contact info' },
        { id: 'location', title: 'Location Details', percentage: completion.sections.location, description: 'Residency and demographic info' },
        { id: 'academic', title: 'Academic History', percentage: completion.sections.education, description: 'At least one qualification required' },
        { id: 'experience', title: 'Work Experience', percentage: completion.sections.experience, description: 'Professional history' },
        { id: 'professional', title: 'Professional Details', percentage: completion.sections.professional, description: 'Certifications and memberships' },
        { id: 'referees', title: 'Referees', percentage: completion.sections.referees, description: 'At least 2 referees required' },
    ];

    return (
        <View className="space-y-6">
            <View className={`p-5 rounded-[32px] border ${isComplete ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800' : 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800'}`}>
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${isComplete ? 'bg-green-100 dark:bg-green-800' : 'bg-amber-100 dark:bg-amber-800'}`}>
                            {isComplete ? <CheckCircle2 size={20} color="#10b981" /> : <AlertCircle size={20} color="#f59e0b" />}
                        </View>
                        <View className="ml-3">
                            <Text className={`font-black text-lg ${isComplete ? 'text-green-900 dark:text-green-300' : 'text-amber-900 dark:text-amber-300'}`}>
                                {isComplete ? 'Profile Complete' : 'Profile Incomplete'}
                            </Text>
                            <Text className={`text-xs ${isComplete ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                Overall Progress: {completion.overallPercentage}%
                            </Text>
                        </View>
                    </View>
                    {!isComplete && (
                        <View className="bg-amber-200 dark:bg-amber-700 px-3 py-1 rounded-full">
                            <Text className="text-amber-900 dark:text-amber-100 text-[10px] font-black uppercase">Action Required</Text>
                        </View>
                    )}
                </View>

                {!isComplete && (
                    <Text className="text-amber-800 dark:text-amber-400 text-xs leading-5">
                        Your Digital CV must be 100% complete before you can submit this application. Please address the missing sections below.
                    </Text>
                )}
            </View>

            <View className="space-y-3">
                <Text className="text-gray-900 dark:text-white font-black text-lg ml-1">Section Checklist</Text>
                {sections.map((section) => (
                    <TouchableOpacity 
                        key={section.id}
                        onPress={() => onJumpToStep(section.id)}
                        className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex-row items-center justify-between shadow-sm"
                    >
                        <View className="flex-row items-center flex-1">
                            <View className={`w-8 h-8 rounded-full items-center justify-center ${section.percentage === 100 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                {section.percentage === 100 ? (
                                    <CheckCircle2 size={16} color="#10b981" />
                                ) : (
                                    <View className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                )}
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className={`font-bold text-sm ${section.percentage === 100 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {section.title}
                                </Text>
                                <Text className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{section.description}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center">
                            <Text className={`text-[10px] font-bold mr-2 ${section.percentage === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                                {section.percentage}%
                            </Text>
                            <ChevronRight size={16} color="#cbd5e1" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
