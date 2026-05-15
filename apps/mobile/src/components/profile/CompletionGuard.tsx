import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react-native';
import type { ProfileCompletionSummary, ProfileSectionId } from '@meru/shared';

interface CompletionGuardProps {
    completion: ProfileCompletionSummary;
    onJumpToStep: (stepId: string) => void;
}

type DisplaySection = {
    id: ProfileSectionId;
    stepId: string;
}

const DISPLAY_SECTIONS: DisplaySection[] = [
    { id: 'personal', stepId: 'personal' },
    { id: 'contact', stepId: 'personal' },
    { id: 'location', stepId: 'location' },
    { id: 'education', stepId: 'academic' },
    { id: 'experience', stepId: 'experience' },
    { id: 'professional', stepId: 'professional' },
    { id: 'referees', stepId: 'referees' },
];

export function CompletionGuard({ completion, onJumpToStep }: CompletionGuardProps) {
    const visibleSections = [...(completion?.groups?.required || []), ...(completion?.groups?.optional || [])]
        .filter((section) => DISPLAY_SECTIONS.some((visible) => visible.id === section.id))
        .map((section) => ({
            ...section,
            stepId: DISPLAY_SECTIONS.find((visible) => visible.id === section.id)?.stepId || section.id,
        }));

    const isComplete = completion.canApply;

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
                                {isComplete ? 'Ready to Apply' : 'Complete Required Sections'}
                            </Text>
                            <Text className={`text-xs ${isComplete ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                Required Progress: {completion.requiredPercentage}%
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
                        Finish the required sections below before submitting the application. Optional sections can be completed later.
                    </Text>
                )}
            </View>

            {completion.requiredMissing.length > 0 && (
                <View className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                    <Text className="text-amber-900 dark:text-amber-200 font-black text-sm mb-1">Missing Required Sections</Text>
                    <Text className="text-amber-800 dark:text-amber-400 text-xs leading-5">
                        {completion.requiredMissing.join(', ')}
                    </Text>
                </View>
            )}

            <View className="space-y-4">
                <SectionGroup
                    title="Required to Apply"
                    items={visibleSections.filter((section) => section.required)}
                    onJumpToStep={onJumpToStep}
                />
                <SectionGroup
                    title="Optional Enhancements"
                    items={visibleSections.filter((section) => !section.required)}
                    onJumpToStep={onJumpToStep}
                />
            </View>
        </View>
    );
}

function SectionGroup({
    title,
    items,
    onJumpToStep,
}: {
    title: string;
    items: (ProfileCompletionSummary['groups']['required'][number] & { stepId: string })[];
    onJumpToStep: (stepId: string) => void;
}) {
    if (items.length === 0) return null;

    return (
        <View className="space-y-3">
            <Text className="text-gray-900 dark:text-white font-black text-lg ml-1">{title}</Text>
            {items.map((section) => (
                <TouchableOpacity
                    key={section.id}
                    onPress={() => onJumpToStep(section.stepId)}
                    className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex-row items-center justify-between shadow-sm"
                >
                    <View className="flex-row items-center flex-1">
                        <View className={`w-8 h-8 rounded-full items-center justify-center ${section.completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                            {section.completed ? (
                                <CheckCircle2 size={16} color="#10b981" />
                            ) : (
                                <View className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                            )}
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className={`font-bold text-sm ${section.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {section.label}
                            </Text>
                            <Text className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{section.description}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center">
                        {!section.completed && section.required && (
                            <Text className="text-[10px] font-bold mr-2 text-amber-600">Required</Text>
                        )}
                        <Text className={`text-[10px] font-bold mr-2 ${section.completed ? 'text-green-600' : 'text-amber-600'}`}>
                            {section.percentage}%
                        </Text>
                        <ChevronRight size={16} color="#cbd5e1" />
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}
