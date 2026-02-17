import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import chatApi, { ConversationItem } from '../../services/chat';
import { connectSocket, getSocket } from '../../services/socket';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme';

const ConversationsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  // Socket: listen for live conversation updates
  useEffect(() => {
    let mounted = true;
    const setup = async () => {
      const socket = await connectSocket();
      socket.on('conversation:updated', (data: any) => {
        if (!mounted) return;
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === data.conversationId);
          if (idx === -1) {
            // New conversation - reload list
            loadConversations();
            return prev;
          }
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            last_message: data.last_message,
            last_message_at: data.last_message.created_at,
            unread_count: updated[idx].unread_count + 1,
          };
          // Move to top
          updated.sort((a, b) => {
            const aTime = a.last_message_at || a.created_at;
            const bTime = b.last_message_at || b.created_at;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          });
          return updated;
        });
      });
    };
    setup();
    return () => {
      mounted = false;
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return t('chat.yesterday', 'Yesterday');
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderConversation = ({ item, index }: { item: ConversationItem; index: number }) => {
    const hasUnread = item.unread_count > 0;
    const lastMsg = item.last_message;
    let preview = '';
    if (lastMsg) {
      if (lastMsg.message_type === 'system') {
        preview = lastMsg.content;
      } else {
        preview = lastMsg.content.length > 60 ? lastMsg.content.slice(0, 60) + '...' : lastMsg.content;
      }
    }
    const isAlt = index % 2 === 1;
    const cardBg = hasUnread ? colors.primaryLight : (isAlt ? colors.cardAltBackground : colors.cardBackground);
    const t1 = isAlt && !hasUnread ? colors.cardAltTextPrimary : colors.textPrimary;
    const t2 = isAlt && !hasUnread ? colors.cardAltTextSecondary : colors.textSecondary;
    const t3 = isAlt && !hasUnread ? colors.cardAltTextSecondary : colors.textTertiary;

    return (
      <TouchableOpacity
        style={[styles.conversationCard, { backgroundColor: cardBg }]}
        onPress={() =>
          navigation.navigate('ChatConversation', {
            conversationId: item.id,
            otherUser: item.other_user,
          })
        }
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: hasUnread ? colors.primary : (isAlt ? 'rgba(255,255,255,0.25)' : colors.chipBackground) }]}>
          <Text style={[styles.avatarText, { color: hasUnread ? colors.textInverse : (isAlt ? colors.textInverse : colors.textSecondary) }]}>{getInitials(item.other_user.name)}</Text>
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, hasUnread && styles.userNameUnread, { color: t1 }]} numberOfLines={1}>
              {item.other_user.name}
            </Text>
            <Text style={[styles.timeText, hasUnread && styles.timeTextUnread, { color: hasUnread ? colors.primary : t3 }]}>
              {formatTime(item.last_message_at)}
            </Text>
          </View>

          <View style={styles.conversationFooter}>
            <Text
              style={[styles.previewText, hasUnread && styles.previewTextUnread, { color: hasUnread ? t1 : t2 }]}
              numberOfLines={1}
            >
              {preview || t('chat.noMessages', 'No messages yet')}
            </Text>
            {hasUnread && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.unreadBadgeText, { color: colors.textInverse }]}>
                  {item.unread_count > 99 ? '99+' : item.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.separator }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('chat.title', 'Messages')}</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t('chat.emptyTitle', 'No conversations yet')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {t('chat.emptySubtitle', 'Match with playpals to start chatting!')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.separator }]} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    textTransform: 'capitalize',
  },
  list: {
    paddingVertical: spacing.sm,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    flex: 1,
    marginRight: spacing.sm,
  },
  userNameUnread: {
    fontWeight: fontWeight.bold,
  },
  timeText: {
    fontSize: fontSize.xs,
  },
  timeTextUnread: {
    fontWeight: fontWeight.semibold,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewText: {
    fontSize: fontSize.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  previewTextUnread: {
    fontWeight: fontWeight.medium,
  },
  unreadBadge: {
    borderRadius: borderRadius.pill,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs + 2,
  },
  unreadBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  separator: {
    height: 1,
    marginLeft: 52 + spacing.md + spacing.xl, // avatar width + margin + padding
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ConversationsScreen;
