import React from 'react';
import { View } from 'react-native';
import { Award } from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { ProfileRecordsLoadingState } from '@/components/ui/loading-skeletons';
import { ListSectionWrapper } from '@/components/profile/forms/ListSectionWrapper';
import { MembershipForm } from '@/components/profile/forms/MembershipForm';
import { MembershipCard } from '@/components/profile/MembershipCard';
import { useMemberships } from '@/hooks/use-memberships';

export default function MembershipsScreen() {
    const { 
        memberships, 
        isLoading, 
        addMembership, 
        updateMembership, 
        deleteMembership 
    } = useMemberships();

    if (isLoading) {
        return <ProfileRecordsLoadingState title="Memberships" />;
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header title="Memberships" />

            <View className="flex-1 p-4">
                <ListSectionWrapper
                    title="Professional Memberships"
                    items={memberships || []}
                    FormComponent={MembershipForm}
                    onAdd={addMembership}
                    onUpdate={updateMembership}
                    onDelete={deleteMembership}
                    emptyMessage="No memberships added yet"
                    emptyIcon={<Award size={48} color="#cbd5e1" />}
                    renderItem={(item, onEdit, onDelete) => (
                        <MembershipCard 
                            key={item.id}
                            membership={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    )}
                />
            </View>
        </View>
    );
}
