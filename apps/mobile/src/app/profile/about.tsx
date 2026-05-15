import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { Globe, Globe2, Info } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { FormLayout } from '@/components/ui/form-layout';
import { router } from 'expo-router';
import Constants from 'expo-constants';

const XIcon = ({ size = 20, color = "#64748b" }: { size?: number, color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z" />
    </Svg>
);

const FacebookIcon = ({ size = 20, color = "#64748b" }: { size?: number, color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </Svg>
);

export default function AboutScreen() {
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const buildNumber = Constants.expoConfig?.extra?.buildNumber || '1';
    
    const socialLinks = [
        { icon: Globe2 || Globe || Info, url: 'https://meru.go.ke' },
        { icon: XIcon, url: 'https://twitter.com/merucounty' },
        { icon: FacebookIcon, url: 'https://facebook.com/merucounty' },
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
                <Text className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Version {appVersion} (Build {buildNumber})</Text>
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
                            <social.icon size={20} color="#64748b" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="items-center pb-10">
                    <Text className="text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest text-center">
                        © {new Date().getFullYear()} Meru County Public Service Board{"\n"}All Rights Reserved
                    </Text>
                </View>
            </View>
        </FormLayout>
    );
}
