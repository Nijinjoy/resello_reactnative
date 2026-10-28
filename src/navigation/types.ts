import type { StackScreenProps } from '@react-navigation/stack';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  // Local UAE digits, e.g. "501234567".
  Otp: { phone: string };
  ProfileSetup: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
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
