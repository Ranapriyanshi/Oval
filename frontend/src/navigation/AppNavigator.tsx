import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fontSize, fontWeight } from '../theme';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Simple text-based tab icon (no external icon library needed)
const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const iconMap: Record<string, string> = {
    Home: '⚽',
    Discover: '🔍',
    Chat: '💬',
    Gametime: '🎮',
    Coaching: '🏋️',
    Venues: '🏟️',
    Profile: '👤',
  };
  return (
    <View style={tabIconStyles.container}>
      <Text style={[tabIconStyles.icon, focused && tabIconStyles.iconFocused]}>
        {iconMap[label] || '●'}
      </Text>
    </View>
  );
};

const tabIconStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20, opacity: 0.5 },
  iconFocused: { opacity: 1 },
});

const MainTabs = () => {
  const { colors, isDark } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoveryScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ focused }) => <TabIcon label="Discover" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ConversationsScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ focused }) => <TabIcon label="Chat" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Gametime"
        component={GametimeScreen}
        options={{
          tabBarLabel: 'Gametime',
          tabBarIcon: ({ focused }) => <TabIcon label="Gametime" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Venues"
        component={VenuesScreen}
        options={{
          tabBarLabel: 'Venues',
          tabBarIcon: ({ focused }) => <TabIcon label="Venues" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();

  if (loading) {
    return null;
  }

  const stackHeaderStyle = {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: { color: colors.textPrimary },
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...stackHeaderStyle }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
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
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
