import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, fontFamily } from '../../theme';

const parrotImage = require('../../assets/Stylized 3D Parrot Illustration.png');
const mascotImage = require('../../assets/Colorful Clay Bird.png');
const basketballImage = require('../../assets/Stylized Yellow Basketball.png');
const soccerBallImage = require('../../assets/Classic Soccer Ball.png');
const tennisImage = require('../../assets/Red Tennis Racket on Turquoise Background.png');
const skateboardImage = require('../../assets/Retro Cruiser Skateboard in Vibrant Blue and Red.png');
const snowboardImage = require('../../assets/Dynamic Snowboarder.png');
const swimImage = require('../../assets/Diver in Turquoise Gear.png');
const compassImage = require('../../assets/3D Colorful Compass.png');
const trophyImage = require('../../assets/Minimalist Yellow Trophy.png');
const starImage = require('../../assets/Star Object Design.png');

type OnboardingScreenProps = {
  onDone?: () => void;
};

type Phase = 'splash' | 'welcome' | 'quiz';

type OptionItem = {
  id: string;
  label: string;
  icon?: any;
  description?: string;
};

type OnboardingStep = {
  key: string;
  mascotMessage: string;
  question?: string;
  options: OptionItem[];
  multiSelect?: boolean;
};

const SIGNAL_LEVELS = [1, 2, 3, 4, 5];

const STEPS: OnboardingStep[] = [
  {
    key: 'sports',
    mascotMessage: "Hey there! Let's find your game!",
    question: 'What sports do you play?',
    multiSelect: true,
    options: [
      { id: 'football', label: 'Football / Soccer', icon: soccerBallImage },
      { id: 'basketball', label: 'Basketball', icon: basketballImage },
      { id: 'tennis', label: 'Tennis / Badminton', icon: tennisImage },
      { id: 'skateboarding', label: 'Skateboarding', icon: skateboardImage },
      { id: 'snowboarding', label: 'Snowboarding', icon: snowboardImage },
      { id: 'swimming', label: 'Swimming / Diving', icon: swimImage },
    ],
  },
  {
    key: 'level',
    mascotMessage: "Nice picks! Now let's see your level.",
    question: "What's your skill level?",
    multiSelect: false,
    options: [
      { id: 'beginner', label: "I'm brand new" },
      { id: 'casual', label: 'I play casually' },
      { id: 'intermediate', label: 'I can hold my own' },
      { id: 'competitive', label: "I'm pretty competitive" },
      { id: 'advanced', label: 'I play at a high level' },
    ],
  },
  {
    key: 'goal',
    mascotMessage: "Awesome! Now let's find your starting point.",
    question: 'What are you looking for?',
    multiSelect: false,
    options: [
      {
        id: 'find_games',
        label: 'Find pickup games',
        description: 'Browse and join games happening near you',
        icon: compassImage,
      },
      {
        id: 'find_teammates',
        label: 'Meet new teammates',
        description: 'Connect with players at your skill level',
        icon: starImage,
      },
      {
        id: 'compete',
        label: 'Compete & improve',
        description: 'Join tournaments and track your progress',
        icon: trophyImage,
      },
    ],
  },
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TRANSITION_DURATION = 350;

/* ─── Signal Bars (skill level indicator) ─── */
const SignalBars: React.FC<{ level: number; active: boolean; activeColor: string }> = ({
  level,
  active,
  activeColor,
}) => (
  <View style={signalStyles.container}>
    {SIGNAL_LEVELS.map((bar) => (
      <View
        key={bar}
        style={[
          signalStyles.bar,
          {
            height: 6 + bar * 4,
            backgroundColor:
              bar <= level
                ? active
                  ? '#FFFFFF'
                  : activeColor
                : active
                  ? 'rgba(255,255,255,0.3)'
                  : 'rgba(255,255,255,0.15)',
          },
        ]}
      />
    ))}
  </View>
);

const signalStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginRight: spacing.sm },
  bar: { width: 5, borderRadius: 2 },
});

