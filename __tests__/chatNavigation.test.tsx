import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import ReactTestRenderer from 'react-test-renderer';
import { CHATS } from '../src/data/chats';
import ChatScreen from '../src/screens/ChatScreen';
import ChatsScreen from '../src/screens/ChatsScreen';

jest.mock(
  'lucide-react-native',
  () => new Proxy({ __esModule: true }, { get: () => () => null }),
);

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  const insets = { top: 0, bottom: 0, left: 0, right: 0 };
  return {
    ...actual,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const Tabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Chats" component={ChatsScreen} />
  </Tab.Navigator>
);

test('tapping a row in the Chats tab opens that conversation', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={Tabs} />
          <Stack.Screen name="Chat" component={ChatScreen as any} />
        </Stack.Navigator>
      </NavigationContainer>,
    );
  });

  const chat = CHATS[0];
  const row = tree.root.find(
    node =>
      node.props.accessibilityLabel?.startsWith?.(`Chat with ${chat.name}`) &&
      typeof node.props.onPress === 'function',
  );
  await ReactTestRenderer.act(async () => row.props.onPress());

  const shown = tree.root
    .findAllByType(Text)
    .flatMap(node => node.props.children);
  expect(shown).toContain(`Hi, is the ${chat.listing.title} still available?`);

  await ReactTestRenderer.act(async () => tree.unmount());
});
