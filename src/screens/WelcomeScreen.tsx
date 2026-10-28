import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import type { RootStackScreenProps } from '../navigation/types';
import { fonts } from '../theme/typography';

const COLORS = {
  background: '#FAF6F0',
  primary: '#0F766E',
  accent: '#E0A458',
  title: '#1F2A2A',
  body: '#5B6B6A',
  dotInactive: '#D9CFC1',
  surface: '#FFFFFF',
};

type Language = 'en' | 'ar';

type Slide = {
  key: string;
  image: ImageSourcePropType;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    key: 'sell',
    image: require('../assets/images/onboarding/sell/welcome-sell.png'),
    title: "Sell what you don't need",
    description:
      'Snap a photo, set your price and reach buyers across the UAE in minutes.',
  },
  {
    key: 'buy',
    image: require('../assets/images/onboarding/buy/welcome-buy.png'),
    title: 'Buy pre-loved for less',
    description:
      'Discover quality second-hand finds near you and give great items a second life.',
  },
  {
    key: 'safe',
    image: require('../assets/images/onboarding/safe/welcome-safe.png'),
    title: 'Deal safely, locally',
    description: 'Chat in the app, meet nearby and trade with confidence.',
  },
];

const LANGUAGES: Record<Language, { flag: string; name: string }> = {
  en: { flag: '🇬🇧', name: 'English' },
  ar: { flag: '🇦🇪', name: 'العربية' },
};

const TRACK_WIDTH = 58;
const KNOB_SIZE = 28;
const TRACK_PADDING = 3;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - TRACK_PADDING * 2;

type LanguageToggleProps = {
  value: Language;
  onChange: (language: Language) => void;
};

function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  const isArabic = value === 'ar';
  const knobX = useRef(new Animated.Value(isArabic ? KNOB_TRAVEL : 0)).current;
  const current = LANGUAGES[value];
  const other = LANGUAGES[isArabic ? 'en' : 'ar'];

  useEffect(() => {
    Animated.spring(knobX, {
      toValue: isArabic ? KNOB_TRAVEL : 0,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [isArabic, knobX]);

  return (
    <Pressable
      onPress={() => onChange(isArabic ? 'en' : 'ar')}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Language: ${current.name}`}
      accessibilityHint={`Switches to ${other.name}`}
      style={styles.toggle}
    >
      <View style={styles.toggleTrack}>
        <Animated.View
          style={[styles.toggleKnob, { transform: [{ translateX: knobX }] }]}
        >
          <Text style={styles.toggleFlag}>{current.flag}</Text>
        </Animated.View>
      </View>
      <Text style={styles.toggleLabel}>{current.name}</Text>
    </Pressable>
  );
}

function WelcomeScreen({ navigation }: RootStackScreenProps<'Welcome'>) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const isLast = index === SLIDES.length - 1;

  const finish = () => navigation.replace('Login');

  const handleNext = () => {
    if (isLast) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1 });
    setIndex(index + 1);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <StatusBar barStyle="dark-content" animated />
      <View style={styles.header}>
        <LanguageToggle value={language} onChange={setLanguage} />
        {!isLast && (
          <Pressable onPress={finish} hitSlop={12} accessibilityRole="button">
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        )}
      </View>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image
              source={item.image}
              fadeDuration={0}
              style={styles.illustration}
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((slide, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          return (
            <Animated.View
              key={slide.key}
              style={[
                styles.dot,
                {
                  width: scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 24, 8],
                    extrapolate: 'clamp',
                  }),
                  backgroundColor: scrollX.interpolate({
                    inputRange,
                    outputRange: [
                      COLORS.dotInactive,
                      COLORS.primary,
                      COLORS.dotInactive,
                    ],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            />
          );
        })}
      </View>
      <Button
        title={isLast ? 'Get started' : 'Next'}
        onPress={handleNext}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleTrack: {
    width: TRACK_WIDTH,
    height: KNOB_SIZE + TRACK_PADDING * 2,
    padding: TRACK_PADDING,
    borderRadius: (KNOB_SIZE + TRACK_PADDING * 2) / 2,
    backgroundColor: COLORS.primary,
  },
  toggleKnob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  toggleFlag: {
    fontSize: 16,
  },
  toggleLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: COLORS.title,
  },
  skip: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: COLORS.primary,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  illustration: {
    width: 280,
    height: 280,
    marginBottom: 32,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: COLORS.title,
    textAlign: 'center',
  },
  description: {
    marginTop: 12,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.body,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    marginHorizontal: 24,
  },
});

export default WelcomeScreen;
