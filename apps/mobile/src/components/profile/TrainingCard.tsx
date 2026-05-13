import React from 'react';
import { View, Text } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { SectionCard } from '@/components/account/SectionCard';

interface TrainingCardProps {
    training: {
        id: number | string;
        courseName: string;
        institution: string;
        year?: number | string;
        grade?: string;
    };
    onEdit?: () => void;
    onDelete?: () => void;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({ 
    training, 
    onEdit, 
    onDelete 
}) => {
    return (
        <SectionCard
            title={training.courseName}
            icon={<BookOpen size={20} color="#004aad" />}
            subtitle={training.institution}
            onEdit={onEdit}
            onDelete={onDelete}
        >
            <View className="mt-0.5">
                <View className="flex-row items-center mt-2">
                    <Text className="text-slate-500 dark:text-slate-500 text-xs">
                        {training.year ? `Year: ${training.year}` : 'Date N/A'}
                        {training.grade ? ` • Grade: ${training.grade}` : ''}
                    </Text>
                </View>
            </View>
        </SectionCard>
    );
};
