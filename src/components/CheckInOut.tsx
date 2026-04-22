
import React, { useState } from 'react';
import { Reservation, RealEstateListing } from '../types';
import { Camera, CheckCircle, AlertCircle, ArrowLeft, Image as ImageIcon, Save, ShieldCheck } from 'lucide-react';

interface CheckInOutProps {
  reservation: Reservation;
  mode: 'CHECK-IN' | 'CHECK-OUT';
  onComplete: (photos: string[]) => void;
  onCancel: () => void;
  onReport?: (notes: string) => void;
}

export const CheckInOut: React.FC<CheckInOutProps> = ({ reservation, mode, onComplete, onCancel, onReport }) => {
  const [photos, setPhotos] = useState<string[]>(mode === 'CHECK-OUT' ? reservation.checkInPhotos || [] : []);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);

  const sections = ['Salon', 'Chambre', 'Salle de bain', 'Cuisine'];

  const handleCapture = (index: number) => {
    // Simulation d'upload de photo
    const mockUrl = `https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop&sig=${Date.now()}-${index}`;
    const newCurrent = [...currentPhotos];
    newCurrent[index] = mockUrl;
    setCurrentPhotos(newCurrent);
  };

  const isComplete = currentPhotos.filter(p => !!p).length >= 4;

  const handleSave = () => {
    if (!isComplete) {
      alert("Veuillez prendre les 4 photos obligatoires.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onComplete(currentPhotos);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] overflow-y-auto pb-20">
      <div className="bg-brand-dark text-white p-4 sticky top-0 flex items-center justify-between">
        <button onClick={onCancel} className="p-2"><ArrowLeft /></button>
        <h2 className="font-bold text-lg">{mode} : État des lieux</h2>
        <div className="w-10"></div>
      </div>

      <div className="max-w-xl mx-auto p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
          <ShieldCheck className="text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-bold">Protection APNET Active</p>
            <p>Prenez des photos claires de chaque pièce pour garantir la sécurité de la caution ({reservation.cautionAmount.toLocaleString()} FCFA).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {sections.map((section, idx) => (
            <div key={section} className="border rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
              <div className="p-3 bg-white border-b flex justify-between items-center">
                <span className="font-bold text-gray-700">{section}</span>
                {currentPhotos[idx] ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">REQUIS</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 aspect-[16/9]">
                {/* Photo de référence (Check-in) si on est en Check-out */}
                {mode === 'CHECK-OUT' && (
                  <div className="border-r relative group">
                    <img src={reservation.checkInPhotos?.[idx]} className="w-full h-full object-cover" alt="Réf" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-bold">RÉFÉRENCE ARRIVÉE</span>
                    </div>
                  </div>
                )}
                
                {/* Photo actuelle */}
                <div className={`relative flex items-center justify-center ${mode === 'CHECK-OUT' ? '' : 'col-span-2'}`}>
                  {currentPhotos[idx] ? (
                    <img src={currentPhotos[idx]} className="w-full h-full object-cover" alt="Actuelle" />
                  ) : (
                    <button 
                      onClick={() => handleCapture(idx)}
                      className="flex flex-col items-center gap-2 text-gray-400 hover:text-brand-orange transition"
                    >
                      <Camera size={32} />
                      <span className="text-xs font-bold uppercase">Prendre photo</span>
                    </button>
                  )}
                  {currentPhotos[idx] && (
                    <button 
                      onClick={() => {
                        const next = [...currentPhotos];
                        next[idx] = '';
                        setCurrentPhotos(next);
                      }}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                    >
                      <ImageIcon size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {mode === 'CHECK-OUT' && isComplete && (
          <div className="space-y-4 pt-4">
             {!showReportForm ? (
               <button 
                onClick={() => setShowReportForm(true)}
                className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
               >
                 <AlertCircle size={18} /> Signaler un dégât
               </button>
             ) : (
               <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                 <label className="block text-sm font-bold text-gray-700">Détails du dégat</label>
                 <textarea 
                   className="w-full border rounded-xl p-3 text-sm h-24"
                   placeholder="Décrivez les dommages constatés..."
                   value={reportNote}
                   onChange={e => setReportNote(e.target.value)}
                 />
                 <button 
                  onClick={() => onReport?.(reportNote)}
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-bold"
                 >
                   Confirmer le signalement
                 </button>
               </div>
             )}
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-4">
          <button 
            disabled={!isComplete || loading}
            onClick={handleSave}
            className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95 ${isComplete ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {loading ? <ImageIcon className="animate-spin" /> : <Save />}
            {mode === 'CHECK-IN' ? "Confirmer l'arrivée" : "Libérer la caution"}
          </button>
        </div>
      </div>
    </div>
  );
};
