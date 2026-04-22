
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ClipboardList, ArrowRight, ShieldCheck, CheckCircle, Upload, Image, Trash2, HelpCircle } from 'lucide-react';
import { CATEGORY_EXAMPLES } from '../constants';

interface QuoteRequestModalProps {
  onClose: () => void;
  onSubmit: (details: { 
    title: string;
    description: string; 
    budget?: string;
    photos: string[];
  }) => void;
  category: string;
  subCategory: string;
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({ 
  onClose, 
  onSubmit, 
  category, 
  subCategory 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPickerActive = useRef(false);
  
  // Handle Browser Back Button for Mobile UX (Nested History)
  useEffect(() => {
    // Initial state for the modal
    window.history.pushState({ modal: 'quote-request', step: 'form' }, '');

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      
      // If we are going back and the state is null or doesn't match our modal, close it
      if (!state || state.modal !== 'quote-request') {
        onClose();
        return;
      }

      // If we just came back to the 'form' step from the 'picker' step
      if (state.step === 'form' && isPickerActive.current) {
        isPickerActive.current = false;
        setIsUploading(false);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up all our added history states when component unmounts
      if (window.history.state?.modal === 'quote-request') {
        // If we are still in picker step, we need to go back twice
        if (window.history.state.step === 'picker') {
          window.history.go(-2);
        } else {
          window.history.back();
        }
      }
    };
  }, [onClose]);
  
  // Robust handling for native file picker cancellation
  useEffect(() => {
    const handleFocus = () => {
      // Small timeout to allow onChange to fire if user actually picked files
      setTimeout(() => {
        // If the focus returns but we are still in 'picker' history state, 
        // it means the user closed the picker via UI (Cancel button) 
        // and NOT via hardware back button.
        if (isPickerActive.current && window.history.state?.step === 'picker') {
          window.history.back(); // Manually pop the picker state
          isPickerActive.current = false;
        }
        setIsUploading(false);
      }, 300);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) return;

    // Use a manual event listener to bypass TS type errors for 'onCancel'
    const handleCancel = () => setIsUploading(false);
    input.addEventListener('cancel', handleCancel);
    return () => input.removeEventListener('cancel', handleCancel);
  }, []);
  
  const example = CATEGORY_EXAMPLES[category] || CATEGORY_EXAMPLES['Bâtiment & Artisanat'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    // Reset loading state if no files are selected (handles some mobile bypasses)
    if (!files || files.length === 0) {
      setIsUploading(false);
      return;
    }

    setIsUploading(true);
    // Simulate upload
    const nextPhotos = Array.from(files).map(file => URL.createObjectURL(file));
    setTimeout(() => {
      setPhotos(prev => [...prev, ...nextPhotos]);
      setIsUploading(false);
      // Reset input value to allow selecting the same files again
      e.target.value = '';
    }, 1000);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !title || photos.length === 0) return;
    
    onSubmit({ 
      title,
      description, 
      budget,
      photos
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Side: Context & Professional Tips */}
        <div className="hidden lg:flex lg:w-4/12 bg-brand-dark flex-col relative text-white">
           <div className="absolute inset-0 opacity-30">
              <img src={example.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />
           </div>

           <div className="relative p-8 mt-auto">
              <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-brand-orange/30">
                Conseils Pro
              </div>
              <h3 className="text-xl font-bold mb-4">Réussir votre Devis</h3>
              
              <ul className="space-y-4 text-xs text-white/80">
                <li className="flex gap-3">
                  <CheckCircle size={16} className="text-green-400 shrink-0" />
                  <span>Soyez précis sur les dimensions ou la surface à traiter.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle size={16} className="text-green-400 shrink-0" />
                  <span>Les **photos sont obligatoires** pour une estimation réaliste.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle size={16} className="text-green-400 shrink-0" />
                  <span>Précisez si vous fournissez les matériaux ou non.</span>
                </li>
              </ul>
              
              <div className="mt-8 pt-8 border-t border-white/10">
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-brand-orange" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide">Tiers de Confiance</p>
                      <p className="text-[9px] text-white/50">APNET protège votre acompte jusqu'à la fin des travaux.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Quote Form */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="bg-gray-50 p-6 lg:p-10 border-b border-gray-100 relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                  <ClipboardList className="text-brand-orange" size={20} />
               </div>
               <h2 className="text-2xl font-black tracking-tight leading-tight text-gray-900">
                  Demande de Devis
               </h2>
            </div>
            <p className="text-xs text-brand-blue uppercase font-black tracking-widest flex items-center gap-2">
                {category} <ArrowRight size={10} /> {subCategory}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 lg:p-10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Project Title */}
               <div className="lg:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                     Titre de votre projet
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ex: Rénovation cuisine, Installation clim..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                  />
               </div>

               {/* Description */}
               <div className="lg:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                     Décrivez votre projet en détail
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand-orange outline-none transition-all min-h-[120px]"
                    placeholder="Précisez vos besoins, contraintes, matériaux désirés..."
                  />
               </div>

               {/* Budget Estimatif */}
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                     Votre budget estimatif (FCFA) <HelpCircle size={10} className="text-gray-300" />
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Facultatif"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-orange outline-none"
                  />
               </div>

               {/* Info Alert */}
               <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                  <p className="text-[10px] text-brand-blue/70 leading-relaxed italic">
                    Un devis permet d'ouvrir la discussion technique avec le prestataire. Une fois d'accord, vous pourrez valider la commande.
                  </p>
               </div>
            </div>

            {/* Photo Upload - Mandatory */}
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span>Ajouter des photos du chantier/problème (Obligatoire)</span>
                  <span className={photos.length > 0 ? 'text-green-500' : 'text-brand-orange'}>
                    {photos.length} photo(s) sélectionnée(s)
                  </span>
               </label>
               
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  <AnimatePresence>
                     {photos.map((photo, index) => (
                        <motion.div
                           key={index}
                           initial={{ opacity: 0, scale: 0.8 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.8 }}
                           className="aspect-square rounded-xl overflow-hidden relative group"
                        >
                           <img src={photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <Trash2 size={14} />
                           </button>
                        </motion.div>
                     ))}
                  </AnimatePresence>

                  {photos.length < 8 && (
                     <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-orange hover:bg-orange-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 relative">
                        {isUploading ? (
                           <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                           >
                              <Upload size={24} className="text-brand-orange" />
                           </motion.div>
                        ) : (
                           <>
                              <Image size={24} className="text-gray-300" />
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Ajouter</span>
                           </>
                        )}
                        <input
                           ref={fileInputRef}
                           type="file"
                           multiple
                           accept="image/*"
                           onChange={(e) => {
                             if (isPickerActive.current && window.history.state?.step === 'picker') {
                               window.history.back();
                               isPickerActive.current = false;
                             }
                             handleFileChange(e);
                           }}
                           onClick={() => {
                             setIsUploading(true);
                             isPickerActive.current = true;
                             window.history.pushState({ modal: 'quote-request', step: 'picker' }, '');
                           }}
                           className="hidden"
                        />
                     </label>
                  )}
               </div>
               {!photos.length && (
                 <p className="text-[9px] text-brand-orange font-bold mt-2">
                    ⚠️ Veuillez ajouter au moins une photo pour chiffrer précisément.
                 </p>
               )}
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center">
               <div className="flex-1">
                  <p className="text-[10px] text-gray-500 px-2 lg:px-0">
                     En envoyant cette demande, vous acceptez que vos photos soient transmises au prestataire sélectionné.
                  </p>
               </div>
               <button
                  type="submit"
                  disabled={!description || !title || photos.length === 0}
                  className="w-full md:w-auto px-10 bg-brand-orange text-white font-black py-4 rounded-2xl hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center gap-3 group uppercase tracking-widest text-sm"
               >
                  Envoyer la demande de devis <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
