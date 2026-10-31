import React from 'react';
import { Alert, Image, Text, TextInput } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ReactTestRenderer from 'react-test-renderer';
import SellScreen from '../src/screens/SellScreen';

jest.mock(
  'lucide-react-native',
  () => new Proxy({ __esModule: true }, { get: () => () => null }),
);

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

const pickPhotos = launchImageLibrary as unknown as jest.Mock;
let tree: ReactTestRenderer.ReactTestRenderer;

beforeEach(async () => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<SellScreen />);
  });
});

afterEach(async () => {
  await ReactTestRenderer.act(async () => tree.unmount());
  jest.restoreAllMocks();
});

const texts = () =>
  tree.root.findAllByType(Text).flatMap(node => node.props.children);

const pressable = (label: string) =>
  tree.root.find(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  );

const press = (label: string) =>
  ReactTestRenderer.act(async () => pressable(label).props.onPress());

const input = (label: string) =>
  tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === label)!;

const type = (label: string, value: string) =>
  ReactTestRenderer.act(async () => input(label).props.onChangeText(value));

const addPhotos = async (count: number) => {
  pickPhotos.mockResolvedValue({
    assets: Array.from({ length: count }, (_, i) => ({ uri: `file://${i}` })),
  });
  await ReactTestRenderer.act(async () => {
    await handlePick();
  });
};

// Runs the "Choose from library" option through the real result handler.
const handlePick = () =>
  tree.root
    .findAll(
      node =>
        Array.isArray(node.props.options) &&
        typeof node.props.onClose === 'function',
    )[0]
    .props.options[1].onPress();

const post = () =>
  ReactTestRenderer.act(async () =>
    tree.root
      .findAll(
        node =>
          node.props.title === 'Post listing' &&
          typeof node.props.onPress === 'function',
      )[0]
      .props.onPress(),
  );

test('posting an empty form shows each required error', async () => {
  await post();
  const shown = texts();
  expect(shown).toContain('Add at least one photo');
  expect(shown).toContain('Enter a title for your item');
  expect(shown).toContain('Choose a category');
  expect(shown).toContain('Choose a condition');
  expect(shown).toContain('Enter a price');
  expect(shown).toContain('Enter a location');
  expect(shown).toContain('Enter a description');
  expect(Alert.alert).not.toHaveBeenCalled();
});

test('a blank description is rejected and clears on typing', async () => {
  await type('Description', '   ');
  await post();
  expect(texts()).toContain('Enter a description');
  await type('Description', 'Barely used');
  expect(texts()).not.toContain('Enter a description');
});

test('price keeps digits only and zero is rejected', async () => {
  await type('Price', '1,5a0');
  expect(input('Price').props.value).toBe('150');
  await type('Price', '0');
  await post();
  expect(texts()).toContain('Enter a price');
});

test('photos stop at six and the add button disappears', async () => {
  await addPhotos(8);
  expect(tree.root.findAllByType(Image)).toHaveLength(6);
  expect(() => pressable('Add photos')).toThrow();
});

test('removing a photo updates the list', async () => {
  await addPhotos(2);
  await press('Remove photo 1');
  expect(tree.root.findAllByType(Image)).toHaveLength(1);
});

test('a complete form passes and says posting is not connected', async () => {
  await addPhotos(1);
  await type('Title', 'Road bike');
  await press('Bikes');
  await press('Good');
  await type('Price', '900');
  await type('Location', 'Dubai Marina');
  await type('Description', 'Serviced last month');
  await post();
  expect(Alert.alert).toHaveBeenCalledWith(
    'Listing not posted',
    expect.stringContaining('isn’t connected'),
  );
});
