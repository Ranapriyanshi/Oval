import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import chatApi, { ChatMessage } from '../../services/chat';
import { connectSocket, getSocket } from '../../services/socket';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../../theme';

const ChatScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { conversationId, otherUser } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        setCurrentUserId(parsed.id);
      }
    };
    getUserId();
  }, []);

  // Set header title
  useEffect(() => {
    navigation.setOptions({
      headerTitle: otherUser?.name || t('chat.chat', 'Chat'),
    });
  }, [navigation, otherUser]);

  // Load messages
  const loadMessages = async () => {
    try {
      const data = await chatApi.getMessages(conversationId);
      setMessages(data.messages);
      setHasMore(data.has_more);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load older messages
  const loadOlderMessages = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const data = await chatApi.getMessages(conversationId, {
        before: messages[0].id,
      });
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.has_more);
    } catch (error) {
      console.error('Failed to load older messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  // Socket: real-time messaging
  useEffect(() => {
    let mounted = true;
    const setup = async () => {
      const socket = await connectSocket();

      // Join conversation room
      socket.emit('conversation:join', conversationId);

      // New message
      socket.on('message:new', (message: ChatMessage) => {
        if (!mounted) return;
        if (message.conversation_id !== conversationId) return;
        setMessages((prev) => {
          // Deduplicate
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        // Mark as read if from other user
        if (message.sender_id !== currentUserId) {
          socket.emit('messages:read', conversationId);
        }
      });

      // Typing indicators
      socket.on('typing:start', (data: any) => {
        if (data.conversationId === conversationId && mounted) {
          setIsTyping(true);
        }
      });

      socket.on('typing:stop', (data: any) => {
        if (data.conversationId === conversationId && mounted) {
          setIsTyping(false);
        }
      });

      // Messages marked read
      socket.on('messages:read', (data: any) => {
        if (data.conversationId === conversationId && mounted) {
          setMessages((prev) =>
            prev.map((m) =>
              m.sender_id === currentUserId && !m.is_read
                ? { ...m, is_read: true }
                : m
            )
          );
        }
      });

      // Mark existing unread messages as read
      socket.emit('messages:read', conversationId);
    };

    if (currentUserId) setup();

    return () => {
      mounted = false;
      const socket = getSocket();
      if (socket) {
        socket.emit('conversation:leave', conversationId);
        socket.off('message:new');
        socket.off('typing:start');
        socket.off('typing:stop');
        socket.off('messages:read');
      }
    };
  }, [conversationId, currentUserId]);

  // Send message
  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setInputText('');

    // Stop typing indicator
    const socket = getSocket();
    socket?.emit('typing:stop', conversationId);

    try {
      // Try socket first
      if (socket?.connected) {
        socket.emit(
          'message:send',
          { conversationId, content: trimmed },
          (response: any) => {
            if (response?.error) {
              // Fallback to REST
              chatApi.sendMessage(conversationId, trimmed);
            }
            setSending(false);
          }
        );
      } else {
        // REST fallback
        await chatApi.sendMessage(conversationId, trimmed);
        setSending(false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setSending(false);
      setInputText(trimmed); // Restore text on failure
    }
  };

  // Typing indicator
  const handleInputChange = (text: string) => {
    setInputText(text);
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('typing:start', conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', conversationId);
      }, 2000);
    }
  };

  // Format time
  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Date separator
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('chat.today', 'Today');
    if (diffDays === 1) return t('chat.yesterday', 'Yesterday');
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const shouldShowDate = (index: number) => {
    if (index === 0) return true;
    const current = new Date(messages[index].created_at).toDateString();
    const previous = new Date(messages[index - 1].created_at).toDateString();
    return current !== previous;
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMe = item.sender_id === currentUserId;
    const isSystem = item.message_type === 'system';
    const showDate = shouldShowDate(index);

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            <View style={styles.dateLine} />
          </View>
        )}

        {isSystem ? (
          <View style={styles.systemMessage}>
            <Text style={styles.systemMessageText}>{item.content}</Text>
          </View>
        ) : (
          <View style={[styles.messageBubbleRow, isMe && styles.messageBubbleRowMe]}>
            <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
              <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                {item.content}
              </Text>
              <View style={styles.messageFooter}>
                <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
                  {formatMessageTime(item.created_at)}
                </Text>
                {isMe && (
                  <Text style={styles.readReceipt}>
                    {item.is_read ? '✓✓' : '✓'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        onLayout={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        onStartReached={loadOlderMessages}
        onStartReachedThreshold={0.3}
        ListHeaderComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyIcon}>👋</Text>
            <Text style={styles.emptyText}>
              {t('chat.startConversation', 'Say hello!')}
            </Text>
          </View>
        }
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>
            {otherUser?.name || 'User'} {t('chat.isTyping', 'is typing...')}
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder={t('chat.typeMessage', 'Type a message...')}
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={5000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          activeOpacity={0.7}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            <Text style={styles.sendButtonText}>▶</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  messageList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexGrow: 1,
  },
  // Date separator
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dateText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
    fontWeight: fontWeight.medium,
  },
  // System message
  systemMessage: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  systemMessageText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontStyle: 'italic',
    backgroundColor: colors.chipBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  // Message bubbles
  messageBubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs + 2,
    justifyContent: 'flex-start',
  },
  messageBubbleRowMe: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md + 2,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.xs + 2,
    borderRadius: borderRadius.lg,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: spacing.xs,
    ...shadow.sm,
  },
  messageText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  messageTextMe: {
    color: colors.textInverse,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  messageTime: {
    fontSize: fontSize.xs - 1,
    color: colors.textTertiary,
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.65)',
  },
  readReceipt: {
    fontSize: fontSize.xs - 1,
    color: 'rgba(255,255,255,0.65)',
    marginLeft: spacing.xs,
  },
  // Typing
  typingIndicator: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
  },
  typingText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.chipBackground,
  },
  sendButtonText: {
    fontSize: fontSize.lg,
    color: colors.textInverse,
  },
  // Loading
  loadingMore: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  // Empty
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});

export default ChatScreen;
