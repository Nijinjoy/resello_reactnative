import type { StackScreenProps } from '@react-navigation/stack';
import type { ListingCategory } from '../data/chats';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Otp: { phone: string };
  ProfileSetup: undefined;
  Main: undefined;
  Chat: { chatId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Explore: { category?: ListingCategory } | undefined;
  Sell: undefined;
  Chats: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
