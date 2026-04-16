
import React from 'react';
import { MapPin, Shield, Award } from 'lucide-react';

const Features = () => (
  <div className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">Pourquoi choisir APNET ?</h2>
        <p className="mt-4 text-gray-600">La plateforme conçue pour les réalités ivoiriennes.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition duration-300">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <MapPin size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Proximité Totale</h3>
          <p className="text-gray-600">Recherche précise par quartier et commune (ex: Yopougon Siporex). Trouvez quelqu'un à 5 minutes de chez vous.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition duration-300">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Sécurité Renforcée</h3>
          <p className="text-gray-600">Vérification des profils et paiement séquestre. L'argent n'est libéré que lorsque le travail est fait.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition duration-300">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-brand-orange mb-4">
            <Award size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Tous les Métiers</h3>
          <p className="text-gray-600">Du maçon à l'ingénieur, en passant par l'apprenti couturier. Tout le monde a sa place sur APNET.</p>
        </div>
      </div>
    </div>
  </div>
);

export default Features;
