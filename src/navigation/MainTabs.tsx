import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ChanceTabBar } from '@/components/ChanceTabBar';
import { CameraScreen } from '@/screens/CameraScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import type { MainTabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <ChanceTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: false,
      }}
      initialRouteName="Camera"
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
