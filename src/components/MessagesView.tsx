
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Search, Send, ArrowLeft, MoreVertical, ShieldCheck, CheckCircle, AlertTriangle, LockKeyhole, Brain, X } from 'lucide-react';
import { UserProfile, Conversation, ChatMessage } from '../types';
import { messageService } from '../services/messageService';

interface MessagesViewProps {
    currentUser: UserProfile;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ currentUser }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  
  // Auto-refresh timer
  const refreshInterval = useRef<number | null>(null);

  const loadData = () => {
      const data = messageService.getUserConversations(currentUser.id);
      setConversations(data);
  };

  useEffect(() => {
      loadData();
      // Poll for new messages every 3 seconds
      refreshInterval.current = window.setInterval(loadData, 3000);
      return () => {
          if (refreshInterval.current) clearInterval(refreshInterval.current);
      };
  }, [currentUser.id]);

  const activeConversation = conversations.find(c => c.id === selectedChatId);

  // Marquer comme lu quand on ouvre
  useEffect(() => {
      if (selectedChatId) {
          messageService.markAsRead(selectedChatId, currentUser.id);
          loadData(); // Update UI badge
      }
  }, [selectedChatId]);

  const handleSendMessage = () => {
      if(!messageInput.trim() || !activeConversation) return;
      
      // Trouver l'autre participant
      const receiverId = activeConversation.participants.find(p => p !== currentUser.id);
      if (!receiverId) return;

      const result = messageService.sendMessage(currentUser.id, receiverId, messageInput);

      if (!result.success && result.error === 'SECURITY_BLOCK') {
          setShowSecurityAlert(true);
          return;
      }

      if (result.success) {
          setMessageInput('');
          loadData(); // Refresh immediat
          setShowSecurityAlert(false);
      }
  };

  const getOtherParticipantName = (conv: Conversation) => {
      const otherId = conv.participants.find(p => p !== currentUser.id);
      return otherId ? conv.participantNames[otherId] : 'Inconnu';
  };

  const getOtherParticipantRole = (conv: Conversation) => {
      const otherId = conv.participants.find(p => p !== currentUser.id);
      return otherId ? conv.participantRoles[otherId] : '';
  };

  // --- VIEW: LISTE DES CONVERSATIONS ---
  if (!selectedChatId) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-8 h-[80vh] flex flex-col">
          <div className="bg-white rounded-t-2xl shadow-sm border border-gray-200 p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="text-brand-orange" /> Mes Messages
            </h2>
            <div className="mt-4 relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Rechercher une conversation..." 
                    className="w-full pl-10 p-2 border rounded-lg bg-gray-50 focus:bg-white transition"
                />
            </div>
          </div>

          <div className="bg-white flex-1 rounded-b-2xl shadow-sm border border-gray-200 border-t-0 overflow-y-auto">
            {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    Aucune conversation pour le moment.
                </div>
            ) : (
                conversations.map(conv => {
                    const unread = (conv.unreadCount[currentUser.id] || 0) > 0;
                    return (
                        <div 
                            key={conv.id} 
                            onClick={() => setSelectedChatId(conv.id)}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex justify-between items-start ${unread ? 'bg-blue-50/50' : ''}`}
                        >
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg relative uppercase">
                                    {getOtherParticipantName(conv).charAt(0)}
                                </div>
                                <div>
                                    <h4 className={`text-sm ${unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                        {getOtherParticipantName(conv)}
                                    </h4>
                                    <p className={`text-xs mt-1 truncate max-w-[200px] ${unread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-gray-400 block">{new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                {unread && <span className="inline-block w-2 h-2 bg-brand-orange rounded-full mt-1"></span>}
                            </div>
                        </div>
                    );
                })
            )}
          </div>
        </div>
      );
  }

  // --- VIEW: CONVERSATION ACTIVE ---
  return (
      <div className="max-w-3xl mx-auto px-4 py-8 h-[80vh] flex flex-col relative">
          {/* Header Chat */}
          <div className="bg-white rounded-t-2xl shadow-sm border border-gray-200 p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedChatId(null)} className="p-1 hover:bg-gray-100 rounded-full">
                      <ArrowLeft size={20} className="text-gray-600" />
                  </button>
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold uppercase">
                      {activeConversation && getOtherParticipantName(activeConversation).charAt(0)}
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-900 text-sm">{activeConversation && getOtherParticipantName(activeConversation)}</h3>
                      <p className="text-xs text-gray-500">{activeConversation && getOtherParticipantRole(activeConversation)}</p>
                  </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={20} />
              </button>
          </div>

          {/* Security Alert Overlay */}
          {showSecurityAlert && (
            <div className="absolute top-20 left-4 right-4 z-50 bg-red-100 border-l-4 border-red-600 text-red-900 px-4 py-4 rounded shadow-2xl animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-red-600" size={20} />
                        <span className="font-bold text-sm">Message Intercepté</span>
                    </div>
                    <button onClick={() => setShowSecurityAlert(false)} className="text-red-500 hover:text-red-800"><X size={16}/></button>
                </div>
                
                <p className="text-sm font-medium mb-2">
                    ⚠️ Échange de contacts interdit avant validation du service.
                </p>
                <p className="text-xs text-red-800">
                    Votre message contient un numéro, un email ou une adresse. Veuillez utiliser le système de paiement sécurisé pour débloquer les coordonnées.
                </p>
            </div>
          )}

          {/* Messages List */}
          <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-4 border-x border-gray-200">
              <div className="text-center text-xs text-gray-400 my-4 bg-gray-100 py-1 rounded-full w-fit mx-auto px-4">
                  Conversation sécurisée par APNET
              </div>
              
              {activeConversation?.messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : (msg.isSystem ? 'items-center' : 'items-start')}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl text-sm shadow-sm ${
                          msg.isSystem 
                          ? 'bg-gray-200 text-gray-600 text-xs font-bold text-center w-full my-2' 
                          : msg.senderId === currentUser.id 
                            ? 'bg-brand-orange text-white rounded-br-none' 
                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                      }`}>
                          {msg.isSystem && <CheckCircle size={14} className="inline mr-1 mb-0.5"/>}
                          
                          {/* Image Display */}
                          {msg.image && (
                            <div className="mb-2">
                                <img src={msg.image} alt="Envoyé" className="rounded-lg max-h-40 w-full object-cover border border-white/20"/>
                                {msg.aiAnalysis && (
                                    <div className="mt-2 bg-white/10 p-2 rounded text-xs border border-white/20">
                                        <div className="flex items-center gap-1 font-bold mb-1"><Brain size={12}/> Analyse IA</div>
                                        <p>{msg.aiAnalysis.analysis}</p>
                                    </div>
                                )}
                            </div>
                          )}

                          {msg.text}
                      </div>
                      {!msg.isSystem && (
                          <span className="text-[10px] text-gray-400 mt-1 px-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </span>
                      )}
                  </div>
              ))}
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex gap-2">
                  <input 
                      type="text" 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Écrivez un message..." 
                      className={`flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 text-sm ${showSecurityAlert ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-brand-orange'}`}
                  />
                  <button 
                      onClick={handleSendMessage}
                      className="p-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition"
                  >
                      <Send size={18} />
                  </button>
              </div>
          </div>
      </div>
  );
};
