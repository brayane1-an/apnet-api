
import React from 'react';
import { Search, Briefcase, Home } from 'lucide-react';
import { ViewState, UserProfile } from '../types';

interface HeroProps {
  setView: (v: ViewState) => void;
  currentUser: UserProfile | null;
}

const Hero: React.FC<HeroProps> = ({ setView, currentUser }) => (
  <div className="relative bg-brand-dark overflow-hidden">
    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center"></div>
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <div className="md:w-2/3">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Trouvez le bon <span className="text-brand-orange">prestataire</span> <br/>
          à côté de chez vous.
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl">
          APNET connecte artisans, apprentis et travailleurs qualifiés avec des entreprises et particuliers en Côte d'Ivoire. Fiable, rapide et sécurisé.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setView(ViewState.CATALOG)}
            className="bg-brand-orange text-white font-bold py-4 px-8 rounded-full hover:bg-orange-600 transition shadow-lg flex items-center justify-center gap-2"
          >
            <Search size={20} />
            Parcourir le Catalogue
          </button>

          <button 
            onClick={() => setView(ViewState.REAL_ESTATE)}
            className="bg-white text-brand-dark font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition shadow-lg flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Immobilier
          </button>

          <button 
            onClick={() => setView(ViewState.RECRUITER_SPACE)}
            className="bg-brand-green text-white font-bold py-4 px-8 rounded-full hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2"
          >
            <Briefcase size={20} />
            Recrutement Entreprise
          </button>
          
          {/* Masquer le bouton si l'utilisateur est déjà inscrit */}
          {!currentUser && (
            <button 
              onClick={() => setView(ViewState.REGISTER)}
              className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-brand-dark transition flex items-center justify-center gap-2"
            >
              <Briefcase size={20} />
              Proposer mes services
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default Hero;
