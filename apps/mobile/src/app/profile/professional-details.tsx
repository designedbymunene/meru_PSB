import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';
import { Award, Plus, X } from 'lucide-react-native';
import { Header, HeaderAction } from '@/components/ui/header';
import { SectionCard, FieldGroup } from '@/components/account';
import { ProfileRecordsLoadingState } from '@/components/ui/loading-skeletons';

interface ProfessionalDetailItem {
    id: number;
    licenseType?: string;
    issuingBody?: string;
    registrationNumber?: string;
    issueDate?: string;
    expiryDate?: string | null;
}

export default function ProfessionalDetailsScreen() {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        registrationNumber: '',
        licenseType: '',
        issuingBody: '',
        issueDate: '',
        expiryDate: '',
    });

    const { data: professionals, isLoading } = useQuery<ProfessionalDetailItem[]>({
        queryKey: ['professional-details'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/professional-details');
            return response.data.data || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/professional-details', data),
                method: 'post',
                path: '/applicant-profiles/professional-details',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['professional-details'] });

            if (result.queued) {
                Alert.alert('Queued', 'Professional detail saved offline and will sync when you are back online.');
                setIsAddModalOpen(false);
                setFormData({
                    registrationNumber: '',
                    licenseType: '',
                    issuingBody: '',
                    issueDate: '',
                    expiryDate: '',
                });
                return;
            }

            Alert.alert('Success', 'Professional detail added successfully');
            setIsAddModalOpen(false);
            setFormData({
                registrationNumber: '',
                licenseType: '',
                issuingBody: '',
                issueDate: '',
                expiryDate: '',
            });
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add professional detail'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return runOfflineCapableMutation({
                request: () => apiClient.delete(`/applicant-profiles/professional-details/${id}`),
                method: 'delete',
                path: `/applicant-profiles/professional-details/${id}`,
            });
        },
        onSuccess: (result, id) => {
            queryClient.setQueryData(['professional-details'], (current: ProfessionalDetailItem[] | undefined) =>
                current?.filter((item) => item.id !== id) ?? current
            );
            queryClient.invalidateQueries({ queryKey: ['professional-details'] });

            if (result.queued) {
                Alert.alert('Queued', 'Professional detail deletion queued and will sync when you are back online.');
                return;
            }

            Alert.alert('Success', 'Professional detail deleted successfully');
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete professional detail'));
        },
    });

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Professional Detail',
            'Are you sure you want to delete this registration?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
            ]
        );
    };

    const handleAddProfessional = () => {
        if (!formData.registrationNumber || !formData.licenseType) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        createMutation.mutate(formData as any);
    };

    if (isLoading) {
        return <ProfileRecordsLoadingState title="Professional Details" />;
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-950">
            <Header 
                title="Professional Details" 
                rightAction={
                    <HeaderAction 
                        icon={<Plus size={24} color="white" />}
                        onPress={() => setIsAddModalOpen(true)}
                    />
                }
            />

            {professionals && professionals.length > 0 ? (
                <FlatList
                    data={professionals}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <SectionCard
                            title={item.licenseType}
                            icon={<Award size={24} color="#2563eb" />}
                            subtitle={item.issuingBody}
                            collapsible={false}
                            action={{
                                label: 'Delete',
                                onPress: () => handleDelete(item.id),
                            }}
                        >
                            <View className="space-y-3">
                                <FieldGroup label="Registration Number">
                                    <Text className="text-gray-900 font-semibold">{item.registrationNumber}</Text>
                                </FieldGroup>
                                <FieldGroup label="Issue Date">
                                    <Text className="text-gray-900 dark:text-white font-semibold">{item.issueDate}</Text>
                                </FieldGroup>
                                {item.expiryDate && (
                                    <FieldGroup label="Expiry Date">
                                        <Text className="text-gray-900 dark:text-white font-semibold">{item.expiryDate}</Text>
                                    </FieldGroup>
                                )}
                            </View>
                        </SectionCard>
                    )}
                />
            ) : (
                <View className="flex-1 justify-center items-center px-10">
                    <Award size={48} color="#cbd5e1" />
                    <Text className="text-gray-500 text-center font-semibold mt-4 text-base">No professional details added.</Text>
                    <Text className="text-gray-400 text-center mt-2 text-sm">Add your professional registrations and licenses.</Text>
                    <TouchableOpacity 
                        className="mt-6 bg-blue-600 px-6 py-3 rounded-xl active:bg-blue-700"
                        onPress={() => setIsAddModalOpen(true)}
                    >
                        <Text className="text-white font-semibold">Add Professional Detail</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal visible={isAddModalOpen} transparent={true} animationType="fade">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">Add Professional Detail</Text>
                            <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                                <X size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                             <FieldGroup label="License Type *">
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white"
                                    placeholder="e.g., Professional License"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.licenseType}
                                    onChangeText={(text) => setFormData({ ...formData, licenseType: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Registration Number *">
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white"
                                    placeholder="Enter registration number"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.registrationNumber}
                                    onChangeText={(text) => setFormData({ ...formData, registrationNumber: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Issuing Body">
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white"
                                    placeholder="Organization name"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.issuingBody}
                                    onChangeText={(text) => setFormData({ ...formData, issuingBody: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Issue Date">
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white"
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.issueDate}
                                    onChangeText={(text) => setFormData({ ...formData, issueDate: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Expiry Date">
                                <TextInput
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-900 dark:text-white"
                                    placeholder="YYYY-MM-DD (optional)"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.expiryDate}
                                    onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
                                />
                            </FieldGroup>

                            <TouchableOpacity
                                className="bg-blue-600 p-4 rounded-xl items-center mt-6 active:bg-blue-700"
                                onPress={handleAddProfessional}
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Add Detail</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
