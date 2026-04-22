
import React, { useState } from 'react';
import { 
  Search, Sparkles, Loader2, MapPin, Star, Languages, 
  Calendar, Clock, CheckCircle, MessageSquare, ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, query, where, getDocs, doc, getDoc, setDoc, 
  Timestamp, limit 
} from 'firebase/firestore';
import { extractSearchCriteria, ExtractedCriteria } from '../services/geminiService';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SmartSearchProps {
  onContact?: (provider: UserProfile) => void;
}

const normalizeQuery = (q: string) => {
  return q.toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '');
};

export const SmartSearch: React.FC<SmartSearchProps> = ({ onContact }) => {
  const [userInput, setUserInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [criteria, setCriteria] = useState<ExtractedCriteria | null>(null);
  const [error, setError] = useState('');

  const handleSmartSearch = async () => {
    if (!userInput.trim()) return;

    setIsSearching(true);
    setError('');
    setResults([]);
    
    try {
      const normalizedQuery = normalizeQuery(userInput);
      const cacheRef = doc(db, 'search_cache', normalizedQuery);
      const cacheSnap = await getDoc(cacheRef);

      let extracted: ExtractedCriteria;

      if (cacheSnap.exists()) {
        const cacheData = cacheSnap.data();
        const now = Timestamp.now().toMillis();
        const expiresAt = cacheData.expiresAt.toMillis();

        if (now < expiresAt) {
          console.log('Cache Hit!');
          extracted = cacheData.extractedCriteria;
        } else {
          console.log('Cache Expired, calling Gemini...');
          extracted = await extractSearchCriteria(userInput);
          await saveToCache(normalizedQuery, extracted);
        }
      } else {
        console.log('Cache Miss, calling Gemini...');
        extracted = await extractSearchCriteria(userInput);
        await saveToCache(normalizedQuery, extracted);
      }

      setCriteria(extracted);
      await performProviderSearch(extracted);
      
    } catch (err: any) {
      console.error("Search error:", err);
      setError("Désolé, une erreur est survenue lors de la recherche. Veuillez réessayer.");
    } finally {
      setIsSearching(false);
    }
  };

  const saveToCache = async (normalized: string, extracted: ExtractedCriteria) => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await setDoc(doc(db, 'search_cache', normalized), {
      queryNormalized: normalized,
      extractedCriteria: extracted,
      cachedAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt)
    });
  };

  const performProviderSearch = async (extracted: ExtractedCriteria) => {
    try {
      // Basic query for providers
      const providersRef = collection(db, 'users');
      const q = query(providersRef, where('roles.isProvider', '==', true), limit(50));
      const querySnapshot = await getDocs(q);
      
      const allProviders: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        allProviders.push(doc.data() as UserProfile);
      });

      // Simple internal scoring system
      const scoredProviders = allProviders.map(p => {
        let score = 0;
        const profile = p.providerProfile;
        
        if (!profile) return { ...p, searchScore: 0 };

        // 1. Job Title / Category Match
        if (extracted.jobTitle && profile.jobTitle?.toLowerCase().includes(extracted.jobTitle.toLowerCase())) score += 10;
        if (extracted.category && profile.category === extracted.category) score += 5;

        // 2. Skills Match
        if (extracted.skills && profile.skills) {
          const matchingSkills = extracted.skills.filter(s => 
            profile.skills?.some(ps => ps.toLowerCase().includes(s.toLowerCase()))
          );
          score += matchingSkills.length * 3;
        }

        // 3. Location Match
        if (extracted.location && p.location?.city && 
            extracted.location.toLowerCase().includes(p.location.city.toLowerCase())) {
          score += 8;
          if (p.location.commune && extracted.location.toLowerCase().includes(p.location.commune.toLowerCase())) {
            score += 4;
          }
        }

        // 4. Rating Bonus
        score += (profile.rating || 0) * 2;

        // 5. Verification Bonus
        if (profile.isVerified) score += 5;
        if (profile.isAvailableNow) score += 3;

        return { ...p, searchScore: score };
      });

      // Sort by score and filter out low matches if many results found
      const sorted = scoredProviders
        .filter(p => (p as any).searchScore > 0)
        .sort((a, b) => (b as any).searchScore - (a as any).searchScore);

      setResults(sorted);
      if (sorted.length === 0) {
          setError("Aucun prestataire ne correspond exactement à vos critères. Essayez d'élargir votre recherche.");
      }
    } catch (err) {
      console.error("Firestore query error:", err);
      throw err;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Sparkles size={120} className="text-brand-orange" />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Search className="text-brand-orange" size={28} />
            Recherche Intelligente APNET
          </h2>
          <p className="text-gray-500 mb-6 max-w-2xl">
            Décrivez votre besoin en langage naturel (ex: "Je cherche une nounou bilingue pour mes enfants à Cocody, disponible immédiatement"). 
            Notre IA analysera vos critères pour trouver les meilleurs pros.
          </p>

          <div className="space-y-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full p-4 text-lg border-2 border-gray-100 rounded-2xl focus:border-brand-orange focus:ring-0 transition resize-none h-32"
              placeholder="Décrivez votre besoin ici..."
            />
            
            <button
              onClick={handleSmartSearch}
              disabled={isSearching || !userInput.trim()}
              className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 disabled:bg-gray-300 disabled:shadow-none"
            >
              {isSearching ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Analyse IA en cours...
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  Lancer la recherche intelligente
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {criteria && !isSearching && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 px-2"
          >
            {criteria.jobTitle && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                Métier: {criteria.jobTitle}
              </span>
            )}
            {criteria.location && (
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
                <MapPin size={12} /> {criteria.location}
              </span>
            )}
            {criteria.skills?.map(s => (
              <span key={s} className="bg-orange-50 text-brand-orange px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                {s}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100">
           <AlertCircle className="shrink-0" />
           <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((provider) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition group"
          >
            <div className="flex gap-4">
              <div className="relative">
                <img 
                  src={provider.photoUrl || 'https://via.placeholder.com/150'} 
                  alt={provider.firstName}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-gray-50"
                  referrerPolicy="no-referrer"
                />
                {provider.providerProfile?.isAvailableNow && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-brand-orange transition">
                      {provider.firstName} {provider.lastName.charAt(0)}.
                    </h3>
                    <p className="text-xs font-bold text-gray-500">
                      {provider.providerProfile?.jobTitle || provider.subCategory}
                    </p>
                  </div>
                  <div className="flex items-center text-orange-400 gap-1 bg-orange-50 px-2 py-0.5 rounded-lg">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-bold">{provider.providerProfile?.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                   {provider.providerProfile?.languages?.map(lang => (
                     <span key={lang} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                       <Languages size={8} /> {lang}
                     </span>
                   ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                   <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      <MapPin size={10} />
                      {provider.location?.commune || provider.location?.city}
                   </div>
                   <button 
                    onClick={() => onContact?.(provider)}
                    className="bg-brand-dark text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                   >
                     <MessageSquare size={12} /> Contacter
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
