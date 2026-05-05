import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Plus, X } from 'lucide-react-native';
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

    const handleSave = async (data: T) => {
        try {
            if (editingItem) {
                await onUpdate(editingItem.id, data);
            } else {
                await onAdd(data);
            }
            setIsModalOpen(false);
        } catch (error) {
            // Error handling is usually done in the mutation hooks passed to onAdd/onUpdate
        }
    };

    const handleDelete = (id: string | number) => {
        Alert.alert(
            `Delete ${title ? title.slice(0, -1) : 'Item'}`,
            'Are you sure you want to delete this record?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDeleteItem(id) },
            ]
        );
    };

    return (
        <View>
            {title && (
                <View className="mb-4">
                    <Text className="text-xl font-black text-slate-900 dark:text-white">{title}</Text>
                </View>
            )}

            <TouchableOpacity 
                onPress={handleOpenAdd}
                className="w-full flex-row items-center justify-center bg-[#004aad] h-12 rounded-2xl shadow-sm mb-6"
            >
                <Plus size={18} color="white" />
                <Text className="text-white font-bold ml-2 text-sm">Add New</Text>
            </TouchableOpacity>

            {items.length > 0 ? (
                items.map((item) => renderItem(item, () => handleOpenEdit(item), () => handleDelete(item.id)))
            ) : (
                <View className="items-center justify-center py-10 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800">
                    {emptyIcon}
                    <Text className="text-gray-400 dark:text-gray-500 text-xs mt-3">{emptyMessage}</Text>
                </View>
            )}

            <Modal
                visible={isModalOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsModalOpen(false)}
            >
                <View className="flex-1 bg-white dark:bg-gray-950">
                    <View 
                        style={{ paddingTop: Math.max(insets.top, 16) }}
                        className="relative flex-row items-center justify-center px-6 pb-3 border-b border-gray-100 dark:border-gray-800"
                    >
                        <Text className="text-lg font-black text-gray-900 dark:text-white text-center">
                            {editingItem ? 'Edit' : 'Add'} {title ? title.slice(0, -1) : 'Item'}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => setIsModalOpen(false)}
                            style={{ top: Math.max(insets.top, 16) - 6 }}
                            className="absolute right-6 bg-gray-100 dark:bg-gray-900 p-2 rounded-full"
                        >
                            <X size={18} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        className="flex-1 px-6" 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
                    >                        <FormComponent 
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
                            className="bg-[#004aad] h-14 rounded-2xl items-center justify-center"
                        >
                            <Text className="text-white font-bold text-lg">Save Record</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
