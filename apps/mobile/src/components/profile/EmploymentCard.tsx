import React from 'react';
import { View, Text } from 'react-native';
import { Briefcase } from 'lucide-react-native';
import { SectionCard } from '@/components/account/SectionCard';

interface EmploymentCardProps {
    employment: {
        id: number | string;
        organization: string;
        jobTitle: string;
        jobGroup?: string;
        startDate: string;
        endDate?: string | null;
        isCurrent: boolean;
        responsibilities?: string;
    };
    onEdit?: () => void;
    onDelete?: () => void;
}

export const EmploymentCard: React.FC<EmploymentCardProps> = ({ 
    employment, 
    onEdit, 
    onDelete 
}) => {
    return (
        <SectionCard
            title={employment.organization}
            icon={<Briefcase size={20} color="#004aad" />}
            subtitle={employment.jobTitle}
            onEdit={onEdit}
            onDelete={onDelete}
        >
            <View className="mt-0.5">
                {employment.jobGroup && (
                    <Text className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                        {employment.jobGroup}
                    </Text>
                )}
                
                <View className="flex-row items-center mt-2">
                    <Text className="text-slate-500 dark:text-slate-500 text-xs">
                        {new Date(employment.startDate).toLocaleDateString()} — {employment.isCurrent || !employment.endDate ? 'Currently Working' : new Date(employment.endDate).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </SectionCard>
    );
};
