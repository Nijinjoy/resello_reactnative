import { ComponentRef, useRef, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  value: string;
  onChangeValue: (code: string) => void;
  length?: number;
  error?: string;
  editable?: boolean;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
};

function OtpInput({
  value,
  onChangeValue,
  length = 6,
  error,
  editable = true,
  autoFocus = false,
  style,
}: Props) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(autoFocus);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View style={style}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessible={false}
        style={styles.row}
      >
        {Array.from({ length }, (_, i) => {
          let borderColor: string = colors.border;
          if (error) {
            borderColor = colors.error;
          } else if (focused && i === activeIndex) {
            borderColor = colors.primary;
          }
          return (
            <View key={i} style={[styles.box, { borderColor }]}>
              <Text style={styles.digit}>{value[i] ?? ''}</Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={text =>
          onChangeValue(text.replace(/\D/g, '').slice(0, length))
        }
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={length}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus={autoFocus}
        editable={editable}
        caretHidden
        accessibilityLabel={`${length}-digit verification code`}
        style={styles.hiddenInput}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  box: {
    flex: 1,
    maxWidth: 52,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    color: colors.title,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  error: {
    marginTop: 10,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
  },
});

export default OtpInput;
