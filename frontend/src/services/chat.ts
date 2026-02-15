import api from './api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ChatUser {
  id: string;
  name: string;
  city?: string;
  bio?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'system';
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  Sender?: { id: string; name: string };
}

export interface ConversationItem {
  id: string;
  other_user: ChatUser;
  last_message: ChatMessage | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

export interface ConversationsResponse {
  conversations: ConversationItem[];
}

export interface MessagesResponse {
  messages: ChatMessage[];
  has_more: boolean;
}

// ── API calls ──────────────────────────────────────────────────────────────

export const chatApi = {
  /** Get all conversations for the current user */
  getConversations: async (): Promise<ConversationsResponse> => {
    const { data } = await api.get('/chat/conversations');
    return data;
  },

  /** Start or fetch existing conversation with a user */
  startConversation: async (userId: string) => {
    const { data } = await api.post('/chat/conversations', { user_id: userId });
    return data;
  },

  /** Get messages for a conversation */
  getMessages: async (
    conversationId: string,
    options?: { limit?: number; before?: string }
  ): Promise<MessagesResponse> => {
    const params: any = {};
    if (options?.limit) params.limit = options.limit;
    if (options?.before) params.before = options.before;
    const { data } = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
    return data;
  },

  /** Send a message via REST (fallback) */
  sendMessage: async (
    conversationId: string,
    content: string,
    messageType?: string
  ): Promise<ChatMessage> => {
    const { data } = await api.post(`/chat/conversations/${conversationId}/messages`, {
      content,
      message_type: messageType || 'text',
    });
    return data;
  },

  /** Mark conversation as read */
  markRead: async (conversationId: string) => {
    const { data } = await api.post(`/chat/conversations/${conversationId}/read`);
    return data;
  },
};

export default chatApi;
