import React from 'react';
import { View } from 'react-native';
import { Award } from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { ProfileRecordsLoadingState } from '@/components/ui/loading-skeletons';
import { ListSectionWrapper } from '@/components/profile/forms/ListSectionWrapper';
import { ProfessionalDetailForm } from '@/components/profile/forms/ProfessionalDetailForm';
import { ProfessionalDetailCard } from '@/components/profile/ProfessionalDetailCard';
import { useProfessionalDetails } from '@/hooks/use-professional-details';
import { useProfile } from '@/hooks/use-profile';

export default function ProfessionalDetailsScreen() {
    const { 
        professionalDetails, 
        isLoading: isLoadingRecords, 
        addProfessionalDetail, 
        updateProfessionalDetail, 
        deleteProfessionalDetail 
    } = useProfessionalDetails();
    
    const { profile, isLoading: isLoadingProfile, toggleNA } = useProfile();
    const isLoading = isLoadingRecords || isLoadingProfile;

    if (isLoading) {
        return <ProfileRecordsLoadingState title="Professional Details" />;
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header title="Professional Details" />

            <View className="flex-1 p-6 pt-10">
                <ListSectionWrapper
                    title="Certifications & Licenses"
                    items={professionalDetails || []}
                    FormComponent={ProfessionalDetailForm}
                    onAdd={addProfessionalDetail}
                    onUpdate={updateProfessionalDetail}
                    onDelete={deleteProfessionalDetail}
                    emptyMessage="No professional details added yet"
                    emptyIcon={<Award size={48} color="#cbd5e1" />}
                    isNA={profile?.hasNoCertificates}
                    onToggleNA={(val) => toggleNA('hasNoCertificates', val)}
                    renderItem={(item, onEdit, onDelete) => (
                        <ProfessionalDetailCard 
                            key={item.id}
                            detail={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    )}
                />
            </View>
        </View>
    );
}
