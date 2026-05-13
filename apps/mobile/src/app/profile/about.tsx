import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import { Info, ExternalLink, Mail, Github, Twitter, Globe, Facebook } from 'lucide-react-native';
import { FormLayout } from '@/components/ui/form-layout';
import { router } from 'expo-router';

export default function AboutScreen() {
    const socialLinks = [
        { icon: Globe, url: 'https://meru.go.ke' },
        { icon: Twitter, url: 'https://twitter.com/merucounty' },
        { icon: Facebook, url: 'https://facebook.com/merucounty' },
    ];

    return (
        <FormLayout
            title="About Meru PSB"
            onBack={() => router.back()}
        >
            <View className="items-center py-10">
                <View className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[32px] items-center justify-center mb-6 shadow-xl shadow-blue-100 dark:shadow-none">
                    <Image 
                        source={{ uri: 'https://ui-avatars.com/api/?name=Meru+County&background=004aad&color=fff&size=256' }} 
                        className="w-20 h-20 rounded-[28px]"
                    />
                </View>
                <Text className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Meru County PSB</Text>
                <Text className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Version 2.4.0 (Stable)</Text>
            </View>

            <View className="space-y-8">
                <View className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <Text className="text-gray-900 dark:text-white font-black text-lg mb-4 uppercase tracking-tighter">Our Mission</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-[13px] font-bold leading-6">
                        To provide the Meru County Government with a highly competent, professional, and motivated workforce through fair, transparent, and merit-based recruitment and management practices.
                    </Text>
                    
                    <View className="h-[1px] bg-gray-50 dark:bg-gray-800 my-8" />
                    
                    <Text className="text-gray-900 dark:text-white font-black text-lg mb-4 uppercase tracking-tighter">Our Values</Text>
                    <View className="space-y-5">
                        {[
                            { title: 'Integrity', desc: 'Upholding the highest moral and ethical standards.' },
                            { title: 'Transparency', desc: 'Ensuring openness in all recruitment processes.' },
                            { title: 'Equity', desc: 'Promoting fairness and equal opportunity for all.' }
                        ].map((v, i) => (
                            <View key={i} className="flex-row items-start">
                                <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-4" />
                                <View className="flex-1">
                                    <Text className="text-gray-900 dark:text-white font-black text-[13px] uppercase tracking-tighter">{v.title}</Text>
                                    <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold mt-1 leading-4">{v.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="flex-row justify-center space-x-6 py-6">
                    {socialLinks.map((social, i) => (
                        <TouchableOpacity 
                            key={i}
                            onPress={() => Linking.openURL(social.url)}
                            className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 items-center justify-center active:opacity-70"
                        >
                            <social.icon size={20} color="#64748b" strokeWidth={2} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="items-center pb-10">
                    <Text className="text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest text-center">
                        © 2026 Meru County Public Service Board{"\n"}All Rights Reserved
                    </Text>
                </View>
            </View>
        </FormLayout>
    );
}
