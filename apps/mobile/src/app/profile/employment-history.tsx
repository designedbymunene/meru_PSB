import React from 'react';
import { View } from 'react-native';
import { Briefcase } from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { ProfileRecordsLoadingState } from '@/components/ui/loading-skeletons';
import { ListSectionWrapper } from '@/components/profile/forms/ListSectionWrapper';
import { EmploymentForm } from '@/components/profile/forms/EmploymentForm';
import { EmploymentCard } from '@/components/profile/EmploymentCard';
import { useEmployment } from '@/hooks/use-employment';
import { useProfile } from '@/hooks/use-profile';

export default function EmploymentHistoryScreen() {
    const { 
        employmentHistory, 
        isLoading: isLoadingRecords, 
        addEmployment, 
        updateEmployment, 
        deleteEmployment 
    } = useEmployment();
    
    const { profile, isLoading: isLoadingProfile, toggleNA } = useProfile();
    const isLoading = isLoadingRecords || isLoadingProfile;

    if (isLoading) {
        return <ProfileRecordsLoadingState title="Employment History" />;
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header title="Employment History" />

            <View className="flex-1 p-6 pt-10">
                <ListSectionWrapper
                    title="Work Experience"
                    items={employmentHistory || []}
                    FormComponent={EmploymentForm}
                    onAdd={addEmployment}
                    onUpdate={updateEmployment}
                    onDelete={deleteEmployment}
                    emptyMessage="No employment records added yet"
                    emptyIcon={<Briefcase size={48} color="#cbd5e1" />}
                    isNA={profile?.hasNoExperience}
                    onToggleNA={(val) => toggleNA('hasNoExperience', val)}
                    renderItem={(item, onEdit, onDelete) => (
                        <EmploymentCard 
                            key={item.id}
                            employment={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    )}
                />
            </View>
        </View>
    );
}

