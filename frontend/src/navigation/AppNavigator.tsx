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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Simple text-based tab icon (no external icon library needed)
const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const iconMap: Record<string, string> = {
    Home: '⚽',
    Discover: '🔍',
    Matches: '🤝',
    Gametime: '🎮',
    Venues: '🏟️',
    Bookings: '📋',
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
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ focused }) => <TabIcon label="Matches" focused={focused} />,
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
