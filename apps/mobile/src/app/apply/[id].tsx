import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { UnifiedProfileWizard } from '@/components/profile/UnifiedProfileWizard';

export default function ApplyScreen() {
    const { id } = useLocalSearchParams();
    
    return (
        <UnifiedProfileWizard 
            mode="apply" 
            vacancyId={id as string} 
        />
    );
}
