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
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, fontFamily } from '../../theme';
import GoogleLogo from '../../assets/google-symbol.png';
import AppleLogo from '../../assets/apple.png';
import FacebookLogo from '../../assets/facebook.png';

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

  const BUTTON_SHADOW_HEIGHT = 4;

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
            {t('auth.signIn')}
          </Text>

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

          {/* Password input with FORGOT */}
          <View
            style={[
              styles.inputWrapper,
              { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <TextInput
              style={[styles.input, styles.inputWithAction, { color: colors.textPrimary }]}
              placeholder={t('auth.password')}
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.6}>
              <Text style={[styles.forgotText, { color: colors.textTertiary }]}>FORGOT?</Text>
            </TouchableOpacity>
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
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {t('auth.signIn').toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* OR divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Social login icons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialCircle} activeOpacity={0.7}>
              <Image source={AppleLogo} style={styles.socialImage} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialCircle} activeOpacity={0.7}>
              <Image source={FacebookLogo} style={styles.socialImage} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialCircle} activeOpacity={0.7}>
              <Image source={GoogleLogo} style={styles.socialImage} />
            </TouchableOpacity>
          </View>

          {/* Sign-up link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register' as never)}
            style={styles.link}
          >
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              {t('auth.dontHaveAccount')}{' '}
              <Text style={[styles.linkTextBold, { color: colors.primary }]}>
                {t('auth.signUp')}
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
  inputWithAction: {
    paddingRight: spacing.sm,
  },
  forgotBtn: {
    paddingLeft: spacing.sm,
  },
  forgotText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
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

  /* OR divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 2,
  },
  dividerText: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginHorizontal: spacing.lg,
    letterSpacing: 1,
  },

  /* Social buttons */
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
  },
  socialCircle: {
    width: 58,
    height: 58,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#39FF14', // neon green style outline
    marginHorizontal: spacing.lg,
    backgroundColor: 'transparent',
  },
  socialImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  socialIcon: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginRight: spacing.sm,
  },
  socialLabel: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
  },

  /* Links & footer */
  link: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  linkText: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.base,
  },
  linkTextBold: {
    fontFamily: fontFamily.roundedSemibold,
    fontWeight: fontWeight.semibold,
  },
  footerText: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    fontFamily: fontFamily.roundedSemibold,
    fontWeight: fontWeight.semibold,
  },
});

export default LoginScreen;
