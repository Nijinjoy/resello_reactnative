import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ArrowRight, Tag } from 'lucide-react-native';
import ListingCard from '../components/ListingCard';
import { CATEGORIES, CATEGORY_ICONS } from '../data/categories';
import { LISTINGS } from '../data/listings';
import type { MainTabParamList } from '../navigation/types';
import { getSavedUser } from '../services/session';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const GUTTER = 20;
const CARD_GAP = 12;
const FEATURED_WIDTH = 216;

const FEATURED = LISTINGS.filter(listing => listing.featured);

function HomeScreen({ navigation }: BottomTabScreenProps<MainTabParamList>) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - GUTTER * 2 - CARD_GAP) / 2;
  const [firstName, setFirstName] = useState<string>();
  const [favourites, setFavourites] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    getSavedUser()
      .then(user => setFirstName(user?.fullName?.split(' ')[0]))
      .catch(() => undefined);
  }, []);

  const toggleFavourite = (id: string) =>
    setFavourites(current => {
      const next = new Set(current);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });

  const header = (
    <>
      <Text style={styles.greeting}>
        {firstName ? `Hi, ${firstName}` : 'Welcome back'}
      </Text>
      <Text style={styles.heading}>Fresh finds for you</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(key => {
          const { label, Icon, tint } = CATEGORY_ICONS[key];
          return (
            <Pressable
              key={key}
              onPress={() => navigation.navigate('Explore', { category: key })}
              accessibilityRole="button"
              accessibilityLabel={label}
              style={styles.category}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: `${tint}1A` }]}
              >
                <Icon color={tint} size={24} strokeWidth={2} />
              </View>
              <Text style={styles.categoryLabel}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={() => navigation.navigate('Sell')}
        accessibilityRole="button"
        accessibilityLabel="Sell an item"
        style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
      >
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Got something to sell?</Text>
          <Text style={styles.bannerSubtitle}>
            Turn what you don't use into cash.
          </Text>
          <View style={styles.bannerAction}>
            <Text style={styles.bannerActionText}>List an item</Text>
            <ArrowRight color={colors.title} size={15} strokeWidth={2.4} />
          </View>
        </View>
        <View style={styles.bannerIcon}>
          <Tag color={colors.accent} size={34} strokeWidth={1.8} />
        </View>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending now</Text>
        <Pressable
          onPress={() => navigation.navigate('Explore')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="See all listings"
        >
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.featured}
        contentContainerStyle={styles.featuredContent}
      >
        {FEATURED.map(listing => (
          <ListingCard
            key={listing.id}
            listing={listing}
            width={FEATURED_WIDTH}
            favourite={favourites.has(listing.id)}
            onToggleFavourite={() => toggleFavourite(listing.id)}
          />
        ))}
      </ScrollView>

      <Text style={[styles.sectionTitle, styles.feedTitle]}>
        Fresh listings
      </Text>
    </>
  );

  return (
    <FlatList
      data={LISTINGS}
      keyExtractor={listing => listing.id}
      numColumns={2}
      extraData={favourites}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <ListingCard
          listing={item}
          width={cardWidth}
          favourite={favourites.has(item.id)}
          onToggleFavourite={() => toggleFavourite(item.id)}
        />
      )}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: 16,
    paddingBottom: 24,
    gap: CARD_GAP,
  },
  column: {
    gap: CARD_GAP,
  },
  pressed: {
    opacity: 0.8,
  },
  greeting: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.body,
  },
  heading: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.title,
  },
  categories: {
    marginTop: 20,
    marginHorizontal: -GUTTER,
  },
  categoriesContent: {
    paddingHorizontal: GUTTER,
    gap: 14,
  },
  category: {
    width: 64,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    marginTop: 6,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.body,
  },
  banner: {
    marginTop: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  bannerText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  bannerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.onPrimary,
  },
  bannerSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.onPrimary,
    opacity: 0.85,
  },
  bannerAction: {
    marginTop: 12,
    height: 34,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  bannerActionText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.title,
  },
  bannerIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.title,
  },
  seeAll: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
  featured: {
    marginTop: 12,
    marginHorizontal: -GUTTER,
  },
  featuredContent: {
    paddingHorizontal: GUTTER,
    gap: CARD_GAP,
  },
  feedTitle: {
    marginTop: 24,
  },
});

export default HomeScreen;
