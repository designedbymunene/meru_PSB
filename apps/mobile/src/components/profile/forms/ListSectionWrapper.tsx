import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Switch, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { AlertModal } from '@/components/ui/alert-modal';
import { Plus, X, Info } from 'lucide-react-native';
import { SectionCard } from '@/components/account/SectionCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

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
    testID?: string;
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
    testID
}: ListSectionWrapperProps<T>) {
    // Generate safe testID from title if not provided
    const safeTestID = testID || title?.toLowerCase().replace(/\s+/g, '-') || 'list-section';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const formRef = React.useRef<any>(null);
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    React.useEffect(() => {
        if (Platform.OS === 'android') {
            const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            });
            const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardHeight(0);
            });
            return () => {
                showSubscription.remove();
                hideSubscription.remove();
            };
        }
    }, []);

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
        <View testID={safeTestID}>
            {title && (
                <View className="mb-6 ml-2">
                    <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-[2px]">{title}</Text>
                </View>
            )}

            {onToggleNA && items.length === 0 && (
                <View
                    className="mb-6 p-6 rounded-[32px] border flex-row items-center justify-between"
                    style={{
                        backgroundColor: isNA 
                            ? (isDark ? 'rgba(30, 58, 138, 0.3)' : '#eff6ff') 
                            : (isDark ? '#111827' : '#ffffff'),
                        borderColor: isNA 
                            ? (isDark ? 'rgba(30, 58, 138, 0.5)' : '#dbeafe') 
                            : (isDark ? '#1f2937' : '#f3f4f6'),
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 2,
                    }}
                    testID={`${safeTestID}-na-container`}
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
                        testID={`${safeTestID}-na-switch`}
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
                <Pressable
                    onPress={handleOpenAdd}
                    className="w-full flex-row items-center justify-center bg-[#004aad] h-14 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none mb-8 "
                    testID={`${safeTestID}-add`}
                >
                    <Plus size={18} color="white" strokeWidth={3} />
                    <Text className="text-white font-black ml-2 text-sm uppercase tracking-widest">Add New Record</Text>
                </Pressable>
            )}

            {items.length > 0 ? (
                items.map((item) => renderItem(item, () => handleOpenEdit(item), () => handleDelete(item.id)))
            ) : (
                <View 
                    className="items-center justify-center py-12 rounded-[32px] border border-dashed"
                    style={{
                        backgroundColor: isNA 
                            ? (isDark ? 'rgba(30, 58, 138, 0.1)' : 'rgba(239, 246, 255, 0.5)') 
                            : (isDark ? 'rgba(17, 24, 39, 0.5)' : 'rgba(255, 255, 255, 0.5)'),
                        borderColor: isNA 
                            ? (isDark ? 'rgba(30, 58, 138, 0.3)' : '#bfdbfe') 
                            : (isDark ? '#1f2937' : '#e5e7eb'),
                    }}
                >
                    {isNA ? (
                        <View className="items-center">
                            <View 
                                className="w-16 h-16 rounded-3xl items-center justify-center mb-4"
                                style={{
                                    backgroundColor: isDark ? 'rgba(30, 58, 138, 0.3)' : '#dbeafe',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }}
                            >
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
                testID={`${safeTestID}-delete-modal`}
            />

            <Modal
                visible={isModalOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsModalOpen(false)}
                testID={`${safeTestID}-modal`}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="flex-1 bg-gray-50 dark:bg-gray-950"
                >
                    <View 
                        style={{ paddingTop: Math.max(insets.top, 16) }}
                        className="relative flex-row items-center justify-center px-6 pb-4 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800"
                    >
                        <Text className="text-base font-black text-gray-900 dark:text-white text-center uppercase tracking-widest">
                            {editingItem ? 'Edit' : 'Add'} {title ? title.replace(/s$/, '') : 'Item'}
                        </Text>
                        <Pressable
                            onPress={() => setIsModalOpen(false)}
                            style={{ top: Math.max(insets.top, 16) - 4 }}
                            className="absolute right-6 bg-gray-100 dark:bg-gray-800 p-2 rounded-full "
                            testID={`${safeTestID}-modal-close`}
                        >
                            <X size={18} color="#64748b" strokeWidth={2.5} />
                        </Pressable>
                    </View>

                    <ScrollView 
                        className="flex-1 px-6" 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
                        keyboardShouldPersistTaps="handled"
                        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
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
                        <Pressable
                            onPress={() => formRef.current?.submit()}
                            disabled={isSavingLocal}
                            className={`${isSavingLocal ? 'bg-gray-300 dark:bg-gray-800' : 'bg-[#004aad]'} h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none`}
                            testID={`${safeTestID}-save`}
                        >
                            {isSavingLocal ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-white font-black text-sm uppercase tracking-widest">Save Record</Text>
                            )}
                        </Pressable>
                    </View>

                    {Platform.OS === 'android' && <View style={{ height: keyboardHeight }} />}
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
