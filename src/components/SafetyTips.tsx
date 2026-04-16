
import React from 'react';
import { ShieldAlert, Shield } from 'lucide-react';

const SafetyTips = () => (
  <div className="py-16 bg-orange-50 border-t border-orange-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">Votre sécurité, notre priorité</h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Nous mettons tout en œuvre pour sécuriser vos échanges.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm border border-orange-100">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-brand-orange">
              <ShieldAlert size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Paiement Séquestre</h3>
            <p className="text-sm text-gray-600">
              Ne payez jamais en direct. Utilisez le système APNET. L'argent est bloqué et reversé uniquement une fois le service rendu.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm border border-blue-100">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Shield size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Profils Vérifiés</h3>
            <p className="text-sm text-gray-600">
              Vérifiez le badge "Identité Vérifiée" avant d'engager un prestataire. Nous contrôlons les pièces d'identité.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SafetyTips;
