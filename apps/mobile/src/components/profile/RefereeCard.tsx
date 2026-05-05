import React from 'react';
import { View, Text } from 'react-native';
import { User, Phone, Mail, Link2 } from 'lucide-react-native';
import { SectionCard } from '@/components/account/SectionCard';

interface RefereeCardProps {
    referee: {
        id: number | string;
        fullName: string;
        organization: string;
        designation: string;
        phone: string;
        email: string;
        relationship: string;
    };
    onEdit?: () => void;
    onDelete?: () => void;
}

export const RefereeCard: React.FC<RefereeCardProps> = ({ 
    referee, 
    onEdit, 
    onDelete 
}) => {
    return (
        <SectionCard
            title={referee.fullName}
            icon={<User size={20} color="#004aad" />}
            subtitle={referee.designation}
            onEdit={onEdit}
            onDelete={onDelete}
        >
            <View className="mt-0.5">
                <Text className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                    {referee.organization}
                </Text>
                
                <View className="space-y-1 mt-2">
                    <View className="flex-row items-center">
                        <Phone size={12} color="#64748b" />
                        <Text className="text-slate-500 dark:text-slate-500 text-xs ml-2">
                            {referee.phone}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Mail size={12} color="#64748b" />
                        <Text className="text-slate-500 dark:text-slate-500 text-xs ml-2">
                            {referee.email}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Link2 size={12} color="#64748b" />
                        <Text className="text-slate-500 dark:text-slate-400 text-xs ml-2 font-medium">
                            {referee.relationship}
                        </Text>
                    </View>
                </View>
            </View>
        </SectionCard>
    );
};
