import React from 'react';
import { View, Text } from 'react-native';
import { GraduationCap } from 'lucide-react-native';
import { SectionCard } from '@/components/account/SectionCard';

interface QualificationCardProps {
    qualification: {
        id: number | string;
        institution: string;
        level: string;
        course: string;
        yearStart?: number | string;
        yearEnd?: number | string | null;
        grade?: string | null;
    };
    onEdit?: () => void;
    onDelete?: () => void;
}

export const QualificationCard: React.FC<QualificationCardProps> = ({ 
    qualification, 
    onEdit, 
    onDelete 
}) => {
    return (
        <SectionCard
            title={qualification.institution}
            icon={<GraduationCap size={20} color="#004aad" />}
            subtitle={qualification.level}
            onEdit={onEdit}
            onDelete={onDelete}
        >
            <View className="mt-0.5">
                <Text className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                    {qualification.course}
                </Text>
                
                <View className="flex-row items-center mt-2">
                    <Text className="text-slate-500 dark:text-slate-500 text-xs">
                        {qualification.yearStart} — {qualification.yearEnd || 'Present'}
                    </Text>
                    
                    {qualification.grade && (
                        <View className="flex-row items-center">
                            <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-2" />
                            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                                Grade: {qualification.grade}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </SectionCard>
    );
};
