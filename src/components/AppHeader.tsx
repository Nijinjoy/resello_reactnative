import { Bell } from 'lucide-react-native';
import { Image, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

type Props = {
  onMenuPress: () => void;
  onNotificationsPress: () => void;
  hasUnread?: boolean;
};

function AppHeader({
  onMenuPress,
  onNotificationsPress,
  hasUnread = false,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.brand}>
        <Pressable
          onPress={onMenuPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Menu"
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={[styles.menuLine, styles.menuLineShort]} />
            <View style={styles.menuLine} />
          </View>
        </Pressable>

        <Image
          source={require('../assets/images/logo/logo-color.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Resello"
        />
      </View>

      <Pressable
        onPress={onNotificationsPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          hasUnread ? 'Notifications, unread' : 'Notifications'
        }
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Bell color={colors.title} size={22} strokeWidth={2} />
        {hasUnread && <View style={styles.badge} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  logo: {
    width: 112,
    height: 32,
    transform: [{ translateY: -4 }],
  },
  menuButton: {
    height: 42,
    justifyContent: 'center',
  },
  menuIcon: {
    gap: 5,
  },
  menuLine: {
    width: 22,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.title,
  },
  menuLineShort: {
    width: 13,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  pressed: {
    opacity: 0.75,
  },
});

export default AppHeader;
