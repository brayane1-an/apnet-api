
import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

interface ReviewModalProps {
  providerName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ providerName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Veuillez donner une note (étoiles).");
      return;
    }
    onSubmit(rating, comment);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">Noter la prestation</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">
            Comment s'est passée votre expérience avec <br/>
            <span className="font-bold text-gray-900 text-lg">{providerName}</span> ?
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star 
                  size={32} 
                  className={`${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              </button>
            ))}
          </div>

          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg text-sm mb-4 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
            rows={4}
            placeholder="Écrivez un commentaire (facultatif)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button 
            onClick={handleSubmit}
            className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition"
          >
            Envoyer mon avis
          </button>
        </div>
      </div>
    </div>
  );
};
