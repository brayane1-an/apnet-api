
import React from 'react';

export const OfficialMessage = () => {
  return (
    <div className="bg-gray-50 py-16 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
          <span>📢</span> Message officiel APNET
        </h2>
        <div className="text-lg text-gray-600 space-y-4 leading-relaxed">
          <p>
            Bienvenue sur APNET, la plateforme qui connecte ceux qui offrent des services et ceux qui en recherchent.
          </p>
          <p>
            Nous remercions nos prestataires pour leur professionnalisme, ainsi que tous les utilisateurs qui contribuent à faire de APNET une communauté fondée sur la confiance et l'entraide.
          </p>
        </div>
        <div className="mt-8 font-bold text-brand-orange text-lg">
          — L’équipe APNET
        </div>
      </div>
    </div>
  );
};