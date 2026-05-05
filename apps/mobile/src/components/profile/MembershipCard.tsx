import React from 'react';
import { View, Text } from 'react-native';
import { Award } from 'lucide-react-native';
import { SectionCard } from '@/components/account/SectionCard';

interface MembershipCardProps {
    membership: {
        id: number | string;
        organization: string;
        membershipNumber?: string;
        role?: string;
        yearJoined?: number | string;
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
            title={membership.organization}
            icon={<Award size={20} color="#004aad" />}
            subtitle={membership.role || 'Professional Member'}
            onEdit={onEdit}
            onDelete={onDelete}
        >
            <View className="mt-0.5">
                {membership.membershipNumber && (
                    <Text className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                        Reg No: {membership.membershipNumber}
                    </Text>
                )}
                
                {membership.yearJoined && (
                    <View className="flex-row items-center mt-2">
                        <Text className="text-slate-500 dark:text-slate-500 text-xs">
                            Joined in {membership.yearJoined}
                        </Text>
                    </View>
                )}
            </View>
        </SectionCard>
    );
};
