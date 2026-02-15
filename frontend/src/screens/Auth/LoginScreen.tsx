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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';

const LoginScreen = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={styles.logoSection}>
          <View style={[styles.logoBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.logoIcon}>⚽</Text>
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Oval</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Community Sports</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>{t('auth.signIn')}</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('auth.email')}</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.backgroundSecondary }]}
              placeholder="you@example.com"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('auth.password')}</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.backgroundSecondary }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.textInverse }]}>{t('auth.signIn')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register' as never)}
            style={styles.link}
          >
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              {t('auth.dontHaveAccount')}{' '}
              <Text style={[styles.linkTextBold, { color: colors.primary }]}>{t('auth.signUp')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl },
  logoSection: { alignItems: 'center', marginBottom: spacing.xxxl + 8 },
  logoBadge: { width: 72, height: 72, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: fontSize.title, fontWeight: fontWeight.bold, letterSpacing: -0.5 },
  tagline: { fontSize: fontSize.base, marginTop: spacing.xs },
  form: { width: '100%' },
  formTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, marginBottom: spacing.xl },
  inputContainer: { marginBottom: spacing.lg },
  inputLabel: { fontSize: fontSize.md, fontWeight: fontWeight.medium, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderRadius: borderRadius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2, fontSize: fontSize.lg },
  button: { borderRadius: borderRadius.sm, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.sm },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  link: { marginTop: spacing.xl, alignItems: 'center' },
  linkText: { fontSize: fontSize.base },
  linkTextBold: { fontWeight: fontWeight.semibold },
});

export default LoginScreen;
