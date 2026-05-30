import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { AlertModal } from '@/components/ui/alert-modal';
import { Plus, X, Info } from 'lucide-react-native';
import { SectionCard } from '@/components/account/SectionCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ListSectionWrapperProps<T> {
    title?: string;
    items: T[];
    renderItem: (item: T, onEdit: () => void, onDelete: () => void) => React.ReactNode;
    FormComponent: React.ComponentType<{ initialData?: Partial<T>; onSubmit: (data: T) => void; ref: any }>;
    onAdd: (data: T) => Promise<void>;
    onUpdate: (id: string | number, data: T) => Promise<void>;
    onDelete: (id: string | number) => Promise<void>;
    emptyMessage: string;
    emptyIcon: React.ReactNode;
    isNA?: boolean;
    onToggleNA?: (value: boolean) => void;
}

export function ListSectionWrapper<T extends { id: string | number }>({
    title,
    items,
    renderItem,
    FormComponent,
    onAdd,
    onUpdate,
    onDelete: onDeleteItem,
    emptyMessage,
    emptyIcon,
    isNA = false,
    onToggleNA,
}: ListSectionWrapperProps<T>) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const formRef = React.useRef<any>(null);
    const insets = useSafeAreaInsets();

    const handleOpenAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: T) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const [isSavingLocal, setIsSavingLocal] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null);

    const handleSave = async (data: T) => {
        if (isSavingLocal) return;
        setIsSavingLocal(true);
        try {
            if (editingItem) {
                await onUpdate(editingItem.id, data);
            } else {
                await onAdd(data);
            }
            setIsModalOpen(false);
        } catch (error) {
            // Error handling is usually done in the mutation hooks passed to onAdd/onUpdate
        } finally {
            setIsSavingLocal(false);
        }
    };

    const handleDelete = (id: string | number) => {
        console.log(`[ListSectionWrapper] Opening delete modal for id: ${id}`);
        setPendingDeleteId(id);
        setIsDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        console.log(`[ListSectionWrapper] Confirming delete for id: ${pendingDeleteId}`);
        if (pendingDeleteId != null) {
            try {
                await onDeleteItem(pendingDeleteId);
            } catch (error) {
                console.error(`[ListSectionWrapper] Delete failed`, error);
            }
        }
        setPendingDeleteId(null);
        setIsDeleteModalVisible(false);
    };

    return (
        <View>
            {title && (
                <View className="mb-6 ml-2">
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px]">{title}</Text>
                </View>
            )}

            {onToggleNA && items.length === 0 && (
                <View 
                    className={`mb-6 p-6 rounded-[32px] border ${isNA ? 'bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50 shadow-sm' : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm'} flex-row items-center justify-between`}
                >
                    <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-1.5">
                            <Info size={14} color={isNA ? "#2563eb" : "#64748b"} strokeWidth={2.5} />
                            <Text className={`font-black ml-1.5 text-[11px] uppercase tracking-wider ${isNA ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                Not Applicable
                            </Text>
                        </View>
                        <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold leading-4">
                            {isNA ? "You've marked this as not applicable. This helps you reach 100% completion." : "Don't have any records for this section? Toggle this to skip."}
                        </Text>
                    </View>
                    <Switch
                        value={isNA}
                        onValueChange={(val) => {
                            try {
                                console.log(`[ListSectionWrapper] N/A toggle starting: ${val}`);
                                // Defer the toggle to next event loop to avoid navigation context issues
                                setTimeout(() => {
                                    try {
                                        onToggleNA(val);
                                    } catch (error) {
                                        console.error('[ListSectionWrapper] N/A toggle error (deferred):', error);
                                    }
                                }, 0);
                            } catch (error) {
                                console.error('[ListSectionWrapper] N/A toggle error:', error);
                            }
                        }}
                        trackColor={{ false: '#f1f5f9', true: '#93c5fd' }}
                        thumbColor={isNA ? '#004aad' : '#f8fafc'}
                    />
                </View>
            )}

            {!isNA && (
                <TouchableOpacity 
                    onPress={handleOpenAdd}
                    className="w-full flex-row items-center justify-center bg-[#004aad] h-14 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none mb-8 active:opacity-80"
                >
                    <Plus size={18} color="white" strokeWidth={3} />
                    <Text className="text-white font-black ml-2 text-sm uppercase tracking-widest">Add New Record</Text>
                </TouchableOpacity>
            )}

            {items.length > 0 ? (
                items.map((item) => renderItem(item, () => handleOpenEdit(item), () => handleDelete(item.id)))
            ) : (
                <View className={`items-center justify-center py-12 rounded-[32px] border border-dashed ${isNA ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30' : 'bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800'}`}>
                    {isNA ? (
                        <View className="items-center">
                            <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-3xl items-center justify-center mb-4 shadow-sm">
                                <X size={32} color="#2563eb" strokeWidth={2.5} />
                            </View>
                            <Text className="text-blue-700 dark:text-blue-400 font-black text-lg">Marked as N/A</Text>
                            <Text className="text-blue-600/60 dark:text-blue-400/60 text-[10px] font-bold mt-2 text-center px-8 uppercase tracking-tighter leading-4">
                                This section will be considered complete for your profile.
                            </Text>
                        </View>
                    ) : (
                        <View className="items-center">
                            <View className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-3xl items-center justify-center mb-4">
                                {emptyIcon}
                            </View>
                            <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-widest">{emptyMessage}</Text>
                        </View>
                    )}
                </View>
            )}

            <AlertModal
                visible={isDeleteModalVisible}
                title={`Delete ${title ? title.slice(0, -1) : 'Item'}`}
                message={'Are you sure you want to delete this record?'}
                onCancel={() => { setIsDeleteModalVisible(false); setPendingDeleteId(null); }}
                onConfirm={confirmDelete}
            />

            <Modal
                visible={isModalOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsModalOpen(false)}
            >
                <View className="flex-1 bg-gray-50 dark:bg-gray-950">
                    <View 
                        style={{ paddingTop: Math.max(insets.top, 16) }}
                        className="relative flex-row items-center justify-center px-6 pb-4 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800"
                    >
                        <Text className="text-base font-black text-gray-900 dark:text-white text-center uppercase tracking-widest">
                            {editingItem ? 'Edit' : 'Add'} {title ? title.replace(/s$/, '') : 'Item'}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => setIsModalOpen(false)}
                            style={{ top: Math.max(insets.top, 16) - 4 }}
                            className="absolute right-6 bg-gray-100 dark:bg-gray-800 p-2 rounded-full active:opacity-70"
                        >
                            <X size={18} color="#64748b" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        className="flex-1 px-6" 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <FormComponent 
                            ref={formRef} 
                            initialData={editingItem || undefined} 
                            onSubmit={handleSave} 
                        />
                    </ScrollView>

                    <View 
                        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
                        className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950"
                    >
                        <TouchableOpacity 
                            onPress={() => formRef.current?.submit()}
                            disabled={isSavingLocal}
                            className={`${isSavingLocal ? 'bg-gray-300 dark:bg-gray-800' : 'bg-[#004aad]'} h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none active:opacity-80`}
                        >
                            {isSavingLocal ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-white font-black text-sm uppercase tracking-widest">Save Record</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
