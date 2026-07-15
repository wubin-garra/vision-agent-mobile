import { useRef } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  type NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { useNavigationAnalytics } from '@/navigation/NavigationAnalytics';
import { MainTabs } from '@/navigation/MainTabs';
import { InsightScreen } from '@/screens/InsightScreen';
import { PointsScreen } from '@/screens/PointsScreen';
import { posthog } from '@/services/analytics';
import type { RootStackParamList } from '@/types/navigation';
import { colors, lightColors } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: lightColors.bg,
    card: lightColors.bg,
    text: lightColors.text,
    border: lightColors.border,
    primary: lightColors.accent,
  },
};

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const { onReady, onStateChange } = useNavigationAnalytics(navigationRef);

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer
          ref={navigationRef}
          theme={navTheme}
          onReady={onReady}
          onStateChange={onStateChange}
        >
          <PostHogProvider
            client={posthog}
            autocapture={{
              captureScreens: false,
              captureTouches: false,
            }}
          >
            <StatusBar style="auto" />
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen
                name="Main"
                component={MainTabs}
                options={{ contentStyle: { backgroundColor: lightColors.bg } }}
              />
              <Stack.Screen
                name="Points"
                component={PointsScreen}
                options={{ contentStyle: { backgroundColor: lightColors.bg } }}
              />
              <Stack.Screen
                name="Insight"
                component={InsightScreen}
                options={{
                  contentStyle: { backgroundColor: colors.bg },
                  animation: 'slide_from_bottom',
                }}
              />
            </Stack.Navigator>
          </PostHogProvider>
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: lightColors.bg },
});
