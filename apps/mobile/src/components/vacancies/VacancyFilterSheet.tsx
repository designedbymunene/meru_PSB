import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { X, Building2, Layers, Clock, RotateCcw, CheckCircle2, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDepartments } from '@/lib/api/departments';
import { useJobGroups } from '@/lib/api/job-groups';
import RNPickerSelect from 'react-native-picker-select';
import { useColorScheme } from 'nativewind';

interface VacancyFilterSheetProps {
    isVisible: boolean;
    onClose: () => void;
    filters: {
        status?: 'open' | 'closed' | 'all';
        departmentId?: number | string | null;
        jobGroupId?: number | string | null;
    };
    onApply: (filters: any) => void;
    onReset: () => void;
}

export function VacancyFilterSheet({
    isVisible,
    onClose,
    filters: initialFilters,
    onApply,
    onReset
}: VacancyFilterSheetProps) {
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [localFilters, setLocalFilters] = useState(initialFilters);
    const { data: departments } = useDepartments();
    const { data: jobGroups } = useJobGroups();

    // Sync local state when modal opens
    React.useEffect(() => {
        if (isVisible) {
            setLocalFilters(initialFilters);
        }
    }, [isVisible, initialFilters]);

    const departmentItems = (departments || []).map((d: any) => ({ label: d.name, value: d.id }));
    const jobGroupItems = (jobGroups || []).map((jg: any) => ({ label: jg.name, value: jg.id }));

    const statusOptions = [
        { label: 'Open', value: 'open', icon: CheckCircle2 },
        { label: 'Closed', value: 'closed', icon: X },
        { label: 'All', value: 'all', icon: Clock },
    ];

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = { status: 'open', departmentId: null, jobGroupId: null };
        setLocalFilters(resetFilters);
        onReset();
    };

    const dynamicPickerStyles = {
        ...pickerStyles,
        inputIOS: {
            ...pickerStyles.inputIOS,
            color: isDarkMode ? '#ffffff' : '#0f172a',
        },
        inputAndroid: {
            ...pickerStyles.inputAndroid,
            color: isDarkMode ? '#ffffff' : '#0f172a',
        },
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <Pressable className="flex-1" onPress={onClose} />
                <View 
                    className="bg-white dark:bg-gray-950 rounded-t-[40px] shadow-2xl overflow-hidden"
                    style={{ maxHeight: '90%', paddingBottom: insets.bottom }}
                >
                    {/* Header */}
                    <View className="p-6 border-b border-gray-100 dark:border-gray-900 flex-row items-center justify-between">
                        <View>
                            <Text className="text-2xl font-black text-gray-900 dark:text-white">Filter Vacancies</Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-1">
                                Find the perfect role for you
                            </Text>
                        </View>
                        <TouchableOpacity 
                            onPress={onClose}
                            className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 items-center justify-center"
                        >
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
                        {/* Status Section */}
                        <View className="mb-8">
                            <View className="flex-row items-center mb-4">
                                <Clock size={16} color="#94a3b8" />
                                <Text className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-2">Vacancy Status</Text>
                            </View>
                            <View className="flex-row gap-3">
                                {statusOptions.map((opt) => {
                                    const isSelected = (localFilters.status || 'open') === opt.value;
                                    return (
                                        <TouchableOpacity
                                            key={opt.value}
                                            onPress={() => setLocalFilters({ ...localFilters, status: opt.value as any })}
                                            className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border ${
                                                isSelected 
                                                    ? 'bg-[#004aad]/5 border-[#004aad] shadow-sm' 
                                                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'
                                            }`}
                                        >
                                            <opt.icon size={14} color={isSelected ? '#004aad' : '#94a3b8'} />
                                            <Text className={`ml-2 text-xs font-bold ${isSelected ? 'text-[#004aad]' : 'text-gray-500'}`}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Department Section */}
                        <View className="mb-8">
                            <View className="flex-row items-center mb-3">
                                <Building2 size={16} color="#94a3b8" />
                                <Text className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-2">Department</Text>
                            </View>
                            <View className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
                                <RNPickerSelect
                                    value={localFilters.departmentId}
                                    onValueChange={(val) => setLocalFilters({ ...localFilters, departmentId: val })}
                                    items={departmentItems}
                                    placeholder={{ label: 'All Departments', value: null }}
                                    useNativeAndroidPickerStyle={false}
                                    style={dynamicPickerStyles}
                                    Icon={() => <ChevronDown size={18} color="#94a3b8" style={{ marginTop: 18, marginRight: 16 }} />}
                                />
                            </View>
                        </View>

                        {/* Job Group Section */}
                        <View className="mb-8">
                            <View className="flex-row items-center mb-3">
                                <Layers size={16} color="#94a3b8" />
                                <Text className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-2">Job Group</Text>
                            </View>
                            <View className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
                                <RNPickerSelect
                                    value={localFilters.jobGroupId}
                                    onValueChange={(val) => setLocalFilters({ ...localFilters, jobGroupId: val })}
                                    items={jobGroupItems}
                                    placeholder={{ label: 'All Job Groups', value: null }}
                                    useNativeAndroidPickerStyle={false}
                                    style={dynamicPickerStyles}
                                    Icon={() => <ChevronDown size={18} color="#94a3b8" style={{ marginTop: 18, marginRight: 16 }} />}
                                />
                            </View>
                        </View>

                        <View className="h-10" />
                    </ScrollView>

                    {/* Footer */}
                    <View className="p-6 border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 flex-row gap-4">
                        <TouchableOpacity 
                            onPress={handleReset}
                            className="flex-1 h-14 rounded-2xl border border-gray-100 dark:border-gray-800 items-center justify-center flex-row"
                        >
                            <RotateCcw size={16} color="#64748b" />
                            <Text className="ml-2 text-gray-600 dark:text-gray-400 font-bold">Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleApply}
                            className="flex-[2] h-14 rounded-2xl bg-[#004aad] items-center justify-center shadow-lg shadow-blue-900/20"
                        >
                            <Text className="text-white font-black text-lg">Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const pickerStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 18,
        paddingHorizontal: 16,
        color: '#0f172a',
        paddingRight: 40,
        fontWeight: '700',
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        color: '#0f172a',
        paddingRight: 40,
        fontWeight: '700',
    },
    placeholder: {
        color: '#94a3b8',
        fontWeight: '700',
    },
});
