
import React from 'react';
import { 
  Hammer, ShoppingBag, Utensils, Truck, 
  HeartPulse, BookOpen, Cpu, Home, Users, ArrowRight 
} from 'lucide-react';
import { ViewState } from '../types';
import { SERVICE_CATEGORIES } from '../constants';

interface CategoryGridProps {
  setView: (v: ViewState) => void;
  onSelectCategory: (category: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'Bâtiment & Artisanat': <Hammer size={24} />,
  'Commerce & Vente': <ShoppingBag size={24} />,
  'Restauration & Hôtellerie': <Utensils size={24} />,
  'Transport & Logistique': <Truck size={24} />,
  'Santé & Bien-être': <HeartPulse size={24} />,
  'Éducation & Formation': <BookOpen size={24} />,
  'Technologie & Informatique': <Cpu size={24} />,
  'Services à domicile': <Home size={24} />,
  'Communauté & Opportunités': <Users size={24} />,
  'Immobilier': <Home size={24} />,
  'Livreur Privé': <Truck size={24} />
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ setView, onSelectCategory }) => {
  // On ajoute manuellement Immobilier et Livreur Privé car ce sont des modules à part
  const displayCategories = [
    ...SERVICE_CATEGORIES.filter(c => c.label !== 'Communauté & Opportunités' && c.label !== 'Transport & Logistique'),
    { id: 'real-estate', label: 'Immobilier', subCategories: [] },
    { id: 'delivery', label: 'Livreur Privé', subCategories: [] },
    SERVICE_CATEGORIES.find(c => c.label === 'Communauté & Opportunités')!
  ];

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Parcourir par Catégorie</h2>
            <p className="mt-2 text-gray-600">Trouvez l'expert qu'il vous faut dans nos différents secteurs.</p>
          </div>
          <button 
            onClick={() => setView(ViewState.CATALOG)}
            className="hidden sm:flex items-center gap-2 text-brand-orange font-bold hover:underline"
          >
            Voir tout le catalogue <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayCategories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => {
                if (cat.label === 'Immobilier') {
                  setView(ViewState.REAL_ESTATE);
                } else if (cat.label === 'Livreur Privé') {
                  onSelectCategory('Livreur Privé'); // Go to provider list filtered by Livreur Privé
                } else if (cat.label === 'Communauté & Opportunités') {
                  setView(ViewState.INTERNSHIPS);
                } else {
                  onSelectCategory(cat.label);
                }
              }}
              className="group bg-gray-50 rounded-2xl p-6 text-center cursor-pointer hover:bg-brand-orange hover:text-white transition-all duration-300 border border-gray-100 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center p-4 bg-white rounded-xl mb-4 text-brand-orange group-hover:bg-white/20 group-hover:text-white transition-colors shadow-sm">
                {iconMap[cat.label] || <Hammer size={24} />}
              </div>
              <h3 className="font-bold text-sm md:text-base leading-tight">
                {cat.label}
              </h3>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => setView(ViewState.CATALOG)}
          className="mt-8 w-full sm:hidden flex items-center justify-center gap-2 text-brand-orange font-bold py-3 border border-brand-orange rounded-xl"
        >
          Voir tout le catalogue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
