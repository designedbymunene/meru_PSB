import React from 'react';
import { View, Text, Pressable } from 'react-native';
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
    { id: 'training', stepId: 'training' },
    { id: 'professional', stepId: 'professional' },
    { id: 'memberships', stepId: 'professional' },
    { id: 'referees', stepId: 'referees' },
];

export function CompletionGuard({ completion, onJumpToStep }: CompletionGuardProps) {
    const visibleSections = [...(completion?.groups?.required || []), ...(completion?.groups?.optional || [])]
        .reduce<DisplaySection[]>((acc, section) => {
            const displaySection = DISPLAY_SECTIONS.find((visible) => visible.id === section.id);
            if (displaySection) {
                acc.push({
                    ...section,
                    stepId: displaySection.stepId,
                });
            }
            return acc;
        }, []);

    const isComplete = completion.canApply;

    return (
        <View className="space-y-8 pt-2">
            <View className={`p-4 rounded-2xl border ${isComplete ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800' : 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800'}`}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-3">
                        <View className={`w-8 h-8 rounded-full items-center justify-center ${isComplete ? 'bg-green-100 dark:bg-green-800' : 'bg-amber-100 dark:bg-amber-800'}`}>
                            {isComplete ? <CheckCircle2 size={16} color="#10b981" /> : <AlertCircle size={16} color="#f59e0b" />}
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className={`font-bold text-sm ${isComplete ? 'text-green-900 dark:text-green-300' : 'text-amber-900 dark:text-amber-300'}`}>
                                {isComplete ? 'Ready to Apply' : 'Complete Required Sections'}
                            </Text>
                            {!isComplete && completion.requiredMissing.length > 0 && (
                                <Text className="text-amber-800 dark:text-amber-400 text-xs mt-0.5">
                                    Missing: {completion.requiredMissing.join(', ')}
                                </Text>
                            )}
                        </View>
                    </View>
                    <Text className={`text-xs font-black ${isComplete ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {completion.requiredPercentage}%
                    </Text>
                </View>
            </View>

            <View className="space-y-6">
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
        <View className="space-y-4">
            <Text className="text-gray-900 dark:text-white font-black text-lg ml-1">{title}</Text>
            {items.map((section) => (
                <Pressable
                    key={section.id}
                    onPress={() => onJumpToStep(section.stepId)}
                    className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex-row items-center justify-between shadow-sm"
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
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
                </Pressable>
            ))}
        </View>
    );
}
