import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogoMark from '../components/LogoMark';
import type { RootStackScreenProps } from '../navigation/types';
import { restoreSession } from '../services/authService';
import { fonts } from '../theme/typography';

const LOGO_TEXT = require('../assets/images/logo/logo-text-white.png');

const COLORS = {
  background: '#0F766E',
  subtitle: 'rgba(255, 255, 255, 0.8)',
  dot: '#E0A458',
  mark: '#FFFFFF',
};

function SplashScreen({ navigation }: RootStackScreenProps<'Splash'>) {
  const insets = useSafeAreaInsets();
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textOffset = useRef(new Animated.Value(12)).current;
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.stagger(
        150,
        dots.map(dot =>
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
    );

    const intro = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textOffset, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
    ]);

    const session = restoreSession();

    pulse.start();
    intro.start(async ({ finished }) => {
      if (finished) {
        navigation.replace(await session);
      }
    });

    return () => {
      intro.stop();
      pulse.stop();
    };
  }, [dots, logoOpacity, logoScale, navigation, textOffset, textOpacity]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" animated />
      <View style={styles.center}>
        <Animated.View
          accessible
          accessibilityLabel="Resello"
          style={[
            styles.logo,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image
            source={LOGO_TEXT}
            resizeMode="contain"
            fadeDuration={0}
            style={styles.logoText}
          />
          <LogoMark
            shape="bare"
            size={40}
            color={COLORS.mark}
            style={styles.logoMark}
          />
        </Animated.View>
        <Animated.Text
          style={[
            styles.subtitle,
            { opacity: textOpacity, transform: [{ translateY: textOffset }] },
          ]}
        >
          Buy. Sell. Repeat.
        </Animated.Text>
      </View>
      <View style={[styles.dots, { marginBottom: insets.bottom + 48 }]}>
        {dots.map((dot, index) => (
          <Animated.View key={index} style={[styles.dot, { opacity: dot }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  logoText: {
    width: 193,
    height: 67,
  },
  logoMark: {
    marginLeft: 5,
    marginBottom: 2,
  },
  subtitle: {
    marginTop: 16,
    fontFamily: fonts.regular,
    fontSize: 15,
    letterSpacing: 1,
    color: COLORS.subtitle,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.dot,
  },
});

export default SplashScreen;
