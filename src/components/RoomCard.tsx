
import React, { useState } from 'react';
import { RealEstateListing } from '../types'; 
import { ROOM_UNLOCK_PRICE, checkRoomAvailability } from '../services/realEstateService';
import { MapPin, Lock, Loader2, CheckCircle, AlertCircle, Bed } from 'lucide-react';

interface RoomCardProps {
  room: RealEstateListing;
  onUnlock: (room: RealEstateListing, price: number) => void;
  isUnlocked: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onUnlock, isUnlocked }) => {
  const [checking, setChecking] = useState(false);

  const handleUnlock = async () => {
    setChecking(true);
    const available = await checkRoomAvailability(room.id);
    setChecking(false);

    if (!available) {
      alert("Cette chambre n’est plus disponible.");
      return;
    }

    onUnlock(room, ROOM_UNLOCK_PRICE);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col h-full">
      <div className="relative h-48 bg-gray-200 rounded-lg mb-3 overflow-hidden">
         <img src={room.photos[0]} className="w-full h-full object-cover" alt={room.title} />
         <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold uppercase flex items-center gap-1">
            <Bed size={12} /> Chambre
         </div>
      </div>

      <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{room.title}</h3>
      <div className="flex items-center text-gray-500 text-xs mb-3">
          <MapPin size={12} className="mr-1"/>
          {room.location.commune} - {room.location.quartier}
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow italic">"{room.description}"</p>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <p className="font-extrabold text-brand-orange text-lg">{room.price.toLocaleString()} F <span className="text-xs text-gray-400 font-normal">/ mois</span></p>
      </div>

      <div className="mt-3">
        {isUnlocked ? (
            <div className="bg-green-50 text-green-700 p-2.5 rounded-lg text-center text-sm font-bold flex items-center justify-center gap-2 border border-green-100">
                <CheckCircle size={16} /> Coordonnées Débloquées
            </div>
        ) : (
            <button
                onClick={handleUnlock}
                disabled={checking}
                className="bg-blue-600 text-white w-full rounded-lg py-2.5 text-sm font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
                {checking ? <Loader2 size={16} className="animate-spin"/> : <Lock size={16}/>}
                {checking ? "Vérification dispo..." : `Voir coordonnées (${ROOM_UNLOCK_PRICE} F)`}
            </button>
        )}
      </div>
    </div>
  );
};
