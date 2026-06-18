import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Bug, RefreshCw } from 'lucide-react-native';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of the crashed component tree.
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        if (__DEV__) {
            console.group('Error Boundary Stack');
            console.error(errorInfo.componentStack);
            console.groupEnd();
        }

        this.setState({
            errorInfo,
        });

        // Call the optional onError callback
        this.props.onError?.(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Bug size={48} color="#ef4444" />
                        </View>

                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.message}>
                            {__DEV__
                                ? this.state.error?.message || 'An unexpected error occurred'
                                : 'An unexpected error occurred. Please try again.'}
                        </Text>

                        {__DEV__ && this.state.error && (
                            <ScrollView style={styles.errorDetails}>
                                <Text style={styles.errorText}>
                                    {this.state.error.toString()}
                                    {'\n\n'}
                                    {this.state.errorInfo?.componentStack}
                                </Text>
                            </ScrollView>
                        )}

                        <Pressable
                            style={styles.resetButton}
                            onPress={this.handleReset}
                            accessibilityRole="button"
                            accessibilityLabel="Try again"
                        >
                            <RefreshCw size={20} color="#ffffff" />
                            <Text style={styles.resetButtonText}>Try Again</Text>
                        </Pressable>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    errorDetails: {
        flex: 1,
        width: '100%',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        maxHeight: 200,
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#004aad',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    resetButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

/**
 * A simpler functional error boundary component for screen-level error handling.
 * Wraps a screen and shows an error state when an error occurs.
 */
interface ScreenErrorBoundaryProps {
    children: ReactNode;
    screenName?: string;
    onRetry?: () => void;
}

export function ScreenErrorBoundary({ children, screenName, onRetry }: ScreenErrorBoundaryProps) {
    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                console.error(`Error in screen: ${screenName || 'Unknown'}`, error, errorInfo);
            }}
            fallback={
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Bug size={48} color="#ef4444" />
                        </View>
                        <Text style={styles.title}>Screen Error</Text>
                        <Text style={styles.message}>
                            {screenName ? `The ${screenName} screen encountered an error.` : 'This screen encountered an error.'}
                        </Text>
                        <Pressable
                            style={styles.resetButton}
                            onPress={() => {
                                if (onRetry) {
                                    onRetry();
                                } else {
                                    // Default behavior: reload the app
                                    (ErrorBoundary as any).instance?.handleReset?.();
                                }
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Retry"
                        >
                            <RefreshCw size={20} color="#ffffff" />
                            <Text style={styles.resetButtonText}>Retry</Text>
                        </Pressable>
                    </View>
                </View>
            }
        >
            {children}
        </ErrorBoundary>
    );
}

// Add Platform import for StyleSheet
import { Platform } from 'react-native';
