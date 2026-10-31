import {
  BottomTabBarButtonProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import {
  Compass,
  House,
  LucideIcon,
  MessageCircle,
  SquarePlus,
} from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import DrawerScreen from '../screens/DrawerScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ExploreScreen from '../screens/ExploreScreen';
import HomeScreen from '../screens/HomeScreen';
import SellScreen from '../screens/SellScreen';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, LucideIcon> = {
  Home: House,
  Explore: Compass,
  Sell: SquarePlus,
  Chats: MessageCircle,
};

const ACTIVE_PILL = '#E2EFEC';

type IconProps = { Icon: LucideIcon; focused: boolean; color: string };

function TabIcon({ Icon, focused, color }: IconProps) {
  return (
    <View style={[styles.pill, focused && styles.pillActive]}>
      <Icon
        color={color}
        size={22}
        strokeWidth={focused ? 2.4 : 1.9}
        fill={focused ? color : 'none'}
        fillOpacity={0.18}
      />
    </View>
  );
}

const renderIcon =
  (Icon: LucideIcon) =>
  ({ focused, color }: { focused: boolean; color: string }) =>
    <TabIcon Icon={Icon} focused={focused} color={color} />;

const renderTabButton = ({
  children,
  style,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  testID,
}: BottomTabBarButtonProps) => (
  <Pressable
    style={style}
    onPress={onPress}
    onLongPress={onLongPress}
    accessibilityRole="button"
    accessibilityState={accessibilityState}
    accessibilityLabel={accessibilityLabel}
    testID={testID}
  >
    {children}
  </Pressable>
);

function MainTabs() {
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View style={styles.container}>
      <AppHeader
        onMenuPress={() => setDrawerOpen(true)}
        onNotificationsPress={() => {}}
        hasUnread
      />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.body,
          tabBarLabelStyle: styles.label,
          tabBarStyle: [
            styles.bar,
            { height: 68 + insets.bottom, paddingBottom: insets.bottom + 6 },
          ],
          tabBarItemStyle: styles.item,
          tabBarButton: renderTabButton,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarIcon: renderIcon(ICONS.Home) }}
        />
        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{ tabBarIcon: renderIcon(ICONS.Explore) }}
        />
        <Tab.Screen
          name="Sell"
          component={SellScreen}
          options={{ tabBarIcon: renderIcon(ICONS.Sell) }}
        />
        <Tab.Screen
          name="Chats"
          component={ChatsScreen}
          options={{ tabBarIcon: renderIcon(ICONS.Chats) }}
        />
      </Tab.Navigator>
      <DrawerScreen visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  bar: {
    paddingTop: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  item: {
    paddingVertical: 2,
  },
  label: {
    marginTop: 4,
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  pill: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: ACTIVE_PILL,
  },
});

export default MainTabs;
