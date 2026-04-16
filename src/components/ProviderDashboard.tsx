
import React from 'react';
import { UserProfile, ViewState } from '../types';
import { Briefcase, MessageSquare, User, Calendar, CheckCircle, TrendingUp } from 'lucide-react';

interface ProviderDashboardProps {
  currentUser: UserProfile;
  setView: (view: ViewState) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ currentUser, setView }) => {
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
        <div className="relative z-10">
            <h1 className="text-3xl font-extrabold mb-2">{dashboardTitle}</h1>
            <p className="text-gray-300">Bienvenue, {currentUser.firstName}. Gérez votre activité et vos missions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Profil */}
        <div 
            onClick={() => setView(ViewState.PROFILE)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group"
        >
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                <User size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Mon Profil Public</h3>
            <p className="text-sm text-gray-500">Gérez votre photo, vos documents et vos infos visibles par les clients.</p>
        </div>

        {/* Card 2: Messages */}
        <div 
            onClick={() => setView(ViewState.MESSAGES)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group"
        >
            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition">
                <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Messages & Chat</h3>
            <p className="text-sm text-gray-500">Discutez avec vos clients en cours et répondez aux nouvelles demandes.</p>
        </div>

        {/* Card 3: Activité */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="bg-orange-100 text-brand-orange w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Statistiques</h3>
            <div className="flex justify-between items-center mt-4">
                <div className="text-center">
                    <span className="block text-2xl font-bold text-gray-900">{currentUser.completedJobs}</span>
                    <span className="text-xs text-gray-500">Missions</span>
                </div>
                <div className="text-center">
                    <span className="block text-2xl font-bold text-gray-900">{currentUser.rating}</span>
                    <span className="text-xs text-gray-500">Note</span>
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
    </div>
  );
};
