import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { FileText, Upload, CheckCircle, AlertCircle, ShieldCheck, Clock, FileCheck } from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { SectionCard } from '@/components/account';
import { FormLayout } from '@/components/ui/form-layout';
import { ProfileFormLoadingState } from '@/components/ui/loading-skeletons';

export default function DocumentsScreen() {
    const { data: documents, isLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/account/documents');
                return response.data.data || [];
            } catch (error) {
                console.error('Failed to fetch documents', error);
                return [];
            }
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return '#16a34a';
            case 'uploaded': return '#2563eb';
            case 'rejected': return '#ef4444';
            default: return '#64748b';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified': return <CheckCircle size={18} color="#16a34a" />;
            case 'rejected': return <AlertCircle size={18} color="#ef4444" />;
            default: return <FileText size={18} color="#64748b" />;
        }
    };

    if (isLoading) {
        return <ProfileFormLoadingState title="Documents" />;
    }

    return (
        <FormLayout
            title="Documents"
            onBack={() => {}}
        >
            <View className="space-y-6">
                {/* Verification Status */}
                <View className="bg-green-50 p-5 rounded-2xl border border-green-100 flex-row items-start mb-2">
                    <ShieldCheck size={20} color="#16a34a" className="mt-0.5" />
                    <View className="ml-3 flex-1">
                        <Text className="text-green-800 font-bold text-sm">Account Partially Verified</Text>
                        <Text className="text-green-700/60 text-[10px] mt-1 font-medium leading-4">
                            Most of your identity documents have been verified. Complete the remaining items to reach full compliance.
                        </Text>
                    </View>
                </View>

                {/* Required Documents */}
                <SectionCard
                    title="Supporting Documents"
                    icon={<FileText size={22} color="#2563eb" />}
                >
                    <View className="space-y-4">
                        {documents && documents.length > 0 ? (
                            documents.map((doc: any) => (
                                <View key={doc.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <View className="flex-row items-start justify-between">
                                        <View className="flex-1 flex-row items-start">
                                            <View className="bg-white p-2 rounded-lg shadow-sm">
                                                {getStatusIcon(doc.status)}
                                            </View>
                                            <View className="ml-3 flex-1">
                                                <Text className="text-gray-900 font-bold text-sm">{doc.documentType}</Text>
                                                <Text className="text-gray-500 text-[10px] mt-1 font-medium">{doc.description}</Text>
                                                <View className="mt-2 bg-white self-start px-2 py-0.5 rounded-full border border-gray-100">
                                                    <Text 
                                                        className="text-[9px] font-black uppercase tracking-widest"
                                                        style={{ color: getStatusColor(doc.status) }}
                                                    >
                                                        {doc.status}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    {doc.status === 'pending' && (
                                        <TouchableOpacity className="mt-4 bg-blue-600 p-3 rounded-xl flex-row justify-center items-center">
                                            <Upload size={14} color="white" />
                                            <Text className="text-white text-xs font-black uppercase tracking-widest ml-2">Upload File</Text>
                                        </TouchableOpacity>
                                    )}
                                    {doc.status === 'rejected' && (
                                        <View className="mt-4 bg-red-50 p-3 rounded-xl border border-red-100">
                                            <Text className="text-red-700 text-[10px] font-medium leading-4 mb-3">{doc.rejectionReason}</Text>
                                            <TouchableOpacity className="bg-red-600 p-3 rounded-xl flex-row justify-center items-center">
                                                <Upload size={14} color="white" />
                                                <Text className="text-white text-xs font-black uppercase tracking-widest ml-2">Re-upload File</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            ))
                        ) : (
                            <View className="items-center py-6">
                                <FileCheck size={40} color="#cbd5e1" />
                                <Text className="text-gray-400 text-xs font-medium mt-3">No documents required at this time</Text>
                            </View>
                        )}
                    </View>
                </SectionCard>

                {/* Compliance Checklist */}
                <SectionCard
                    title="Compliance Status"
                    icon={<FileCheck size={22} color="#059669" />}
                >
                    <View className="space-y-1">
                        {[
                            { label: 'Background Check', status: 'COMPLETE', icon: CheckCircle, color: '#16a34a' },
                            { label: 'Identity Verification', status: 'COMPLETE', icon: CheckCircle, color: '#16a34a' },
                            { label: 'Reference Check', status: 'PENDING', icon: Clock, color: '#f59e0b' }
                        ].map((item, index) => (
                            <View key={index} className="flex-row items-center py-4 border-b border-gray-50 last:border-b-0">
                                <item.icon size={18} color={item.color} />
                                <Text className="text-gray-900 font-bold text-sm ml-3 flex-1">{item.label}</Text>
                                <View 
                                    className="px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: `${item.color}15` }}
                                >
                                    <Text className="text-[9px] font-black" style={{ color: item.color }}>{item.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </SectionCard>
            </View>
        </FormLayout>
    );
}
