import React from 'react';
import { View } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { ProfileRecordsLoadingState } from '@/components/ui/loading-skeletons';
import { ListSectionWrapper } from '@/components/profile/forms/ListSectionWrapper';
import { TrainingForm } from '@/components/profile/forms/TrainingForm';
import { TrainingCard } from '@/components/profile/TrainingCard';
import { useTraining } from '@/hooks/use-training';
import { useProfile } from '@/hooks/use-profile';

export default function TrainingScreen() {
    const { 
        trainingCourses, 
        isLoading: isLoadingRecords, 
        addTraining, 
        updateTraining, 
        deleteTraining 
    } = useTraining();
    
    const { profile, isLoading: isLoadingProfile, toggleNA } = useProfile();
    const isLoading = isLoadingRecords || isLoadingProfile;

    if (isLoading) {
        return <ProfileRecordsLoadingState title="Training" />;
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header title="Training & Workshops" />

            <View className="flex-1 p-6 pt-10">
                <ListSectionWrapper
                    title="Course History"
                    items={trainingCourses || []}
                    FormComponent={TrainingForm}
                    onAdd={addTraining}
                    onUpdate={updateTraining}
                    onDelete={deleteTraining}
                    emptyMessage="No training courses added yet"
                    emptyIcon={<BookOpen size={48} color="#cbd5e1" />}
                    isNA={profile?.hasNoTrainings}
                    onToggleNA={(val) => toggleNA('hasNoTrainings', val)}
                    renderItem={(item, onEdit, onDelete) => (
                        <TrainingCard 
                            key={item.id}
                            training={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    )}
                />
            </View>
        </View>
    );
}
