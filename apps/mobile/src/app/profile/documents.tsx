import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { FileText, Upload, CheckCircle, AlertCircle, ShieldCheck, Clock, FileCheck, Plus, Trash2 } from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { SectionCard } from '@/components/account';
import { FormLayout } from '@/components/ui/form-layout';
import { ProfileFormLoadingState } from '@/components/ui/loading-skeletons';
import * as DocumentPicker from 'expo-document-picker';
import { toast } from 'sonner-native';

export default function DocumentsScreen() {
    const [isUploading, setIsUploading] = useState(false);
    const { data: documents, isLoading, refetch } = useQuery({
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

    const pickAndUpload = async (documentType: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            setIsUploading(true);
            const file = result.assets[0];
            
            const formData = new FormData();
            // @ts-ignore
            formData.append('file', {
                uri: file.uri,
                type: file.mimeType || 'application/octet-stream',
                name: file.name,
            });
            formData.append('documentType', documentType);

            await apiClient.post('/account/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Document uploaded successfully');
            refetch();
        } catch (error) {
            console.error('Upload failed', error);
            toast.error('Failed to upload document');
        } finally {
            setIsUploading(false);
        }
    };

    const deleteDocument = async (id: number) => {
        try {
            await apiClient.delete(`/account/documents/${id}`);
            toast.success('Document deleted');
            refetch();
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

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

    const requiredDocTypes = ['ID Card', 'Academic Certificate', 'KRA Pin', 'Certificate of Good Conduct'];
    const uploadedTypes = documents?.map((d: any) => d.documentType) || [];
    const missingTypes = requiredDocTypes.filter(t => !uploadedTypes.includes(t));

    return (
        <FormLayout
            title="Documents"
            onBack={() => {}}
        >
            <View className="space-y-6">
                {/* Verification Status */}
                <View className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex-row items-start mb-2">
                    <ShieldCheck size={20} color="#004aad" className="mt-0.5" />
                    <View className="ml-3 flex-1">
                        <Text className="text-[#004aad] font-bold text-sm">Document Verification</Text>
                        <Text className="text-blue-700/60 text-[10px] mt-1 font-medium leading-4">
                            Upload your supporting documents here. Once uploaded, our team will verify them for authenticity.
                        </Text>
                    </View>
                </View>

                {/* Uploaded Documents */}
                <SectionCard
                    title="Your Documents"
                    icon={<FileText size={22} color="#004aad" />}
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
                                                <View className="flex-row justify-between items-center">
                                                    <Text className="text-gray-900 font-bold text-sm">{doc.documentType}</Text>
                                                    <TouchableOpacity onPress={() => deleteDocument(doc.id)}>
                                                        <Trash2 size={14} color="#ef4444" />
                                                    </TouchableOpacity>
                                                </View>
                                                <Text className="text-gray-500 text-[10px] mt-1 font-medium">{doc.originalName}</Text>
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
                                    {doc.status === 'rejected' && (
                                        <View className="mt-4 bg-red-50 p-3 rounded-xl border border-red-100">
                                            <Text className="text-red-700 text-[10px] font-medium leading-4 mb-3">{doc.rejectionReason}</Text>
                                            <TouchableOpacity 
                                                className="bg-red-600 p-3 rounded-xl flex-row justify-center items-center"
                                                onPress={() => pickAndUpload(doc.documentType)}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? <ActivityIndicator size="small" color="white" /> : <Upload size={14} color="white" />}
                                                <Text className="text-white text-xs font-black uppercase tracking-widest ml-2">Re-upload File</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            ))
                        ) : (
                            <View className="items-center py-6">
                                <FileCheck size={40} color="#cbd5e1" />
                                <Text className="text-gray-400 text-xs font-medium mt-3">No documents uploaded yet</Text>
                            </View>
                        )}

                        <TouchableOpacity 
                            className="mt-2 bg-gray-900 p-4 rounded-xl flex-row justify-center items-center"
                            onPress={() => pickAndUpload('Other Document')}
                            disabled={isUploading}
                        >
                            {isUploading ? <ActivityIndicator size="small" color="white" /> : <Plus size={16} color="white" />}
                            <Text className="text-white text-xs font-black uppercase tracking-widest ml-2">Upload New Document</Text>
                        </TouchableOpacity>
                    </View>
                </SectionCard>

                {/* Missing Required Documents */}
                {missingTypes.length > 0 && (
                    <SectionCard
                        title="Action Required"
                        icon={<AlertCircle size={22} color="#f59e0b" />}
                    >
                        <View className="space-y-3">
                            <Text className="text-gray-500 text-[10px] font-medium mb-1">
                                Please upload the following documents to complete your profile:
                            </Text>
                            {missingTypes.map((type) => (
                                <TouchableOpacity 
                                    key={type}
                                    className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex-row justify-between items-center"
                                    onPress={() => pickAndUpload(type)}
                                    disabled={isUploading}
                                >
                                    <View className="flex-row items-center">
                                        <Clock size={16} color="#f59e0b" />
                                        <Text className="text-gray-900 font-bold text-xs ml-3">{type}</Text>
                                    </View>
                                    {isUploading ? <ActivityIndicator size="small" color="#f59e0b" /> : <Upload size={16} color="#f59e0b" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </SectionCard>
                )}
            </View>
        </FormLayout>
    );
}

