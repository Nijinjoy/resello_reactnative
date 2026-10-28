import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  BellRing,
  ChevronRight,
  FileText,
  Heart,
  Languages,
  LogOut,
  LucideIcon,
  MapPin,
  Package,
  Search,
  Settings,
  Star,
  Trash2,
  UserRound,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteAccount } from '../services/auth';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type MenuItem = { label: string; Icon: LucideIcon; tint: string };

const SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Buying & selling',
    items: [
      { label: 'My listings', Icon: Package, tint: colors.primary },
      { label: 'Favourites', Icon: Heart, tint: '#E0475B' },
      { label: 'Saved searches', Icon: Search, tint: '#2B7FB8' },
      { label: 'Reviews & ratings', Icon: Star, tint: '#D08A1F' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { label: 'Language', Icon: Languages, tint: '#7A4FB8' },
      { label: 'Location', Icon: MapPin, tint: '#D9604A' },
      { label: 'Notifications', Icon: BellRing, tint: '#2E9C6A' },
      { label: 'Settings', Icon: Settings, tint: '#4F5DB8' },
    ],
  },
  {
    title: 'About',
    items: [{ label: 'Terms & privacy', Icon: FileText, tint: '#5B6B6A' }],
  },
];

const APP_VERSION = '0.0.1';

const OPEN_DURATION = 450;
const CLOSE_DURATION = 380;
const EASING = Easing.inOut(Easing.cubic);

type DrawerItemProps = MenuItem & {
  onPress: () => void;
  danger?: boolean;
};

function DrawerItem({ label, Icon, tint, onPress, danger }: DrawerItemProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const springTo = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      friction: 6,
      tension: 220,
      useNativeDriver: true,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => springTo(0.96)}
      onPressOut={() => springTo(1)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.row,
            pressed && styles.rowPressed,
            { transform: [{ scale }] },
          ]}
        >
          <View
            style={[
              styles.iconTile,
              { backgroundColor: pressed ? tint : `${tint}1A` },
            ]}
          >
            <Icon
              color={pressed ? colors.onPrimary : tint}
              size={18}
              strokeWidth={2.2}
            />
          </View>
          <Text style={[styles.rowLabel, danger && { color: tint }]}>
            {label}
          </Text>
          {!danger && (
            <ChevronRight
              color={pressed ? tint : colors.body}
              size={18}
              style={pressed && styles.chevronPressed}
            />
          )}
        </Animated.View>
      )}
    </Pressable>
  );
}

function DrawerScreen({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.82, 340);
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const shown = useRef(false);

  const animateTo = (toValue: number, onDone?: () => void) => {
    progress.stopAnimation();
    Animated.timing(progress, {
      toValue,
      duration: toValue ? OPEN_DURATION : CLOSE_DURATION,
      easing: EASING,
      useNativeDriver: true,
    }).start(({ finished }) => finished && onDone?.());
  };

  // Opening waits for the Modal's onShow so the slide-in starts once the
  // drawer is actually on screen instead of dropping its first frames.
  const handleShow = () => {
    shown.current = true;
    animateTo(1);
  };

  useEffect(() => {
    if (visible) {
      setMounted(true);
      if (shown.current) {
        animateTo(1);
      }
    } else if (shown.current) {
      animateTo(0, () => {
        shown.current = false;
        setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const logOut = () => {
    onClose();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete account?',
      'This permanently removes your profile, listings and chats. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              logOut();
            } catch (e) {
              Alert.alert(
                'Could not delete account',
                e instanceof Error ? e.message : 'Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
      onShow={handleShow}
    >
      <Animated.View style={[styles.backdrop, { opacity: progress }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close profile"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 16,
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-drawerWidth, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <UserRound color={colors.primary} size={26} />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>Your profile</Text>
            <Text style={styles.subtitle}>Manage your account</Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={styles.close}
          >
            <X color={colors.title} size={22} />
          </Pressable>
        </View>

        <View style={styles.menu}>
          {SECTIONS.map(section => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map(item => (
                <DrawerItem key={item.label} {...item} onPress={onClose} />
              ))}
            </View>
          ))}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <DrawerItem
              label="Log out"
              Icon={LogOut}
              tint={colors.error}
              onPress={logOut}
              danger
            />
            <DrawerItem
              label="Delete account"
              Icon={Trash2}
              tint={colors.error}
              onPress={confirmDelete}
              danger
            />
          </View>
        </View>

        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 30, 28, 0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 4, height: 0 },
    elevation: 16,
  },
  close: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 6,
    marginBottom: 18,
  },
  profileText: {
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.title,
  },
  subtitle: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.body,
  },
  menu: {
    flex: 1,
    gap: 12,
  },
  section: {
    gap: 0,
  },
  sectionTitle: {
    marginLeft: 10,
    marginBottom: 2,
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.body,
  },
  version: {
    marginTop: 4,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.body,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 44,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronPressed: {
    transform: [{ translateX: 3 }],
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.title,
  },
});

export default DrawerScreen;
