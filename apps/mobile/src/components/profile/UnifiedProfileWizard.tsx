import React, { useState, useMemo, useRef } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertModal } from '@/components/ui/alert-modal';
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    User,
    GraduationCap,
    Briefcase,
    Award,
    Users,
    ClipboardCheck,
    AlertCircle,
    BookOpen,
    MapPin,
} from 'lucide-react-native';
import { Header } from '@/components/ui/header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { runOfflineCapableMutation } from '@/lib/offline-mutations/mutation-strategy';
import { toast } from 'sonner-native';

// Form Components
import { PersonalDetailsForm, FormHandle } from './forms/PersonalDetailsForm';
import { LocationForm } from './forms/LocationForm';
import { ListSectionWrapper } from './forms/ListSectionWrapper';
import { QualificationForm } from './forms/QualificationForm';
import { EmploymentForm } from './forms/EmploymentForm';
import { RefereeForm } from './forms/RefereeForm';
import { ProfessionalDetailForm } from './forms/ProfessionalDetailForm';
import { TrainingForm } from './forms/TrainingForm';
import { QualificationCard } from './QualificationCard';
import { EmploymentCard } from './EmploymentCard';
import { RefereeCard } from './RefereeCard';
import { ProfessionalDetailCard } from './ProfessionalDetailCard';
import { TrainingCard } from './TrainingCard';
import { useQualifications } from '@/hooks/use-qualifications';
import { useEmployment } from '@/hooks/use-employment';
import { useReferees } from '@/hooks/use-referees';
import { useProfessionalDetails } from '@/hooks/use-professional-details';
import { useTraining } from '@/hooks/use-training';
import { CompletionGuard } from './CompletionGuard';


export type WizardMode = 'profile' | 'apply';

interface UnifiedProfileWizardProps {
    mode: WizardMode;
    vacancyId?: string;
    initialStep?: string;
}

