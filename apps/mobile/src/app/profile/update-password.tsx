import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordInput } from '@meru/shared';
import { FormLayout } from '@/components/ui/form-layout';
import { FormField } from '@/components/ui/form-field';
import { apiClient } from '@/lib/api/client';
import { router } from 'expo-router';
import { Lock, ShieldCheck } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner-native';

export default function UpdatePasswordScreen() {
    const { control, handleSubmit, formState: { errors } } = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: ''
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: ChangePasswordInput) => {
            await apiClient.put('/account/password', data);
        },
        onSuccess: () => {
            toast.success('Password updated successfully');
            router.back();
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || 'Failed to update password';
            toast.error('Error', { description: message });
        }
    });

    const onSubmit = (data: ChangePasswordInput) => {
        mutation.mutate(data);
    };

    return (
        <FormLayout
            title="Update Password"
            onBack={() => router.back()}
        >
            <View className="space-y-6">
                <View className="items-center mb-8">
                    <View className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 items-center justify-center mb-4">
                        <Lock size={40} color="#3b82f6" strokeWidth={1.5} />
                    </View>
                    <Text className="text-gray-900 dark:text-white font-black text-xl">Change Password</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-center mt-2 px-6 font-bold text-xs leading-5">
                        Choose a strong password with at least 8 characters.
                    </Text>
                </View>

                <Controller
                    control={control}
                    name="currentPassword"
                    render={({ field: { onChange, value } }) => (
                        <FormField
                            label="Current Password"
                            placeholder="Enter current password"
                            secureTextEntry
                            value={value}
                            onChangeText={onChange}
                            error={errors.currentPassword?.message}
                            icon={Lock}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="newPassword"
                    render={({ field: { onChange, value } }) => (
                        <FormField
                            label="New Password"
                            placeholder="Min. 8 characters"
                            secureTextEntry
                            value={value}
                            onChangeText={onChange}
                            error={errors.newPassword?.message}
                            icon={Lock}
                        />
                    )}
                />

                <View className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-[24px] border border-gray-100 dark:border-gray-800 flex-row items-center space-x-3 mb-4">
                    <ShieldCheck size={20} color="#10b981" strokeWidth={2.5} />
                    <Text className="text-gray-500 dark:text-gray-400 text-[10px] flex-1 font-bold">
                        Updating your password will sign you out from all other devices for security.
                    </Text>
                </View>

                <TouchableOpacity
                    className={`p-5 rounded-[24px] items-center ${mutation.isPending ? 'bg-blue-300' : 'bg-[#004aad]'} shadow-lg shadow-blue-500/20`}
                    onPress={handleSubmit(onSubmit)}
                    disabled={mutation.isPending}
                >
                    <Text className="text-white font-black text-xs uppercase tracking-widest">
                        {mutation.isPending ? 'Updating...' : 'Update Password'}
                    </Text>
                </TouchableOpacity>
            </View>
        </FormLayout>
    );
}
