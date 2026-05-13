import React from 'react';
import { View, Text } from 'react-native';
import { Award } from 'lucide-react-native';
import { SectionCard } from '@/components/account/SectionCard';

interface MembershipCardProps {
    membership: {
        id: number | string;
        membershipBody: string;
        membershipType: string;
        registrationNumber?: string;
        expiryDate?: string;
    };
    onEdit?: () => void;
    onDelete?: () => void;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ 
    membership, 
    onEdit, 
    onDelete 
}) => {
    return (
        <SectionCard
            title={membership.membershipBody}
            icon={<Award size={20} color="#004aad" />}
            subtitle={membership.membershipType}
            onEdit={onEdit}
            onDelete={onDelete}
        >
            <View className="mt-0.5">
                {membership.registrationNumber && (
                    <Text className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                        Reg No: {membership.registrationNumber}
                    </Text>
                )}
                
                {membership.expiryDate && (
                    <View className="flex-row items-center mt-2">
                        <Text className="text-slate-500 dark:text-slate-500 text-xs">
                            Expires on: {new Date(membership.expiryDate).toLocaleDateString()}
                        </Text>
                    </View>
                )}
            </View>
        </SectionCard>
    );
};
