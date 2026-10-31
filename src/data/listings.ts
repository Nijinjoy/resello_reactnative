import type { ListingCategory } from './chats';

export type Condition = 'New' | 'Like new' | 'Good' | 'Fair';

export type Listing = {
  id: string;
  title: string;
  price: number;
  category: ListingCategory;
  condition: Condition;
  location: string;
  featured?: boolean;
  postedAt: Date;
};

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000);

// Sample data until the backend has a listings API.
export const LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro, 256GB Natural Titanium',
    price: 3150,
    category: 'phones',
    condition: 'Like new',
    location: 'Dubai Marina',
    featured: true,
    postedAt: hoursAgo(1),
  },
  {
    id: '2',
    title: 'MacBook Air M2, 16GB / 512GB',
    price: 3400,
    category: 'laptops',
    condition: 'Good',
    location: 'Business Bay',
    featured: true,
    postedAt: hoursAgo(3),
  },
  {
    id: '3',
    title: 'Sony A7 III with 28-70mm lens',
    price: 4200,
    category: 'cameras',
    condition: 'Good',
    location: 'Al Reem Island',
    featured: true,
    postedAt: hoursAgo(5),
  },
  {
    id: '4',
    title: 'PlayStation 5 Slim + 2 controllers',
    price: 1450,
    category: 'gaming',
    condition: 'Like new',
    location: 'JLT',
    featured: true,
    postedAt: hoursAgo(8),
  },
  {
    id: '5',
    title: 'Three-seater linen sofa, grey',
    price: 950,
    category: 'furniture',
    condition: 'Good',
    location: 'Al Barsha',
    postedAt: hoursAgo(2),
  },
  {
    id: '6',
    title: 'Trek Marlin 7 mountain bike, size M',
    price: 1800,
    category: 'bikes',
    condition: 'Good',
    location: 'Jumeirah',
    postedAt: hoursAgo(4),
  },
  {
    id: '7',
    title: 'Apple Watch Series 9, 45mm',
    price: 1100,
    category: 'watches',
    condition: 'Like new',
    location: 'Khalifa City',
    postedAt: hoursAgo(6),
  },
  {
    id: '8',
    title: 'Samsung Galaxy S24, 256GB',
    price: 1950,
    category: 'phones',
    condition: 'Good',
    location: 'Sharjah',
    postedAt: hoursAgo(9),
  },
  {
    id: '9',
    title: 'Solid oak dining table with 6 chairs',
    price: 2200,
    category: 'furniture',
    condition: 'Fair',
    location: 'Mirdif',
    postedAt: hoursAgo(14),
  },
  {
    id: '10',
    title: 'Nintendo Switch OLED, white',
    price: 780,
    category: 'gaming',
    condition: 'New',
    location: 'Al Nahda',
    postedAt: hoursAgo(20),
  },
  {
    id: '11',
    title: 'Dell XPS 13, i7 / 16GB',
    price: 2600,
    category: 'laptops',
    condition: 'Good',
    location: 'Downtown Dubai',
    postedAt: hoursAgo(26),
  },
  {
    id: '12',
    title: 'Canon EOS R50 body only',
    price: 2300,
    category: 'cameras',
    condition: 'New',
    location: 'Abu Dhabi',
    postedAt: hoursAgo(30),
  },
];
