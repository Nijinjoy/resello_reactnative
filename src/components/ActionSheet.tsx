import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export type ActionSheetOption = {
  label: string;
  Icon?: LucideIcon;
  destructive?: boolean;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  title?: string;
  message?: string;
  cancelLabel?: string;
};

const OPEN_DURATION = 300;
const CLOSE_DURATION = 240;
const EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

function ActionSheet({
  visible,
  onClose,
  options,
  title,
  message,
  cancelLabel = 'Cancel',
}: Props) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(400);
  const shown = useRef(false);
  const pending = useRef<(() => void) | null>(null);

  const animateTo = (toValue: number, onDone?: () => void) => {
    progress.stopAnimation();
    Animated.timing(progress, {
      toValue,
      duration: toValue ? OPEN_DURATION : CLOSE_DURATION,
      easing: EASING,
      useNativeDriver: true,
    }).start(({ finished }) => finished && onDone?.());
  };

  const runPending = () => {
    const action = pending.current;
    pending.current = null;
    action?.();
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
        if (Platform.OS !== 'ios') {
          runPending();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const choose = (option: ActionSheetOption) => {
    pending.current = option.onPress;
    onClose();
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
      onShow={() => {
        shown.current = true;
        animateTo(1);
      }}
      onDismiss={runPending}
    >
      <Animated.View style={[styles.backdrop, { opacity: progress }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel={cancelLabel}
        />
      </Animated.View>

      <Animated.View
        onLayout={e => setSheetHeight(e.nativeEvent.layout.height)}
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + 16,
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [sheetHeight, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.handle} />

        {(title || message) && (
          <View style={styles.header}>
            {title && <Text style={styles.title}>{title}</Text>}
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
        )}

        <View style={styles.options}>
          {options.map(option => {
            const tint = option.destructive ? colors.error : colors.primary;
            const { Icon } = option;
            return (
              <Pressable
                key={option.label}
                onPress={() => choose(option)}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.optionPressed,
                ]}
              >
                {Icon && (
                  <View
                    style={[styles.iconTile, { backgroundColor: `${tint}1A` }]}
                  >
                    <Icon color={tint} size={20} strokeWidth={2.2} />
                  </View>
                )}
                <Text
                  style={[
                    styles.optionLabel,
                    option.destructive && { color: colors.error },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          style={({ pressed }) => [
            styles.cancel,
            pressed && styles.cancelPressed,
          ]}
        >
          <Text style={styles.cancelLabel}>{cancelLabel}</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 30, 28, 0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
    backgroundColor: colors.border,
  },
  header: {
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.title,
  },
  message: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
  },
  options: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    paddingHorizontal: 14,
  },
  optionPressed: {
    backgroundColor: colors.background,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.title,
  },
  cancel: {
    height: 54,
    marginTop: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  cancelPressed: {
    backgroundColor: colors.border,
  },
  cancelLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.body,
  },
});

export default ActionSheet;
