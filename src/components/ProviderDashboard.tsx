
import React, { useState } from 'react';
import { UserProfile, ViewState } from '../types';
import { Briefcase, MessageSquare, User, Calendar, CheckCircle, TrendingUp, IdCard } from 'lucide-react';
import { DigitalIDCard } from './DigitalIDCard';

interface ProviderDashboardProps {
  currentUser: UserProfile;
  setView: (view: ViewState) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ currentUser, setView }) => {
  const [showIDCard, setShowIDCard] = useState(false);
  
  // Adaptation dynamique du titre selon le métier
  const dashboardTitle = currentUser.subCategory 
    ? `Espace ${currentUser.subCategory}` 
    : "Espace Prestataire";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-brand-dark text-white rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Briefcase size={120} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-3xl font-extrabold mb-2">{dashboardTitle}</h1>
                <p className="text-gray-300">Bienvenue, {currentUser.firstName}. Gérez votre activité et vos missions.</p>
            </div>
            {/* CTA Bouton Ma Carte */}
            <button 
              onClick={() => setShowIDCard(true)}
              className="bg-brand-orange text-white px-6 py-3 rounded-xl font-black flex items-center gap-3 hover:bg-orange-600 transition shadow-lg shadow-orange-900/20 active:scale-95 border-b-4 border-orange-700"
            >
                <IdCard size={24} />
                MA CARTE APNET
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Profil */}
        <div 
            onClick={() => setView(ViewState.PROFILE)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group"
        >
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                <User size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Profil Public</h3>
            <p className="text-sm text-gray-500">Gérez votre visibilité.</p>
        </div>

        {/* Card 2: Messages */}
        <div 
            onClick={() => setView(ViewState.MESSAGES)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group"
        >
            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition">
                <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Messages</h3>
            <p className="text-sm text-gray-500">Discutez avec vos clients.</p>
        </div>

        {/* Card 3: Ma Carte (Mobile focus) */}
        <div 
            onClick={() => setShowIDCard(true)}
            className="bg-orange-50 p-6 rounded-xl shadow-sm border border-brand-orange/20 hover:shadow-md transition cursor-pointer group"
        >
            <div className="bg-brand-orange text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <IdCard size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Carte de Membre</h3>
            <p className="text-sm text-gray-500">Présentez votre badge pro.</p>
        </div>

        {/* Card 4: Statistiques */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="bg-brand-dark p-1 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <TrendingUp size={24} className="text-brand-orange" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Stats</h3>
            <div className="flex justify-between items-center mt-4">
                <div className="text-center">
                    <span className="block text-2xl font-bold text-gray-900">{currentUser.completedJobs}</span>
                    <span className="text-xs text-gray-500">Jobs</span>
                </div>
                <div className="text-center font-bold text-brand-orange">
                    {currentUser.rating} ★
                </div>
            </div>
        </div>
      </div>

      {/* Section spécifique métier (Exemple Livreur) */}
      {currentUser.category?.includes('Transport') && (
          <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Outils Livraison</h2>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex justify-between items-center">
                  <div>
                      <h3 className="font-bold">Accès Rapide aux Courses</h3>
                      <p className="text-sm text-gray-600">Voir les colis disponibles autour de moi.</p>
                  </div>
                  <button 
                    onClick={() => setView(ViewState.RIDER_JOB_BOARD)}
                    className="bg-brand-orange text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition"
                  >
                      Voir les courses
                  </button>
              </div>
          </div>
      )}

      {/* Carte Digitale plein écran */}
      {showIDCard && (
        <DigitalIDCard user={currentUser} onClose={() => setShowIDCard(false)} />
      )}
    </div>
  );
};
