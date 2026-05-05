import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
        }}>
            <Stack.Screen name="personal-details" options={{ title: 'Personal Details' }} />
            <Stack.Screen name="qualifications" options={{ title: 'Qualifications' }} />
            <Stack.Screen name="professional-details" options={{ title: 'Professional Details' }} />
            <Stack.Screen name="employment-history" options={{ title: 'Employment History' }} />
            <Stack.Screen name="memberships" options={{ title: 'Professional Memberships' }} />
            <Stack.Screen name="add-qualification" options={{ title: 'Add Qualification' }} />
            <Stack.Screen name="edit-qualification" options={{ title: 'Edit Qualification' }} />
            <Stack.Screen name="add-employment" options={{ title: 'Add Employment' }} />
            <Stack.Screen name="add-membership" options={{ title: 'Add Membership' }} />
            <Stack.Screen name="add-referee" options={{ title: 'Add Referee' }} />
            <Stack.Screen name="security-settings" options={{ title: 'Security Settings' }} />
            <Stack.Screen name="preferences" options={{ title: 'Preferences' }} />
            <Stack.Screen name="documents" options={{ title: 'Documents & Compliance' }} />
        </Stack>
    );
}
