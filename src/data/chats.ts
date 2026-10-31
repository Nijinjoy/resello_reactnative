export type ChatRole = 'buying' | 'selling';

export type ListingStatus = 'active' | 'reserved' | 'sold';

export type ListingCategory =
  | 'phones'
  | 'furniture'
  | 'bikes'
  | 'cameras'
  | 'watches'
  | 'gaming'
  | 'laptops';

export type Chat = {
  id: string;
  name: string;
  role: ChatRole;
  listing: {
    title: string;
    price: number;
    category: ListingCategory;
    status: ListingStatus;
  };
  lastMessage: string;
  fromMe: boolean;
  read: boolean;
  unreadCount: number;
  sentAt: Date;
};

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000);

export const CHATS: Chat[] = [
  {
    id: '1',
    name: 'Omar Haddad',
    role: 'buying',
    listing: {
      title: 'iPhone 15 Pro, 256GB',
      price: 3200,
      category: 'phones',
      status: 'active',
    },
    lastMessage: 'Sure, I can meet at Dubai Marina Mall around 7?',
    fromMe: false,
    read: false,
    unreadCount: 2,
    sentAt: minutesAgo(4),
  },
  {
    id: '2',
    name: 'Priya Nair',
    role: 'selling',
    listing: {
      title: 'Oak dining table + 4 chairs',
      price: 1450,
      category: 'furniture',
      status: 'reserved',
    },
    lastMessage: 'Is the price negotiable? I can pick up tomorrow.',
    fromMe: false,
    read: false,
    unreadCount: 1,
    sentAt: minutesAgo(38),
  },
  {
    id: '3',
    name: 'Daniel Ruiz',
    role: 'buying',
    listing: {
      title: 'Sony A7 III body',
      price: 4100,
      category: 'cameras',
      status: 'active',
    },
    lastMessage: 'Thanks! How many shutter clicks does it have?',
    fromMe: true,
    read: true,
    unreadCount: 0,
    sentAt: minutesAgo(60 * 3),
  },
  {
    id: '4',
    name: 'Fatima Al Mansoori',
    role: 'selling',
    listing: {
      title: 'Trek road bike, size M',
      price: 2300,
      category: 'bikes',
      status: 'active',
    },
    lastMessage: 'Great, see you Saturday morning.',
    fromMe: true,
    read: false,
    unreadCount: 0,
    sentAt: minutesAgo(60 * 26),
  },
  {
    id: '5',
    name: 'James Okafor',
    role: 'buying',
    listing: {
      title: 'PS5 Slim with 2 controllers',
      price: 1650,
      category: 'gaming',
      status: 'sold',
    },
    lastMessage: 'Sorry, it just sold. I’ll let you know if it falls through.',
    fromMe: false,
    read: true,
    unreadCount: 0,
    sentAt: minutesAgo(60 * 24 * 3),
  },
  {
    id: '6',
    name: 'Lina Haddad',
    role: 'selling',
    listing: {
      title: 'MacBook Air M2, 13"',
      price: 3400,
      category: 'laptops',
      status: 'active',
    },
    lastMessage: 'Does it come with the original charger and box?',
    fromMe: false,
    read: true,
    unreadCount: 0,
    sentAt: minutesAgo(60 * 24 * 6),
  },
  {
    id: '7',
    name: 'Arjun Mehta',
    role: 'buying',
    listing: {
      title: 'Seiko Presage automatic',
      price: 1200,
      category: 'watches',
      status: 'active',
    },
    lastMessage: 'Deal. I’ll send the location pin.',
    fromMe: true,
    read: true,
    unreadCount: 0,
    sentAt: minutesAgo(60 * 24 * 12),
  },
];

export type Message = {
  id: string;
  text: string;
  fromMe: boolean;
  sentAt: Date;
};

// Sample thread, newest first, until the backend has a chat API.
export const sampleMessages = (chat: Chat): Message[] => {
  const iAmBuyer = chat.role === 'buying';
  const before = (minutes: number) =>
    new Date(chat.sentAt.getTime() - minutes * 60 * 1000);

  return [
    {
      id: 'sample-3',
      text: chat.lastMessage,
      fromMe: chat.fromMe,
      sentAt: chat.sentAt,
    },
    {
      id: 'sample-2',
      text: 'Yes, it’s still available.',
      fromMe: !iAmBuyer,
      sentAt: before(10),
    },
    {
      id: 'sample-1',
      text: `Hi, is the ${chat.listing.title} still available?`,
      fromMe: iAmBuyer,
      sentAt: before(25),
    },
  ];
};
