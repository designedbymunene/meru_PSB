import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { AlertModal } from '@/components/ui/alert-modal';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApplication } from '@/hooks/use-applications';
import { 
    ChevronLeft, BookOpen, FileText, Award, 
    Users, ShieldCheck, Briefcase, Check, 
    AlertCircle, HelpCircle, Sparkles, Clock, 
    Download, ExternalLink 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApplicationDetailsLoadingState } from '@/components/ui/loading-skeletons';

const THEME = {
    bg: '#0a0c10',
    card: '#11141d',
    border: 'rgba(30, 41, 59, 0.6)',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    accentBlue: '#3b82f6',
    accentGreen: '#10b981',
    accentPurple: '#8b5cf6',
    accentOrange: '#f59e0b',
};

const defaultResources = [
    {
        id: '1',
        type: 'guide',
        title: 'Interview Preparation Guide',
        description: 'Comprehensive guide to help you prepare for your interview',
        duration: '15 min read',
        bgColor: '#3b82f615',
        borderColor: '#3b82f630',
        textColor: '#3b82f6',
        icon: BookOpen
    },
    {
        id: '2',
        type: 'video',
        title: 'What to Expect: Interview Process',
        description: 'Overview of our interview process and tips for success',
        duration: '10 min watch',
        bgColor: '#8b5cf615',
        borderColor: '#8b5cf630',
        textColor: '#8b5cf6',
        icon: Sparkles
    },
    {
        id: '3',
        type: 'checklist',
        title: 'Interview Day Checklist',
        description: 'Everything you need to bring and prepare for interview day',
        duration: '5 min read',
        bgColor: '#10b98115',
        borderColor: '#10b98130',
        textColor: '#10b981',
        icon: FileText
    },
    {
        id: '4',
        type: 'document',
        title: 'Company Culture Handbook',
        description: 'Learn about our values, culture, and what makes us unique',
        duration: '20 min read',
        bgColor: '#f59e0b15',
        borderColor: '#f59e0b30',
        textColor: '#f59e0b',
        icon: Briefcase
    }
];

export default function MobileInterviewPrepGuideScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<'checklist' | 'values' | 'etiquette'>('checklist');

    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const applicationId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
    const isValidId = !!applicationId && applicationId !== 'active' && applicationId !== 'undefined';

    const { data: application, isLoading, isError, refetch } = useApplication(applicationId as string, {
        enabled: isValidId
    });

    if (isLoading && !application) {
        return <ApplicationDetailsLoadingState />;
    }

    if ((isError || !isValidId) && !application) {
        return (
            <View className="flex-1 bg-[#0a0c10] items-center justify-center p-6">
                <AlertCircle size={48} color={THEME.accentOrange} />
                <Text className="text-white text-xl font-bold mt-4">
                    Unable to load preparation guide
                </Text>
                <TouchableOpacity 
                    onPress={() => !isValidId ? router.back() : refetch()}
                    className="mt-6 px-8 py-3 bg-blue-600 rounded-full"
                >
                    <Text className="text-white font-bold">{!isValidId ? 'Go Back' : 'Retry'}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const vacancyTitle = application?.vacancy?.title || 'Job Interview';
    const departmentName = application?.vacancy?.department?.name || 'PUBLIC SERVICE BOARD';

    const handleOpenResource = (title: string) => {
        setAlertMessage(`Opening ${title}...`);
        setIsAlertVisible(true);
    };

    return (
        <View style={{ flex: 1, backgroundColor: THEME.bg }}>
            <StatusBar barStyle="light-content" />

            <AlertModal
                visible={isAlertVisible}
                title="Resource Viewer"
                message={alertMessage}
                onCancel={() => setIsAlertVisible(false)}
                onConfirm={() => setIsAlertVisible(false)}
            />

            {/* Custom Header */}
            <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 24, paddingBottom: 16 }}>
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: THEME.border }}
                    >
                        <ChevronLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <View className="flex-row items-center bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                        <Sparkles size={14} color={THEME.accentBlue} />
                        <Text className="text-blue-400 text-[10px] font-black uppercase tracking-wider ml-1.5">Success Portal</Text>
                    </View>
                </View>

                <Text className="text-blue-500 text-[10px] font-black uppercase tracking-[2px] mb-1">
                    {departmentName}
                </Text>
                <Text className="text-white text-2xl font-bold leading-tight mb-2">
                    Interview Prep Guide
                </Text>
                <Text className="text-slate-400 text-xs leading-relaxed">
                    Resources, mandatory checklists, and panel tips for your <Text className="text-white font-semibold">{vacancyTitle}</Text> interview.
                </Text>
            </View>

            {/* Horizontal Tabs Selector */}
            <View className="px-6 mb-6">
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={{ gap: 8 }}
                >
                    {[
                        { key: 'checklist', label: 'Checklist', icon: FileText },
                        { key: 'values', label: 'Core Values', icon: Award },
                        { key: 'etiquette', label: 'Etiquette', icon: Users },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key as any)}
                                className="flex-row items-center px-4 py-3 rounded-2xl border"
                                style={{
                                    backgroundColor: isActive ? THEME.accentBlue : THEME.card,
                                    borderColor: isActive ? THEME.accentBlue : THEME.border,
                                }}
                            >
                                <Icon size={16} color={isActive ? '#fff' : THEME.textSecondary} />
                                <Text 
                                    className="text-xs font-bold ml-2"
                                    style={{ color: isActive ? '#fff' : THEME.textSecondary }}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Main Content Area */}
            <ScrollView 
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Tab 2: Checklist */}
                {activeTab === 'checklist' && (
                    <View className="space-y-6">
                        <View className="flex-row items-center mb-2">
                            <ShieldCheck size={18} color={THEME.accentGreen} />
                            <Text className="text-white font-bold text-base ml-2">Mandatory Document Checklist</Text>
                        </View>
                        <Text className="text-slate-400 text-xs leading-relaxed mb-4">
                            Please bring original copies and one set of photocopies for all documents listed below.
                        </Text>

                        {/* Identification & Academic */}
                        <View style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-3xl p-5 border mb-4">
                            <View className="flex-row items-center mb-4 pb-3 border-b border-slate-800">
                                <Briefcase size={16} color={THEME.accentBlue} />
                                <Text className="text-blue-400 font-bold text-xs uppercase tracking-wider ml-2">Identification & Academic</Text>
                            </View>
                            <View className="space-y-3">
                                {[
                                    "Original National ID or valid Passport",
                                    "Original Academic Certificates (KCSE, Degree/Diploma)",
                                    "Official Academic Transcripts",
                                    "Professional Body Registration (if applicable)"
                                ].map((item, idx) => (
                                    <View key={idx} className="flex-row items-start mb-3">
                                        <View className="mt-0.5 w-5 h-5 rounded-lg bg-blue-500/10 border border-blue-500/20 items-center justify-center mr-3">
                                            <Check size={12} color={THEME.accentBlue} />
                                        </View>
                                        <Text className="text-slate-300 text-xs leading-relaxed flex-1">{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Chapter 6 Compliance */}
                        <View style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-3xl p-5 border mb-4">
                            <View className="flex-row items-center mb-4 pb-3 border-b border-slate-800">
                                <ShieldCheck size={16} color={THEME.accentGreen} />
                                <Text className="text-green-400 font-bold text-xs uppercase tracking-wider ml-2">Chapter 6 Compliance</Text>
                            </View>
                            <View className="space-y-3">
                                {[
                                    "DCI Certificate of Good Conduct",
                                    "HELB Clearance Certificate",
                                    "KRA Tax Compliance Certificate",
                                    "EACC Clearance",
                                    "CRB Clearance Certificate"
                                ].map((item, idx) => (
                                    <View key={idx} className="flex-row items-start mb-3">
                                        <View className="mt-0.5 w-5 h-5 rounded-lg bg-green-500/10 border border-green-500/20 items-center justify-center mr-3">
                                            <Check size={12} color={THEME.accentGreen} />
                                        </View>
                                        <Text className="text-slate-300 text-xs leading-relaxed flex-1">{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex-row items-start">
                            <AlertCircle size={16} color={THEME.accentOrange} className="mt-0.5 mr-3" />
                            <Text className="text-orange-200 text-xs leading-relaxed flex-1">
                                <Text className="font-bold text-orange-400 uppercase tracking-wide">Important Notice: </Text>
                                Presenting forged documents is a criminal offense under the laws of Kenya.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Tab 3: Core Values */}
                {activeTab === 'values' && (
                    <View className="space-y-4">
                        <View className="flex-row items-center mb-2">
                            <Award size={18} color={THEME.accentPurple} />
                            <Text className="text-white font-bold text-base ml-2">Public Service Core Values</Text>
                        </View>
                        <Text className="text-slate-400 text-xs leading-relaxed mb-4">
                            As outlined in Article 232 of the Constitution, you will be evaluated on your alignment with these principles.
                        </Text>

                        {[
                            {
                                title: "Integrity & Honesty",
                                desc: "Maintaining the highest standards of moral and ethical conduct, being transparent in decision-making, and avoiding any conflict of interest.",
                                color: THEME.accentPurple,
                                bg: '#8b5cf615',
                                border: '#8b5cf630'
                            },
                            {
                                title: "Professionalism",
                                desc: "Demonstrating competence, excellence, and dedication in service delivery while continuously improving skills.",
                                color: THEME.accentBlue,
                                bg: '#3b82f615',
                                border: '#3b82f630'
                            },
                            {
                                title: "Transparency & Accountability",
                                desc: "Taking responsibility for decisions, actions, and outcomes while ensuring open communication with the public.",
                                color: THEME.accentGreen,
                                bg: '#10b98115',
                                border: '#10b98130'
                            },
                            {
                                title: "Inclusivity & Citizen Focus",
                                desc: "Serving all citizens with dignity, respect, and fairness without discrimination.",
                                color: THEME.accentOrange,
                                bg: '#f59e0b15',
                                border: '#f59e0b30'
                            }
                        ].map((val, idx) => (
                            <View key={idx} style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-3xl p-5 border mb-4 shadow-lg">
                                <View 
                                    className="px-3 py-1.5 rounded-xl border self-start mb-3"
                                    style={{ backgroundColor: val.bg, borderColor: val.border }}
                                >
                                    <Text className="font-bold text-[10px] uppercase tracking-wider" style={{ color: val.color }}>
                                        {val.title}
                                    </Text>
                                </View>
                                <Text className="text-slate-300 text-xs leading-relaxed">{val.desc}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Tab 4: Etiquette */}
                {activeTab === 'etiquette' && (
                    <View className="space-y-4">
                        <View className="flex-row items-center mb-2">
                            <Users size={18} color={THEME.accentBlue} />
                            <Text className="text-white font-bold text-base ml-2">Interview Etiquette & Panel Guidance</Text>
                        </View>
                        <Text className="text-slate-400 text-xs leading-relaxed mb-4">
                            Mastering the nuances of a panel interview is key to leaving a memorable impression.
                        </Text>

                        {[
                            {
                                num: "1",
                                title: "Punctuality is Key",
                                desc: "Arrive at least 30 minutes before your scheduled interview time for security screening and organizing documents.",
                                color: THEME.accentBlue,
                                bg: '#3b82f615',
                                border: '#3b82f630'
                            },
                            {
                                num: "2",
                                title: "Professional Attire",
                                desc: "Dress in formal, conservative business attire. A neat appearance reflects your respect for the Board.",
                                color: THEME.accentPurple,
                                bg: '#8b5cf615',
                                border: '#8b5cf630'
                            },
                            {
                                num: "3",
                                title: "Engaging the Panel",
                                desc: "Maintain good eye contact with all panel members. Speak clearly, listen carefully, and structure answers concisely.",
                                color: THEME.accentGreen,
                                bg: '#10b98115',
                                border: '#10b98130'
                            }
                        ].map((item, idx) => (
                            <View key={idx} style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-3xl p-5 border mb-4 shadow-lg">
                                <View className="flex-row items-center mb-2">
                                    <View 
                                        className="w-8 h-8 rounded-xl items-center justify-center mr-3 border"
                                        style={{ backgroundColor: item.bg, borderColor: item.border }}
                                    >
                                        <Text className="font-bold text-sm" style={{ color: item.color }}>{item.num}</Text>
                                    </View>
                                    <Text className="text-white font-bold text-sm">{item.title}</Text>
                                </View>
                                <Text className="text-slate-400 text-xs leading-relaxed pl-11">{item.desc}</Text>
                            </View>
                        ))}

                        {/* FAQ Section */}
                        <View style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-3xl p-5 border mt-2">
                            <View className="flex-row items-center mb-4 pb-3 border-b border-slate-800">
                                <HelpCircle size={16} color={THEME.accentBlue} />
                                <Text className="text-slate-200 font-bold text-xs uppercase tracking-wider ml-2">Frequently Asked Questions</Text>
                            </View>
                            <View className="space-y-4">
                                <View className="mb-3 pb-3 border-b border-slate-800/60">
                                    <Text className="text-white font-bold text-xs mb-1">How long does the interview take?</Text>
                                    <Text className="text-slate-400 text-xs leading-relaxed">Interviews generally last between 20 to 45 minutes depending on the seniority of the position.</Text>
                                </View>
                                <View className="mb-3 pb-3 border-b border-slate-800/60">
                                    <Text className="text-white font-bold text-xs mb-1">Can I present digital copies of certificates?</Text>
                                    <Text className="text-slate-400 text-xs leading-relaxed">No. The Board requires physical inspection of all original certificates alongside photocopies.</Text>
                                </View>
                                <View>
                                    <Text className="text-white font-bold text-xs mb-1">When will I know the outcome?</Text>
                                    <Text className="text-slate-400 text-xs leading-relaxed">Official communication is typically made within 14 to 30 days after the conclusion of all interviews.</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
