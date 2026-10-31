import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageCircle, Search, X } from 'lucide-react-native';
import { Chat, CHATS } from '../data/chats';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { avatarTint, formatTime, initials } from '../utils/chat';

const AVATAR_SIZE = 52;
const ROW_GAP = 14;
const GUTTER = 20;

function ChatRow({ chat, onPress }: { chat: Chat; onPress: () => void }) {
  const unread = chat.unreadCount > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${chat.name} about ${chat.listing.title}${
        unread ? `, ${chat.unreadCount} unread` : ''
      }`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarTint(chat.name) }]}>
        <Text style={styles.avatarText}>{initials(chat.name)}</Text>
      </View>

      <View style={styles.rowBody}>
        <View style={styles.rowLine}>
          <Text style={styles.name} numberOfLines={1}>
            {chat.name}
          </Text>
          <Text style={[styles.time, unread && styles.timeUnread]}>
            {formatTime(chat.sentAt)}
          </Text>
        </View>
        <View style={styles.rowLine}>
          <Text
            style={[styles.preview, unread && styles.previewUnread]}
            numberOfLines={1}
          >
            {chat.fromMe ? `You: ${chat.lastMessage}` : chat.lastMessage}
          </Text>
          {unread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{chat.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <MessageCircle color={colors.primary} size={28} strokeWidth={2} />
      </View>
      <Text style={styles.emptyTitle}>
        {query ? 'No matches' : 'No chats yet'}
      </Text>
      <Text style={styles.emptyBody}>
        {query
          ? `Nothing found for “${query}”.`
          : 'Your conversations with buyers and sellers will show up here.'}
      </Text>
    </View>
  );
}

function ChatsScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const search = query.trim();

  const chats = useMemo(() => {
    const q = search.toLowerCase();
    return CHATS.filter(
      chat =>
        !q ||
        chat.name.toLowerCase().includes(q) ||
        chat.listing.title.toLowerCase().includes(q),
    ).sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }, [search]);

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={chat => chat.id}
        renderItem={({ item }) => (
          <ChatRow
            chat={item}
            onPress={() => navigation.navigate('Chat', { chatId: item.id })}
          />
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={<EmptyState query={search} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.search}>
              <Search color={colors.body} size={18} strokeWidth={2} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search chats"
                placeholderTextColor={colors.placeholder}
                returnKeyType="search"
                autoCorrect={false}
                accessibilityLabel="Search chats"
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
          </View>
        }
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
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: GUTTER,
    paddingTop: 16,
    paddingBottom: 8,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ROW_GAP,
    paddingHorizontal: GUTTER,
    paddingVertical: 12,
  },
  rowPressed: {
    backgroundColor: '#F1EADF',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.onPrimary,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.title,
  },
  time: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.body,
  },
  timeUnread: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  preview: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.body,
  },
  previewUnread: {
    fontFamily: fonts.semibold,
    color: colors.title,
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.onPrimary,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: GUTTER + AVATAR_SIZE + ROW_GAP,
    backgroundColor: colors.border,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
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
    lineHeight: 20,
    textAlign: 'center',
    color: colors.body,
  },
});

export default ChatsScreen;
