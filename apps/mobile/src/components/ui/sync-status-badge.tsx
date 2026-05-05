import React from 'react';
import { View, Text } from 'react-native';
import { Check, Clock, CloudOff, AlertCircle } from 'lucide-react-native';

export type SyncStatus = 'synced' | 'queued' | 'offline' | 'error';

interface SyncStatusBadgeProps {
    status: SyncStatus;
}

export function SyncStatusBadge({ status }: SyncStatusBadgeProps) {
    const config = {
        synced: {
            label: 'Synced',
            icon: Check,
            bg: 'bg-green-50 dark:bg-green-900/20',
            text: 'text-green-600 dark:text-green-400',
            iconColor: '#16a34a'
        },
        queued: {
            label: 'Queued',
            icon: Clock,
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            text: 'text-amber-600 dark:text-amber-400',
            iconColor: '#d97706'
        },
        offline: {
            label: 'Offline',
            icon: CloudOff,
            bg: 'bg-gray-50 dark:bg-gray-900/20',
            text: 'text-gray-600 dark:text-gray-400',
            iconColor: '#4b5563'
        },
        error: {
            label: 'Error',
            icon: AlertCircle,
            bg: 'bg-red-50 dark:bg-red-900/20',
            text: 'text-red-600 dark:text-red-400',
            iconColor: '#dc2626'
        }
    };

    const { label, icon: Icon, bg, text, iconColor } = config[status] || config.synced;

    return (
        <View className={`${bg} px-2 py-1 rounded-lg flex-row items-center`}>
            <Icon size={10} color={iconColor} className="mr-1" />
            <Text className={`${text} text-[10px] font-black uppercase`}>{label}</Text>
        </View>
    );
}
