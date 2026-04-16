
import React from 'react';
import { ViewState } from '../types';
import { SERVICE_CATEGORIES } from '../constants';
import { Search, ArrowRight, Wallet } from 'lucide-react';

interface ServiceCatalogProps {
  setView: (v: ViewState) => void;
  onSelectService: (category: string, subCategory: string, specialization: string) => void;
  onRequestQuote: (category: string, subCategory: string) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ setView, onSelectService, onRequestQuote }) => {
  // Filtrer pour exclure "Communauté & Opportunités" (Stages) et l'Immobilier s'il était présent
  // On ne garde que les métiers "classiques"
  const filteredCategories = SERVICE_CATEGORIES.filter(cat => 
    cat.label !== 'Communauté & Opportunités' && 
    !cat.label.includes('Immobilier')
  );

  return (
    <div className="py-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
          Catalogue des Services
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Découvrez la liste complète des métiers disponibles sur APNET.
          <br/>
          <span className="text-sm text-gray-500">(Pour l'immobilier et les stages, voir les sections dédiées dans le menu)</span>
        </p>
      </div>

        {/* PROMO CARDS REMOVED as requested */}

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
                                if (sub.label.includes("Livreur Privé")) {
                                    onSelectService(category.label, sub.label, spec.label);
                                } else {
                                    onSelectService(category.label, sub.label, spec.label);
                                }
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
  );
};
