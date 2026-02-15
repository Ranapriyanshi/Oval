import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { gametimeApi } from '../../services/gametime';

const EVENT_TYPES = ['casual', 'competitive', 'training'] as const;
const SKILL_LEVELS = ['any', 'beginner', 'intermediate', 'advanced'] as const;

const GametimeCreateScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState('');
  const [sportName, setSportName] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<typeof EVENT_TYPES[number]>('casual');
  const [skillLevel, setSkillLevel] = useState<typeof SKILL_LEVELS[number]>('any');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [costCents, setCostCents] = useState('0');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Simple date: days from now picker
  const [daysFromNow, setDaysFromNow] = useState(1);
  const [startHour, setStartHour] = useState('10');
  const [startMin, setStartMin] = useState('00');
  const [durationHours, setDurationHours] = useState('2');

  const handleCreate = async () => {
    if (!title.trim() || !sportName.trim()) {
      Alert.alert('Missing info', 'Title and sport are required.');
      return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysFromNow);
    startDate.setHours(parseInt(startHour) || 10, parseInt(startMin) || 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + (parseInt(durationHours) || 2));

    try {
      setSubmitting(true);
      await gametimeApi.create({
        title: title.trim(),
        sport_name: sportName.trim(),
        description: description.trim() || undefined,
        event_type: eventType,
        skill_level: skillLevel,
        venue_name: venueName.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        max_players: parseInt(maxPlayers) || 10,
        cost_per_person_cents: Math.round((parseFloat(costCents) || 0) * 100),
        notes: notes.trim() || undefined,
      });
      Alert.alert(t('gametime.created'), t('gametime.createdMessage'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('gametime.createEvent')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.eventTitle')} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Saturday Morning Tennis"
          placeholderTextColor={colors.textTertiary}
        />

        {/* Sport */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.sport')} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={sportName}
          onChangeText={setSportName}
          placeholder="e.g. Tennis, Soccer, Basketball"
          placeholderTextColor={colors.textTertiary}
        />

        {/* Event type */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.eventType')}</Text>
        <View style={styles.chipRow}>
          {EVENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, { backgroundColor: eventType === type ? colors.primary : colors.chipBackground }]}
              onPress={() => setEventType(type)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color: eventType === type ? colors.textInverse : colors.chipText }]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Skill level */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.skillLevel')}</Text>
        <View style={styles.chipRow}>
          {SKILL_LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.chip, { backgroundColor: skillLevel === level ? colors.primary : colors.chipBackground }]}
              onPress={() => setSkillLevel(level)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color: skillLevel === level ? colors.textInverse : colors.chipText }]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* When */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.when')}</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>Days from now</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={[styles.stepperBtn, { backgroundColor: colors.chipBackground }]} onPress={() => setDaysFromNow(Math.max(0, daysFromNow - 1))}>
                <Text style={[styles.stepperText, { color: colors.textPrimary }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: colors.textPrimary }]}>{daysFromNow}</Text>
              <TouchableOpacity style={[styles.stepperBtn, { backgroundColor: colors.chipBackground }]} onPress={() => setDaysFromNow(daysFromNow + 1)}>
                <Text style={[styles.stepperText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.dateField}>
            <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>Start time</Text>
            <View style={styles.timeInputRow}>
              <TextInput style={[styles.timeInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]} value={startHour} onChangeText={setStartHour} keyboardType="number-pad" maxLength={2} />
              <Text style={[styles.timeSep, { color: colors.textPrimary }]}>:</Text>
              <TextInput style={[styles.timeInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]} value={startMin} onChangeText={setStartMin} keyboardType="number-pad" maxLength={2} />
            </View>
          </View>
          <View style={styles.dateField}>
            <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>Duration (hrs)</Text>
            <TextInput style={[styles.smallInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]} value={durationHours} onChangeText={setDurationHours} keyboardType="number-pad" maxLength={2} />
          </View>
        </View>

        {/* Venue */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.venueName')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={venueName}
          onChangeText={setVenueName}
          placeholder="e.g. Moore Park Indoor"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.address')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={address}
          onChangeText={setAddress}
          placeholder="e.g. 100 Driver Ave, Moore Park"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.city')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Sydney"
          placeholderTextColor={colors.textTertiary}
        />

        {/* Max players */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.maxPlayers')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={maxPlayers}
          onChangeText={setMaxPlayers}
          keyboardType="number-pad"
          placeholder="10"
          placeholderTextColor={colors.textTertiary}
        />

        {/* Cost */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.costPerPerson')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={costCents}
          onChangeText={setCostCents}
          keyboardType="decimal-pad"
          placeholder="0 (free)"
          placeholderTextColor={colors.textTertiary}
        />

        {/* Description */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.description')}</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the event..."
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={3}
        />

        {/* Notes */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gametime.notes')}</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any extra info for participants..."
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={2}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }, submitting && styles.disabledButton]}
          onPress={handleCreate}
          disabled={submitting}
          activeOpacity={0.7}
        >
          <Text style={[styles.submitText, { color: colors.textInverse }]}>
            {submitting ? t('common.loading') : t('gametime.createEvent')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: 52,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { paddingVertical: spacing.xs, width: 60 },
  backText: { fontSize: fontSize.lg, fontWeight: fontWeight.medium },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxxl * 2 },

  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: fontSize.base,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },

  dateRow: { flexDirection: 'row', gap: spacing.md },
  dateField: { flex: 1 },
  dateLabel: { fontSize: fontSize.xs, marginBottom: spacing.xs },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  stepperValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, minWidth: 30, textAlign: 'center' },

  timeInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  timeInput: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    width: 44,
    textAlign: 'center',
  },
  timeSep: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginHorizontal: 4 },
  smallInput: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  submitButton: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  disabledButton: { opacity: 0.6 },
  submitText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
});

export default GametimeCreateScreen;
