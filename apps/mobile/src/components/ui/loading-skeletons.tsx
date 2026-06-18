import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { 
    useAnimatedStyle, 
    withRepeat, 
    withSequence, 
    withTiming,
    useSharedValue
} from 'react-native-reanimated';

type SkeletonProps = {
    className?: string;
};

function SkeletonBlock({ className = '' }: SkeletonProps) {
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.4, { duration: 800 }),
                withTiming(1, { duration: 800 })
            ),
            -1,
            true
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return <Animated.View className={`bg-gray-200 dark:bg-gray-800 rounded-xl ${className}`} style={animatedStyle} />;
}

export function AuthGateLoadingState() {
    return (
        <View className="flex-1 bg-white dark:bg-gray-950 items-center justify-center px-8">
            <View className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 items-center justify-center mb-6">
                <SkeletonBlock className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800/40" />
            </View>
            <SkeletonBlock className="h-7 w-56 rounded-2xl mb-3" />
            <SkeletonBlock className="h-4 w-44 rounded-xl" />
        </View>
    );
}

export function VacanciesListLoadingState() {
    return (
        <ScrollView className="flex-1 bg-white dark:bg-gray-950" contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            <View className="pt-6 mb-8">
                <SkeletonBlock className="h-9 w-44 rounded-2xl mb-3" />
                <SkeletonBlock className="h-4 w-72 rounded-xl mb-6" />
                <SkeletonBlock className="h-13 w-full rounded-2xl" />
            </View>

            {[1, 2, 3].map((item) => (
                <View key={item} className="bg-white dark:bg-gray-900 p-5 rounded-[28px] mb-5 border border-gray-100 dark:border-gray-800">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 mr-3">
                            <SkeletonBlock className="h-5 w-28 rounded-full mb-3" />
                            <SkeletonBlock className="h-5 w-full rounded-xl mb-2" />
                            <SkeletonBlock className="h-5 w-5/6 rounded-xl" />
                        </View>
                        <SkeletonBlock className="w-12 h-12 rounded-2xl" />
                    </View>
                    <SkeletonBlock className="h-3.5 w-full rounded-lg mb-2" />
                    <SkeletonBlock className="h-3.5 w-4/5 rounded-lg mb-5" />
                    <View className="flex-row gap-2 mb-6">
                        <SkeletonBlock className="h-5 w-24 rounded-full" />
                        <SkeletonBlock className="h-5 w-24 rounded-full" />
                        <SkeletonBlock className="h-5 w-28 rounded-full" />
                    </View>
                    <View className="pt-4 border-t border-gray-50 dark:border-gray-800 flex-row justify-between items-center">
                        <SkeletonBlock className="h-3.5 w-24 rounded-lg" />
                        <SkeletonBlock className="w-8 h-8 rounded-full" />
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

export function ApplicationsListLoadingState() {
    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
            <SkeletonBlock className="h-14 w-full rounded-2xl mb-4 bg-amber-100/70 dark:bg-amber-900/20" />
            {[1, 2, 3, 4].map((item) => (
                <View key={item} className="bg-white dark:bg-gray-900 p-4 rounded-2xl mb-4 border border-gray-100 dark:border-gray-800">
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                            <SkeletonBlock className="h-5 w-5/6 rounded-xl mb-2" />
                            <SkeletonBlock className="h-3.5 w-1/3 rounded-lg" />
                        </View>
                        <SkeletonBlock className="h-6 w-16 rounded-full ml-3" />
                    </View>
                    <View className="pt-3 border-t border-gray-50 dark:border-gray-800 flex-row justify-between items-center">
                        <SkeletonBlock className="h-3.5 w-32 rounded-lg" />
                        <SkeletonBlock className="w-4 h-4 rounded-full" />
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

export function ApplicationDetailsLoadingState() {
    return (
        <ScrollView className="flex-1 bg-white dark:bg-gray-950" contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            <View className="bg-gray-900 dark:bg-black p-6 rounded-[32px] mb-8">
                <SkeletonBlock className="h-5 w-24 rounded-full mb-4 bg-white/20 dark:bg-white/10" />
                <SkeletonBlock className="h-7 w-5/6 rounded-2xl mb-2 bg-white/20 dark:bg-white/10" />
                <SkeletonBlock className="h-4 w-2/3 rounded-xl mb-6 bg-white/15 dark:bg-white/5" />
                <View className="h-[1px] bg-white/10 mb-6" />
                <View className="flex-row justify-between">
                    <SkeletonBlock className="h-4 w-24 rounded-xl bg-white/20 dark:bg-white/10" />
                    <SkeletonBlock className="h-4 w-20 rounded-xl bg-white/20 dark:bg-white/10" />
                </View>
            </View>

            <SkeletonBlock className="h-6 w-48 rounded-xl mb-6" />
            {[1, 2, 3, 4].map((item) => (
                <View key={item} className="flex-row mb-8">
                    <View className="items-center mr-4">
                        <SkeletonBlock className="w-10 h-10 rounded-full" />
                        {item < 4 ? <SkeletonBlock className="w-0.5 h-12 mt-2 rounded-full" /> : null}
                    </View>
                    <View className="flex-1 pt-1">
                        <SkeletonBlock className="h-4.5 w-2/3 rounded-lg mb-2" />
                        <SkeletonBlock className="h-3.5 w-24 rounded-lg" />
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

export function VacancyDetailsLoadingState() {
    return (
        <ScrollView className="flex-1 bg-white dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            <View className="px-6 pt-6 pb-8 bg-gray-50/50 dark:bg-gray-900/50">
                <SkeletonBlock className="h-5 w-24 rounded-full mb-4" />
                <SkeletonBlock className="h-7 w-full rounded-2xl mb-2" />
                <SkeletonBlock className="h-7 w-5/6 rounded-2xl mb-4" />
                <View className="flex-row items-center">
                    <SkeletonBlock className="w-12 h-12 rounded-xl mr-4" />
                    <View className="flex-1">
                        <SkeletonBlock className="h-4.5 w-48 rounded-lg mb-2" />
                        <SkeletonBlock className="h-3.5 w-36 rounded-lg" />
                    </View>
                </View>
            </View>

            <View className="px-6 -mt-6">
                <View className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 flex-row flex-wrap">
                    {[1, 2, 3, 4].map((item) => (
                        <View key={item} className="w-1/2 p-3">
                            <SkeletonBlock className="h-3 w-16 rounded-lg mb-2" />
                            <SkeletonBlock className="h-4 w-20 rounded-lg" />
                        </View>
                    ))}
                </View>
            </View>

            <View className="px-6 pt-10">
                <SkeletonBlock className="h-6 w-36 rounded-xl mb-4" />
                <SkeletonBlock className="h-4 w-full rounded-lg mb-2" />
                <SkeletonBlock className="h-4 w-full rounded-lg mb-2" />
                <SkeletonBlock className="h-4 w-4/5 rounded-lg mb-8" />
                <SkeletonBlock className="h-6 w-40 rounded-xl mb-4" />
                {[1, 2, 3].map((item) => (
                    <SkeletonBlock key={item} className="h-4 w-full rounded-lg mb-3" />
                ))}
            </View>
        </ScrollView>
    );
}

export function ProfileFormLoadingState({ title }: { title: string }) {
    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            <Text className="text-gray-300 dark:text-gray-700 font-black text-lg mb-6">{title}</Text>
            <View className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 mb-5">
                <SkeletonBlock className="h-5 w-40 rounded-xl mb-5" />
                {[1, 2, 3, 4].map((item) => (
                    <View key={item} className="mb-4">
                        <SkeletonBlock className="h-3.5 w-28 rounded-lg mb-2" />
                        <SkeletonBlock className="h-12 w-full rounded-xl" />
                    </View>
                ))}
            </View>
            <View className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                <SkeletonBlock className="h-5 w-36 rounded-xl mb-4" />
                <SkeletonBlock className="h-4 w-full rounded-lg mb-2" />
                <SkeletonBlock className="h-4 w-4/5 rounded-lg" />
            </View>
        </ScrollView>
    );
}

export function ProfileRecordsLoadingState({ title }: { title: string }) {
    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
            <Text className="text-gray-300 dark:text-gray-700 font-black text-lg mb-5">{title}</Text>
            {[1, 2, 3].map((item) => (
                <View key={item} className="bg-white dark:bg-gray-900 p-5 rounded-2xl mb-4 border border-gray-100 dark:border-gray-800">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <SkeletonBlock className="h-5 w-2/3 rounded-xl mb-2" />
                            <SkeletonBlock className="h-3.5 w-1/3 rounded-lg" />
                        </View>
                        <SkeletonBlock className="w-10 h-10 rounded-xl ml-3" />
                    </View>
                    <SkeletonBlock className="h-4 w-full rounded-lg mb-2" />
                    <SkeletonBlock className="h-4 w-5/6 rounded-lg mb-2" />
                    <SkeletonBlock className="h-4 w-2/3 rounded-lg" />
                </View>
            ))}
        </ScrollView>
    );
}

export function DashboardLoadingState() {
    return (
        <ScrollView className="flex-1 bg-white dark:bg-gray-950" contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            {/* Welcome Section */}
            <View className="flex-row justify-between items-center mb-8 pt-10">
                <View>
                    <SkeletonBlock className="h-4 w-32 rounded-lg mb-2" />
                    <SkeletonBlock className="h-8 w-48 rounded-xl" />
                </View>
                <SkeletonBlock className="w-12 h-12 rounded-full" />
            </View>

            {/* Quick Stats Grid */}
            <View className="flex-row flex-wrap mb-10 -mx-1.5">
                {[1, 2, 3, 4].map((i) => (
                    <View key={i} className="w-1/2 p-1.5">
                        <SkeletonBlock className="h-20 w-full rounded-2xl" />
                    </View>
                ))}
            </View>

            {/* Ongoing Activity Section */}
            <View className="mb-10">
                <View className="flex-row justify-between items-center mb-5 px-1">
                    <SkeletonBlock className="h-6 w-36 rounded-lg" />
                    <SkeletonBlock className="h-4 w-16 rounded-lg" />
                </View>
                <SkeletonBlock className="h-44 w-full rounded-[28px]" />
            </View>

            {/* Recommended Jobs */}
            <View className="mb-10">
                <View className="flex-row justify-between items-center mb-6 px-1">
                    <View>
                        <SkeletonBlock className="h-6 w-44 rounded-lg mb-2" />
                        <SkeletonBlock className="h-3 w-32 rounded-lg" />
                    </View>
                    <SkeletonBlock className="w-9 h-9 rounded-full" />
                </View>
                <View className="flex-row">
                    <SkeletonBlock className="h-64 w-72 rounded-[32px] mr-4" />
                    <SkeletonBlock className="h-64 w-72 rounded-[32px]" />
                </View>
            </View>
        </ScrollView>
    );
}
