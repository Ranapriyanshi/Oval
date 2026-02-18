import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fontSize, fontWeight, borderRadius } from '../theme';

import TabHomeIcon from '../assets/Minimalist House Icon.png';
import TabDiscoverIcon from '../assets/3D Colorful Compass.png';
import TabChatIcon from '../assets/Social Media Like Icon.png';
import TabGametimeIcon from '../assets/Modern Wooden Hourglass.png';
import TabVenuesIcon from '../assets/Stylized Paper Art Landscape with Location Marker.png';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import AccountSetupScreen from '../screens/Auth/AccountSetupScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import VenuesScreen from '../screens/Venues/VenuesScreen';
import VenueDetailScreen from '../screens/Venues/VenueDetailScreen';
import BookingsScreen from '../screens/Bookings/BookingsScreen';
import DiscoveryScreen from '../screens/Playpals/DiscoveryScreen';
import MatchesScreen from '../screens/Playpals/MatchesScreen';
import PlaypalProfileScreen from '../screens/Playpals/PlaypalProfileScreen';
import GametimeScreen from '../screens/Gametime/GametimeScreen';
import GametimeDetailScreen from '../screens/Gametime/GametimeDetailScreen';
import GametimeCreateScreen from '../screens/Gametime/GametimeCreateScreen';
import ConversationsScreen from '../screens/Chat/ConversationsScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import CoachesScreen from '../screens/Coaching/CoachesScreen';
import CoachProfileScreen from '../screens/Coaching/CoachProfileScreen';
import MySessionsScreen from '../screens/Coaching/MySessionsScreen';
import StatsScreen from '../screens/Stats/StatsScreen';
import LeaderboardsScreen from '../screens/Stats/LeaderboardsScreen';
import GameRatingScreen from '../screens/Stats/GameRatingScreen';
import EventsScreen from '../screens/Events/EventsScreen';
import EventDetailScreen from '../screens/Events/EventDetailScreen';
import MyEventsScreen from '../screens/Events/MyEventsScreen';
import AchievementsScreen from '../screens/Achievements/AchievementsScreen';
import AdminScreen from '../screens/Admin/AdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICON_SIZE = 44;

const iconMap: Record<string, ImageSourcePropType> = {
  Home: TabHomeIcon,
  Discover: TabDiscoverIcon,
  Chat: TabChatIcon,
  Gametime: TabGametimeIcon,
  Venues: TabVenuesIcon,
};

const TabIcon = ({ label, focused, activeColor }: { label: string; focused: boolean; activeColor: string }) => {
  return (
    <View style={[tabIconStyles.wrapper, focused && { borderColor: activeColor, ...tabIconStyles.wrapperFocused }]}>
      <Image
        source={iconMap[label]}
        style={tabIconStyles.icon}
        resizeMode="contain"
      />
    </View>
  );
};

const tabIconStyles = StyleSheet.create({
  wrapper: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wrapperFocused: {
    borderWidth: 2,
  },
  icon: {
    width: TAB_ICON_SIZE,
    height: TAB_ICON_SIZE,
  },
});

