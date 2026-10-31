import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const BASE_SIZE = 56;
const BASE_RING = 34;

type Props = {
  size?: number;
  shape?: 'tile' | 'circle' | 'bare';
  color?: string;
  style?: StyleProp<ViewStyle>;
};

function LogoMark({
  size = BASE_SIZE,
  shape = 'tile',
  color = colors.primary,
  style,
}: Props) {
  const bare = shape === 'bare';
  const k = size / (bare ? BASE_RING : BASE_SIZE);
  const ring = BASE_RING * k;
  const dot = 6 * k;
  const dotInset = (bare ? -1 : 10) * k;

  return (
    <View
      accessibilityLabel="Resello"
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: shape === 'tile' ? 14 * k : size / 2,
        },
        !bare && styles.backing,
        style,
      ]}
    >
      <View
        style={[
          styles.ring,
          {
            width: ring,
            height: ring,
            borderRadius: ring / 2,
            borderWidth: 4 * k,
            borderColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            top: dotInset,
            right: dotInset,
            width: dot,
            height: dot,
            borderRadius: dot / 2,
          },
        ]}
      />
      <Text
        allowFontScaling={false}
        style={[
          styles.letter,
          {
            marginTop: -2 * k,
            marginLeft: 2 * k,
            fontSize: 22 * k,
            color,
          },
        ]}
      >
        r
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backing: {
    backgroundColor: colors.surface,
  },
  ring: {
    position: 'absolute',
    borderTopColor: colors.accent,
    borderRightColor: 'transparent',
    transform: [{ rotate: '-20deg' }],
  },
  dot: {
    position: 'absolute',
    backgroundColor: colors.accent,
  },
  letter: {
    fontFamily: fonts.extrabold,
  },
});

export default LogoMark;
