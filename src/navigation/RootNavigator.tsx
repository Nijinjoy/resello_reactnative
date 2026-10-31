import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  StackCardStyleInterpolator,
  StackNavigationOptions,
  TransitionPresets,
} from '@react-navigation/stack';
import { Easing } from 'react-native';
import ChatScreen from '../screens/ChatScreen';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import MainTabs from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

type TransitionSpec = NonNullable<
  StackNavigationOptions['transitionSpec']
>['open'];

const softTiming: TransitionSpec = {
  animation: 'timing',
  config: { duration: 450, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
};

const forFadeSlide: StackCardStyleInterpolator = ({ current, layouts }) => ({
  cardStyle: {
    opacity: current.progress,
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width * 0.2, 0],
        }),
      },
    ],
  },
});

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#0F766E' },
};

function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          ...TransitionPresets.SlideFromRightIOS,
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: 'none' }}
        />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{ gestureEnabled: true }}
        />
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetupScreen}
          options={{
            cardStyleInterpolator: forFadeSlide,
            transitionSpec: { open: softTiming, close: softTiming },
          }}
        />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ gestureEnabled: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
