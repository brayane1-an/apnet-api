
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RealEstateListing, CompletedWork, Landlord, ViewState } from '../types';
import { MOCK_REAL_ESTATE_LISTINGS, MOCK_COMPLETED_WORKS } from '../constants';
import { MapPin, ArrowRight, UserPlus, Phone, Home, CheckCircle, MessageSquare, Briefcase, Star } from 'lucide-react';
import axios from 'axios';

// --- REAL ESTATE FEED (Annonces à la une) ---
export const RealEstateFeed: React.FC<{ onSelect: (l: RealEstateListing) => void }> = ({ onSelect }) => {
  // Filter for approved listings only
  const featured = MOCK_REAL_ESTATE_LISTINGS
    .filter(l => l.status === 'APPROVED' && l.isActive !== false)
    .slice(0, 10);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Annonces à la une</h2>
          <p className="text-gray-500 text-sm">Les meilleures opportunités immobilières du moment.</p>
        </div>
        <button onClick={() => (window as any).setView(ViewState.REAL_ESTATE)} className="text-brand-orange font-bold text-sm hover:underline flex items-center gap-1">
          Voir tout <ArrowRight size={14} />
        </button>
      </div>
      
      <div className="flex overflow-x-auto gap-6 px-4 pb-8 scrollbar-hide snap-x">
        {featured.map((listing) => (
          <motion.div 
            key={listing.id}
            whileHover={{ y: -5 }}
            className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden snap-start cursor-pointer group"
            onClick={() => onSelect(listing)}
          >
            <div className="relative h-44 overflow-hidden">
              <img 
                src={listing.photos[0]} 
                alt={listing.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                {listing.type}
              </div>
              <div className="absolute bottom-3 left-3 bg-brand-orange text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                {listing.price.toLocaleString()} {listing.currency}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 truncate mb-1">{listing.title}</h3>
              <div className="flex items-center text-gray-400 text-xs mb-3">
                <MapPin size={12} className="mr-1" />
                {listing.location.commune}, {listing.location.city}
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1 font-medium">
                  <Home size={12} /> {listing.features.rooms}p
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <Star size={12} className="text-yellow-400 fill-current" /> {listing.rating}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- COMPLETED WORKS FEED (Témoignages Dynamiques) ---
export const WorksFeed: React.FC = () => {
  return (
    <div className="bg-brand-dark py-12 text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <h2 className="text-2xl font-black tracking-tight mb-2">Travaux terminés</h2>
        <p className="text-gray-400 text-sm">Confiance et expertise sur le terrain, chaque jour.</p>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* Infinite scroll simulation using two rows */}
        <div className="flex gap-4 animate-marquee whitespace-nowrap">
          {[...MOCK_COMPLETED_WORKS, ...MOCK_COMPLETED_WORKS].map((work, idx) => (
            <div key={`${work.id}-${idx}`} className="flex-shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-4 min-w-[300px]">
              <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center font-black">
                {work.workerName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{work.workerName}</span>
                  <span className="text-xs text-white/50">vient de terminer</span>
                </div>
                <div className="text-sm font-medium text-brand-orange">{work.workType}</div>
                <div className="text-[10px] text-white/40 flex items-center gap-1">
                  <MapPin size={10} /> {work.location} • il y a 5 min
                </div>
              </div>
              <CheckCircle size={20} className="text-green-400 ml-auto opacity-50" />
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- LANDLORD ONBOARDING FORM ---
export const LandlordOnboardingForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', location: '' });
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    
    setStatus('LOADING');
    try {
      await axios.post('/api/landlords/register', formData);
      setStatus('SUCCESS');
      setFormData({ name: '', phone: '', location: '' });
      setTimeout(() => setStatus('IDLE'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 5000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="bg-gradient-to-br from-brand-orange to-orange-600 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row shadow-orange-500/20">
        <div className="p-8 lg:p-16 text-white lg:w-1/2 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 w-fit">
            Partenariat Propriétaire
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
            Gagnez plus en confiant votre bien à APNET.
          </h2>
          <ul className="space-y-4 mb-8">
             <li className="flex items-start gap-3">
                <CheckCircle className="text-white mt-1 flex-shrink-0" size={20} />
                <p className="font-medium">Gestion locative dématérialisée et sécurisée.</p>
             </li>
             <li className="flex items-start gap-3">
                <CheckCircle className="text-white mt-1 flex-shrink-0" size={20} />
                <p className="font-medium">Collecte des loyers garantie chaque mois.</p>
             </li>
             <li className="flex items-start gap-3">
                <CheckCircle className="text-white mt-1 flex-shrink-0" size={20} />
                <p className="font-medium">Assistance juridique en cas d'expulsion.</p>
             </li>
          </ul>
          <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/20">
              <Phone className="text-white" />
              <div>
                <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Assistance Propriétaire</p>
                <p className="text-xl font-black">+225 01-02-03-04-05</p>
              </div>
          </div>
        </div>
        
        <div className="bg-white p-8 lg:p-16 lg:w-1/2">
          <h3 className="text-2xl font-black mb-6 text-gray-900">Devenir Propriétaire Partenaire</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nom & Prénoms</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-medium focus:border-brand-orange focus:outline-none transition-colors"
                placeholder="Ex: Kouame Koffi"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Numéro de téléphone</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-medium focus:border-brand-orange focus:outline-none transition-colors"
                placeholder="Ex: +225 0707..."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Localisation du bien</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-medium focus:border-brand-orange focus:outline-none transition-colors"
                placeholder="Ex: Cocody Angre, Yopougon..."
              />
            </div>
            <button 
              type="submit" 
              disabled={status === 'LOADING'}
              className="w-full bg-brand-dark text-white font-black py-4 rounded-xl hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-2 group"
            >
              {status === 'LOADING' ? 'ENVOI EN COURS...' : (
                <>ENREGISTRER MON BIEN <UserPlus size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            
            {status === 'SUCCESS' && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 text-sm font-bold flex items-center gap-2">
                <CheckCircle size={18} /> Demande envoyée ! Nous vous contacterons sous 48h.
              </div>
            )}
            {status === 'ERROR' && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-bold flex items-center gap-2">
                <CheckCircle size={18} /> Erreur lors de l'envoi. Veuillez réessayer.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
