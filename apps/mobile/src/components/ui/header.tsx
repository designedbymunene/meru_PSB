import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  onBackPress?: () => void;
  onBack?: () => void;
  testID?: string;
}

export function Header({
  title,
  subtitle,
  showBackButton = true,
  leftAction,
  rightAction,
  transparent = false,
  onBackPress,
  onBack,
  testID
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const router = useRouter();

  const handleBack = () => {
    const backFn = onBackPress || onBack;
    if (backFn) {
      backFn();
    } else {
      router.back();
    }
  };

  return (
    <View
      className={`w-full z-10 ${transparent ? 'bg-transparent' : 'bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800'}`}
      style={{ paddingTop: insets.top }}
      testID={testID}
    >
      <View className="h-14 flex-row items-center justify-between px-4">
        <View className="flex-1 items-start justify-center min-w-[40px]">
          {showBackButton && !leftAction ? (
            <Pressable
              onPress={handleBack}
              className="p-1 flex-row items-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              testID={testID ? `${testID}-back-button` : 'header-back-button'}
            >
              <ChevronLeft size={24} color={isDarkMode ? '#ffffff' : '#0f172a'} strokeWidth={2.5} />
            </Pressable>
          ) : leftAction}
        </View>

        <View className="flex-[4] items-center justify-center">
          {title && (
            <Text className="text-gray-900 dark:text-white text-[17px] font-bold text-center tracking-tight" numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className="text-gray-500 dark:text-gray-400 text-[11px] font-medium uppercase tracking-wider -mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View className="flex-1 items-end justify-center min-w-[40px]">
          {rightAction}
        </View>
      </View>
    </View>
  );
}

interface HeaderActionProps {
  icon: React.ReactNode;
  onPress: () => void;
  label?: string;
  testID?: string;
}

export function HeaderAction({ icon, onPress, label, testID }: HeaderActionProps) {
  return (
    <Pressable
      onPress={onPress}
      className="p-1 flex-row items-center"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      testID={testID || 'header-action'}
    >
      {icon}
      {label && <Text className="text-[#004aad] text-[15px] font-semibold ml-1">{label}</Text>}
    </Pressable>
  );
}

