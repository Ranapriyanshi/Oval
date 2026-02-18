import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, fontFamily } from '../../theme';
import BoyAvatar from '../../assets/3D Modeled Young Boy Portrait.png';
import GirlAvatar from '../../assets/3D Model of Young Woman with Curious Expression.png';

const AccountSetupScreen = () => {
  const navigation = useNavigation();
  const { updateUser, user } = useAuth();
  const { colors } = useTheme();
  const [mobile, setMobile] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<'boy' | 'girl' | null>('girl');

  const BUTTON_SHADOW_HEIGHT = 4;

  const handleProceed = async () => {
    if (!mobile || !selectedAvatar) return;

    // Save avatarChoice and mobile to AsyncStorage immediately (before backend call)
    // This ensures data persists even if backend doesn't support these fields yet
    try {
      const existingUserData = await AsyncStorage.getItem('userData');
      if (!existingUserData) {
        console.warn('No userData found in AsyncStorage during account setup');
        return; // Can't proceed without user data
      }
      
      const userData = JSON.parse(existingUserData);
      // Update with avatar and mobile preferences
      userData.avatarChoice = selectedAvatar;
      userData.mobile = mobile;
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (err) {
      console.error('Failed to save avatar to AsyncStorage:', err);
    }

    try {
      // Persist preferences to backend profile
      await updateUser({
        mobile,
        avatarChoice: selectedAvatar,
      });
    } catch (err) {
      // If backend update fails, we've already saved to AsyncStorage above
      console.error('Backend update failed, but local storage updated:', err);
    }

    try {
      await AsyncStorage.setItem('oval_has_completed_account_setup', 'true');
    } catch (err) {
      // non-blocking
    }

    navigation.navigate('Main' as never);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.inner}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>Let&apos;s set up your profile</Text>

          {/* Avatar preview */}
          <View style={styles.avatarPreviewWrapper}>
            {selectedAvatar && (
              <Image
                source={selectedAvatar === 'boy' ? BoyAvatar : GirlAvatar}
                style={styles.avatarPreviewImage}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Avatar options row */}
          <View style={styles.avatarRow}>
            {(['boy', 'girl'] as const).map((option) => {
              const isActive = selectedAvatar === option;
              const source = option === 'boy' ? BoyAvatar : GirlAvatar;
              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.8}
                  onPress={() => setSelectedAvatar(option)}
                  style={[
                    styles.avatarCircle,
                    {
                      borderColor: isActive ? colors.primary : colors.border,
                      borderWidth: isActive ? 3 : 2,
                    },
                  ]}
                >
                  <Image source={source} style={styles.avatarImage} resizeMode="cover" />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Mobile number input (replaces name) */}
          <View
            style={[
              styles.inputWrapper,
              { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Mobile number"
              placeholderTextColor={colors.textTertiary}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
            />
          </View>

          {/* Proceed button – same 3D style */}
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
                !mobile && styles.buttonDisabled,
              ]}
              onPress={handleProceed}
              disabled={!mobile}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Proceed</Text>
            </TouchableOpacity>
          </View>
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
  title: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  avatarPreviewWrapper: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarPreviewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    height: 56,
    marginBottom: spacing.xl,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.lg,
    paddingVertical: 0,
  },
  buttonOuter: {
    marginTop: spacing.sm,
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
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

export default AccountSetupScreen;
