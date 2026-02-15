import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { colors, fontSize, fontWeight } from '../theme';
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
        name="Coaching"
        component={CoachesScreen}
        options={{
          tabBarLabel: 'Coaching',
          tabBarIcon: ({ focused }) => <TabIcon label="Coaching" focused={focused} />,
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

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
            options={{ headerShown: true, headerTitle: 'Chat' }}
          />
          <Stack.Screen
            name="CoachProfile"
            component={CoachProfileScreen}
            options={{ headerShown: true, headerTitle: 'Coach Profile' }}
          />
          <Stack.Screen
            name="MySessions"
            component={MySessionsScreen}
            options={{ headerShown: true, headerTitle: 'My Sessions' }}
          />
          <Stack.Screen name="Gametime" component={GametimeScreen} options={{ headerShown: true, headerTitle: 'Gametime' }} />
          <Stack.Screen name="Venues" component={VenuesScreen} options={{ headerShown: true, headerTitle: 'Venues' }} />
          <Stack.Screen name="Bookings" component={BookingsScreen} />
          <Stack.Screen name="MatchesList" component={MatchesScreen} />
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
