import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ArrowUpDown, PackageSearch, Search, X } from 'lucide-react-native';
import ActionSheet from '../components/ActionSheet';
import ListingRow from '../components/ListingRow';
import { CATEGORIES, CATEGORY_ICONS } from '../data/categories';
import type { ListingCategory } from '../data/chats';
import { Listing, LISTINGS } from '../data/listings';
import type { MainTabParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const GUTTER = 20;

type Sort = 'newest' | 'priceLow' | 'priceHigh';

const SORTS: Record<
  Sort,
  { label: string; compare: (a: Listing, b: Listing) => number }
> = {
  newest: {
    label: 'Newest',
    compare: (a, b) => b.postedAt.getTime() - a.postedAt.getTime(),
  },
  priceLow: {
    label: 'Price: low to high',
    compare: (a, b) => a.price - b.price,
  },
  priceHigh: {
    label: 'Price: high to low',
    compare: (a, b) => b.price - a.price,
  },
};

function ExploreScreen({
  navigation,
  route,
}: BottomTabScreenProps<MainTabParamList, 'Explore'>) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ListingCategory>();
  const [sort, setSort] = useState<Sort>('newest');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [favourites, setFavourites] = useState<ReadonlySet<string>>(new Set());
  const search = query.trim().toLowerCase();

  const requestedCategory = route.params?.category;
  useEffect(() => {
    if (requestedCategory) {
      setCategory(requestedCategory);
      setQuery('');
      navigation.setParams({ category: undefined });
    }
  }, [requestedCategory, navigation]);

  const listings = useMemo(
    () =>
      LISTINGS.filter(
        listing =>
          (!category || listing.category === category) &&
          (!search ||
            listing.title.toLowerCase().includes(search) ||
            listing.location.toLowerCase().includes(search)),
      ).sort(SORTS[sort].compare),
    [category, search, sort],
  );

  const toggleFavourite = (id: string) =>
    setFavourites(current => {
      const next = new Set(current);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });

  const clearFilters = () => {
    setQuery('');
    setCategory(undefined);
  };

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <Search color={colors.body} size={18} strokeWidth={2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search items or locations"
          placeholderTextColor={colors.placeholder}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search listings"
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={styles.clear}
          >
            <X color={colors.surface} size={12} strokeWidth={3} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={styles.chips}
        contentContainerStyle={styles.chipsContent}
      >
        <Pressable
          onPress={() => setCategory(undefined)}
          accessibilityRole="button"
          accessibilityState={{ selected: !category }}
          accessibilityLabel="All"
          style={[styles.chip, !category && styles.chipSelected]}
        >
          <Text style={[styles.chipText, !category && styles.chipTextSelected]}>
            All
          </Text>
        </Pressable>
        {CATEGORIES.map(key => {
          const { label, Icon, tint } = CATEGORY_ICONS[key];
          const selected = key === category;
          return (
            <Pressable
              key={key}
              onPress={() => setCategory(selected ? undefined : key)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={label}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Icon
                color={selected ? colors.onPrimary : tint}
                size={16}
                strokeWidth={2.2}
              />
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.toolbar}>
        <Text style={styles.count}>
          {listings.length} {listings.length === 1 ? 'item' : 'items'}
        </Text>
        <Pressable
          onPress={() => setSortSheetOpen(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Sort by ${SORTS[sort].label}`}
          style={styles.sort}
        >
          <ArrowUpDown color={colors.primary} size={15} strokeWidth={2.2} />
          <Text style={styles.sortText}>{SORTS[sort].label}</Text>
        </Pressable>
      </View>

      <FlatList
        data={listings}
        keyExtractor={listing => listing.id}
        extraData={favourites}
        renderItem={({ item }) => (
          <ListingRow
            listing={item}
            favourite={favourites.has(item.id)}
            onToggleFavourite={() => toggleFavourite(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <PackageSearch color={colors.primary} size={28} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptyBody}>
              Try a different search or category.
            </Text>
            <Pressable
              onPress={clearFilters}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear filters"
            >
              <Text style={styles.emptyAction}>Clear filters</Text>
            </Pressable>
          </View>
        }
        ItemSeparatorComponent={Separator}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <ActionSheet
        visible={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        title="Sort by"
        options={(Object.keys(SORTS) as Sort[]).map(key => ({
          label: SORTS[key].label,
          onPress: () => setSort(key),
        }))}
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    marginHorizontal: GUTTER,
    marginTop: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.title,
  },
  clear: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.body,
  },
  chips: {
    flexGrow: 0,
    marginTop: 12,
  },
  chipsContent: {
    paddingHorizontal: GUTTER,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.title,
  },
  chipTextSelected: {
    fontFamily: fonts.semibold,
    color: colors.onPrimary,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GUTTER,
    paddingVertical: 14,
  },
  count: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.title,
  },
  sort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: GUTTER,
    paddingBottom: 24,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#E2EFEC',
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.title,
  },
  emptyBody: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    color: colors.body,
  },
  emptyAction: {
    marginTop: 14,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
});

export default ExploreScreen;
