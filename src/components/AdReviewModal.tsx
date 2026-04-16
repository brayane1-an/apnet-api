
import React, { useState } from 'react';
import { Star, X, AlertTriangle, Send } from 'lucide-react';

interface AdReviewModalProps {
  adTitle: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export const AdReviewModal: React.FC<AdReviewModalProps> = ({ adTitle, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Veuillez sélectionner une note.");
      return;
    }
    if (comment.length < 5) {
      setError("Le commentaire est trop court.");
      return;
    }
    onSubmit(rating, comment);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900 truncate pr-2">Avis : {adTitle}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating Stars */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Votre note</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star 
                      size={32} 
                      className={`${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Votre commentaire</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                placeholder="Partagez votre expérience..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Ne partagez pas de numéros ou d'emails.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-2 rounded text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition flex justify-center items-center gap-2"
            >
              Envoyer <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
