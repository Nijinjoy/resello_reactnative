import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Slide = {
  key: string;
  image: ImageSourcePropType;
  tint: string;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    key: 'sell',
    image: require('../assets/images/onboarding/sell/welcome-sell.png'),
    tint: colors.background,
    title: "Sell what you don't need",
    description:
      'Snap a photo, set your price and reach buyers across the UAE in minutes.',
  },
  {
    key: 'buy',
    image: require('../assets/images/onboarding/buy/welcome-buy.png'),
    tint: '#E6F2EE',
    title: 'Buy pre-loved for less',
    description:
      'Discover quality second-hand finds near you and give great items a second life.',
  },
  {
    key: 'safe',
    image: require('../assets/images/onboarding/safe/welcome-safe.png'),
    tint: '#FBEEDB',
    title: 'Deal safely, locally',
    description: 'Chat in the app, meet nearby and trade with confidence.',
  },
];

function WelcomeScreen({ navigation }: RootStackScreenProps<'Welcome'>) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const illustrationSize = Math.min(width * 0.8, height * 0.38, 340);

  const atSlide = (i: number, outputRange: number[]) =>
    scrollX.interpolate({
      inputRange: [(i - 1) * width, i * width, (i + 1) * width],
      outputRange,
      extrapolate: 'clamp',
    });

  const handleScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: true,
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width)),
      }),
    [scrollX, width],
  );

  const finish = () => navigation.replace('Login');
  const goTo = (target: number) =>
    listRef.current?.scrollToIndex({ index: target });

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <StatusBar barStyle="dark-content" animated />
      {SLIDES.map((slide, i) => (
        <Animated.View
          key={slide.key}
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: slide.tint, opacity: atSlide(i, [0, 1, 0]) },
          ]}
        />
      ))}

      <View style={styles.header}>
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
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        renderItem={({ item, index: i }) => (
          <View style={[styles.slide, { width }]}>
            <Animated.Image
              source={item.image}
              fadeDuration={0}
              style={{
                width: illustrationSize,
                height: illustrationSize,
                opacity: atSlide(i, [0, 1, 0]),
                transform: [
                  { translateX: atSlide(i, [width * 0.3, 0, -width * 0.3]) },
                  { scale: atSlide(i, [0.8, 1, 0.8]) },
                ],
              }}
            />
            <Animated.View
              style={{
                opacity: atSlide(i, [0, 1, 0]),
                transform: [
                  { translateX: atSlide(i, [width * 0.2, 0, -width * 0.2]) },
                ],
              }}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((slide, i) => (
          <Pressable
            key={slide.key}
            onPress={() => goTo(i)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={slide.title}
            accessibilityState={{ selected: i === index }}
          >
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: atSlide(i, [0.25, 1, 0.25]),
                  transform: [{ scale: atSlide(i, [1, 1.4, 1]) }],
                },
              ]}
            />
          </Pressable>
        ))}
      </View>
      <Button
        title={isLast ? 'Get started' : 'Next'}
        onPress={() => (isLast ? finish() : goTo(index + 1))}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skip: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.primary,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    marginTop: 32,
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.title,
    textAlign: 'center',
  },
  description: {
    marginTop: 12,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.body,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  button: {
    marginHorizontal: 24,
  },
});

export default WelcomeScreen;
