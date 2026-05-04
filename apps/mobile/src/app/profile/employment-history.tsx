import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';
import { Briefcase, Plus, X } from 'lucide-react-native';
import { Header, HeaderAction } from '@/components/ui/header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionCard, FieldGroup } from '@/components/account';
import { ProfileRecordsLoadingState } from '@/components/ui/loading-skeletons';

interface EmploymentHistoryItem {
    id: number;
    employer?: string;
    jobTitle?: string;
    department?: string;
    startDate?: string;
    endDate?: string | null;
    responsibilities?: string;
}

export default function EmploymentHistoryScreen() {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        employer: '',
        jobTitle: '',
        department: '',
        startDate: '',
        endDate: '',
        isCurrentlyEmployed: false,
        responsibilities: '',
    });

    const { data: employments, isLoading } = useQuery<EmploymentHistoryItem[]>({
        queryKey: ['employment-history'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/employment-history');
            return response.data.data || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/employment-history', data),
                method: 'post',
                path: '/applicant-profiles/employment-history',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['employment-history'] });

            if (result.queued) {
                Alert.alert('Queued', 'Employment record saved offline and will sync when you are back online.');
                setIsAddModalOpen(false);
                setFormData({
                    employer: '',
                    jobTitle: '',
                    department: '',
                    startDate: '',
                    endDate: '',
                    isCurrentlyEmployed: false,
                    responsibilities: '',
                });
                return;
            }

            Alert.alert('Success', 'Employment record added successfully');
            setIsAddModalOpen(false);
            setFormData({
                employer: '',
                jobTitle: '',
                department: '',
                startDate: '',
                endDate: '',
                isCurrentlyEmployed: false,
                responsibilities: '',
            });
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add employment record'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return runOfflineCapableMutation({
                request: () => apiClient.delete(`/applicant-profiles/employment-history/${id}`),
                method: 'delete',
                path: `/applicant-profiles/employment-history/${id}`,
            });
        },
        onSuccess: (result, id) => {
            queryClient.setQueryData(['employment-history'], (current: EmploymentHistoryItem[] | undefined) =>
                current?.filter((item) => item.id !== id) ?? current
            );
            queryClient.invalidateQueries({ queryKey: ['employment-history'] });

            if (result.queued) {
                Alert.alert('Queued', 'Employment deletion queued and will sync when you are back online.');
                return;
            }

            Alert.alert('Success', 'Employment record deleted successfully');
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete employment record'));
        },
    });

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Employment Record',
            'Are you sure you want to delete this employment record?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
            ]
        );
    };

    const handleAdd = () => {
        if (!formData.employer || !formData.jobTitle) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }
        createMutation.mutate(formData as any);
    };

    const insets = useSafeAreaInsets();

    if (isLoading) {
        return <ProfileRecordsLoadingState title="Employment History" />;
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header 
                title="Employment History"
                rightAction={
                    <HeaderAction 
                        icon={<Plus size={24} color="#004aad" />} 
                        onPress={() => setIsAddModalOpen(true)} 
                    />
                }
            />

            {employments && employments.length > 0 ? (
                <FlatList
                    data={employments}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
                    renderItem={({ item }) => (
                        <SectionCard
                            title={item.jobTitle}
                            icon={<Briefcase size={24} color="#2563eb" />}
                            subtitle={item.employer}
                            collapsible={false}
                            action={{
                                label: 'Delete',
                                onPress: () => handleDelete(item.id),
                            }}
                        >
                            <View className="space-y-3">
                                {item.department && (
                                    <FieldGroup label="Department">
                                        <Text className="text-gray-900 dark:text-white font-semibold">{item.department}</Text>
                                    </FieldGroup>
                                )}
                                <FieldGroup label="Duration">
                                    <Text className="text-gray-900 dark:text-white font-semibold">{item.startDate} — {item.endDate || 'Present'}</Text>
                                </FieldGroup>
                                {item.responsibilities && (
                                    <FieldGroup label="Responsibilities">
                                        <Text className="text-gray-900 dark:text-white font-semibold">{item.responsibilities}</Text>
                                    </FieldGroup>
                                )}
                            </View>
                        </SectionCard>
                    )}
                />
            ) : (
                <View className="flex-1 justify-center items-center px-10">
                    <Briefcase size={48} color="#cbd5e1" />
                    <Text className="text-gray-500 text-center font-semibold mt-4 text-base">No employment records added.</Text>
                    <Text className="text-gray-400 text-center mt-2 text-sm">Add your work experience to complete your profile.</Text>
                    <TouchableOpacity 
                        className="mt-6 bg-blue-600 px-6 py-3 rounded-xl active:bg-blue-700"
                        onPress={() => setIsAddModalOpen(true)}
                    >
                        <Text className="text-white font-semibold">Add Employment</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal visible={isAddModalOpen} transparent={true} animationType="fade">
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 max-h-[90%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">Add Employment</Text>
                            <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                                <X size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <FieldGroup label="Employer *">
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white"
                                    placeholder="Company name"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.employer}
                                    onChangeText={(text) => setFormData({ ...formData, employer: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Job Title *">
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white"
                                    placeholder="Your job title"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.jobTitle}
                                    onChangeText={(text) => setFormData({ ...formData, jobTitle: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Department">
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white"
                                    placeholder="Department (optional)"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.department}
                                    onChangeText={(text) => setFormData({ ...formData, department: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Start Date">
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white"
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.startDate}
                                    onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="End Date">
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white"
                                    placeholder="YYYY-MM-DD (leave empty if current)"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.endDate}
                                    onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Responsibilities">
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white min-h-20"
                                    placeholder="Key responsibilities"
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    value={formData.responsibilities}
                                    onChangeText={(text) => setFormData({ ...formData, responsibilities: text })}
                                />
                            </FieldGroup>

                            <TouchableOpacity
                                className="bg-blue-600 p-4 rounded-xl items-center mt-6 active:bg-blue-700"
                                onPress={handleAdd}
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Add Employment</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
