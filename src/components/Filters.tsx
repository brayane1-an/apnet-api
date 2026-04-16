
import React from 'react';
import { Briefcase, BriefcaseBusiness, Sparkles, MapPin, Star, Wallet, Award, Clock, Languages } from 'lucide-react';
import { SERVICE_CATEGORIES, ABIDJAN_COMMUNES, MOCK_PROVIDERS, AVAILABILITY_OPTIONS, LANGUAGE_OPTIONS } from '../constants';

interface FiltersProps {
  category: string;
  subCategory: string;
  specialization: string;
  location: string;
  minRating: number;
  maxPrice: number;
  requiredCertification: string;
  availability: string;
  language: string;
  
  setCategory: (c: string) => void;
  setSubCategory: (s: string) => void;
  setSpecialization: (s: string) => void;
  setLocation: (l: string) => void;
  setMinRating: (r: number) => void;
  setMaxPrice: (p: number) => void;
  setRequiredCertification: (c: string) => void;
  setAvailability: (a: string) => void;
  setLanguage: (l: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ 
  category, subCategory, specialization, location, minRating, maxPrice, requiredCertification, availability, language,
  setCategory, setSubCategory, setSpecialization, setLocation, setMinRating, setMaxPrice, setRequiredCertification, setAvailability, setLanguage
}) => {
  const selectedCatNode = SERVICE_CATEGORIES.find(c => c.label === category);
  const subCats = selectedCatNode ? selectedCatNode.subCategories : [];
  const selectedSubNode = subCats.find(s => s.label === subCategory);
  const specs = selectedSubNode ? selectedSubNode.specializations : [];

  // Derived unique certifications from mock DB for suggestions
  const allCertifications = Array.from(new Set(MOCK_PROVIDERS.flatMap(p => p.certifications || []))) as string[];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <BriefcaseBusiness className="absolute left-3 top-3 text-gray-400" size={18} />
          <select 
            value={category}
            onChange={e => { setCategory(e.target.value); setSubCategory(''); setSpecialization(''); }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-gray-50 focus:bg-white transition"
          >
            <option value="">Toutes les catégories</option>
            {SERVICE_CATEGORIES.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
          </select>
        </div>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
          <select 
            value={subCategory}
            onChange={e => { setSubCategory(e.target.value); setSpecialization(''); }}
            disabled={!category}
            className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-gray-50 focus:bg-white transition disabled:opacity-50"
          >
            <option value="">Tous les métiers</option>
            {subCats.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
          </select>
        </div>
        <div className="relative">
           <Sparkles className="absolute left-3 top-3 text-gray-400" size={18} />
           <select 
            value={specialization}
            onChange={e => setSpecialization(e.target.value)}
            disabled={!subCategory}
            className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-gray-50 focus:bg-white transition disabled:opacity-50"
          >
            <option value="">Toutes spécialisations</option>
             {specs.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
          </select>
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-gray-50 focus:bg-white transition"
          >
            <option value="">Partout à Abidjan</option>
            {ABIDJAN_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Rating Filter */}
        <div className="relative">
           <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Star size={12}/> Note Min.</label>
           <select 
              value={minRating}
              onChange={e => setMinRating(Number(e.target.value))}
              className="w-full p-2 border rounded text-sm"
           >
             <option value="0">Peu importe</option>
             <option value="3">3+ Étoiles</option>
             <option value="4">4+ Étoiles</option>
             <option value="4.5">4.5+ (Experts)</option>
           </select>
        </div>

        {/* Price Filter */}
        <div className="relative">
           <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Wallet size={12}/> Budget Max.</label>
           <input 
              type="number"
              placeholder="Ex: 10000"
              value={maxPrice || ''}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full p-2 border rounded text-sm"
           />
        </div>

        {/* Certification Filter (Smart Datalist) */}
        <div className="relative">
           <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Award size={12}/> Certification</label>
           <input 
              list="certs-list"
              type="text"
              placeholder="Ex: CAP, BT..."
              value={requiredCertification}
              onChange={e => setRequiredCertification(e.target.value)}
              className="w-full p-2 border rounded text-sm"
           />
           <datalist id="certs-list">
             {allCertifications.map((c, i) => <option key={i} value={c} />)}
           </datalist>
        </div>

         {/* Availability Filter */}
         <div className="relative">
           <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Clock size={12}/> Disponibilité</label>
           <select 
              value={availability}
              onChange={e => setAvailability(e.target.value)}
              className="w-full p-2 border rounded text-sm"
           >
             <option value="">Peu importe</option>
             {AVAILABILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
           </select>
        </div>

        {/* Language Filter */}
        <div className="relative">
           <label className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Languages size={12}/> Langue</label>
           <select 
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full p-2 border rounded text-sm"
           >
             <option value="">Peu importe</option>
             {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
           </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
