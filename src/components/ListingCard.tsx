import { Heart, MapPin } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_ICONS } from '../data/categories';
import type { Listing } from '../data/listings';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { FAVOURITE_TINT, formatAge } from '../utils/listing';
import { formatPrice } from '../utils/price';

type Props = {
  listing: Listing;
  width: number;
  favourite: boolean;
  onToggleFavourite: () => void;
};

function ListingCard({ listing, width, favourite, onToggleFavourite }: Props) {
  const { Icon, tint } = CATEGORY_ICONS[listing.category];

  return (
    <View style={[styles.card, { width }]}>
      <View style={[styles.media, { backgroundColor: `${tint}14` }]}>
        <Icon color={tint} size={44} strokeWidth={1.6} />
        <View style={styles.condition}>
          <Text style={styles.conditionText}>{listing.condition}</Text>
        </View>
        <Pressable
          onPress={onToggleFavourite}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: favourite }}
          accessibilityLabel={`Favourite ${listing.title}`}
          style={styles.favourite}
        >
          <Heart
            color={favourite ? FAVOURITE_TINT : colors.title}
            fill={favourite ? FAVOURITE_TINT : 'none'}
            size={17}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>
      <View style={styles.details}>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <View style={styles.meta}>
          <MapPin color={colors.body} size={12} />
          <Text style={styles.metaText} numberOfLines={1}>
            {listing.location}
          </Text>
          <Text style={styles.age}>{formatAge(listing.postedAt)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  media: {
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  condition: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  conditionText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.title,
  },
  favourite: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  details: {
    padding: 12,
  },
  price: {
    fontFamily: fonts.extrabold,
    fontSize: 16,
    color: colors.primary,
  },
  title: {
    marginTop: 4,
    minHeight: 38,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.title,
  },
  meta: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.body,
  },
  age: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.body,
  },
});

export default ListingCard;
