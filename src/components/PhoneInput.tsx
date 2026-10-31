import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { formatPhone, normalizePhone, PHONE } from '../utils/phone';
import Input from './Input';

type Props = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChangeText' | 'prefix'
> & {
  value: string;
  onChangeValue: (digits: string) => void;
};

function PhoneInput({ value, onChangeValue, ...inputProps }: Props) {
  return (
    <Input
      prefix={
        <>
          <Text style={styles.flag}>{PHONE.flag}</Text>
          <Text style={styles.dialCode}>{PHONE.dialCode}</Text>
        </>
      }
      value={formatPhone(value)}
      onChangeText={text => onChangeValue(normalizePhone(text))}
      placeholder={PHONE.example}
      keyboardType="phone-pad"
      textContentType="telephoneNumber"
      autoComplete="tel"
      {...inputProps}
    />
  );
}

const styles = StyleSheet.create({
  flag: {
    fontSize: 18,
  },
  dialCode: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.title,
  },
});

export default PhoneInput;
