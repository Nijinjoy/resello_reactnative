import React from 'react';
import { Text, TextInput } from 'react-native';
import ReactTestRenderer, { ReactTestInstance } from 'react-test-renderer';
import { CHATS } from '../src/data/chats';
import ChatScreen from '../src/screens/ChatScreen';

jest.mock(
  'lucide-react-native',
  () => new Proxy({ __esModule: true }, { get: () => () => null }),
);

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const goBack = jest.fn();
const chat = CHATS[0];
let tree: ReactTestRenderer.ReactTestRenderer;

afterEach(() => ReactTestRenderer.act(async () => tree.unmount()));

async function render(chatId = chat.id) {
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <ChatScreen
        {...({ navigation: { goBack }, route: { params: { chatId } } } as any)}
      />,
    );
  });
}

const texts = () =>
  tree.root.findAllByType(Text).flatMap(node => node.props.children);

const sendButton = (): ReactTestInstance =>
  tree.root.find(
    node =>
      node.props.accessibilityLabel === 'Send message' &&
      typeof node.props.onPress === 'function',
  );

const type = (value: string) =>
  ReactTestRenderer.act(async () =>
    tree.root.findByType(TextInput).props.onChangeText(value),
  );

test('shows the person, listing, and thread', async () => {
  await render();
  const shown = texts();
  expect(shown).toContain(chat.name);
  expect(shown).toContain(chat.listing.title);
  expect(shown).toContain(chat.lastMessage);
});

test('a blank draft cannot be sent', async () => {
  await render();
  await type('   ');
  expect(sendButton().props.disabled).toBe(true);
});

test('sending adds the trimmed message and clears the input', async () => {
  await render();
  await type('  See you at 7  ');
  await ReactTestRenderer.act(async () => sendButton().props.onPress());
  expect(texts()).toContain('See you at 7');
  expect(tree.root.findByType(TextInput).props.value).toBe('');
});

test('an unknown chat renders nothing instead of crashing', async () => {
  await render('missing');
  expect(tree.toJSON()).toBeNull();
});
