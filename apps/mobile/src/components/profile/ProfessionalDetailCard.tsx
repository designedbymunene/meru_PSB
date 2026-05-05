import React from 'react';
import { View, Text } from 'react-native';
import { Award, ShieldCheck, Calendar } from 'lucide-react-native';
import { SectionCard } from '@/components/account/SectionCard';

interface ProfessionalDetailCardProps {
    detail: {
        id: number | string;
        licenseType: string;
        issuingBody: string;
        registrationNumber: string;
        issueDate: string;
        expiryDate?: string | null;
    };
    onEdit?: () => void;
    onDelete?: () => void;
}

export const ProfessionalDetailCard: React.FC<ProfessionalDetailCardProps> = ({ 
    detail, 
    onEdit, 
    onDelete 
}) => {
    return (
        <SectionCard
            title={detail.licenseType}
            icon={<Award size={20} color="#004aad" />}
            subtitle={detail.issuingBody}
            onEdit={onEdit}
            onDelete={onDelete}
        >
            <View className="mt-0.5">
                <View className="flex-row items-center">
                    <ShieldCheck size={12} color="#64748b" />
                    <Text className="text-slate-600 dark:text-slate-400 text-sm font-semibold ml-2">
                        Reg: {detail.registrationNumber}
                    </Text>
                </View>
                
                <View className="flex-row items-center mt-2">
                    <Calendar size={12} color="#94a3b8" />
                    <Text className="text-slate-500 dark:text-slate-500 text-xs ml-2">
                        Issued: {new Date(detail.issueDate).toLocaleDateString()}
                        {detail.expiryDate ? ` • Expires: ${new Date(detail.expiryDate).toLocaleDateString()}` : ''}
                    </Text>
                </View>
            </View>
        </SectionCard>
    );
};
