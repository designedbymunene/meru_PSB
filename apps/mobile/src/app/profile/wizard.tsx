import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { UnifiedProfileWizard } from '@/components/profile/UnifiedProfileWizard';

export default function ProfileWizardScreen() {
    const { step } = useLocalSearchParams();
    
    return (
        <UnifiedProfileWizard 
            mode="profile" 
            initialStep={step as string}
        />
    );
}
