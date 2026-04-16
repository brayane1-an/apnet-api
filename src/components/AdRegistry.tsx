
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Advertisement, ViewState } from '../types';
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone, ShieldCheck, MessageSquare } from 'lucide-react';

interface AdCarouselProps {
  ads: Advertisement[];
  zone: 'TOP' | 'MIDDLE' | 'BOTTOM';
  onInteract?: (adId: string, action: 'VIEW' | 'CLICK') => void;
}

export const AdCarousel: React.FC<AdCarouselProps> = ({ ads, zone, onInteract }) => {
  const zoneAds = ads.filter(ad => ad.zone === zone);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (zoneAds.length === 0) return;
    
    // Track view for the current ad
    if (onInteract) onInteract(zoneAds[currentIndex].id, 'VIEW');

    if (zoneAds.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % zoneAds.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [zoneAds.length, currentIndex, onInteract, zone]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % zoneAds.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + zoneAds.length) % zoneAds.length);

  const handleClick = (url?: string, adId?: string) => {
    if (adId && onInteract) onInteract(adId, 'CLICK');
    const targetUrl = url || "https://wa.me/22500000000?text=Bonjour, je souhaite faire de la publicité sur APNET.";
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  if (zoneAds.length === 0) {
    // Default Banner if no ads active in this zone
    if (zone === 'TOP') {
      return (
        <div className="relative group w-full max-w-7xl mx-auto px-4 mb-12">
          <div 
            className="relative h-48 md:h-64 overflow-hidden rounded-[2rem] shadow-xl bg-brand-dark cursor-pointer"
            onClick={() => handleClick()}
          >
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop" 
                alt="Votre publicité ici"
                className="w-full h-full object-cover opacity-20 grayscale"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />
            </div>
            <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-brand-orange text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                  Opportunité
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight">
                Votre publicité ici
              </h2>
              <p className="text-gray-300 text-sm md:text-base font-medium mb-6">
                Contactez APNET pour booster votre visibilité.
              </p>
              <div className="flex items-center gap-2 text-brand-orange font-bold text-sm">
                Contactez APNET <MessageSquare size={18} />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div 
          className="bg-gray-50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border-2 border-dashed border-gray-200 hover:border-brand-orange transition-all cursor-pointer group"
          onClick={() => handleClick()}
        >
          <div className="w-full md:w-1/3 h-40 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Megaphone size={48} className="text-gray-300" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black text-gray-400 mb-2">Votre publicité ici</h3>
            <p className="text-gray-400 font-medium mb-6">Contactez APNET pour afficher votre offre dans cette zone.</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white font-black rounded-xl hover:bg-orange-600 transition-all">
              Contactez APNET <MessageSquare size={16} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentAd = zoneAds[currentIndex];

  const handleClickAd = () => {
    handleClick(currentAd.actionUrl, currentAd.id);
  };

  if (zone === 'TOP') {
    return (
      <div className="relative group w-full max-w-7xl mx-auto px-4 mb-12">
        <div className="relative h-48 md:h-64 overflow-hidden rounded-[2rem] shadow-xl bg-brand-dark">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAd.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 cursor-pointer"
              onClick={handleClickAd}
            >
              <div className="absolute inset-0">
                <img 
                  src={currentAd.imageUrl || "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop"} 
                  alt={currentAd.title}
                  className="w-full h-full object-cover opacity-40"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />
              </div>

              <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-brand-orange text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                    Sponsorisé
                  </span>
                  <span className="text-brand-orange text-xs font-bold uppercase tracking-wider">
                    {currentAd.sponsorName}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight">
                  {currentAd.title}
                </h2>
                <p className="text-gray-300 text-sm md:text-base font-medium line-clamp-2 mb-6">
                  {currentAd.body}
                </p>
                <div className="flex items-center gap-2 text-white font-bold text-sm group/btn">
                  Découvrir l'offre <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {zoneAds.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {zoneAds.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-brand-orange' : 'w-2 bg-white/30'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // MIDDLE or BOTTOM
  return (
    <div className="max-w-7xl mx-auto px-4 mb-12">
      <div 
        className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border-2 border-gray-100 hover:border-brand-orange transition-all cursor-pointer group shadow-sm"
        onClick={handleClickAd}
      >
        <div className="w-full md:w-1/3 h-48 rounded-2xl overflow-hidden">
          <img 
            src={currentAd.imageUrl} 
            alt={currentAd.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone size={16} className="text-brand-orange" />
            <span className="text-xs font-black text-brand-orange uppercase tracking-widest">Partenaire : {currentAd.sponsorName}</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">{currentAd.title}</h3>
          <p className="text-gray-500 font-medium mb-6 leading-relaxed">{currentAd.body}</p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all">
            En savoir plus <ExternalLink size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CertifiedCompanies: React.FC = () => {
  const companies = [
    { name: "Orange CI", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/1024px-Orange_logo.svg.png" },
    { name: "MTN", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MTN_Logo.svg/1200px-MTN_Logo.svg.png" },
    { name: "CIE", logo: "https://www.cie.ci/images/logo_cie.png" },
    { name: "SODECI", logo: "https://www.sodeci.ci/images/logo_sodeci.png" },
    { name: "Wave", logo: "https://www.wave.com/static/wave-logo-blue-500-2e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e.png" },
    { name: "Brassivoire", logo: "https://brassivoire.ci/wp-content/uploads/2017/01/logo-brassivoire.png" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xs text-center md:text-left">
          <div className="flex items-center gap-2 text-brand-green font-black uppercase text-xs tracking-widest mb-2">
            <ShieldCheck size={16} /> Entreprises Certifiées
          </div>
          <h3 className="text-xl font-black text-gray-900 leading-tight">
            Ils recrutent leurs stagiaires sur APNET.
          </h3>
        </div>
        
        <div className="flex-1 flex flex-wrap justify-center md:justify-end items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
          {companies.map((c, i) => (
            <img 
              key={i} 
              src={c.logo} 
              alt={c.name} 
              className="h-8 md:h-10 w-auto object-contain hover:scale-110 transition-transform cursor-pointer"
              title={c.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdvertiserCTA: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-brand-orange/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-brand-orange/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-orange/20">
            <Megaphone size={24} />
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900">Boostez votre visibilité</h4>
            <p className="text-gray-500 font-medium text-sm">Affichez vos services auprès de milliers d'utilisateurs APNET.</p>
          </div>
        </div>
        <a 
          href="https://wa.me/22500000000?text=Bonjour, je souhaite faire de la publicité sur APNET."
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 bg-brand-orange text-white font-black rounded-2xl hover:bg-orange-600 transition shadow-xl flex items-center gap-2"
        >
          <MessageSquare size={20} /> Faire votre publicité ici
        </a>
      </div>
    </div>
  );
};
