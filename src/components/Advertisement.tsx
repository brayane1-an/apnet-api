
import React, { useState, useEffect } from 'react';
import { Advertisement, UserProfile } from '../types';
import { ExternalLink, Megaphone, CheckCircle, TrendingUp, Heart, MessageSquare, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { adService } from '../services/adService';
import { AdReviewModal } from './AdReviewModal';

interface AdvertisementProps {
  ad: Advertisement;
  className?: string;
  onInteract?: (adId: string, action: 'VIEW' | 'CLICK') => void;
  currentUser?: UserProfile | null; // Added currentUser prop
}

export const AdBanner: React.FC<AdvertisementProps> = ({ ad, className, onInteract }) => {
  const handleClick = () => {
    if (onInteract) onInteract(ad.id, 'CLICK');
    window.open(ad.actionUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 sm:p-6 rounded-xl shadow-md cursor-pointer group overflow-hidden ${className}`}
    >
      <div className="absolute top-2 right-2 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
        Sponsorisé
      </div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="bg-brand-orange/20 p-3 rounded-full flex-shrink-0 border border-white/10">
          <Megaphone className="text-brand-orange w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-brand-orange font-bold uppercase tracking-wider mb-1">{ad.sponsorName}</p>
          <h3 className="text-lg font-bold leading-tight mb-1">{ad.title}</h3>
          <p className="text-sm text-gray-300 line-clamp-2">{ad.body}</p>
        </div>
        <div className="bg-white text-gray-900 rounded-full p-2 group-hover:bg-brand-orange group-hover:text-white transition-colors">
          <ExternalLink size={20} />
        </div>
      </div>
    </div>
  );
};

// Native Advanced Style AdCard
export const AdCard: React.FC<AdvertisementProps> = ({ ad: initialAd, className, onInteract, currentUser }) => {
  // Local state to handle optimistic UI updates for likes/reviews
  const [ad, setAd] = useState(initialAd);
  const [isLiked, setIsLiked] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Sync with service/prop on mount
  useEffect(() => {
    // If backend data is fresher, use it (mock scenario)
    const freshAd = adService.getAdDetails(initialAd.id) || initialAd;
    setAd(freshAd);
    if (currentUser) {
      setIsLiked(freshAd.likes.includes(currentUser.id));
    }
  }, [initialAd.id, currentUser]);

  const handleClick = () => {
    if (onInteract) onInteract(ad.id, 'CLICK');
    window.open(ad.actionUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("Connectez-vous pour aimer cette publicité.");
      return;
    }

    const result = adService.toggleLike(ad.id, currentUser.id);
    if (result.success) {
      setIsLiked(result.isLiked);
      setAd(prev => ({
        ...prev,
        likes: result.isLiked ? [...prev.likes, currentUser.id] : prev.likes.filter(id => id !== currentUser.id)
      }));
    }
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    if (!currentUser) return;

    const result = adService.addReview(
      ad.id, 
      currentUser.id, 
      `${currentUser.firstName} ${currentUser.lastName}`, 
      rating, 
      comment
    );

    if (result.success && result.review) {
      setAd(prev => ({
        ...prev,
        reviews: [result.review!, ...prev.reviews]
      }));
      setShowReviewModal(false);
    } else {
      alert(result.error || "Erreur lors de l'ajout de l'avis.");
    }
  };

  // Calcul moyenne
  const avgRating = ad.reviews.length > 0 
    ? (ad.reviews.reduce((acc, r) => acc + r.rating, 0) / ad.reviews.length).toFixed(1) 
    : null;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full group ${className}`}>
      {/* Clickable Area for Ad Action */}
      <div onClick={handleClick} className="cursor-pointer">
        <div className="p-5 pb-2">
          <div className="flex items-start gap-4">
            <div className="relative">
               {/* Sponsor Logo mimicking user avatar */}
               <img 
                src={ad.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ad.sponsorName)}&background=random`}
                alt={ad.sponsorName} 
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
              />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                 <CheckCircle size={16} className="text-brand-orange fill-current bg-white rounded-full" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {ad.sponsorName}
                </h3>
              </div>
              <span className="inline-block bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-200 uppercase tracking-wide">
                Annonce
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center mb-2 gap-2">
               <div className="bg-gray-50 rounded-md px-2 py-1 border border-gray-100 flex items-center gap-2 w-full">
                  <TrendingUp size={12} className="text-brand-green" />
                  <span className="text-xs text-gray-600 font-medium truncate">
                    {ad.title}
                  </span>
               </div>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-3 mb-2 mt-2">
              {ad.body}
            </p>
          </div>
        </div>
      </div>

      {/* Interaction Bar (Like & Review Stats) */}
      <div className="px-5 py-2 flex items-center justify-between border-t border-gray-50 bg-gray-50/50">
         <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-bold transition ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
         >
            <Heart size={16} className={isLiked ? 'fill-current' : ''} />
            {ad.likes.length > 0 ? ad.likes.length : "J'aime"}
         </button>

         <button 
            onClick={() => setShowReviews(!showReviews)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition"
         >
            <MessageSquare size={16} />
            {ad.reviews.length} Avis
            {avgRating && (
                <span className="flex items-center text-yellow-500 ml-1">
                    {avgRating} <Star size={10} className="fill-current"/>
                </span>
            )}
            {showReviews ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
         </button>
      </div>

      {/* Reviews Section (Expandable) */}
      {showReviews && (
          <div className="bg-gray-50 border-t border-gray-100 p-4 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">Derniers avis</h4>
                  <button 
                    onClick={() => {
                        if(currentUser) setShowReviewModal(true);
                        else alert("Veuillez vous connecter pour laisser un avis.");
                    }}
                    className="text-xs bg-white border border-gray-300 px-2 py-1 rounded text-gray-700 font-bold hover:bg-gray-100"
                  >
                      + Laisser un avis
                  </button>
              </div>

              {ad.reviews.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-2">Soyez le premier à donner votre avis.</p>
              ) : (
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {ad.reviews.map(rev => (
                          <div key={rev.id} className="bg-white p-2 rounded border border-gray-100 text-xs">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-gray-800">{rev.userName}</span>
                                  <div className="flex text-yellow-400">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} size={8} className={i < rev.rating ? "fill-current" : "text-gray-200"} />
                                      ))}
                                  </div>
                              </div>
                              <p className="text-gray-600 leading-snug">{rev.comment}</p>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <button 
          onClick={() => setShowReviewModal(true)}
          className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          Noter
        </button>
        <button 
          onClick={handleClick}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm group-hover:bg-blue-700"
        >
          <ExternalLink size={16} />
          Voir l'offre
        </button>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
          <AdReviewModal 
            adTitle={ad.title}
            onClose={() => setShowReviewModal(false)}
            onSubmit={handleReviewSubmit}
          />
      )}
    </div>
  );
};
