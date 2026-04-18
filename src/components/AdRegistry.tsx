
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Advertisement, ViewState } from '../types';
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone, ShieldCheck, MessageSquare } from 'lucide-react';

// Specialized Cinemagraph component for a professional loop effect
const APNETCinemagraph: React.FC = () => {
  return (
    <div className="relative w-full aspect-video overflow-hidden bg-gray-900 group">
      {/* 1. Main Static Layer (High-Resolution Background) */}
      <img 
        src="/image_11.png" 
        alt="Equipe APNET" 
        className="absolute inset-0 w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback if the requested image is missing
          e.currentTarget.src = "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2000&auto=format&fit=crop";
        }}
      />

      {/* 2. Dust Particles Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/30 rounded-full blur-[1px]"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0 
            }}
            animate={{ 
              y: ["-10%", "110%"],
              x: [Math.random() * 100 + "%", (Math.random() * 100 + 5) + "%"],
              opacity: [0, 0.4, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              duration: 8 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* 3. Subtle Crane Movement (Simulated) */}
      <motion.div 
        className="absolute top-[15%] left-[20%] w-0.5 h-32 bg-gray-900/10 blur-[1px] origin-top md:block hidden"
        animate={{ rotate: [0.3, -0.3, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 4. Architectural Plan Corner Flutter (Subtle deformation) */}
      <motion.div 
        className="absolute bottom-[35%] right-[40%] w-16 h-16 bg-white/5 blur-[3px] md:block hidden"
        animate={{ 
          scaleY: [1, 1.01, 1],
          skewY: [0, 0.5, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 5. Golden Hour Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-yellow-500/10 pointer-events-none" />

      {/* 6. Professional Text Overlay (Static & Net) */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-1 tracking-tighter uppercase italic">
              APNET <span className="text-brand-orange">GRAND CHANTIER</span>
            </h2>
            <p className="text-gray-200 text-sm md:text-base font-bold tracking-tight max-w-xl">
              L'expertise certifiée au coeur de vos projets. APNET assure la coordination et le suivi rigoureux de tous vos travaux.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <div className="w-8 h-8 bg-brand-orange rounded-md flex items-center justify-center font-black text-white shadow-lg">A</div>
            <div className="text-[10px] font-black uppercase text-white tracking-widest leading-none">
              Logo Net <br/> Verifié
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AdCarouselProps {
  ads: Advertisement[];
  zone: 'TOP' | 'MIDDLE' | 'BOTTOM';
  slotId: string;
  onInteract?: (adId: string, action: 'VIEW' | 'CLICK') => void;
  onQuoteRequest?: (category: string, subCategory: string) => void;
}

export const AdCarousel: React.FC<AdCarouselProps> = ({ ads, zone, slotId, onInteract, onQuoteRequest }) => {
  // Filter by slotId if present in database entries, otherwise fallback to zone
  const zoneAds = ads.filter(ad => ad.slotId === slotId || (ad.zone === zone && !ad.slotId));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (zoneAds.length === 0 || isPaused) return;
    
    // Track view for the current ad
    if (onInteract) onInteract(zoneAds[currentIndex].id, 'VIEW');

    if (zoneAds.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % zoneAds.length);
      }, 4000); // 4 seconds for professional rhythm
      return () => clearInterval(timer);
    }
  }, [zoneAds.length, currentIndex, onInteract, zone, isPaused]);

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

    // Video Player Placeholder for APNET Grand Chantier slot
    if (slotId === 'PROMO_APNET_VIDEO') {
      return (
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <div className="relative bg-black rounded-[16px] overflow-hidden shadow-2xl border-2 border-gray-100 group">
            <APNETCinemagraph />
            
            <button 
              onClick={() => onQuoteRequest?.('Bâtiment & Artisanat', 'Gestion de Chantier Complet')}
              className="absolute top-4 right-4 px-4 py-2 bg-brand-orange text-white font-black text-xs rounded-lg hover:bg-orange-600 transition-all shadow-lg flex items-center gap-2 z-10"
            >
              Démarrer mon projet <ShieldCheck size={14} />
            </button>
            
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2 z-10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-white font-bold uppercase tracking-widest">APNET Live Experience</span>
            </div>
          </div>
        </div>
      );
    }

    // Default Banner Placeholder for other slots (like PROMO_PARTENAIRE_IMAGE)
    return (
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div 
          className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border-2 border-dashed border-gray-200 hover:border-brand-orange transition-all cursor-pointer group shadow-sm overflow-hidden relative"
          onClick={() => handleClick()}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="w-full md:w-1/3 h-48 rounded-2xl bg-gray-50 flex flex-col items-center justify-center border-2 border-gray-100 group-hover:bg-brand-orange/5 transition-colors">
            <Megaphone size={40} className="text-gray-300 group-hover:text-brand-orange transition-colors mb-4" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zone {slotId}</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-brand-dark text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                Publicité
              </span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Votre publicité ici</h3>
            <p className="text-gray-500 font-medium mb-6 leading-relaxed">Boostez votre visibilité auprès de la communauté APNET. Réservez cet emplacement exclusif dès aujourd'hui.</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white font-black rounded-xl hover:bg-orange-600 transition-all shadow-lg">
              Devenir Partenaire <MessageSquare size={16} />
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

  // MIDDLE or BOTTOM (Professional Auto-play Slider)
  return (
    <div className="max-w-7xl mx-auto px-4 mb-12">
      <div 
        className="relative group overflow-hidden rounded-3xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAd.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) handleNext();
              if (info.offset.x > 70) handlePrev();
            }}
            className="bg-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border-2 border-gray-100 hover:border-brand-orange transition-colors cursor-pointer shadow-sm relative"
            onClick={(e) => {
              // Only click if it wasn't a significant drag
              handleClickAd();
            }}
          >
            <div className="w-full md:w-1/3 h-56 rounded-2xl overflow-hidden pointer-events-none">
              <img 
                src={currentAd.imageUrl} 
                alt={currentAd.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Megaphone size={16} className="text-brand-orange" />
                  <span className="text-xs font-black text-brand-orange uppercase tracking-widest">Partenaire : {currentAd.sponsorName}</span>
                </div>
                {isPaused && (
                  <span className="text-[10px] font-bold text-gray-400 animate-pulse bg-gray-100 px-2 py-0.5 rounded">PAUSE</span>
                )}
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">{currentAd.title}</h3>
              <p className="text-gray-500 font-medium mb-6 leading-relaxed line-clamp-2">{currentAd.body}</p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all shadow-md">
                Voir l'offre <ExternalLink size={16} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {zoneAds.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white/20">
            {zoneAds.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-brand-orange' : 'w-2 bg-gray-400/50'}`}
                aria-label={`Aller à la slide ${i + 1}`}
              />
            ))}
          </div>
        )}
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
