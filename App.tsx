import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { MainTabs } from '@/navigation/MainTabs';
import { InsightScreen } from '@/screens/InsightScreen';
import { PointsScreen } from '@/screens/PointsScreen';
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
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={navTheme}>
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
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: lightColors.bg },
});
