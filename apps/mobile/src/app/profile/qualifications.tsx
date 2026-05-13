import React from 'react';
import { View } from 'react-native';
import { GraduationCap } from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { ProfileRecordsLoadingState } from '@/components/ui/loading-skeletons';
import { ListSectionWrapper } from '@/components/profile/forms/ListSectionWrapper';
import { QualificationForm } from '@/components/profile/forms/QualificationForm';
import { QualificationCard } from '@/components/profile/QualificationCard';
import { useQualifications } from '@/hooks/use-qualifications';

export default function QualificationsScreen() {
    const { 
        qualifications, 
        isLoading, 
        addQualification, 
        updateQualification, 
        deleteQualification 
    } = useQualifications();

    if (isLoading) {
        return <ProfileRecordsLoadingState title="Qualifications" />;
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header title="Academic Qualifications" />

            <View className="flex-1 p-6 pt-10">
                <ListSectionWrapper
                    title="Education History"
                    items={qualifications || []}
                    FormComponent={QualificationForm}
                    onAdd={addQualification}
                    onUpdate={updateQualification}
                    onDelete={deleteQualification}
                    emptyMessage="No qualifications added yet"
                    emptyIcon={<GraduationCap size={48} color="#cbd5e1" />}
                    renderItem={(item, onEdit, onDelete) => (
                        <QualificationCard 
                            key={item.id}
                            qualification={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    )}
                />
            </View>
        </View>
    );
}
