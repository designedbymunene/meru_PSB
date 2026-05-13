import React from 'react';
import { View } from 'react-native';
import { Users } from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { ProfileRecordsLoadingState } from '@/components/ui/loading-skeletons';
import { ListSectionWrapper } from '@/components/profile/forms/ListSectionWrapper';
import { RefereeForm } from '@/components/profile/forms/RefereeForm';
import { RefereeCard } from '@/components/profile/RefereeCard';
import { useReferees } from '@/hooks/use-referees';
import { useProfile } from '@/hooks/use-profile';

export default function RefereesScreen() {
    const { 
        referees, 
        isLoading: isLoadingRecords, 
        addReferee, 
        updateReferee, 
        deleteReferee 
    } = useReferees();
    
    const { profile, isLoading: isLoadingProfile, toggleNA } = useProfile();
    const isLoading = isLoadingRecords || isLoadingProfile;

    if (isLoading) {
        return <ProfileRecordsLoadingState title="Referees" />;
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header title="Referees" />

            <View className="flex-1 p-6 pt-10">
                <ListSectionWrapper
                    title="Professional Referees"
                    items={referees || []}
                    FormComponent={RefereeForm}
                    onAdd={addReferee}
                    onUpdate={updateReferee}
                    onDelete={deleteReferee}
                    emptyMessage="No referees added yet"
                    emptyIcon={<Users size={48} color="#cbd5e1" />}
                    isNA={profile?.hasNoReferees}
                    onToggleNA={(val) => toggleNA('hasNoReferees', val)}
                    renderItem={(item, onEdit, onDelete) => (
                        <RefereeCard 
                            key={item.id}
                            referee={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    )}
                />
            </View>
        </View>
    );
}
