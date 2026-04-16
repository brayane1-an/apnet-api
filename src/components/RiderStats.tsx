
import React from 'react';
import { RiderStats as RiderStatsType, RiderLevel } from '../types';
import { RIDER_LEVEL_RULES } from '../constants';
import { getNextLevelDetails } from '../services/riderLevelService';
import { Trophy, Star, Truck, TrendingUp, Info } from 'lucide-react';

interface RiderStatsProps {
  stats: RiderStatsType;
}

export const RiderStats: React.FC<RiderStatsProps> = ({ stats }) => {
  const currentRules = RIDER_LEVEL_RULES[stats.level];
  const nextLevel = getNextLevelDetails(stats.level);

  // Calculate Progress percentages
  const pointsProgress = nextLevel 
    ? Math.min(100, ((stats.reliabilityPoints || 0) / nextLevel.minPoints) * 100) 
    : 100;
    
  const ratingProgress = nextLevel 
    ? Math.min(100, (stats.rating / 5) * 100) // Visual progress out of 5 stars
    : 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
       {/* Header with Level Styling */}
       <div className={`p-6 ${currentRules.color} bg-opacity-10 border-b`}>
          <div className="flex justify-between items-center">
             <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Votre Niveau Actuel</div>
                <h2 className="text-3xl font-extrabold flex items-center gap-2">
                   <Trophy size={28} /> {currentRules.label}
                </h2>
             </div>
             <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Points de Fiabilité</div>
                <div className="text-2xl font-bold">{stats.reliabilityPoints || 0}</div>
             </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
             {currentRules.benefits.map((benefit, i) => (
                <span key={i} className="bg-white bg-opacity-60 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                   <Star size={10} className="fill-current" /> {benefit}
                </span>
             ))}
          </div>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
          <div className="p-4 text-center">
             <div className="text-gray-500 text-xs font-bold uppercase mb-1">Total Courses</div>
             <div className="text-xl font-bold text-gray-900">{stats.totalDeliveries}</div>
          </div>
          <div className="p-4 text-center">
             <div className="text-gray-500 text-xs font-bold uppercase mb-1">Note Moyenne</div>
             <div className="text-xl font-bold text-gray-900 flex items-center justify-center gap-1">
                {stats.rating.toFixed(1)} <Star size={14} className="text-yellow-400 fill-current" />
             </div>
          </div>
          <div className="p-4 text-center bg-green-50">
             <div className="text-green-800 text-xs font-bold uppercase mb-1">Cette Semaine</div>
             <div className="text-xl font-bold text-green-700">{stats.weeklyDeliveries}</div>
          </div>
          <div className="p-4 text-center">
             <div className="text-gray-500 text-xs font-bold uppercase mb-1">Ce Mois</div>
             <div className="text-xl font-bold text-gray-900">{stats.monthlyDeliveries}</div>
          </div>
       </div>

       {/* Next Level Goals */}
       {nextLevel ? (
          <div className="p-6 bg-gray-50">
             <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp size={16} /> Objectifs pour le niveau {nextLevel.label}
             </h3>
             
             <div className="space-y-4">
                {/* Points Progress */}
                <div>
                   <div className="flex justify-between text-xs mb-1">
                      <span>Points de fiabilité : {stats.reliabilityPoints || 0} / {nextLevel.minPoints}</span>
                      <span className="font-bold">{pointsProgress.toFixed(0)}%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-orange h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${pointsProgress}%` }}
                      ></div>
                   </div>
                </div>

                {/* Rating Requirement */}
                <div>
                   <div className="flex justify-between text-xs mb-1">
                      <span className={`${stats.rating < nextLevel.minRating ? 'text-red-600' : 'text-green-600'}`}>
                         Note requise : {nextLevel.minRating} / 5.0
                      </span>
                      {stats.rating >= nextLevel.minRating ? <span className="font-bold text-green-600">OK</span> : <span className="font-bold text-red-600">À améliorer</span>}
                   </div>
                </div>
             </div>
             
             <p className="text-xs text-gray-500 mt-4 italic flex items-center gap-1">
               <Info size={12}/>
               Le niveau est recalculé automatiquement chaque nuit à 00h00.
             </p>
          </div>
       ) : (
          <div className="p-6 text-center bg-cyan-50">
             <Trophy size={48} className="mx-auto text-cyan-500 mb-2" />
             <h3 className="text-lg font-bold text-cyan-900">Vous êtes au sommet !</h3>
             <p className="text-sm text-cyan-700">Vous avez atteint le niveau maximum. Continuez à maintenir votre excellence pour conserver vos avantages exclusifs.</p>
          </div>
       )}
    </div>
  );
};
