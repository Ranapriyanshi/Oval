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
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';
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

  const renderMatchItem = ({ item }: { item: MatchItem }) => {
    const user = item.user;
    const initial = user.name?.charAt(0)?.toUpperCase() || '?';
    const skills = user.UserSportsSkills || [];
    const photo = user.UserProfilePhotos?.[0];

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => navigation.navigate('PlaypalProfile', { userId: user.id })}
        activeOpacity={0.7}
      >
        <View style={styles.matchCardInner}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          {/* Info */}
          <View style={styles.matchInfo}>
            <Text style={styles.matchName}>{user.name}</Text>
            {user.city && (
              <Text style={styles.matchLocation}>📍 {user.city}</Text>
            )}
            {/* Sports chips */}
            {skills.length > 0 && (
              <View style={styles.sportsRow}>
                {skills.slice(0, 3).map((skill) => (
                  <View key={skill.id} style={styles.sportMiniChip}>
                    <Text style={styles.sportMiniEmoji}>
                      {SPORT_EMOJIS[skill.sport_name.toLowerCase()] || '🏅'}
                    </Text>
                    <Text style={styles.sportMiniText}>{skill.sport_name}</Text>
                  </View>
                ))}
                {skills.length > 3 && (
                  <View style={styles.sportMiniChip}>
                    <Text style={styles.sportMiniText}>+{skills.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
            <Text style={styles.matchDate}>
              {t('playpals.matchedOn', { date: formatDate(item.matched_at) })}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.matchActions}>
            <TouchableOpacity
              style={styles.messageButton}
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
              <Text style={styles.unmatchIcon}>•••</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('playpals.matches')}</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('playpals.matches')}</Text>
        {matches.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{matches.length}</Text>
          </View>
        )}
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🤝</Text>
          <Text style={styles.emptyTitle}>{t('playpals.noMatches')}</Text>
          <Text style={styles.emptySubtitle}>{t('playpals.startDiscovering')}</Text>
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={() => navigation.navigate('Discover')}
            activeOpacity={0.7}
          >
            <Text style={styles.discoverButtonText}>{t('playpals.goDiscover')}</Text>
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
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  countBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textInverse,
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
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  matchLocation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
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
    backgroundColor: colors.chipBackground,
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
    color: colors.chipText,
    fontWeight: fontWeight.medium,
  },
  matchDate: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
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
    backgroundColor: colors.primaryLight,
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
    color: colors.textTertiary,
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
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  discoverButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.pill,
  },
  discoverButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textInverse,
  },
});

export default MatchesScreen;
