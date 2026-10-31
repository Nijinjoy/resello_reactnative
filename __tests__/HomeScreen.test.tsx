import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { ReactTestInstance } from 'react-test-renderer';
import { LISTINGS } from '../src/data/listings';
import HomeScreen from '../src/screens/HomeScreen';

jest.mock('../src/services/session', () => ({
  getSavedUser: jest.fn().mockResolvedValue({ fullName: 'Sara Khan' }),
}));

jest.mock(
  'lucide-react-native',
  () => new Proxy({ __esModule: true }, { get: () => () => null }),
);

const navigate = jest.fn();

let tree: ReactTestRenderer.ReactTestRenderer;

afterEach(() => ReactTestRenderer.act(async () => tree.unmount()));

async function render() {
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <HomeScreen {...({ navigation: { navigate } } as any)} />,
    );
  });
  return tree;
}

const texts = () =>
  tree.root.findAllByType(Text).flatMap(node => node.props.children);

const byLabel = (label: string): ReactTestInstance[] =>
  tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  );

const press = (node: ReactTestInstance) =>
  ReactTestRenderer.act(async () => node.props.onPress());

test('greets the saved user and shows the sections', async () => {
  await render();
  const shown = texts();
  expect(shown).toContain('Hi, Sara');
  expect(shown).toContain('Trending now');
  expect(shown).toContain('Fresh listings');
});

test('a category tile opens Explore filtered to it', async () => {
  await render();
  await press(byLabel('Bikes')[0]);
  expect(navigate).toHaveBeenCalledWith('Explore', { category: 'bikes' });
});

test('search belongs to Explore, not Home', async () => {
  await render();
  expect(byLabel('Search listings')).toHaveLength(0);
});

test('toggling a favourite updates its state', async () => {
  await render();
  const label = `Favourite ${LISTINGS[0].title}`;
  await press(byLabel(label)[0]);
  expect(byLabel(label)[0].props.accessibilityState.selected).toBe(true);
});

test('the sell banner opens the Sell tab', async () => {
  await render();
  await press(byLabel('Sell an item')[0]);
  expect(navigate).toHaveBeenCalledWith('Sell');
});
