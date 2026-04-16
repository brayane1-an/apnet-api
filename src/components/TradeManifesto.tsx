
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Truck, Hammer, Scissors, Sparkles, MessageSquare, Send, Heart, CheckCircle } from 'lucide-react';

interface TradeContent {
  icon: React.ElementType;
  title: string;
  introTitle: string;
  introText: string;
  card1Title: string;
  card1Text: string;
  card2Title: string;
  card2Text: string;
  colorClass: string; // Tailwind color class for accents
  bgGradient: string;
}

const TRADE_CONTENTS: Record<string, TradeContent> = {
  'Transport': {
    icon: Truck,
    title: "Espace Livreurs & Chauffeurs",
    introTitle: "L'Humain avant la Course.",
    introText: "Nos livreurs ne sont pas de simples transporteurs. Ce sont des hommes et des femmes qui bravent le soleil et les embouteillages pour servir. Ils méritent respect et sécurité.",
    card1Title: "Dignité & Sécurité",
    card1Text: "Le livreur est un pilier essentiel. Nous garantissons une rémunération juste (80%) et une tolérance zéro pour l'irrespect.",
    card2Title: "Pacte Client",
    card2Text: "Nous invitons chaque client à traiter le livreur comme un partenaire. Un sourire, un peu de patience... ça change tout.",
    colorClass: "text-brand-orange",
    bgGradient: "from-brand-orange to-orange-600"
  },
  'Bâtiment': {
    icon: Hammer,
    title: "Espace Bâtiment & Artisanat",
    introTitle: "Bâtisseurs de l'Avenir.",
    introText: "Maçons, peintres, électriciens... Vous construisez nos maisons et réparez nos vies. Votre savoir-faire manuel est la fondation de notre société.",
    card1Title: "Valeur du Travail",
    card1Text: "Chaque chantier compte. Nous valorisons la sueur, la précision et l'effort fournis sur le terrain.",
    card2Title: "Respect du Pro",
    card2Text: "Le client doit fournir un environnement sain et respecter l'expertise de l'artisan. Pas de négociation abusive.",
    colorClass: "text-blue-600",
    bgGradient: "from-blue-600 to-blue-800"
  },
  'Beauté': {
    icon: Scissors,
    title: "Espace Beauté & Bien-être",
    introTitle: "Révélateurs de Confiance.",
    introText: "Coiffeuses, esthéticiennes, vous ne faites pas que soigner l'apparence. Vous redonnez confiance et estime de soi à vos clients.",
    card1Title: "Art & Hygiène",
    card1Text: "Votre talent artistique mérite d'être reconnu. Nous soutenons vos standards d'hygiène et de qualité.",
    card2Title: "Relation Client",
    card2Text: "La courtoisie est reine. Le client doit respecter vos horaires et votre espace de travail.",
    colorClass: "text-pink-500",
    bgGradient: "from-pink-500 to-pink-700"
  },
  'Ménage': {
    icon: Sparkles,
    title: "Espace Services à Domicile",
    introTitle: "Gardiens du Foyer.",
    introText: "Vous entrez dans l'intimité des familles pour apporter ordre et propreté. C'est un métier de confiance absolue qui exige une intégrité totale.",
    card1Title: "Respect & Discrétion",
    card1Text: "Vous n'êtes pas invisibles. Votre travail est essentiel au bien-être des familles. Nous exigeons respect et considération.",
    card2Title: "Cadre Clair",
    card2Text: "Les tâches et horaires doivent être définis clairement à l'avance. Pas de surcharge de travail imprévue.",
    colorClass: "text-purple-600",
    bgGradient: "from-purple-600 to-purple-800"
  }
};

interface TradeManifestoProps {
  currentUser: UserProfile | null;
  onSubmitFeedback: (category: 'SECURITY' | 'APP' | 'PAYMENT' | 'OTHER', message: string, metier: string) => void;
}

export const TradeManifesto: React.FC<TradeManifestoProps> = ({ currentUser, onSubmitFeedback }) => {
  const [feedbackCategory, setFeedbackCategory] = useState<'SECURITY' | 'APP' | 'PAYMENT' | 'OTHER'>('OTHER');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Determine Trade Content based on user category or default
  const getTradeContent = () => {
    if (!currentUser?.category) return TRADE_CONTENTS['Transport']; // Default
    
    if (currentUser.category.includes('Bâtiment')) return TRADE_CONTENTS['Bâtiment'];
    if (currentUser.category.includes('Santé') || currentUser.category.includes('Beauté')) return TRADE_CONTENTS['Beauté'];
    if (currentUser.category.includes('Services')) return TRADE_CONTENTS['Ménage'];
    
    return TRADE_CONTENTS['Transport']; // Fallback
  };

  const content = getTradeContent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    
    onSubmitFeedback(feedbackCategory, feedbackMessage, content.title);
    setIsSubmitted(true);
    setFeedbackMessage('');
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="bg-white min-h-screen pb-12">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${content.bgGradient} text-white py-16 px-4`}>
        <div className="max-w-4xl mx-auto text-center">
           <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <content.icon size={48} className="text-white" />
           </div>
           <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{content.title}</h1>
           <p className="text-xl opacity-90 max-w-2xl mx-auto">{content.introText}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-gray-200">
               <h3 className={`text-2xl font-bold mb-4 ${content.colorClass}`}>{content.card1Title}</h3>
               <p className="text-gray-600 leading-relaxed">{content.card1Text}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-gray-200">
               <h3 className={`text-2xl font-bold mb-4 ${content.colorClass}`}>{content.card2Title}</h3>
               <p className="text-gray-600 leading-relaxed">{content.card2Text}</p>
            </div>
         </div>
      </div>

      {/* Feedback Section */}
      <div className="max-w-3xl mx-auto px-4 mt-16">
         <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <div className="text-center mb-8">
               <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  <MessageSquare className={content.colorClass} /> La Parole aux Pros
               </h3>
               <p className="text-gray-500 mt-2">
                  Votre métier a des réalités que nous devons connaître. Aidez-nous à améliorer vos conditions.
               </p>
            </div>

            {isSubmitted ? (
               <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                  <h4 className="text-xl font-bold text-green-800">Message Reçu !</h4>
                  <p className="text-green-700">Merci pour votre contribution à la communauté.</p>
               </div>
            ) : (
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['SECURITY', 'PAYMENT', 'APP', 'OTHER'].map((cat) => (
                           <button
                              key={cat}
                              type="button"
                              onClick={() => setFeedbackCategory(cat as any)}
                              className={`py-2 px-3 rounded-lg text-sm font-bold border transition ${
                                 feedbackCategory === cat 
                                 ? `bg-gray-900 text-white border-gray-900` 
                                 : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                           >
                              {cat === 'SECURITY' ? 'Sécurité' : cat === 'PAYMENT' ? 'Paiements' : cat === 'APP' ? 'Appli' : 'Autre'}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Votre Message</label>
                     <textarea 
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        placeholder="Ex: Les clients ne respectent pas les délais..."
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        required
                     ></textarea>
                  </div>
                  <button 
                     type="submit" 
                     className={`w-full py-4 rounded-xl text-white font-bold shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r ${content.bgGradient}`}
                  >
                     Envoyer <Send size={18} />
                  </button>
               </form>
            )}
         </div>
      </div>
    </div>
  );
};
