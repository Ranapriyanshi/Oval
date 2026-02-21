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
import { Ionicons } from '@expo/vector-icons';
import GoogleLogo from '../../assets/google-symbol.png';
import AppleLogo from '../../assets/apple.png';
import FacebookLogo from '../../assets/facebook.png';

// Removes browser focus outline on web (RN types don't include 'none' for outlineStyle)
const noFocusOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as React.ComponentProps<typeof TextInput>['style']) : {};

const RegisterScreen = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
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
              style={[styles.input, { color: colors.textPrimary }, noFocusOutline]}
              placeholder="Your full name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              underlineColorAndroid="transparent"
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
              style={[styles.input, { color: colors.textPrimary }, noFocusOutline]}
              placeholder={t('auth.email')}
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              underlineColorAndroid="transparent"
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
              style={[styles.input, styles.inputWithAction, { color: colors.textPrimary }, noFocusOutline]}
              placeholder="Enter password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(prev => !prev)}
              activeOpacity={0.6}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm password input */}
          <View
            style={[
              styles.inputWrapper,
              { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <TextInput
              style={[styles.input, styles.inputWithAction, { color: colors.textPrimary }, noFocusOutline]}
              placeholder="Confirm password"
              placeholderTextColor={colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowConfirmPassword(prev => !prev)}
              activeOpacity={0.6}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.textTertiary}
              />
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
    borderWidth: 0,
  },
  inputWithAction: {
    paddingRight: spacing.sm,
  },
  eyeBtn: {
    paddingLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
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
  socialCircle: {
    width: 58,
    height: 58,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#8C07DD',
    marginHorizontal: spacing.lg,
    backgroundColor: 'transparent',
  },
  socialImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
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
