import React from 'react';
import { FlatList, Text, TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { LISTINGS } from '../src/data/listings';
import ExploreScreen from '../src/screens/ExploreScreen';
import { formatPrice } from '../src/utils/price';

jest.mock(
  'lucide-react-native',
  () => new Proxy({ __esModule: true }, { get: () => () => null }),
);

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const setParams = jest.fn();
let tree: ReactTestRenderer.ReactTestRenderer;

afterEach(async () => {
  await ReactTestRenderer.act(async () => tree.unmount());
  setParams.mockClear();
});

async function render(params?: { category?: string }) {
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <ExploreScreen
        {...({ navigation: { setParams }, route: { params } } as any)}
      />,
    );
  });
}

const texts = () =>
  tree.root.findAllByType(Text).flatMap(node => node.props.children);

const press = (label: string) =>
  ReactTestRenderer.act(async () =>
    tree.root
      .find(
        node =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === 'function',
      )
      .props.onPress(),
  );

const search = (value: string) =>
  ReactTestRenderer.act(async () =>
    tree.root.findByType(TextInput).props.onChangeText(value),
  );

test('shows every listing by default', async () => {
  await render();
  expect(texts().join('')).toContain(`${LISTINGS.length} items`);
});

test('search matches titles and locations, ignoring case', async () => {
  await render();
  await search('SONY');
  expect(texts()).toContain('Sony A7 III with 28-70mm lens');
  expect(texts().join('')).toContain('1 item');
  await search('sharjah');
  expect(texts()).toContain('Samsung Galaxy S24, 256GB');
});

test('category and search combine, and All resets the category', async () => {
  await render();
  await press('Phones');
  await search('canon');
  expect(texts()).toContain('No items found');
  await press('All');
  expect(texts()).toContain('Canon EOS R50 body only');
});

test('clear filters resets an empty result', async () => {
  await render();
  await search('zzzz');
  await press('Clear filters');
  expect(texts().join('')).toContain(`${LISTINGS.length} items`);
});

test('sorting by price puts the cheapest first', async () => {
  await render();
  const sheet = tree.root.findAll(
    node => Array.isArray(node.props.options) && node.props.title === 'Sort by',
  )[0];
  await ReactTestRenderer.act(async () => sheet.props.options[1].onPress());
  const cheapest = Math.min(...LISTINGS.map(listing => listing.price));
  const prices = texts().filter(
    text => typeof text === 'string' && text.startsWith('AED'),
  );
  expect(prices[0]).toBe(formatPrice(cheapest));
});

test('a category from Home is applied once', async () => {
  await render({ category: 'bikes' });
  expect(texts()).toContain('Trek Marlin 7 mountain bike, size M');
  expect(texts().join('')).toContain('1 item');
  expect(setParams).toHaveBeenCalledWith({ category: undefined });
});

test('results are a one-column list', async () => {
  await render();
  expect(tree.root.findByType(FlatList).props.numColumns).toBeUndefined();
});
