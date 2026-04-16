
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { FileText, CheckCircle, Lock, ShieldCheck } from 'lucide-react';

interface ContractViewerProps {
  provider: UserProfile;
  client: UserProfile;
  amount: number;
  onSign: () => void;
  onCancel: () => void;
}

export const ContractViewer: React.FC<ContractViewerProps> = ({ provider, client, amount, onSign, onCancel }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const handleSign = () => {
    setIsSigning(true);
    // Simulation délai réseau
    setTimeout(() => {
        onSign();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="bg-gray-900 text-white p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="text-brand-orange" /> Contrat de Prestation de Service
            </h2>
            <p className="text-xs text-gray-400 mt-1">Généré automatiquement par APNET Secure</p>
        </div>

        <div className="p-8 overflow-y-auto bg-gray-50 flex-1 text-sm text-gray-700 space-y-6">
            <div className="border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">ENTRE LES SOUSSIGNÉS</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Le Prestataire</p>
                        <p className="font-bold">{provider.firstName} {provider.lastName}</p>
                        <p>{provider.jobTitle}</p>
                        <p className="text-xs">{provider.location.city}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Le Client</p>
                        <p className="font-bold">{client.firstName} {client.lastName}</p>
                        <p className="text-xs">{client.location.city}</p>
                    </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-2">IL A ÉTÉ CONVENU CE QUI SUIT :</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Le prestataire s'engage à réaliser la mission définie dans la demande.</li>
                    <li>Le montant convenu est de <strong>{amount.toLocaleString()} FCFA</strong>.</li>
                    <li>Les fonds sont bloqués en séquestre chez APNET jusqu'à la fin de la mission.</li>
                    <li>Le prestataire déclare être disponible et apte à réaliser le travail.</li>
                </ul>

                <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded text-blue-800 text-xs">
                    <ShieldCheck size={16} className="inline mr-1 mb-0.5"/>
                    En signant ce contrat numériquement, vous engagez votre responsabilité légale.
                    Votre adresse IP et l'horodatage seront enregistrés comme preuve.
                </div>
            </div>
        </div>

        <div className="p-6 bg-white border-t border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer mb-6">
                <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={e => setIsChecked(e.target.checked)}
                    className="w-5 h-5 text-brand-orange rounded border-gray-300 focus:ring-brand-orange"
                />
                <span className="text-sm font-medium text-gray-700">
                    J'ai lu et j'accepte les termes du contrat et les conditions d'utilisation APNET.
                </span>
            </label>

            <div className="flex gap-4">
                <button 
                    onClick={onCancel}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
                >
                    Annuler
                </button>
                <button 
                    onClick={handleSign}
                    disabled={!isChecked || isSigning}
                    className={`flex-1 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition ${
                        isChecked && !isSigning ? 'bg-brand-orange hover:bg-orange-600 shadow-lg' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    {isSigning ? 'Signature en cours...' : <><Lock size={18}/> Approuver et Accepter</>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
