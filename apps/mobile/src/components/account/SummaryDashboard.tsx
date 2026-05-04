import React from 'react';
import { View, Text } from 'react-native';
import { Briefcase, FileText, CheckCircle2 } from 'lucide-react-native';

interface SummaryDashboardProps {
    applicationsCount: number;
    activeVacanciesCount: number;
    isVerified: boolean;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
    applicationsCount,
    activeVacanciesCount,
    isVerified,
}) => {
    return (
        <View className="flex-row justify-between mb-8 px-1">
            <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex-1 mr-2 shadow-sm">
                <View className="bg-blue-50 dark:bg-blue-900/20 w-8 h-8 rounded-lg justify-center items-center mb-2">
                    <FileText size={16} color="#2563eb" />
                </View>
                <Text className="text-gray-900 dark:text-white font-bold text-lg">{applicationsCount}</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-medium uppercase tracking-wider">Applications</Text>
            </View>

            <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex-1 mx-1 shadow-sm">
                <View className="bg-purple-50 dark:bg-purple-900/20 w-8 h-8 rounded-lg justify-center items-center mb-2">
                    <Briefcase size={16} color="#9333ea" />
                </View>
                <Text className="text-gray-900 dark:text-white font-bold text-lg">{activeVacanciesCount}</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-medium uppercase tracking-wider">Vacancies</Text>
            </View>

            <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex-1 ml-2 shadow-sm">
                <View className={`${isVerified ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} w-8 h-8 rounded-lg justify-center items-center mb-2`}>
                    <CheckCircle2 size={16} color={isVerified ? '#16a34a' : '#f97316'} />
                </View>
                <Text className={`${isVerified ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'} font-bold text-lg`}>
                    {isVerified ? 'Active' : 'Pending'}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-medium uppercase tracking-wider">Status</Text>
            </View>
        </View>
    );
};
