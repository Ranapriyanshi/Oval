import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { AuthProvider } from './src/context/AuthContext';
import { LocaleProvider } from './src/context/LocaleContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import i18n from './src/i18n';

function AppInner() {
  const { isDark, colors } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <AppNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Set a rounded, friendly default font for all Text
  if (!Text.defaultProps) {
    Text.defaultProps = {};
  }
  Text.defaultProps.style = [{ fontFamily: 'Nunito_400Regular' }, Text.defaultProps.style].filter(Boolean);

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <AppInner />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
