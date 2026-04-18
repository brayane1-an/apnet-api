
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState } from '../types';
import { SERVICE_CATEGORIES } from '../constants';
import { Search, ArrowRight, Wallet } from 'lucide-react';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2000&auto=format&fit=crop", // Female Tech Expert
  "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?q=80&w=2000&auto=format&fit=crop", // Female Chef/Hospitality Professional
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2000&auto=format&fit=crop", // Professional Multi-trade team
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2000&auto=format&fit=crop", // Electrical Expert
  "https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=2000&auto=format&fit=crop", // Modern Architecture & Design
];

interface ServiceCatalogProps {
  setView: (v: ViewState) => void;
  onSelectService: (category: string, subCategory: string, specialization: string) => void;
  onRequestQuote: (category: string, subCategory: string) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ setView, onSelectService, onRequestQuote }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  // Filtrer pour exclure "Communauté & Opportunités" (Stages) et l'Immobilier s'il était présent
  // On ne garde que les métiers "classiques"
  const filteredCategories = SERVICE_CATEGORIES.filter(cat => 
    cat.label !== 'Communauté & Opportunités' && 
    !cat.label.includes('Immobilier')
  );

  return (
    <div className="py-6">
      {/* --- HERO SECTION: COMPÊLLING DYNAMIC CAROUSEL --- */}
      <div className="relative h-[400px] mb-16 rounded-[2.5rem] overflow-hidden group shadow-2xl">
        {/* Background Carousel with Smooth Fades */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImageIndex}
              src={HERO_IMAGES[currentImageIndex]} 
              alt="Expertise APNET" 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-dark to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-7xl mx-auto px-8 md:px-16 flex flex-col justify-center text-white">
          <motion.div
             key="hero-content"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-brand-orange px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-orange-500/20 shadow-lg">
              Catalogue Officiel
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter leading-none italic uppercase">
              TOUS LES <br/> <span className="text-brand-orange">MÉTIERS</span> DE CI.
            </h1>
            <p className="text-xl text-gray-200 max-w-xl font-medium leading-relaxed mb-8">
              Explorez l'écosystème APNET : plus de 50 spécialisations certifiées pour construire, réparer et innover.
            </p>
            
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-brand-orange">50+</span>
                <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Expertises</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">24/7</span>
                <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Disponibilité</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Pagination Indicators */}
        <div className="absolute bottom-10 right-10 flex gap-2">
          {HERO_IMAGES.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1 transition-all duration-500 rounded-full ${idx === currentImageIndex ? 'w-8 bg-brand-orange' : 'w-2 bg-white/30'}`}
            />
          ))}
        </div>

        {/* Decorative corner label */}
        <div className="absolute top-10 right-10 rotate-90 origin-right md:block hidden">
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 whitespace-nowrap">
             APNET ECOSYSTEM • ABIDJAN 2026
           </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid gap-12">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-brand-dark/5 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{category.label}</h2>
                <span className="text-sm bg-white px-3 py-1 rounded-full border border-gray-300 text-gray-600">
                  {category.subCategories.length} métiers
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {category.subCategories.map((sub) => (
                  <div key={sub.id} className="group relative bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow hover:border-brand-orange/30 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-orange transition-colors">
                      {sub.label}
                    </h3>
                    
                    <div className="mb-4 flex-grow">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Spécialisations</p>
                      <div className="flex flex-wrap gap-2">
                        {sub.specializations.map(spec => (
                          <button 
                            key={spec.id} 
                            onClick={() => {
                                onSelectService(category.label, sub.label, spec.label);
                            }}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-brand-orange hover:text-white transition-colors cursor-pointer"
                          >
                            {spec.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 gap-2">
                      <button 
                        onClick={() => {
                            if (sub.label.includes("Livreur Privé")) {
                                onSelectService(category.label, sub.label, '');
                            } else {
                                onRequestQuote(category.label, sub.label);
                            }
                        }}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-bold bg-green-50 text-green-700 py-2.5 rounded hover:bg-green-100 transition-colors"
                      >
                        <Wallet size={14} />
                        {sub.label.includes("Livreur Privé") ? "Réserver" : "Sur devis"}
                      </button>
                      <button 
                        onClick={() => {
                          onSelectService(category.label, sub.label, '');
                        }}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-bold bg-brand-orange text-white py-2.5 rounded hover:bg-orange-600 transition-colors"
                      >
                        Commander <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-brand-orange rounded-2xl p-8 text-center text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Vous ne trouvez pas votre bonheur ?</h2>
          <p className="text-lg mb-8 opacity-90">
            Notre communauté grandit chaque jour. Publiez une annonce spécifique et laissez les prestataires venir à vous.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => setView(ViewState.FIND_WORKER)}
              className="bg-white text-brand-orange font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition shadow-md"
            >
              Rechercher un expert
            </button>
            <button 
              onClick={() => setView(ViewState.REGISTER)}
              className="bg-brand-dark text-white font-bold py-3 px-8 rounded-full hover:bg-gray-900 transition shadow-md"
            >
              Devenir Prestataire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
