import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ImageSourcePropType,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, fontFamily } from '../../theme';
import {
  onboardingWelcomeIllustration,
  onboardingPlaypalsIllustration,
  onboardingGametimeIllustration,
} from '../../assets/illustrations';
import TennisBallPng from '../../assets/Pristine Yellow Tennis Ball.png';

type OnboardingScreenProps = {
  onDone?: () => void;
};

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
};

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BALL_SIZE = 110;
const LAUNCH_LETTERS = ['O', 'V', 'A', 'L'] as const;

// Each letter is ~38px wide at fontSize 52, with 6px gap between letters.
// Word total width ≈ 4*38 + 3*6 = 170px. Half = 85px.
// Letter-center offsets from row center: -63.5, -21.5, +21.5, +63.5
// We round for cleanliness.
// To start each letter at the center (behind ball), the initial translateX
// must be the negation of its natural offset from center, so all start stacked.
const LETTER_START_X = [64, 22, -22, -64]; // initial offsets → all at center
// Final translateX = 0 for every letter (natural flex-row position, centered).

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    title: 'Welcome to Oval',
    subtitle: 'Find venues, teammates and games around your city in just a few taps.',
    image: onboardingWelcomeIllustration,
  },
  {
    key: 'playpals',
    title: 'Find Your Playpals',
    subtitle: 'Match with players at your level, chat instantly and organise games that stick.',
    image: onboardingPlaypalsIllustration,
  },
  {
    key: 'gametime',
    title: 'Join or Host Gametime',
    subtitle: 'Browse pickup games, tournaments and coaching sessions – or create your own.',
    image: onboardingGametimeIllustration,
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onDone }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [index, setIndex] = useState(0);
  const [showLaunch, setShowLaunch] = useState(true);

  const sheetTranslateY = useRef(new Animated.Value(0)).current;

  // Ball starts centered, then rolls off to the left while letters emerge
  const ballTranslateX = useRef(new Animated.Value(0)).current;
  const ballRotation = useRef(new Animated.Value(0)).current;

  // Letters start stacked behind the ball (translateX = LETTER_START_X[i])
  // and animate to 0 (their natural centered-row position).
  const letterOpacities = useRef(LAUNCH_LETTERS.map(() => new Animated.Value(0))).current;
  const letterTranslateXs = useRef(
    LAUNCH_LETTERS.map((_, idx) => new Animated.Value(LETTER_START_X[idx]))
  ).current;
  const letterScales = useRef(LAUNCH_LETTERS.map(() => new Animated.Value(0.6))).current;
  const letterRotations = useRef(LAUNCH_LETTERS.map(() => new Animated.Value(0))).current;

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const accentColor = index === 0 ? colors.primary : index === 1 ? colors.accent : colors.warning;

  useEffect(() => {
    // -- Phase 1: Ball sits centered for a dramatic pause --
    const initialPause = Animated.delay(1000);

    // -- Phase 2: Ball rolls off to the left --
    const BALL_ROLL_DURATION = 1400;
    const ballRollLeft = Animated.parallel([
      Animated.timing(ballTranslateX, {
        toValue: -(SCREEN_WIDTH / 2 + BALL_SIZE),
        duration: BALL_ROLL_DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ballRotation, {
        toValue: -720,
        duration: BALL_ROLL_DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    // -- Phase 3: Letters emerge one-by-one AFTER the ball has left --
    // Each letter: opacity 0→1, translateX from LETTER_START_X→0,
    // rotation (rolling), scale 0.6→1 with bounce.
    const STAGGER_DELAY = 280; // ms between each letter start
    const LETTER_DURATION = 850; // how long each letter takes to settle

    const letterAnims = LAUNCH_LETTERS.map((_, idx) => {
      const rotationTarget = LETTER_START_X[idx] > 0 ? -360 : 360;

      return Animated.parallel([
        // Fade in
        Animated.timing(letterOpacities[idx], {
          toValue: 1,
          duration: LETTER_DURATION * 0.5,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Slide to final position
        Animated.timing(letterTranslateXs[idx], {
          toValue: 0,
          duration: LETTER_DURATION,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        // Scale up with bounce
        Animated.timing(letterScales[idx], {
          toValue: 1,
          duration: LETTER_DURATION,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        // Rolling rotation
        Animated.timing(letterRotations[idx], {
          toValue: rotationTarget,
          duration: LETTER_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
    });

    // -- Phase 4: Hold the centered wordmark --
    const holdWordmark = Animated.delay(2200);

    // -- Phase 5: Curtain-drop reveal (sheet slides down) --
    const curtainDrop = Animated.timing(sheetTranslateY, {
      toValue: SCREEN_HEIGHT,
      duration: 1000,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });

    Animated.sequence([
      initialPause,
      // First the ball rolls off to the left
      ballRollLeft,
      // Small pause before letters start appearing
      Animated.delay(300),
      // Then letters emerge one by one
      Animated.stagger(STAGGER_DELAY, letterAnims),
      holdWordmark,
      curtainDrop,
    ]).start(() => setShowLaunch(false));
  }, []);

  const finish = () => {
    if (onDone) {
      onDone();
    }
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (isLast) {
      finish();
    } else {
      setIndex((prev) => Math.min(prev + 1, SLIDES.length - 1));
    }
  };

  const handleSkip = () => {
    finish();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        {/* Top bar with pagination dots (left) and Skip action (right) */}
        <View style={styles.topBar}>
          <View style={styles.topDotsRow}>
            {SLIDES.map((s, i) => {
              const active = i === index;
              return (
                <View
                  key={s.key}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: accentColor,
                      width: active ? 38 : 8,
                      opacity: active ? 1 : 0.3,
                    },
                  ]}
                />
              );
            })}
          </View>
          <TouchableOpacity
            onPress={handleSkip}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipTopText, { color: colors.textSecondary }]}>
              {isLast ? 'Skip to Login >' : 'Skip >'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Large illustration background */}
        <View style={styles.heroContainer}>
          <Image source={slide.image} style={styles.heroImage} resizeMode="contain" />
        </View>

        

        {/* Bottom panel with solid per-slide accent color */}
        <View style={[styles.actionsContainer, { backgroundColor: accentColor }]}>
          <View style={styles.textBlock}>
            <Text style={[styles.title, { color: '#FFFFFF' }]}>{slide.title}</Text>
            <Text style={[styles.subtitle, { color: '#FFFFFF' }]}>{slide.subtitle}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: accentColor }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={[styles.primaryButtonText, { color: '#FFFFFF' }]}>
                {isLast ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showLaunch && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              styles.launchSheet,
              {
                backgroundColor: colors.warning,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={styles.launchContent}>
              {/* Letters layer – sits BEHIND the ball (lower zIndex) */}
              <View style={styles.launchWordRow}>
                {LAUNCH_LETTERS.map((letter, idx) => (
                  <Animated.Text
                    key={letter}
                    style={[
                      styles.launchLetter,
                      {
                        color: colors.textPrimary,
                        opacity: letterOpacities[idx],
                        transform: [
                          { translateX: letterTranslateXs[idx] },
                          { scale: letterScales[idx] },
                          {
                            rotate: letterRotations[idx].interpolate({
                              inputRange: [-360, 0, 360],
                              outputRange: ['-360deg', '0deg', '360deg'],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {letter}
                  </Animated.Text>
                ))}
              </View>

              {/* Ball layer – sits IN FRONT of letters (higher zIndex), rolls left */}
              <Animated.View
                style={[
                  styles.launchBallWrapper,
                  {
                    transform: [
                      { translateX: ballTranslateX },
                      {
                        rotate: ballRotation.interpolate({
                          inputRange: [-720, 0],
                          outputRange: ['-720deg', '0deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image
                  source={TennisBallPng}
                  resizeMode="contain"
                  style={styles.launchBallImage}
                />
              </Animated.View>
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    justifyContent: 'flex-end',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heroContainer: {
    flex: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  cardWrapper: {
    marginTop: -spacing.xl,
  },
  card: {
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  topDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  launchSheet: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  launchContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchBallWrapper: {
    position: 'absolute',
    zIndex: 2,
  },
  launchBallImage: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
  },
  launchWordRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  launchLetter: {
    fontFamily: fontFamily.roundedBold,
    fontSize: 52,
    letterSpacing: 3,
    marginHorizontal: 3,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actions: {
    marginTop: spacing.sm,
  },
  actionsContainer: {
    marginTop: spacing.lg,
    // Full-bleed bottom panel (no side or bottom margin)
    marginHorizontal: -spacing.xl,
    marginBottom: -spacing.xxl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  skipTopText: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  primaryButton: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    // borderColor: 'rgba(0,0,0,0.16)', // subtle darker outline like reference
    // Strong shadow for elevated CTA
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  secondaryButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  footerText: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});

export default OnboardingScreen;

