import { ComponentRef, ReactNode, Ref, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = Omit<TextInputProps, 'style'> & {
  label?: string;
  // Shown as the field's message and turns the border red.
  error?: string;
  // Fixed content on the left, separated by a divider (e.g. a dial code).
  prefix?: ReactNode;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

function Input({
  label,
  error,
  prefix,
  style,
  onFocus,
  onBlur,
  accessibilityLabel,
  ref,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);

  let borderColor: string = colors.border;
  if (error) {
    borderColor = colors.error;
  } else if (focused) {
    borderColor = colors.primary;
  }

  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.field, { borderColor }]}>
        {prefix && <View style={styles.prefix}>{prefix}</View>}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.placeholder}
          accessibilityLabel={accessibilityLabel ?? label}
          {...inputProps}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={styles.input}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 10,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.title,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: '100%',
    paddingHorizontal: 16,
    borderRightWidth: 1.5,
    borderRightColor: colors.border,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    letterSpacing: 0.3,
    color: colors.title,
  },
  error: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
  },
});

export default Input;
