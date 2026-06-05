import * as Updates from 'expo-updates';
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { toast } from 'sonner-native';

export function useOtaUpdates() {
    const [isChecking, setIsChecking] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isUpdateReady, setIsUpdateReady] = useState(false);

    // Safely detect if the native updates module is loaded/enabled
    const isUpdatesSupported = useCallback(() => {
        try {
            // Read isEnabled safely. If the native module is completely missing
            // from the binary, reading or calling Updates properties might throw.
            return !!(Updates && Updates.isEnabled);
        } catch (e) {
            return false;
        }
    }, []);

    const supported = isUpdatesSupported();

    // Automatically check for updates on mount in production
    useEffect(() => {
        if (!__DEV__ && supported) {
            autoCheckAndInstall();
        }
    }, [supported]);

    const autoCheckAndInstall = async () => {
        try {
            if (!supported) return;
            const check = await Updates.checkForUpdateAsync();
            if (check.isAvailable) {
                setIsDownloading(true);
                const fetchResult = await Updates.fetchUpdateAsync();
                setIsDownloading(false);
                
                if (fetchResult.isNew) {
                    setIsUpdateReady(true);
                    
                    toast.success('Update Downloaded', {
                        description: 'A new update has been downloaded. Restart the app to apply it.',
                    });

                    Alert.alert(
                        'Update Ready',
                        'A new version of the app has been downloaded. Would you like to restart and apply the update now?',
                        [
                            { text: 'Later', style: 'cancel' },
                            {
                                text: 'Restart Now',
                                onPress: async () => {
                                    try {
                                        await Updates.reloadAsync();
                                    } catch (e: any) {
                                        console.error('Failed to reload:', e);
                                    }
                                }
                            }
                        ]
                    );
                }
            }
        } catch (error) {
            console.warn('OTA Auto Update Error:', error);
        }
    };

    const checkForUpdatesManually = useCallback(async () => {
        if (__DEV__) {
            toast.info('Development Mode', {
                description: 'OTA Updates are disabled in development mode.',
            });
            return;
        }

        if (!supported) {
            toast.error('Native Module Missing', {
                description: 'The native updates module is not present in this build. Please compile/rebuild the app binary.',
            });
            return;
        }

        setIsChecking(true);
        try {
            const check = await Updates.checkForUpdateAsync();
            setIsChecking(false);

            if (check.isAvailable) {
                toast.info('Update Found', {
                    description: 'Downloading the latest update...',
                });
                
                setIsDownloading(true);
                const fetchResult = await Updates.fetchUpdateAsync();
                setIsDownloading(false);

                if (fetchResult.isNew) {
                    setIsUpdateReady(true);
                    Alert.alert(
                        'Update Ready',
                        'The update has been successfully downloaded. Restart the app to apply changes.',
                        [
                            { text: 'Later', style: 'cancel' },
                            {
                                text: 'Restart',
                                onPress: async () => {
                                    try {
                                        await Updates.reloadAsync();
                                    } catch (e: any) {
                                        console.error('Failed to reload:', e);
                                    }
                                }
                            }
                        ]
                    );
                } else {
                    toast.success('Up to Date', {
                        description: 'You are already running the latest version.',
                    });
                }
            } else {
                toast.success('Up to Date', {
                    description: 'No new updates available.',
                });
            }
        } catch (error: any) {
            setIsChecking(false);
            console.error('Manual update check error:', error);
            toast.error('Update Check Failed', {
                description: error.message || 'An error occurred while checking for updates.',
            });
        }
    }, [supported]);

    const applyUpdate = useCallback(async () => {
        if (!supported) {
            toast.error('Unsupported', {
                description: 'Native updates module is not loaded in this build.',
            });
            return;
        }
        try {
            if (isUpdateReady) {
                await Updates.reloadAsync();
            } else {
                toast.error('No Update Ready', {
                    description: 'Please check and download an update first.',
                });
            }
        } catch (error: any) {
            toast.error('Failed to Restart', {
                description: error.message || 'Could not restart the app.',
            });
        }
    }, [isUpdateReady, supported]);

    return {
        isChecking,
        isDownloading,
        isUpdateReady,
        checkForUpdates: checkForUpdatesManually,
        applyUpdate,
    };
}
