import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import GoogleButton from '../components/GoogleButton';
import LogoMark from '../components/LogoMark';
import PhoneInput from '../components/PhoneInput';
import type { RootStackScreenProps } from '../navigation/types';
import { requestOtp, signInWithGoogle } from '../services/authService';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { isValidPhone, PHONE, toE164 } from '../utils/phone';

function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string>();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (digits: string) => {
    setPhone(digits);
    setError(undefined);
  };

  const handleContinue = async () => {
    if (!isValidPhone(phone)) {
      setError(`Enter a valid UAE mobile number, e.g. ${PHONE.example}`);
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    try {
      await requestOtp(toE164(phone));
      navigation.navigate('Otp', { phone });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    Keyboard.dismiss();
    setGoogleError(undefined);
    setGoogleLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();
      navigation.reset({
        index: 0,
        routes: [{ name: isNewUser ? 'ProfileSetup' : 'Main' }],
      });
    } catch (e) {
      setGoogleError(e instanceof Error ? e.message : 'Something went wrong');
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <Pressable
        style={[
          styles.content,
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 },
        ]}
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <View style={styles.header}>
          <LogoMark style={styles.logo} />
          <Text style={styles.title}>Log in with your phone</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number. We'll log you in or create your account.
          </Text>
        </View>

        <PhoneInput
          label="Mobile number"
          value={phone}
          onChangeValue={handleChange}
          onSubmitEditing={handleContinue}
          error={error}
          editable={!loading && !googleLoading}
          returnKeyType="done"
          style={styles.field}
        />

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={googleLoading}
          style={styles.button}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <GoogleButton
          onPress={handleGoogle}
          loading={googleLoading}
          disabled={loading}
        />
        {googleError && <Text style={styles.googleError}>{googleError}</Text>}

        <Text style={styles.terms}>
          By continuing, you agree to our Terms and Privacy Policy.
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    marginBottom: 28,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.title,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    paddingHorizontal: 8,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.body,
    textAlign: 'center',
  },
  field: {
    marginTop: 40,
  },
  button: {
    marginTop: 24,
  },
  divider: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.body,
  },
  dividerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.body,
  },
  googleError: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  terms: {
    marginTop: 18,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.body,
    textAlign: 'center',
  },
});

export default LoginScreen;
