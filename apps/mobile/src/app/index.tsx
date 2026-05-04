import { Redirect } from 'expo-router';
import { useAuth } from '../context/auth-context';
import { AuthGateLoadingState } from '../components/ui/loading-skeletons';

export default function Index() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <AuthGateLoadingState />;
    }

    if (!user) {
        return <Redirect href="/login" />;
    }

    return <Redirect href="/(tabs)" />;
}