const MainTabs = () => {
  const { colors, isDark } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 20,
          height: 72,
          borderRadius: 999,
          // Whitish in light mode, greyish in dark mode
          backgroundColor: isDark ? 'rgba(255,255,255,0.96)' : 'rgba(64, 61, 61, 0.96)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
          paddingBottom: 6,
          paddingTop: 6,
          paddingHorizontal: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarItemStyle: {
          paddingHorizontal: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} activeColor={colors.primary} />,
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoveryScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Discover" focused={focused} activeColor={colors.primary} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ConversationsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Chat" focused={focused} activeColor={colors.primary} />,
        }}
      />
      <Tab.Screen
        name="Gametime"
        component={GametimeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Gametime" focused={focused} activeColor={colors.primary} />,
        }}
      />
      <Tab.Screen
        name="Venues"
        component={VenuesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Venues" focused={focused} activeColor={colors.primary} />,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [hasCompletedAccountSetup, setHasCompletedAccountSetup] = useState<boolean | null>(null);

  useEffect(() => {
    const loadOnboardingFlag = async () => {
      try {
        const value = await AsyncStorage.getItem('oval_has_seen_onboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (err) {
        console.error('Failed to load onboarding flag', err);
        setHasSeenOnboarding(true);
      }
    };
    loadOnboardingFlag();
  }, []);

  useEffect(() => {
    const loadAccountSetupFlag = async () => {
      try {
        const value = await AsyncStorage.getItem('oval_has_completed_account_setup');
        setHasCompletedAccountSetup(value === 'true');
      } catch (err) {
        console.error('Failed to load account setup flag', err);
        setHasCompletedAccountSetup(false);
      }
    };
    loadAccountSetupFlag();
  }, []);

  const handleOnboardingDone = async () => {
    try {
      await AsyncStorage.setItem('oval_has_seen_onboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (err) {
      console.error('Failed to save onboarding flag', err);
    }
  };

  if (loading || hasSeenOnboarding === null || hasCompletedAccountSetup === null) {
    return null;
  }

  const stackHeaderStyle = {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: { color: colors.textPrimary, textTransform: 'capitalize' },
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...stackHeaderStyle }}>
      {user ? (
        <>
          {!hasCompletedAccountSetup && (
            <Stack.Screen name="AccountSetup" component={AccountSetupScreen} />
          )}
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: true, headerTitle: 'Profile', ...stackHeaderStyle }}
          />
          <Stack.Screen name="VenueDetail" component={VenueDetailScreen} />
          <Stack.Screen name="PlaypalProfile" component={PlaypalProfileScreen} />
          <Stack.Screen name="GametimeDetail" component={GametimeDetailScreen} />
          <Stack.Screen name="GametimeCreate" component={GametimeCreateScreen} />
          <Stack.Screen
            name="ChatConversation"
            component={ChatScreen}
            options={{ headerShown: true, headerTitle: 'Chat', ...stackHeaderStyle }}
          />
          <Stack.Screen
            name="CoachProfile"
            component={CoachProfileScreen}
            options={{ headerShown: true, headerTitle: 'Coach Profile', ...stackHeaderStyle }}
          />
          <Stack.Screen
            name="MySessions"
            component={MySessionsScreen}
            options={{ headerShown: true, headerTitle: 'My Sessions', ...stackHeaderStyle }}
          />
          <Stack.Screen
            name="Coaches"
            component={CoachesScreen}
            options={{ headerShown: true, headerTitle: 'Coaching', ...stackHeaderStyle }}
          />
          <Stack.Screen name="Bookings" component={BookingsScreen} />
          <Stack.Screen name="MatchesList" component={MatchesScreen} />
          <Stack.Screen
            name="Stats"
            component={StatsScreen}
            options={{ headerShown: true, headerTitle: 'My Stats', ...stackHeaderStyle }}
          />
          <Stack.Screen
            name="Leaderboards"
            component={LeaderboardsScreen}
            options={{ headerShown: true, headerTitle: 'Leaderboards', ...stackHeaderStyle }}
          />
          <Stack.Screen
            name="GameRating"
            component={GameRatingScreen}
            options={{ headerShown: true, headerTitle: 'Rate players', ...stackHeaderStyle }}
          />
          <Stack.Screen
            name="Events"
            component={EventsScreen}
            options={{ headerShown: true, headerTitle: 'Events', ...stackHeaderStyle }}
          />
          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
            options={{ headerShown: true, headerTitle: 'Event', ...stackHeaderStyle }}
          />
          <Stack.Screen
            name="MyEvents"
            component={MyEventsScreen}
            options={{ headerShown: true, headerTitle: 'My events', ...stackHeaderStyle }}
          />
          <Stack.Screen
            name="Achievements"
            component={AchievementsScreen}
            options={{ headerShown: true, headerTitle: 'Achievements', ...stackHeaderStyle }}
          />
          <Stack.Screen
            name="Admin"
            component={AdminScreen}
            options={{ headerShown: true, headerTitle: 'Admin', ...stackHeaderStyle }}
          />
        </>
      ) : hasSeenOnboarding ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Onboarding">
            {(props) => <OnboardingScreen {...props} onDone={handleOnboardingDone} />}
          </Stack.Screen>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
