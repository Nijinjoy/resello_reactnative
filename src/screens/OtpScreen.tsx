import { useEffect, useEffectEvent, useState } from 'react';
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
import OtpInput from '../components/OtpInput';
import type { RootStackScreenProps } from '../navigation/types';
import { requestOtp, verifyOtp } from '../services/authService';
import { stopSmsListener, waitForOtp } from '../services/smsOtp';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { formatPhone, PHONE, toE164 } from '../utils/phone';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

function OtpScreen({ navigation, route }: RootStackScreenProps<'Otp'>) {
  const { phone } = route.params;
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [smsRequest, setSmsRequest] = useState(0);

  useEffect(() => {
    if (resendIn === 0) {
      return;
    }
    const timer = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const verify = async (value: string) => {
    if (value.length !== CODE_LENGTH || verifying) {
      return;
    }
    Keyboard.dismiss();
    setVerifying(true);
    try {
      const { isNewUser } = await verifyOtp(toE164(phone), value);
      navigation.reset({
        index: 0,
        routes: [{ name: isNewUser ? 'ProfileSetup' : 'Main' }],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setVerifying(false);
    }
  };

  const handleChange = (value: string) => {
    setCode(value);
    setError(undefined);
    if (value.length === CODE_LENGTH) {
      verify(value);
    }
  };

  const fillFromSms = useEffectEvent((otp: string) => {
    if (!verifying) {
      handleChange(otp);
    }
  });

  useEffect(() => {
    let active = true;
    waitForOtp(CODE_LENGTH).then(otp => {
      if (active && otp) {
        fillFromSms(otp);
      }
    });
    return () => {
      active = false;
    };
  }, [smsRequest]);

  useEffect(() => stopSmsListener, []);

  const handleResend = async () => {
    setCode('');
    setError(undefined);
    setResendIn(RESEND_SECONDS);
    try {
      const request = requestOtp(toE164(phone));
      setSmsRequest(n => n + 1);
      await request;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resend the code');
      setResendIn(0);
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
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
        ]}
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <Button title="Back" onPress={navigation.goBack} style={styles.back}>
          <View style={styles.backChevron} />
        </Button>

        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a {CODE_LENGTH}-digit code to{'\n'}
          <Text style={styles.phone}>
            {PHONE.dialCode} {formatPhone(phone)}
          </Text>
          {'  '}
          <Text
            style={styles.link}
            onPress={navigation.goBack}
            accessibilityRole="link"
          >
            Edit
          </Text>
        </Text>

        <OtpInput
          value={code}
          onChangeValue={handleChange}
          length={CODE_LENGTH}
          error={error}
          editable={!verifying}
          autoFocus
          style={styles.otp}
        />

        <Button
          title="Verify"
          onPress={() => verify(code)}
          loading={verifying}
          disabled={code.length !== CODE_LENGTH}
          style={styles.button}
        />

        <View style={styles.resend}>
          <Text style={styles.resendText}>Didn't get the code? </Text>
          {resendIn > 0 ? (
            <Text style={styles.resendText}>
              Resend in 0:{String(resendIn).padStart(2, '0')}
            </Text>
          ) : (
            <Pressable
              onPress={handleResend}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.link}>Resend code</Text>
            </Pressable>
          )}
        </View>
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
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  backChevron: {
    width: 12,
    height: 12,
    marginLeft: 4,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.title,
    borderBottomLeftRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.title,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.body,
  },
  phone: {
    fontFamily: fonts.semibold,
    color: colors.title,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.primary,
  },
  otp: {
    marginTop: 36,
  },
  button: {
    marginTop: 28,
  },
  resend: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.body,
  },
});

export default OtpScreen;
