import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronLeft, SendHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_ICONS } from '../data/categories';
import { CHATS, Message, sampleMessages } from '../data/chats';
import type { RootStackScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { avatarTint, formatTime, initials } from '../utils/chat';
import { formatPrice } from '../utils/price';

function MessageBubble({ message }: { message: Message }) {
  const { fromMe, text, sentAt } = message;

  return (
    <View style={[styles.bubble, fromMe ? styles.mine : styles.theirs]}>
      <Text style={[styles.text, fromMe && styles.textMine]}>{text}</Text>
      <Text style={[styles.time, fromMe && styles.timeMine]}>
        {formatTime(sentAt)}
      </Text>
    </View>
  );
}

function ChatScreen({ navigation, route }: RootStackScreenProps<'Chat'>) {
  const insets = useSafeAreaInsets();
  const chat = CHATS.find(({ id }) => id === route.params.chatId);
  const [messages, setMessages] = useState(() =>
    chat ? sampleMessages(chat) : [],
  );
  const [draft, setDraft] = useState('');

  if (!chat) {
    return null;
  }

  const { Icon, tint } = CATEGORY_ICONS[chat.listing.category];
  const text = draft.trim();

  const send = () => {
    const sentAt = new Date();
    setMessages(current => [
      { id: String(sentAt.getTime()), text, fromMe: true, sentAt },
      ...current,
    ]);
    setDraft('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={navigation.goBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.back}
        >
          <ChevronLeft color={colors.title} size={26} />
        </Pressable>
        <View
          style={[styles.avatar, { backgroundColor: avatarTint(chat.name) }]}
        >
          <Text style={styles.avatarText}>{initials(chat.name)}</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {chat.name}
        </Text>
      </View>

      <View style={styles.listing}>
        <View style={[styles.listingIcon, { backgroundColor: `${tint}1A` }]}>
          <Icon color={tint} size={20} strokeWidth={1.9} />
        </View>
        <Text style={styles.listingTitle} numberOfLines={1}>
          {chat.listing.title}
        </Text>
        <Text style={styles.listingPrice}>
          {formatPrice(chat.listing.price)}
        </Text>
      </View>

      <KeyboardAvoidingView behavior="padding" style={styles.thread}>
        <FlatList
          inverted
          data={messages}
          keyExtractor={message => message.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message"
            placeholderTextColor={colors.placeholder}
            multiline
            accessibilityLabel="Message"
            style={styles.input}
          />
          <Pressable
            onPress={send}
            disabled={!text}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !text }}
            style={[styles.send, !text && styles.sendDisabled]}
          >
            <SendHorizontal color={colors.onPrimary} size={20} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      {/* Sits outside the avoiding view so no gap shows above the keyboard. */}
      <View style={[styles.safeArea, { height: insets.bottom }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  back: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.onPrimary,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.title,
  },
  listing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  listingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingTitle: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.title,
  },
  listingPrice: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.primary,
  },
  thread: {
    flex: 1,
  },
  messages: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  mine: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
    backgroundColor: colors.primary,
  },
  theirs: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    backgroundColor: colors.surface,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: colors.title,
  },
  textMine: {
    color: colors.onPrimary,
  },
  time: {
    marginTop: 3,
    alignSelf: 'flex-end',
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.body,
  },
  timeMine: {
    color: colors.onPrimary,
    opacity: 0.75,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    borderRadius: 22,
    backgroundColor: colors.background,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.title,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  sendDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  safeArea: {
    backgroundColor: colors.surface,
  },
});

export default ChatScreen;