/* ═══════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════ */
const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onDone }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [phase, setPhase] = useState<Phase>('splash');
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  // Splash animations
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(0.8)).current;

  // Welcome screen animations
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const parrotScale = useRef(new Animated.Value(0.6)).current;
  const welcomeTextTranslate = useRef(new Animated.Value(30)).current;
  const welcomeButtonsTranslate = useRef(new Animated.Value(60)).current;
  const welcomeButtonsOpacity = useRef(new Animated.Value(0)).current;

  // Quiz animations
  const progressAnim = useRef(new Animated.Value(1 / STEPS.length)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const mascotSlide = useRef(new Animated.Value(-100)).current;
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const optionsTranslateY = useRef(new Animated.Value(40)).current;
  const optionsOpacity = useRef(new Animated.Value(0)).current;
  const isTransitioning = useRef(false);

  const step = STEPS[stepIndex];
  const currentSelections = selections[step?.key] || [];

  /* ─── Phase 1: Splash → Welcome ─── */
  useEffect(() => {
    Animated.spring(splashScale, {
      toValue: 1,
      tension: 40,
      friction: 6,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setPhase('welcome');
        animateWelcomeIn();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  /* ─── Welcome entrance animations ─── */
  const animateWelcomeIn = () => {
    welcomeOpacity.setValue(0);
    parrotScale.setValue(0.6);
    welcomeTextTranslate.setValue(30);
    welcomeButtonsTranslate.setValue(60);
    welcomeButtonsOpacity.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(welcomeOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(parrotScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(welcomeTextTranslate, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(welcomeButtonsOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(welcomeButtonsTranslate, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  /* ─── Quiz step entrance animations ─── */
  const animateStepIn = () => {
    mascotSlide.setValue(-100);
    bubbleScale.setValue(0);
    optionsTranslateY.setValue(40);
    optionsOpacity.setValue(0);

    Animated.sequence([
      Animated.spring(mascotSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(bubbleScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(optionsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(optionsTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  /* ─── Navigation helpers ─── */
  const goToLogin = () => {
    if (onDone) onDone();
    navigation.replace('Login');
  };

  const startQuiz = () => {
    setPhase('quiz');
    setTimeout(() => animateStepIn(), 50);
  };

  const finishQuiz = () => {
    if (onDone) onDone();
    navigation.replace('Register');
  };

  /* ─── Quiz logic ─── */
  const toggleSelection = (optionId: string) => {
    const stepKey = step.key;
    setSelections((prev) => {
      const current = prev[stepKey] || [];
      if (step.multiSelect) {
        return {
          ...prev,
          [stepKey]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      }
      return { ...prev, [stepKey]: [optionId] };
    });
  };

  const transitionToStep = (nextIndex: number) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    const targetProgress = (nextIndex + 1) / STEPS.length;

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: TRANSITION_DURATION / 2,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: targetProgress,
        duration: TRANSITION_DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      setStepIndex(nextIndex);
      contentOpacity.setValue(1);
      isTransitioning.current = false;
      animateStepIn();
    });
  };

  const handleContinue = () => {
    if (stepIndex === STEPS.length - 1) {
      finishQuiz();
    } else {
      transitionToStep(stepIndex + 1);
    }
  };

  const handleSkip = () => finishQuiz();

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const isSelected = (optionId: string) => currentSelections.includes(optionId);
  const canContinue = currentSelections.length > 0;

  /* ═══════════════════════════════════════════════
     RENDER — Splash
     ═══════════════════════════════════════════════ */
  if (phase === 'splash') {
    return (
      <Animated.View
        style={[
          styles.splashContainer,
          { backgroundColor: colors.primary, opacity: splashOpacity },
        ]}
      >
        <Animated.Text
          style={[styles.splashLogo, { transform: [{ scale: splashScale }] }]}
        >
          OVAL
        </Animated.Text>
      </Animated.View>
    );
  }

  /* ═══════════════════════════════════════════════
     RENDER — Welcome (Get Started / I have an account)
     ═══════════════════════════════════════════════ */
  if (phase === 'welcome') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.welcomeContainer, { opacity: welcomeOpacity }]}>
          {/* Parrot illustration */}
          <View style={styles.welcomeHeroArea}>
            <Animated.Image
              source={parrotImage}
              style={[
                styles.parrotImage,
                { transform: [{ scale: parrotScale }] },
              ]}
              resizeMode="contain"
            />
          </View>

          {/* Tagline */}
          <Animated.View
            style={[
              styles.welcomeTextBlock,
              { transform: [{ translateY: welcomeTextTranslate }] },
            ]}
          >
            <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
              The fun, social way{'\n'}to find your next game!
            </Text>
          </Animated.View>

          {/* Buttons */}
          <Animated.View
            style={[
              styles.welcomeActions,
              {
                opacity: welcomeButtonsOpacity,
                transform: [{ translateY: welcomeButtonsTranslate }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.getStartedBtn, { backgroundColor: colors.primary }]}
              onPress={startQuiz}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>GET STARTED</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.haveAccountBtn, { borderColor: colors.primary }]}
              onPress={goToLogin}
              activeOpacity={0.8}
            >
              <Text style={[styles.haveAccountText, { color: colors.primary }]}>
                I ALREADY HAVE AN ACCOUNT
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  /* ═══════════════════════════════════════════════
     RENDER — Quiz questionnaire
     ═══════════════════════════════════════════════ */
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.quizContainer, { backgroundColor: colors.backgroundSecondary }]}>
        {/* Progress bar */}
        <View style={styles.topBar}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: progressWidth },
              ]}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Mascot + Speech bubble */}
          <Animated.View
            style={[
              styles.mascotRow,
              { opacity: contentOpacity, transform: [{ translateX: mascotSlide }] },
            ]}
          >
            <Image source={mascotImage} style={styles.mascotImage} resizeMode="contain" />
            <Animated.View
              style={[
                styles.speechBubble,
                {
                  backgroundColor: colors.surface,
                  transform: [{ scale: bubbleScale }],
                },
              ]}
            >
              <Text style={[styles.speechText, { color: colors.textPrimary }]}>
                {step.mascotMessage}
              </Text>
              <View style={[styles.speechTail, { borderRightColor: colors.surface }]} />
            </Animated.View>
          </Animated.View>

          {/* Question title */}
          {step.question && (
            <Animated.View style={{ opacity: contentOpacity }}>
              <Text style={[styles.questionTitle, { color: colors.textPrimary }]}>
                {step.question}
              </Text>
              {step.multiSelect && (
                <Text style={[styles.multiHint, { color: colors.textSecondary }]}>
                  Select all that apply
                </Text>
              )}
            </Animated.View>
          )}

          {/* Option cards */}
          <Animated.View
            style={[
              styles.optionsContainer,
              {
                opacity: optionsOpacity,
                transform: [{ translateY: optionsTranslateY }],
              },
            ]}
          >
            {step.options.map((option, idx) => {
              const selected = isSelected(option.id);
              const isLevelStep = step.key === 'level';
              const levelIndex = idx + 1;

              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: selected ? colors.primary : colors.surface,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleSelection(option.id)}
                  activeOpacity={0.7}
                >
                  {isLevelStep && (
                    <SignalBars level={levelIndex} active={selected} activeColor={colors.primary} />
                  )}
                  {option.icon && !isLevelStep && (
                    <Image
                      source={option.icon}
                      style={option.description ? styles.optionIconLarge : styles.optionIcon}
                      resizeMode="contain"
                    />
                  )}
                  <View style={option.description ? styles.optionTextBlock : styles.optionLabelWrap}>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: selected ? '#FFFFFF' : colors.textPrimary,
                          fontWeight: option.description ? fontWeight.bold : fontWeight.semibold,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.description && (
                      <Text
                        style={[
                          styles.optionDescription,
                          { color: selected ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
                        ]}
                      >
                        {option.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </ScrollView>

        {/* Bottom actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: canContinue ? colors.primary : colors.border },
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!canContinue}
          >
            <Text
              style={[
                styles.continueButtonText,
                { color: canContinue ? '#FFFFFF' : colors.textTertiary },
              ]}
            >
              {stepIndex === STEPS.length - 1 ? "LET'S GO!" : 'CONTINUE'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.skipBtn}>
            <Text style={[styles.skipBtnText, { color: colors.textTertiary }]}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

/* ═══════════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════════ */
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  /* ── Splash ── */
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    fontFamily: fontFamily.roundedBold,
    fontSize: 56,
    letterSpacing: 8,
    color: '#FFFFFF',
  },

  /* ── Welcome ── */
  welcomeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: spacing.xxl,
  },
  welcomeHeroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
  },
  parrotImage: {
    width: '100%',
    height: 300,
  },
  welcomeTextBlock: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.title,
    textAlign: 'center',
    lineHeight: 34,
  },
  welcomeActions: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm + 2,
  },
  getStartedBtn: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md + 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  haveAccountBtn: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md + 4,
    alignItems: 'center',
    borderWidth: 2.5,
  },
  haveAccountText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.base,
    letterSpacing: 0.5,
  },

  /* ── Quiz ── */
  quizContainer: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  topBar: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 7,
  },
  scrollArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },

  mascotRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  mascotImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  speechBubble: {
    flex: 1,
    marginLeft: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  speechTail: {
    position: 'absolute',
    left: -8,
    top: 16,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  speechText: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.base,
    lineHeight: 20,
  },

  questionTitle: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.xxl,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  multiHint: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  optionsContainer: {
    gap: spacing.sm + 2,
    marginTop: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 36,
    height: 36,
    marginRight: spacing.sm,
    borderRadius: 8,
  },
  optionIconLarge: {
    width: 48,
    height: 48,
    marginRight: spacing.md,
    borderRadius: 12,
  },
  optionLabelWrap: { flex: 1 },
  optionTextBlock: { flex: 1 },
  optionLabel: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.base,
  },
  optionDescription: {
    fontFamily: fontFamily.roundedRegular,
    fontSize: fontSize.sm,
    marginTop: 2,
    lineHeight: 17,
  },

  bottomActions: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  continueButton: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontFamily: fontFamily.roundedBold,
    fontSize: fontSize.lg,
    letterSpacing: 1,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipBtnText: {
    fontFamily: fontFamily.roundedSemibold,
    fontSize: fontSize.md,
  },
});

export default OnboardingScreen;
