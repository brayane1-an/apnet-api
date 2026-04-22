
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, ClipboardList, ArrowRight, ShieldCheck, Clock, FileText, CheckCircle, Info } from 'lucide-react';
import { ContractType } from '../types';
import { CATEGORY_EXAMPLES } from '../constants';

interface UniversalOrderModalProps {
  onClose: () => void;
  onSubmit: (details: { 
    type: ContractType; 
    description: string; 
    preferredDate?: string; 
    duration?: string;
  }) => void;
  category: string;
  subCategory: string;
}

export const UniversalOrderModal: React.FC<UniversalOrderModalProps> = ({ 
  onClose, 
  onSubmit, 
  category, 
  subCategory 
}) => {
  const [contractType, setContractType] = useState<ContractType>(ContractType.PIN_POINT);
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [duration, setDuration] = useState('1 mois');
  
  const example = CATEGORY_EXAMPLES[category] || CATEGORY_EXAMPLES['Bâtiment & Artisanat'];

  // Handle Browser Back Button for Mobile UX
  useEffect(() => {
    const state = { modal: 'order-request' };
    window.history.pushState(state, '');

    const handlePopState = (event: PopStateEvent) => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === 'order-request') {
        window.history.back();
      }
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    
    onSubmit({ 
      type: contractType, 
      description, 
      preferredDate: contractType === ContractType.PIN_POINT ? preferredDate : undefined,
      duration: contractType === ContractType.MONTHLY ? duration : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Side: Category Context & Visual Example */}
        <div className="hidden md:flex md:w-5/12 bg-brand-dark flex-col relative text-white">
           <div className="absolute inset-0 opacity-40">
              <img src={example.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />
           </div>

           <div className="relative p-8 mt-auto">
              <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-brand-orange/30">
                Aperçu Type
              </div>
              <h3 className="text-xl font-bold mb-2">Exemple de Prestation</h3>
              <p className="text-xs text-white/70 leading-relaxed italic">
                "{example.description}"
              </p>
              
              <div className="mt-8 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                       <ShieldCheck size={16} className="text-brand-orange" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Paiement Sécurisé APNET</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                       <CheckCircle size={16} className="text-green-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Artisans Certifiés</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="bg-gray-50 p-6 border-b border-gray-100 relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X size={24} />
            </button>
            <h2 className="text-2xl font-black tracking-tight leading-tight text-gray-900">
               Commander <br/>
               <span className="text-brand-orange">{subCategory}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">
                Catégorie: {category}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 1. Prestation Type Selection */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                 Type de Prestation Souhaité
              </label>
              <div className="grid grid-cols-2 gap-3">
                 <button
                    type="button"
                    onClick={() => setContractType(ContractType.PIN_POINT)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${contractType === ContractType.PIN_POINT ? 'border-brand-blue bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                 >
                    <Clock size={20} className={contractType === ContractType.PIN_POINT ? 'text-brand-blue' : 'text-gray-400'} />
                    <span className={`text-xs font-black mt-2 ${contractType === ContractType.PIN_POINT ? 'text-brand-blue' : 'text-gray-600'}`}>Ponctuelle</span>
                    <span className="text-[8px] text-gray-400 uppercase mt-1">À la tâche</span>
                 </button>
                 <button
                    type="button"
                    onClick={() => setContractType(ContractType.MONTHLY)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${contractType === ContractType.MONTHLY ? 'border-brand-orange bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}
                 >
                    <FileText size={20} className={contractType === ContractType.MONTHLY ? 'text-brand-orange' : 'text-gray-400'} />
                    <span className={`text-xs font-black mt-2 ${contractType === ContractType.MONTHLY ? 'text-brand-orange' : 'text-gray-600'}`}>Placement</span>
                    <span className="text-[8px] text-gray-400 uppercase mt-1">Durée (Mois)</span>
                 </button>
              </div>
            </div>

            {/* 2. Dynamic Inputs based on type */}
            <AnimatePresence mode="wait">
               {contractType === ContractType.PIN_POINT ? (
                 <motion.div 
                    key="ponctuelle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                 >
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                           <Calendar size={14} className="text-brand-blue" />
                           Date de l'intervention
                        </label>
                        <input
                           type="date"
                           required={contractType === ContractType.PIN_POINT}
                           value={preferredDate}
                           onChange={(e) => setPreferredDate(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-brand-blue outline-none"
                        />
                    </div>
                 </motion.div>
               ) : (
                 <motion.div 
                    key="mensuel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                 >
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                           <Clock size={14} className="text-brand-orange" />
                           Durée souhaitée
                        </label>
                        <select
                           value={duration}
                           onChange={(e) => setDuration(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-brand-orange outline-none"
                        >
                           <option value="1 mois">1 mois (Essai)</option>
                           <option value="3 mois">3 mois (Trimestriel)</option>
                           <option value="6 mois">6 mois (Semestriel)</option>
                           <option value="1 an">1 an (Annuel)</option>
                        </select>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex gap-2">
                       <Info size={16} className="text-brand-orange shrink-0" />
                       <p className="text-[9px] text-orange-800 leading-tight">
                          <strong>Mode Agence :</strong> APNET générera un récapitulatif de contrat mensuel et bloquera le paiement en séquestre pour garantir le salaire.
                       </p>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            {/* 3. Common Description Field */}
            <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                   <ClipboardList size={14} className="text-brand-blue" />
                   Détails de la mission / Travaux
                </label>
                <textarea
                   required
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand-orange transition-all min-h-[100px]"
                   placeholder="Que doit faire le prestataire précisément ?"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-brand-dark text-white font-black py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-3 group uppercase tracking-widest text-sm"
            >
                Valider & Continuer <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
