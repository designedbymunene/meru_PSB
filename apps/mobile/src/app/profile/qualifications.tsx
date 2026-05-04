import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';
import { Plus, GraduationCap } from 'lucide-react-native';
import { Header, HeaderAction } from '@/components/ui/header';
import { SectionCard } from '@/components/account';
import { ProfileRecordsLoadingState } from '@/components/ui/loading-skeletons';

interface QualificationItem {
    id: number;
    institution: string;
    qualificationType?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string | null;
    gradeObtained?: string | null;
}

export default function QualificationsScreen() {
    const queryClient = useQueryClient();

    const { data: qualifications, isLoading } = useQuery<QualificationItem[]>({
        queryKey: ['qualifications'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/qualifications');
            return response.data.data || [];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return runOfflineCapableMutation({
                request: () => apiClient.delete(`/applicant-profiles/qualifications/${id}`),
                method: 'delete',
                path: `/applicant-profiles/qualifications/${id}`,
            });
        },
        onSuccess: (result, id) => {
            queryClient.setQueryData(['qualifications'], (current: QualificationItem[] | undefined) =>
                current?.filter((item) => item.id !== id) ?? current
            );
            queryClient.invalidateQueries({ queryKey: ['qualifications'] });

            if (result.queued) {
                Alert.alert('Queued', 'Qualification deletion queued and will sync when you are back online.');
                return;
            }

            Alert.alert('Success', 'Qualification deleted successfully');
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete qualification'));
        }
    });

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Qualification',
            'Are you sure you want to delete this qualification?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
            ]
        );
    };

    if (isLoading) {
        return <ProfileRecordsLoadingState title="Qualifications" />;
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header 
                title="Qualifications" 
                rightAction={
                    <HeaderAction 
                        icon={<Plus size={24} color="white" />}
                        onPress={() => {/* TODO: Navigate to add qualification */}}
                    />
                }
            />

            {qualifications && qualifications.length > 0 ? (
                <FlatList
                    data={qualifications}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <SectionCard
                            title={item.institution}
                            icon={<GraduationCap size={24} color="#2563eb" />}
                            subtitle={item.qualificationType}
                            collapsible={false}
                            action={{
                                label: 'Delete',
                                onPress: () => handleDelete(item.id),
                            }}
                        >
                            <View className="space-y-3">
                                <View>
                                    <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Field of Study</Text>
                                    <Text className="text-gray-900 dark:text-white font-semibold">{item.fieldOfStudy}</Text>
                                </View>
                                <View className="border-t border-gray-100 dark:border-gray-800 pt-3">
                                    <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Duration</Text>
                                    <Text className="text-gray-900 dark:text-white font-semibold">{item.startDate} — {item.endDate || 'Present'}</Text>
                                </View>
                                {item.gradeObtained && (
                                    <View className="border-t border-gray-100 dark:border-gray-800 pt-3">
                                        <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Grade</Text>
                                        <Text className="text-gray-900 dark:text-white font-semibold">{item.gradeObtained}</Text>
                                    </View>
                                )}
                            </View>
                        </SectionCard>
                    )}
                />
            ) : (
                <View className="flex-1 justify-center items-center px-10">
                    <GraduationCap size={48} color="#cbd5e1" className="dark:text-gray-700" />
                    <Text className="text-gray-500 dark:text-gray-300 text-center font-semibold mt-4 text-base">No qualifications added yet.</Text>
                    <Text className="text-gray-400 dark:text-gray-500 text-center mt-2 text-sm">Add your educational background to strengthen your profile.</Text>
                    <TouchableOpacity 
                        className="mt-6 bg-blue-600 px-6 py-3 rounded-xl active:bg-blue-700"
                        onPress={() => {/* TODO: Navigate to add qualification */}}
                    >
                        <Text className="text-white font-semibold">Add Qualification</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
