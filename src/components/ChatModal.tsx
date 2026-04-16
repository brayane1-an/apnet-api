
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { Send, X, ShieldCheck, Wallet, AlertTriangle, Camera, Brain, FileCheck, Loader2, CheckCircle, Ban, LockKeyhole } from 'lucide-react';
import { analyzeJobImage } from '../services/geminiService';
import { messageService } from '../services/messageService';

interface ChatModalProps {
  provider: UserProfile;
  client: UserProfile;
  onClose: () => void;
  onPayRequest: (amount: number, jobDetails?: { photoUrl: string, analysis: string }) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ provider, client, onClose, onPayRequest }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [showOfferInput, setShowOfferInput] = useState(false);
  
  // Image & AI State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{analysis: string, anomalies: string[], advice: string} | null>(null);
  
  // Security Alert State
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refreshInterval = useRef<number | null>(null);

  // --- INITIALISATION DU SERVICE ---
  
  const loadMessages = () => {
      const conv = messageService.getOrCreateConversation(client, provider);
      setMessages(conv.messages);
  };

  useEffect(() => {
      loadMessages();
      // Poll pour synchronisation
      refreshInterval.current = window.setInterval(loadMessages, 3000);
      return () => {
          if (refreshInterval.current) clearInterval(refreshInterval.current);
      };
  }, [client.id, provider.id]);

  const handleSendMessage = () => {
    if (!inputText.trim() && !selectedImage) return;

    // Utilisation du service centralisé qui gère la sécurité
    const result = messageService.sendMessage(
        client.id, 
        provider.id, 
        inputText, 
        imagePreview || undefined, 
        aiResult
    );

    if (!result.success && result.error === 'SECURITY_BLOCK') {
        setShowSecurityAlert(true);
        return; // Bloqué, on n'efface pas le texte
    }

    if (result.success) {
        setInputText('');
        setSelectedImage(null);
        setImagePreview(null);
        setAiResult(null);
        setShowSecurityAlert(false);
        loadMessages(); // Refresh UI
        
        // Simulation réponse auto (si besoin pour démo)
        if (messages.length < 2) {
            setTimeout(() => {
               messageService.sendMessage(provider.id, client.id, "Bien reçu. Si nous sommes d'accord sur le prix, validez le paiement ici.");
               loadMessages();
            }, 1500);
        }
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedImage(file);
          const url = URL.createObjectURL(file);
          setImagePreview(url);
          
          setIsAnalyzing(true);
          const result = await analyzeJobImage("mock_base64", inputText || "Travail à réaliser");
          setAiResult(result);
          setIsAnalyzing(false);
      }
  };

  const handleCreateOffer = () => {
      if(!offerAmount) return;
      
      // On cherche une image récente pour le contrat
      const lastImageMsg = [...messages].reverse().find(m => m.image && m.senderId === client.id);
      
      onPayRequest(parseInt(offerAmount), lastImageMsg ? { 
          photoUrl: lastImageMsg.image!, 
          analysis: lastImageMsg.aiAnalysis?.analysis || "Pas d'analyse" 
      } : undefined);
  };

  const handleCloseNegotiation = () => {
      setShowSecurityAlert(false);
      setShowOfferInput(true); // Ouvre le panneau de paiement
      
      // Message système via le service
      messageService.sendMessage(client.id, provider.id, "Montant validé. Vous pouvez procéder au paiement.", undefined, undefined, true);
      loadMessages();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
           <div className="flex items-center gap-3">
              <div className="relative">
                <img src={provider.photoUrl} className="w-10 h-10 rounded-full border-2 border-brand-orange" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
              </div>
              <div>
                 <h3 className="font-bold text-sm">{provider.firstName} {provider.lastName}</h3>
                 <p className="text-xs text-gray-400">{provider.jobTitle}</p>
              </div>
           </div>
           <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full"><X size={20}/></button>
        </div>

        {/* Security Alert Overlay */}
        {showSecurityAlert && (
            <div className="absolute top-16 left-4 right-4 z-50 bg-red-100 border-l-4 border-red-600 text-red-900 px-4 py-4 rounded shadow-2xl animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-red-600" size={20} />
                        <span className="font-bold text-sm">Message Intercepté</span>
                    </div>
                    <button onClick={() => setShowSecurityAlert(false)} className="text-red-500 hover:text-red-800"><X size={16}/></button>
                </div>
                
                <p className="text-sm font-medium mb-4">
                    ⚠️ Échange de contacts interdit avant validation du service.
                </p>
                
                <button 
                    onClick={handleCloseNegotiation}
                    className="w-full bg-red-600 text-white font-bold py-2.5 rounded-lg hover:bg-red-700 transition shadow-md flex items-center justify-center gap-2 text-sm"
                >
                    <LockKeyhole size={16} /> Clôturer le montant convenu
                </button>
            </div>
        )}

        {/* Security Notice */}
        <div className="bg-red-50 p-2 text-xs text-center text-red-700 border-b border-red-100 flex items-center justify-center gap-1 font-bold">
           <ShieldCheck size={12} /> Échange de contacts interdit avant paiement
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
           {messages.length === 0 && (
               <div className="text-center text-gray-400 text-sm mt-10">Début de la conversation sécurisée.</div>
           )}
           {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.senderId === client.id ? 'items-end' : (msg.isSystem ? 'items-center' : 'items-start')}`}>
                 <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                    msg.isSystem
                    ? 'bg-green-100 text-green-800 border border-green-200 text-center w-full font-bold shadow-sm'
                    : msg.senderId === client.id 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                 }`}>
                    {msg.isSystem && <div className="flex justify-center mb-1"><CheckCircle size={16}/></div>}
                    {msg.image && (
                        <div className="mb-2">
                            <img src={msg.image} alt="Travail" className="rounded-lg max-h-40 w-full object-cover border border-white/20"/>
                            {msg.aiAnalysis && (
                                <div className="mt-2 bg-white/10 p-2 rounded text-xs border border-white/20">
                                    <div className="flex items-center gap-1 font-bold mb-1"><Brain size={12}/> Analyse IA APNET</div>
                                    <p>{msg.aiAnalysis.analysis}</p>
                                </div>
                            )}
                        </div>
                    )}
                    {msg.text}
                 </div>
              </div>
           ))}
        </div>

        {/* Input Preview Area (Image) */}
        {imagePreview && (
            <div className="px-4 py-2 bg-gray-100 flex items-center justify-between border-t border-gray-200">
                <div className="flex items-center gap-3">
                    <img src={imagePreview} className="w-10 h-10 rounded object-cover" />
                    <div className="text-xs">
                        <span className="font-bold text-gray-700">Photo sélectionnée</span>
                        {isAnalyzing ? (
                            <span className="flex items-center gap-1 text-blue-600"><Loader2 size={10} className="animate-spin"/> Analyse IA...</span>
                        ) : (
                            <span className="flex items-center gap-1 text-green-600"><CheckCircle size={10}/> Analysée</span>
                        )}
                    </div>
                </div>
                <button onClick={() => { setImagePreview(null); setSelectedImage(null); }} className="text-gray-500 hover:text-red-500"><X size={16}/></button>
            </div>
        )}

        {/* Offer & Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
           {showOfferInput ? (
               <div className="mb-4 bg-orange-50 p-3 rounded-lg animate-in slide-in-from-bottom-2 border border-orange-100">
                   <div className="flex items-center gap-2 mb-2 text-orange-800 font-bold text-xs uppercase">
                        <FileCheck size={14} /> Conclusion du prix
                   </div>
                   <label className="block text-xs font-bold text-gray-700 mb-1">Montant convenu (FCFA)</label>
                   <div className="flex gap-2">
                       <input 
                         type="number" 
                         value={offerAmount}
                         onChange={e => setOfferAmount(e.target.value)}
                         className="flex-1 p-2 border rounded text-sm font-bold"
                         placeholder="Ex: 10000"
                       />
                       <button 
                         onClick={handleCreateOffer}
                         className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-green-700 shadow-sm"
                       >
                         Valider & Payer
                       </button>
                   </div>
                   <p className="text-[10px] text-gray-500 mt-2">
                       En validant, vous acceptez le prix. L'argent sera sécurisé par APNET.
                   </p>
                   <button onClick={() => setShowOfferInput(false)} className="text-xs text-gray-500 mt-2 hover:underline">Annuler</button>
               </div>
           ) : (
               <div className="flex gap-2 mb-3">
                   <button 
                     onClick={() => setShowOfferInput(true)}
                     className="flex-1 bg-brand-orange text-white py-2 rounded-lg font-bold text-xs hover:bg-orange-600 flex items-center justify-center gap-1 shadow-sm"
                   >
                      <Wallet size={14} /> Conclure Prix / Payer
                   </button>
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="px-3 bg-gray-100 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-200 flex items-center justify-center gap-1 border border-gray-300"
                   >
                      <Camera size={14} /> Photo
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
               </div>
           )}

           <div className="flex gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Message sécurisé..."
                className={`flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 text-sm ${showSecurityAlert ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-blue-500'}`}
              />
              <button 
                onClick={handleSendMessage}
                className="p-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                <Send size={18} />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
