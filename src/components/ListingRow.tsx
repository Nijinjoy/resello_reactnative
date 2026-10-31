import { Heart } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_ICONS } from '../data/categories';
import type { Listing } from '../data/listings';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { FAVOURITE_TINT, formatAge } from '../utils/listing';
import { formatPrice } from '../utils/price';

type Props = {
  listing: Listing;
  favourite: boolean;
  onToggleFavourite: () => void;
};

function ListingRow({ listing, favourite, onToggleFavourite }: Props) {
  const { Icon, tint } = CATEGORY_ICONS[listing.category];

  return (
    <View style={styles.row}>
      <View style={[styles.thumb, { backgroundColor: `${tint}14` }]}>
        <Icon color={tint} size={36} strokeWidth={1.6} />
      </View>

      <View style={styles.details}>
        <View style={styles.top}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>
          <Pressable
            onPress={onToggleFavourite}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityState={{ selected: favourite }}
            accessibilityLabel={`Favourite ${listing.title}`}
          >
            <Heart
              color={favourite ? FAVOURITE_TINT : colors.body}
              fill={favourite ? FAVOURITE_TINT : 'none'}
              size={19}
              strokeWidth={2}
            />
          </Pressable>
        </View>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {listing.condition} · {listing.location} ·{' '}
          {formatAge(listing.postedAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.title,
  },
  price: {
    fontFamily: fonts.extrabold,
    fontSize: 16,
    color: colors.primary,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.body,
  },
});

export default ListingRow;
