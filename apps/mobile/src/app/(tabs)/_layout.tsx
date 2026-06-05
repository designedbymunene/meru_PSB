import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Briefcase, ClipboardList, UserRoundSearch, Settings2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function TabsLayout() {
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    
    // Calculate heights based on device safe area
    const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 55 + insets.bottom : 65 + insets.bottom;
    const PADDING_BOTTOM = Platform.OS === 'ios' ? Math.max(insets.bottom - 5, 0) : Math.max(insets.bottom, 12);

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: isDarkMode ? '#60a5fa' : '#004aad',
            tabBarInactiveTintColor: isDarkMode ? '#64748b' : '#94a3b8',
            headerShown: false,
            tabBarStyle: {
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                height: TAB_BAR_HEIGHT,
                paddingBottom: PADDING_BOTTOM,
                paddingTop: 10,
                backgroundColor: isDarkMode ? '#030712' : 'white',
                elevation: 0,
                shadowOpacity: 0,
            },
            tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
            }
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="vacancies"
                options={{
                    title: 'Vacancies',
                    tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="applications"
                options={{
                    title: 'My Apps',
                    tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="digital-cv"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <UserRoundSearch color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
