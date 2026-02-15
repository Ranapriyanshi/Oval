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
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';

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
      >
        <View style={styles.inner}>
          <View style={styles.logoSection}>
            <View style={[styles.logoBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.logoIcon}>⚽</Text>
            </View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>Oval</Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.formTitle, { color: colors.textPrimary }]}>{t('auth.createAccount')}</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.backgroundSecondary }]}
                placeholder="Your full name"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>

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
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.textInverse }]}>{t('auth.signUp')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.link}
            >
              <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                {t('auth.alreadyHaveAccount')}{' '}
                <Text style={[styles.linkTextBold, { color: colors.primary }]}>{t('auth.signIn')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxxl },
  logoSection: { alignItems: 'center', marginBottom: spacing.xxxl },
  logoBadge: { width: 64, height: 64, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  logoIcon: { fontSize: 32 },
  appName: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, letterSpacing: -0.5 },
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

export default RegisterScreen;
