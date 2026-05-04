import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';
import { Users, Plus, X } from 'lucide-react-native';
import { Header, HeaderAction } from '@/components/ui/header';
import { SectionCard, FieldGroup } from '@/components/account';
import { ProfileRecordsLoadingState } from '@/components/ui/loading-skeletons';

interface MembershipItem {
    id: number;
    organizationName?: string;
    membershipType?: string;
    membershipNumber?: string;
    joinDate?: string;
    renewalDate?: string | null;
}

export default function MembershipsScreen() {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        organizationName: '',
        membershipType: '',
        membershipNumber: '',
        joinDate: '',
        renewalDate: '',
    });

    const { data: memberships, isLoading } = useQuery<MembershipItem[]>({
        queryKey: ['memberships'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/memberships');
            return response.data.data || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            return runOfflineCapableMutation({
                request: () => apiClient.post('/applicant-profiles/memberships', data),
                method: 'post',
                path: '/applicant-profiles/memberships',
                body: data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });

            if (result.queued) {
                Alert.alert('Queued', 'Membership saved offline and will sync when you are back online.');
                setIsAddModalOpen(false);
                setFormData({
                    organizationName: '',
                    membershipType: '',
                    membershipNumber: '',
                    joinDate: '',
                    renewalDate: '',
                });
                return;
            }

            Alert.alert('Success', 'Membership added successfully');
            setIsAddModalOpen(false);
            setFormData({
                organizationName: '',
                membershipType: '',
                membershipNumber: '',
                joinDate: '',
                renewalDate: '',
            });
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to add membership'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return runOfflineCapableMutation({
                request: () => apiClient.delete(`/applicant-profiles/memberships/${id}`),
                method: 'delete',
                path: `/applicant-profiles/memberships/${id}`,
            });
        },
        onSuccess: (result, id) => {
            queryClient.setQueryData(['memberships'], (current: MembershipItem[] | undefined) =>
                current?.filter((item) => item.id !== id) ?? current
            );
            queryClient.invalidateQueries({ queryKey: ['memberships'] });

            if (result.queued) {
                Alert.alert('Queued', 'Membership deletion queued and will sync when you are back online.');
                return;
            }

            Alert.alert('Success', 'Membership deleted successfully');
        },
        onError: (error: unknown) => {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete membership'));
        },
    });

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Membership',
            'Are you sure you want to delete this membership?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
            ]
        );
    };

    const handleAdd = () => {
        if (!formData.organizationName || !formData.membershipType) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }
        createMutation.mutate(formData as any);
    };

    if (isLoading) {
        return <ProfileRecordsLoadingState title="Professional Memberships" />;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Header 
                title="Professional Memberships"
                rightAction={
                    <HeaderAction 
                        icon={<Plus size={24} color="white" />}
                        onPress={() => setIsAddModalOpen(true)}
                    />
                }
            />

            {memberships && memberships.length > 0 ? (
                <FlatList
                    data={memberships}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <SectionCard
                            title={item.organizationName}
                            icon={<Users size={24} color="#2563eb" />}
                            subtitle={item.membershipType}
                            collapsible={false}
                            action={{
                                label: 'Delete',
                                onPress: () => handleDelete(item.id),
                            }}
                        >
                            <View className="space-y-3">
                                <FieldGroup label="Membership Number">
                                    <Text className="text-gray-900 font-semibold">{item.membershipNumber}</Text>
                                </FieldGroup>
                                <FieldGroup label="Join Date">
                                    <Text className="text-gray-900 font-semibold">{item.joinDate}</Text>
                                </FieldGroup>
                                {item.renewalDate && (
                                    <FieldGroup label="Renewal Date">
                                        <Text className="text-gray-900 font-semibold">{item.renewalDate}</Text>
                                    </FieldGroup>
                                )}
                            </View>
                        </SectionCard>
                    )}
                />
            ) : (
                <View className="flex-1 justify-center items-center px-10">
                    <Users size={48} color="#cbd5e1" />
                    <Text className="text-gray-500 text-center font-semibold mt-4 text-base">No memberships added.</Text>
                    <Text className="text-gray-400 text-center mt-2 text-sm">Add your professional memberships and affiliations.</Text>
                    <TouchableOpacity 
                        className="mt-6 bg-blue-600 px-6 py-3 rounded-xl active:bg-blue-700"
                        onPress={() => setIsAddModalOpen(true)}
                    >
                        <Text className="text-white font-semibold">Add Membership</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal visible={isAddModalOpen} transparent={true} animationType="fade">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">Add Membership</Text>
                            <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                                <X size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <FieldGroup label="Organization Name *">
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900"
                                    placeholder="Professional organization"
                                    value={formData.organizationName}
                                    onChangeText={(text) => setFormData({ ...formData, organizationName: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Membership Type *">
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900"
                                    placeholder="e.g., Full Member, Associate"
                                    value={formData.membershipType}
                                    onChangeText={(text) => setFormData({ ...formData, membershipType: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Membership Number">
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900"
                                    placeholder="Your membership ID"
                                    value={formData.membershipNumber}
                                    onChangeText={(text) => setFormData({ ...formData, membershipNumber: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Join Date">
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900"
                                    placeholder="YYYY-MM-DD"
                                    value={formData.joinDate}
                                    onChangeText={(text) => setFormData({ ...formData, joinDate: text })}
                                />
                            </FieldGroup>

                            <FieldGroup label="Renewal Date">
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-gray-900"
                                    placeholder="YYYY-MM-DD (optional)"
                                    value={formData.renewalDate}
                                    onChangeText={(text) => setFormData({ ...formData, renewalDate: text })}
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
                                    <Text className="text-white font-bold">Add Membership</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
