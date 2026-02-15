import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';
import { playpalsApi, MatchItem } from '../../services/playpals';
import chatApi from '../../services/chat';

const SPORT_EMOJIS: Record<string, string> = {
  tennis: '🎾',
  basketball: '🏀',
  soccer: '⚽',
  football: '🏈',
  cricket: '🏏',
  swimming: '🏊',
  running: '🏃',
  cycling: '🚴',
  volleyball: '🏐',
  badminton: '🏸',
  golf: '⛳',
  hockey: '🏒',
};

const MatchesScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = useCallback(async () => {
    try {
      const response = await playpalsApi.getMatches();
      setMatches(response.data.matches);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  const handleUnmatch = (matchItem: MatchItem) => {
    Alert.alert(
      t('playpals.unmatch'),
      t('playpals.unmatchConfirm', { name: matchItem.user.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('playpals.unmatch'),
          style: 'destructive',
          onPress: async () => {
            try {
              await playpalsApi.unmatch(matchItem.user.id);
              setMatches((prev) => prev.filter((m) => m.match_id !== matchItem.match_id));
            } catch (error) {
              console.error('Unmatch failed:', error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderMatchItem = ({ item, index }: { item: MatchItem; index: number }) => {
    const user = item.user;
    const initial = user.name?.charAt(0)?.toUpperCase() || '?';
    const skills = user.UserSportsSkills || [];
    const photo = user.UserProfilePhotos?.[0];
    const isAlt = index % 2 === 1;
    const bg = isAlt ? colors.cardAltBackground : colors.cardBackground;
    const border = isAlt ? colors.cardAltBorder : colors.cardBorder;
    const t1 = isAlt ? colors.cardAltTextPrimary : colors.textPrimary;
    const t2 = isAlt ? colors.cardAltTextSecondary : colors.textSecondary;
    const t3 = isAlt ? colors.cardAltTextSecondary : colors.textTertiary;
    const chipBg = isAlt ? colors.cardAltChipBackground : colors.chipBackground;
    const chipTxt = isAlt ? colors.cardAltChipText : colors.chipText;

    return (
      <TouchableOpacity
        style={[styles.matchCard, { backgroundColor: bg, borderColor: border }]}
        onPress={() => navigation.navigate('PlaypalProfile', { userId: user.id })}
        activeOpacity={0.7}
      >
        <View style={styles.matchCardInner}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: isAlt ? 'rgba(255,255,255,0.25)' : colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: isAlt ? colors.textInverse : colors.primary }]}>{initial}</Text>
          </View>

          {/* Info */}
          <View style={styles.matchInfo}>
            <Text style={[styles.matchName, { color: t1 }]}>{user.name}</Text>
            {user.city && (
              <Text style={[styles.matchLocation, { color: t2 }]}>📍 {user.city}</Text>
            )}
            {/* Sports chips */}
            {skills.length > 0 && (
              <View style={styles.sportsRow}>
                {skills.slice(0, 3).map((skill) => (
                  <View key={skill.id} style={[styles.sportMiniChip, { backgroundColor: chipBg }]}>
                    <Text style={styles.sportMiniEmoji}>
                      {SPORT_EMOJIS[skill.sport_name.toLowerCase()] || '🏅'}
                    </Text>
                    <Text style={[styles.sportMiniText, { color: chipTxt }]}>{skill.sport_name}</Text>
                  </View>
                ))}
                {skills.length > 3 && (
                  <View style={[styles.sportMiniChip, { backgroundColor: chipBg }]}>
                    <Text style={[styles.sportMiniText, { color: chipTxt }]}>+{skills.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
            <Text style={[styles.matchDate, { color: t3 }]}>
              {t('playpals.matchedOn', { date: formatDate(item.matched_at) })}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.matchActions}>
            <TouchableOpacity
              style={[styles.messageButton, { backgroundColor: isAlt ? 'rgba(255,255,255,0.25)' : colors.primaryLight }]}
              onPress={async () => {
                try {
                  const conv = await chatApi.startConversation(user.id);
                  navigation.navigate('ChatConversation', {
                    conversationId: conv.id,
                    otherUser: { id: user.id, name: user.name, city: user.city },
                  });
                } catch (error) {
                  console.error('Start conversation failed:', error);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.messageButtonText}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.unmatchButton}
              onPress={() => handleUnmatch(item)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={[styles.unmatchIcon, { color: t3 }]}>•••</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('playpals.matches')}</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('playpals.matches')}</Text>
        {matches.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.countBadgeText, { color: colors.textInverse }]}>{matches.length}</Text>
          </View>
        )}
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🤝</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t('playpals.noMatches')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{t('playpals.startDiscovering')}</Text>
          <TouchableOpacity
            style={[styles.discoverButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Discover')}
            activeOpacity={0.7}
          >
            <Text style={[styles.discoverButtonText, { color: colors.textInverse }]}>{t('playpals.goDiscover')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.match_id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  countBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },

  // Match card
  matchCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    ...shadow.sm,
  },
  matchCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  matchLocation: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  sportsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  sportMiniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    gap: 3,
  },
  sportMiniEmoji: {
    fontSize: 12,
  },
  sportMiniText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  matchDate: {
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  matchActions: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    fontSize: 18,
  },
  unmatchButton: {
    padding: spacing.sm,
  },
  unmatchIcon: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  discoverButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
  },
  discoverButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});

export default MatchesScreen;