export function UnifiedProfileWizard({ mode, vacancyId, initialStep }: UnifiedProfileWizardProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const [currentStepIndex, setCurrentStepIndex] = useState(() => {
        if (initialStep) {
            const index = [
                'personal',
                'location',
                'academic',
                'experience',
                'training',
                'professional',
                'referees',
                // 'documents',
                'review'
            ].indexOf(initialStep);
            return index >= 0 ? index : 0;
        }
        return 0;
    });
    const formRef = useRef<FormHandle>(null);
    const locationFormRef = useRef<FormHandle>(null);

    // Fetch profile and all related data
    const { data: profileData, isLoading: isProfileLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await apiClient.get('/applicant-profiles/me');
            return response.data.data;
        },
    });

    const profile = profileData;
    const profileCompletion = profileData?.profileCompletion;

    const { data: vacancy } = useQuery({
        queryKey: ['vacancy', vacancyId],
        queryFn: async () => {
            const response = await apiClient.get(`/vacancies/${vacancyId}`);
            return response.data.data;
        },
        enabled: !!vacancyId,
    });

    const { 
        qualifications, 
        addQualification, 
        updateQualification, 
        deleteQualification 
    } = useQualifications();

    const {
        employmentHistory,
        addEmployment,
        updateEmployment,
        deleteEmployment
    } = useEmployment();

    const {
        referees,
        addReferee,
        updateReferee,
        deleteReferee
    } = useReferees();

    const {
        professionalDetails,
        addProfessionalDetail,
        updateProfessionalDetail,
        deleteProfessionalDetail
    } = useProfessionalDetails();

    const {
        trainingCourses,
        addTrainingCourse,
        updateTrainingCourse,
        deleteTrainingCourse
    } = useTraining();

    const isSubmittingRef = useRef(false);

    const [isSubmissionModalVisible, setIsSubmissionModalVisible] = useState(false);
    const [submissionTitleModal, setSubmissionTitleModal] = useState('');
    const [submissionMessageModal, setSubmissionMessageModal] = useState('');
    const [submissionNavigateOnConfirm, setSubmissionNavigateOnConfirm] = useState(false);

    // Mutations
    const updateProfileMutation = useMutation({
        mutationFn: async (data: any) => {
            return runOfflineCapableMutation({
                request: () => apiClient.put('/applicant-profiles/me', data),
                method: 'put',
                path: '/applicant-profiles/me',
                data,
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (result.queued) {
                toast.info('Offline', { description: 'Changes saved locally and will sync later.' });
            }
            setCurrentStepIndex(prev => prev + 1);
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to save changes') });
        },
        onSettled: () => {
            isSubmittingRef.current = false;
        }
    });

    const submitApplicationMutation = useMutation({
        mutationFn: async () => {
            return apiClient.post('/applications', { vacancyId });
        },
        onSuccess: (response) => {
            const app = response.data.data;
            const refNo = vacancy?.advertisementNumber || 'N/A';
            const title = vacancy?.title || 'this position';
            
            setSubmissionTitleModal('Application Submitted');
            setSubmissionMessageModal(`Your application for ${title} (${refNo}) has been submitted successfully.\n\nApplication ID: APP-${app.id.toString().padStart(6, '0')}`);
            setSubmissionNavigateOnConfirm(true);
            setTimeout(() => setIsSubmissionModalVisible(true), 100);
        },
        onError: (error) => {
            toast.error('Error', { description: getApiErrorMessage(error, 'Failed to submit application') });
        },
        onSettled: () => {
            isSubmittingRef.current = false;
        }
    });

    const steps = useMemo(() => {
        const baseSteps = [
            // --- REQUIRED SECTIONS ---
            {
                id: 'personal',
                title: 'Personal Details (Required)',
                icon: User,
                render: () => <PersonalDetailsForm ref={formRef} initialData={profile} onSubmit={(data) => {
                    if (isSubmittingRef.current) return;
                    isSubmittingRef.current = true;
                    updateProfileMutation.mutate(data);
                }} />
            },
            {
                id: 'location',
                title: 'Location & Ethnicity (Required)',
                icon: MapPin,
                render: () => <LocationForm ref={locationFormRef} initialData={profile} onSubmit={(data) => {
                    if (isSubmittingRef.current) return;
                    isSubmittingRef.current = true;
                    updateProfileMutation.mutate(data);
                }} />
            },
            {
                id: 'academic', 
                title: 'Academic History (Required)', 
                icon: GraduationCap, 
                render: () => (
                    <ListSectionWrapper 
                        items={qualifications || []}
                        FormComponent={QualificationForm as any}
                        onAdd={addQualification}
                        onUpdate={updateQualification}
                        onDelete={deleteQualification}
                        emptyMessage="No qualifications added yet."
                        emptyIcon={<GraduationCap size={48} color="#cbd5e1" />}
                        renderItem={(item, onEdit, onDelete) => (
                            <QualificationCard 
                                key={item.id}
                                qualification={item}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        )}
                    />
                )
            },
            { 
                id: 'experience', 
                title: 'Work Experience (Required)', 
                icon: Briefcase, 
                render: () => (
                    <ListSectionWrapper 
                        items={employmentHistory || []}
                        FormComponent={EmploymentForm as any}
                        onAdd={addEmployment}
                        onUpdate={updateEmployment}
                        onDelete={deleteEmployment}
                        emptyMessage="No work experience added yet."
                        emptyIcon={<Briefcase size={48} color="#cbd5e1" />}
                        renderItem={(item, onEdit, onDelete) => (
                            <EmploymentCard 
                                key={item.id}
                                employment={item}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        )}
                    />
                )
            },
            { 
                id: 'training', 
                title: 'Training Courses (Required)', 
                icon: BookOpen, 
                render: () => (
                    <ListSectionWrapper 
                        items={trainingCourses || []}
                        FormComponent={TrainingForm as any}
                        onAdd={addTrainingCourse}
                        onUpdate={updateTrainingCourse}
                        onDelete={deleteTrainingCourse}
                        emptyMessage="No training courses added yet."
                        emptyIcon={<BookOpen size={48} color="#cbd5e1" />}
                        renderItem={(item, onEdit, onDelete) => (
                            <TrainingCard 
                                key={item.id}
                                training={item}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        )}
                    />
                )
            },
            // --- OPTIONAL SECTIONS ---
            { 
                id: 'professional', 
                title: 'Professional Details (Optional)', 
                icon: Award, 
                render: () => (
                    <ListSectionWrapper 
                        items={professionalDetails || []}
                        FormComponent={ProfessionalDetailForm as any}
                        onAdd={addProfessionalDetail}
                        onUpdate={updateProfessionalDetail}
                        onDelete={deleteProfessionalDetail}
                        emptyMessage="No professional details added yet."
                        emptyIcon={<Award size={48} color="#cbd5e1" />}
                        renderItem={(item, onEdit, onDelete) => (
                            <ProfessionalDetailCard 
                                key={item.id}
                                detail={item}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        )}
                    />
                )
            },
            { 
                id: 'referees', 
                title: 'Referees (Optional)', 
                icon: Users, 
                render: () => (
                    <ListSectionWrapper 
                        items={referees || []}
                        FormComponent={RefereeForm as any}
                        onAdd={addReferee}
                        onUpdate={updateReferee}
                        onDelete={deleteReferee}
                        emptyMessage="No referees added yet."
                        emptyIcon={<Users size={48} color="#cbd5e1" />}
                        renderItem={(item, onEdit, onDelete) => (
                            <RefereeCard 
                                key={item.id}
                                referee={item}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        )}
                    />
                )
            },
            /* {
                id: 'documents',
                title: 'Uploads (Optional)',
                icon: FileUp,
                render: () => (
                    <View className="space-y-4">
                        <View className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-[24px] border-dashed items-center">
                            <View className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm mb-3">
                                <FileUp size={22} color="#64748b" />
                            </View>
                            <Text className="text-gray-900 dark:text-white font-bold text-sm text-center">Manage Documents</Text>
                            <Text className="text-gray-400 dark:text-gray-500 text-[10px] text-center mt-1 px-6 leading-4">
                                Upload your ID, CV and other supporting documents.
                            </Text>

                            <Pressable 
                                onPress={() => router.push('/profile/documents')}
                                className="mt-5 flex-row items-center bg-gray-900 px-5 py-3 rounded-xl"
                            >
                                <Plus size={16} color="white" />
                                <Text className="text-white font-bold text-xs ml-2">Open Manager</Text>
                            </Pressable>
                        </View>
                    </View>
                )
            } */
        ];

        if (mode === 'apply') {
            baseSteps.push({ 
                id: 'review', 
                title: 'Review & Submit', 
                icon: ClipboardCheck, 
                render: () => (
                    <View className="space-y-6">
                        <View className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                            <Text className="text-blue-900 dark:text-blue-200 font-bold mb-1">Applying For:</Text>
                            <Text className="text-blue-700 dark:text-blue-300 text-lg font-black">{vacancy?.title}</Text>
                            <Text className="text-blue-600 dark:text-blue-400 text-xs mt-1">{vacancy?.advertisementNumber}</Text>
                        </View>

                        {profileCompletion && (
                            <CompletionGuard 
                                completion={profileCompletion} 
                                onJumpToStep={(stepId) => {
                                    const index = steps.findIndex(s => s.id === stepId);
                                    if (index >= 0) setCurrentStepIndex(index);
                                }}
                            />
                        )}
                        
                        {profileCompletion?.canApply && (
                            <View className="space-y-4">
                                <Text className="text-gray-900 dark:text-white font-black text-lg">Final Declarations</Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-xs leading-5">
                                    By submitting this application, I declare that all information provided in my profile is true and correct to the best of my knowledge. I understand that any false statements may lead to disqualification or legal action.
                                </Text>
                            </View>
                        )}
                    </View>
                )
            });
        }

        return baseSteps;
    }, [
        profile, 
        vacancy, 
        mode, 
        qualifications,
        addQualification,
        updateQualification,
        deleteQualification,
        employmentHistory,
        addEmployment,
        updateEmployment,
        deleteEmployment,
        referees,
        addReferee,
        updateReferee,
        deleteReferee,
        professionalDetails,
        addProfessionalDetail,
        updateProfessionalDetail,
        deleteProfessionalDetail,
        updateProfileMutation,
        profileCompletion
    ]);

    const currentStep = steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    const isSaving = updateProfileMutation.isPending || submitApplicationMutation.isPending;

    const handleNext = async () => {
        if (isSaving || isSubmittingRef.current || submitApplicationMutation.isSuccess) return;

        if (currentStep.id === 'personal') {
            formRef.current?.submit();
        } else if (currentStep.id === 'location') {
            locationFormRef.current?.submit();
        } else if (currentStep.id === 'review') {
            isSubmittingRef.current = true;
            submitApplicationMutation.mutate();
        } else {
            // For list-based steps, just proceed if valid (we could add validation here)
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (isFirstStep) {
            router.back();
        } else {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    if (isProfileLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
                <ActivityIndicator size="large" color="#004aad" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
            <Header 
                title={mode === 'apply' ? 'Job Application' : 'Update Profile'} 
                subtitle={currentStep.title}
                onBack={handleBack}
            />

            <AlertModal
                visible={isSubmissionModalVisible}
                title={submissionTitleModal}
                message={submissionMessageModal}
                onCancel={() => setIsSubmissionModalVisible(false)}
                onConfirm={() => {
                    setIsSubmissionModalVisible(false);
                    if (submissionNavigateOnConfirm) {
                        setTimeout(() => router.replace('/(tabs)/applications'), 100);
                    }
                }}
            />

            {/* Progress Indicator */}
            <View className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Step {currentStepIndex + 1} of {steps.length}
                    </Text>
                    <Text className="text-xs font-black text-[#004aad] dark:text-blue-400">
                        {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
                    </Text>
                </View>
                <View className="h-1.5 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                    <View 
                        className="h-full bg-[#004aad] dark:bg-blue-600 rounded-full" 
                        style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                    />
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView 
                    className="flex-1" 
                    showsVerticalScrollIndicator={false} 
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                >
                <View className="p-6">
                    {currentStep.render()}
                </View>
                <View className="h-10" />
            </ScrollView>

            {/* Sticky Bottom Actions */}
            <View 
                className="px-6 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80"
                style={{ 
                    paddingBottom: Math.max(insets.bottom, 20),
                    paddingTop: 16
                }}
            >
                <View className="flex-row items-center justify-between">
                    {!isFirstStep && (
                        <Pressable 
                            onPress={handleBack}
                            className="w-14 h-14 rounded-2xl border border-gray-200 dark:border-gray-800 items-center justify-center bg-gray-50/50 dark:bg-gray-900/50"
                        >
                            <ChevronLeft size={24} color="#64748b" />
                        </Pressable>
                    )}
                    
                    <View className={isFirstStep ? 'flex-1' : 'flex-1 ml-4'}>
                        <Pressable 
                            onPress={handleNext}
                            disabled={isSaving || submitApplicationMutation.isSuccess || (isLastStep && mode === 'apply' && !profileCompletion?.canApply)}
                            className={`h-14 rounded-2xl items-center justify-center flex-row shadow-xl ${
                                (isSaving || submitApplicationMutation.isSuccess || (isLastStep && mode === 'apply' && !profileCompletion?.canApply)) 
                                ? 'bg-gray-300 dark:bg-gray-800' 
                                : 'bg-[#004aad] dark:bg-blue-600 shadow-blue-100/50 dark:shadow-none'
                            }`}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Text className="text-white font-black text-base mr-2">
                                        {isLastStep 
                                            ? (mode === 'apply' 
                                            ? (profileCompletion?.canApply ? 'Submit Application' : 'Complete Required Sections') 
                                                : 'Finish') 
                                            : 'Save & Continue'}
                                    </Text>
                                    {!isLastStep && <ChevronRight size={20} color="white" strokeWidth={3} />}
                                    {isLastStep && mode === 'apply' && profileCompletion?.canApply && <CheckCircle2 size={20} color="white" />}
                                    {isLastStep && mode === 'apply' && !profileCompletion?.canApply && <AlertCircle size={20} color="#94a3b8" />}
                                </>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
