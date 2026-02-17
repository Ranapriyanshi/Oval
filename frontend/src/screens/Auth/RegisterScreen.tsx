import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, fontFamily } from '../../theme';

const RegisterScreen = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.inner}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t('auth.createAccount')}
          </Text>

          {/* Name input */}
          <View
            style={[
              styles.inputWrapper,
              { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Your full name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email input */}
          <View
            style={[
              styles.inputWrapper,
              { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder={t('auth.email')}
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password input */}
          <View
            style={[
              styles.inputWrapper,
              { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Primary CTA – 3D raised button */}
          <View style={styles.buttonOuter}>
            <View
              style={[
                styles.buttonShadow,
                { backgroundColor: colors.primaryDark, borderRadius: borderRadius.lg },
              ]}
            />
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: colors.primary,
                  marginBottom: BUTTON_SHADOW_HEIGHT,
                },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {t('auth.signUp').toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign-in link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as never)}
            style={styles.link}
          >
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              {t('auth.alreadyHaveAccount')}{' '}
              <Text style={[styles.linkTextBold, { color: colors.primary }]}>
                {t('auth.signIn')}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const BUTTON_SHADOW_HEIGHT = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },

  /* Title */
  title: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.xxl + spacing.sm,
  },

  /* Inputs */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    height: 56,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.lg,
    paddingVertical: 0,
  },

  /* 3D raised button */
  buttonOuter: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    position: 'relative',
  },
  buttonShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  button: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -BUTTON_SHADOW_HEIGHT }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  /* Links */
  link: {
    alignItems: 'center',
  },
  linkText: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.base,
  },
  linkTextBold: {
    fontFamily: fontFamily.roundedSemibold,
    fontWeight: fontWeight.semibold,
  },
});

export default RegisterScreen;
