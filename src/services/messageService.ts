
import { Conversation, ChatMessage, UserProfile } from '../types';
import { antiNumInfo } from './securityService';

const STORAGE_KEY_CONVERSATIONS = 'apnet_conversations_db_v2';

// --- HELPERS ---

const loadConversations = (): Conversation[] => {
  const stored = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
  return stored ? JSON.parse(stored) : [];
};

const saveConversations = (conversations: Conversation[]) => {
  localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
};

const getConversationId = (user1Id: string, user2Id: string) => {
  return [user1Id, user2Id].sort().join('_');
};

// --- SERVICE API ---

export const messageService = {
  
  // Récupérer toutes les conversations d'un utilisateur
  getUserConversations: (userId: string): Conversation[] => {
    const all = loadConversations();
    // Trie par date décroissante
    return all
        .filter(c => c.participants.includes(userId))
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  },

  // Récupérer (ou créer si inexistante) une conversation spécifique
  getOrCreateConversation: (user1: UserProfile, user2: UserProfile): Conversation => {
    const all = loadConversations();
    const convId = getConversationId(user1.id, user2.id);
    
    let conv = all.find(c => c.id === convId);
    
    if (!conv) {
      conv = {
        id: convId,
        participants: [user1.id, user2.id],
        participantNames: { [user1.id]: `${user1.firstName} ${user1.lastName}`, [user2.id]: `${user2.firstName} ${user2.lastName}` },
        participantRoles: { [user1.id]: user1.role, [user2.id]: user2.role },
        messages: [],
        lastMessage: "Nouvelle conversation",
        lastMessageTime: new Date().toISOString(),
        unreadCount: { [user1.id]: 0, [user2.id]: 0 }
      };
      all.push(conv);
      saveConversations(all);
    }
    
    return conv;
  },

  // Envoyer un message (AVEC SÉCURITÉ)
  sendMessage: (
    senderId: string, 
    receiverId: string, 
    text: string, 
    image?: string,
    aiAnalysis?: any,
    isSystem: boolean = false
  ): { success: boolean; error?: string; message?: ChatMessage } => {
    
    // 1. VÉRIFICATION SÉCURITÉ (Sauf si message système)
    if (!isSystem && antiNumInfo(text)) {
        return { success: false, error: 'SECURITY_BLOCK' };
    }

    const all = loadConversations();
    const convId = getConversationId(senderId, receiverId);
    const convIndex = all.findIndex(c => c.id === convId);

    if (convIndex === -1) return { success: false, error: 'CONVERSATION_NOT_FOUND' };

    const newMessage: ChatMessage = {
        id: Date.now(),
        senderId,
        text,
        timestamp: new Date().toISOString(),
        image,
        aiAnalysis,
        isSystem
    };

    // Mise à jour conversation
    all[convIndex].messages.push(newMessage);
    all[convIndex].lastMessage = isSystem ? "Notification système" : text;
    all[convIndex].lastMessageTime = newMessage.timestamp;
    
    // Incrémenter non-lus pour le receveur
    if (!all[convIndex].unreadCount[receiverId]) all[convIndex].unreadCount[receiverId] = 0;
    all[convIndex].unreadCount[receiverId]++;

    saveConversations(all);

    return { success: true, message: newMessage };
  },

  // Marquer comme lu
  markAsRead: (conversationId: string, userId: string) => {
    const all = loadConversations();
    const idx = all.findIndex(c => c.id === conversationId);
    if (idx !== -1) {
        all[idx].unreadCount[userId] = 0;
        saveConversations(all);
    }
  }
};
