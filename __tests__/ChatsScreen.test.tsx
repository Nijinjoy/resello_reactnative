import React from 'react';
import { Text, TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { CHATS } from '../src/data/chats';
import ChatsScreen from '../src/screens/ChatsScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock(
  'lucide-react-native',
  () => new Proxy({ __esModule: true }, { get: () => () => null }),
);

let tree: ReactTestRenderer.ReactTestRenderer;

afterEach(() => ReactTestRenderer.act(async () => tree.unmount()));

async function render() {
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<ChatsScreen />);
  });
}

const texts = () =>
  tree.root.findAllByType(Text).flatMap(node => node.props.children);

const search = (value: string) =>
  ReactTestRenderer.act(async () =>
    tree.root.findByType(TextInput).props.onChangeText(value),
  );

test('lists people with their last message', async () => {
  await render();
  expect(texts()).toContain(CHATS[0].name);
  expect(texts()).toContain(CHATS[0].lastMessage);
});

test('search narrows the list by name', async () => {
  await render();
  await search(CHATS[0].name);
  expect(texts()).toContain(CHATS[0].name);
  expect(texts()).not.toContain(CHATS[1].name);
});

test('search with no results shows the empty state', async () => {
  await render();
  await search('zzzz');
  expect(texts()).toContain('No matches');
});

test('tapping a row opens that chat', async () => {
  await render();
  const row = tree.root.find(
    node =>
      node.props.accessibilityLabel?.startsWith?.(
        `Chat with ${CHATS[0].name}`,
      ) && typeof node.props.onPress === 'function',
  );
  await ReactTestRenderer.act(async () => row.props.onPress());
  expect(mockNavigate).toHaveBeenCalledWith('Chat', { chatId: CHATS[0].id });
});
