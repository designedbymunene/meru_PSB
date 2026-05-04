import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
    ChevronLeft, 
    ChevronRight, 
    Check, 
    User, 
    GraduationCap, 
    Briefcase, 
    Award, 
    Users,
    Save,
    AlertCircle
} from 'lucide-react-native';
import { Header } from '@/components/ui/header';

export default function MultiStepApplicationScreen() {
    const { id, step: initialStep } = useLocalSearchParams();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(parseInt(initialStep as string) || 1);

    const steps = [
        { id: 1, title: 'Bio-Data', icon: <User size={18} color={currentStep === 1 ? 'white' : '#94a3b8'} /> },
        { id: 2, title: 'Academic', icon: <GraduationCap size={18} color={currentStep === 2 ? 'white' : '#94a3b8'} /> },
        { id: 3, title: 'Experience', icon: <Briefcase size={18} color={currentStep === 3 ? 'white' : '#94a3b8'} /> },
        { id: 4, title: 'Skills', icon: <Award size={18} color={currentStep === 4 ? 'white' : '#94a3b8'} /> },
        { id: 5, title: 'Referees', icon: <Users size={18} color={currentStep === 5 ? 'white' : '#94a3b8'} /> },
    ];

    const nextStep = () => {
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
        else router.back();
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <BioDataStep />;
            case 2: return <AcademicStep />;
            case 3: return <ExperienceStep />;
            case 4: return <SkillsStep />;
            case 5: return <RefereesStep />;
            default: return null;
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            className="flex-1 bg-white dark:bg-gray-950"
        >
            <Header 
                title={id === 'profile' ? 'Update Digital CV' : 'Job Application'} 
                showBackButton={true}
                onBackPress={prevStep}
            />

            {/* Stepper Progress */}
            <View className="px-6 pt-4 pb-2">
                <View className="flex-row justify-between items-center mb-6">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <View className="items-center">
                                <View className={`w-10 h-10 rounded-full items-center justify-center border ${
                                    currentStep === step.id ? 'bg-[#004aad] border-[#004aad] dark:bg-blue-600 dark:border-blue-600' : 
                                    currentStep > step.id ? 'bg-green-500 border-green-500' : 'bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-800'
                                }`}>
                                    {currentStep > step.id ? (
                                        <Check size={20} color="white" />
                                    ) : step.icon}
                                </View>
                            </View>
                            {index < steps.length - 1 && (
                                <View className={`flex-1 h-0.5 mx-1 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-800'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </View>
                <Text className="text-2xl font-black text-gray-900 dark:text-white">{steps[currentStep-1].title}</Text>
                <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">Step {currentStep} of 5 • Section information</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-6">
                    {renderStepContent()}
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View className="p-6 border-t border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-950 pb-10 flex-row justify-between items-center">
                <TouchableOpacity 
                    onPress={prevStep}
                    className="px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                >
                    <Text className="text-gray-600 dark:text-gray-400 font-bold">Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    onPress={currentStep === 5 ? () => router.back() : nextStep}
                    className="flex-1 ml-4 bg-gray-900 dark:bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-gray-200 dark:shadow-none"
                >
                    <Text className="text-white font-bold">
                        {currentStep === 5 ? 'Save & Finish' : 'Save & Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

// Sub-step Components
const BioDataStep = () => (
    <View className="space-y-6">
        <View>
            <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">ID / Passport Number</Text>
            <TextInput 
                placeholder="Enter ID Number" 
                placeholderTextColor="#94a3b8"
                className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white"
            />
        </View>
        <View>
            <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">KRA PIN</Text>
            <TextInput 
                placeholder="A000000000X" 
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
                className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white"
            />
        </View>
        <View className="flex-row space-x-4">
            <View className="flex-1">
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">Gender</Text>
                <View className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl">
                    <Text className="text-gray-400 dark:text-gray-500">Select Gender</Text>
                </View>
            </View>
            <View className="flex-1">
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">Date of Birth</Text>
                <View className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl">
                    <Text className="text-gray-400 dark:text-gray-500">DD/MM/YYYY</Text>
                </View>
            </View>
        </View>
        <View>
            <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">Ethnicity / Sub-County</Text>
            <View className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl">
                <Text className="text-gray-400 dark:text-gray-500">Select Ethnicity</Text>
            </View>
        </View>
    </View>
);

const AcademicStep = () => (
    <View className="space-y-6">
        <View className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-4 rounded-2xl flex-row items-start mb-2">
            <AlertCircle size={16} color="#004aad" className="mt-0.5 dark:text-blue-400" />
            <Text className="text-blue-700 dark:text-blue-400 text-xs ml-3 leading-4">
                Please add your academic qualifications starting from the highest level (University/College).
            </Text>
        </View>

        <TouchableOpacity className="border-2 border-dashed border-gray-200 dark:border-gray-800 p-8 rounded-[32px] items-center">
            <View className="bg-gray-50 dark:bg-gray-900 p-4 rounded-full mb-3">
                <GraduationCap size={24} color="#94a3b8" />
            </View>
            <Text className="text-gray-900 dark:text-white font-bold">Add Qualification</Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">Degree, Diploma, or Certificate</Text>
        </TouchableOpacity>

        {/* Example added item */}
        <View className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="text-gray-900 dark:text-white font-bold text-base">BSc. Computer Science</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">University of Nairobi</Text>
                </View>
                <View className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                    <Text className="text-green-600 dark:text-green-400 text-[10px] font-black uppercase">Completed</Text>
                </View>
            </View>
            <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                <Text className="text-gray-400 dark:text-gray-500 text-[11px]">Grade: Second Class Upper</Text>
                <Text className="text-gray-400 dark:text-gray-500 text-[11px]">2019 - 2023</Text>
            </View>
        </View>
    </View>
);

const ExperienceStep = () => (
    <View className="space-y-6">
        <TouchableOpacity className="border-2 border-dashed border-gray-200 dark:border-gray-800 p-8 rounded-[32px] items-center">
            <View className="bg-gray-50 dark:bg-gray-900 p-4 rounded-full mb-3">
                <Briefcase size={24} color="#94a3b8" />
            </View>
            <Text className="text-gray-900 dark:text-white font-bold">Add Work Experience</Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">Roles, Internships, or Attachments</Text>
        </TouchableOpacity>
    </View>
);

const SkillsStep = () => (
    <View className="space-y-6">
        <View>
            <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-2">Professional Memberships</Text>
            <TouchableOpacity className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-2xl flex-row justify-between items-center">
                <Text className="text-gray-400 dark:text-gray-500 text-sm">Select Board (e.g. ICPAK, LSK)</Text>
                <ChevronRight size={18} color="#94a3b8" />
            </TouchableOpacity>
        </View>
        <View>
            <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm mb-4 mt-2">Core Skills</Text>
            <View className="flex-row flex-wrap -m-1">
                {['Public Policy', 'Financial Audit', 'Project Management', 'Data Analysis', 'Reporting'].map(skill => (
                    <View key={skill} className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl m-1 border border-blue-100 dark:border-blue-900/20">
                        <Text className="text-[#004aad] dark:text-blue-400 text-xs font-bold">{skill}</Text>
                    </View>
                ))}
                <TouchableOpacity className="bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl m-1 border border-gray-200 dark:border-gray-800 border-dashed">
                    <Text className="text-gray-400 dark:text-gray-500 text-xs font-bold">+ Add Skill</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

const RefereesStep = () => (
    <View className="space-y-6">
        <Text className="text-gray-900 dark:text-white font-bold text-base mb-2">Professional Referees</Text>
        <View className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-sm mb-4">
            <TextInput 
                placeholder="Referee Full Name" 
                placeholderTextColor="#94a3b8"
                className="text-gray-900 dark:text-white font-bold mb-3 border-b border-gray-50 dark:border-gray-800 pb-2" 
            />
            <TextInput 
                placeholder="Organization & Position" 
                placeholderTextColor="#94a3b8"
                className="text-gray-500 dark:text-gray-400 text-sm mb-3 border-b border-gray-50 dark:border-gray-800 pb-2" 
            />
            <TextInput 
                placeholder="Phone Number / Email" 
                placeholderTextColor="#94a3b8"
                className="text-gray-500 dark:text-gray-400 text-sm mb-2" 
            />
        </View>
        
        <View className="bg-gray-50 dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 mt-4">
            <Text className="text-gray-900 dark:text-white font-bold mb-4">Chapter 6 Declarations</Text>
            <View className="space-y-4">
                {[
                    'Have you ever been dismissed from service?',
                    'Any pending criminal cases?',
                    'Are you a cleared by EACC?'
                ].map((q, i) => (
                    <View key={i} className="flex-row justify-between items-center">
                        <Text className="text-gray-600 dark:text-gray-400 text-xs flex-1 mr-4">{q}</Text>
                        <View className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded-full px-1 justify-center">
                            <View className="w-4 h-4 bg-white dark:bg-gray-700 rounded-full" />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    </View>
);
