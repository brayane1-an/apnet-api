
import React, { useState, useEffect } from 'react';
import { calculateDeliveryPrice } from '../services/deliveryService';
import { DeliveryQuote, DeliveryOrder, VehicleType, UserProfile } from '../types';
import { ABIDJAN_COMMUNES, ABIDJAN_DISTANCES } from '../constants';
import { Calculator, MapPin, Truck, Package, Clock, Info, CheckCircle, User, Phone, FileText, Loader2, ShieldCheck, Gem, Car, AlertTriangle } from 'lucide-react';

interface DeliveryEstimatorProps {
    onOrder?: (orderData: Partial<DeliveryOrder>) => void;
    provider?: UserProfile | null;
    currentUser?: UserProfile | null;
    isBadWeather?: boolean;
}

export const DeliveryEstimator: React.FC<DeliveryEstimatorProps> = ({ onOrder, provider, currentUser, isBadWeather = false }) => {
  const [step, setStep] = useState<'ESTIMATE' | 'DETAILS'>('ESTIMATE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estimate State
  const [pickup, setPickup] = useState('Cocody');
  const [dropoff, setDropoff] = useState('Marcory');
  const [distance, setDistance] = useState(5);
  const [weight, setWeight] = useState(2);
  const [hour, setHour] = useState(new Date().getHours()); 
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.MOTO);
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);

  // Risk / Value State
  const [isPrecious, setIsPrecious] = useState('non');
  const [declaredValue, setDeclaredValue] = useState('');
  const [hasLoadingService, setHasLoadingService] = useState(false);

  // Details State
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [description, setDescription] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  // Validation State
  const isFormValid = pickupAddress.length > 3 && dropoffAddress.length > 3 && senderPhone.length >= 8 && receiverPhone.length >= 8;

  useEffect(() => {
    // Calcul automatique de la distance entre les communes
    if (ABIDJAN_DISTANCES[pickup] && ABIDJAN_DISTANCES[pickup][dropoff]) {
      setDistance(ABIDJAN_DISTANCES[pickup][dropoff]);
    }
  }, [pickup, dropoff]);

  useEffect(() => {
    // Recalcul automatique à chaque changement
    const val = isPrecious === 'oui' ? (parseInt(declaredValue) || 0) : 0;
    const result = calculateDeliveryPrice(pickup, dropoff, distance, weight, hour, val, vehicleType, isBadWeather, hasLoadingService);
    setQuote(result);
  }, [pickup, dropoff, distance, weight, hour, isPrecious, declaredValue, vehicleType, isBadWeather, hasLoadingService]);

  const handleNext = () => {
      setStep('DETAILS');
  };

  const handleSubmit = async () => {
      if (!isFormValid) {
          alert("Veuillez remplir correctement tous les champs obligatoires (Adresses précises et Numéros de téléphone).");
          return;
      }

      if (isPrecious === 'oui' && (!declaredValue || parseInt(declaredValue) <= 0)) {
          alert("Veuillez saisir la valeur du colis pour l'assurance.");
          return;
      }

      setIsSubmitting(true);

      // Simulation délai réseau (API Call)
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (onOrder && quote) {
          const val = isPrecious === 'oui' ? parseInt(declaredValue) : 0;
          onOrder({
              pickup: { city: 'Abidjan', commune: pickup, quartier: pickupAddress },
              dropoff: { city: 'Abidjan', commune: dropoff, quartier: dropoffAddress },
              distanceKm: distance,
              price: quote.prix_total,
              riderGain: quote.gain_livreur,
              description: description || `Colis ${weight}kg - ${vehicleType}`,
              clientPhone: currentUser?.phone,
              senderPhone,
              receiverPhone,
              isPrecious: isPrecious === 'oui',
              declaredValue: val,
              maxRefund: isPrecious === 'oui' ? val * 0.5 : 0,
              vehicleType: vehicleType,
              hasLoadingService: hasLoadingService,
              acceptedBy: provider?.id // Assigned to the selected provider
          });
      }
      
      setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
          <Truck className="text-brand-orange" size={32} />
          {step === 'ESTIMATE' ? 'Réserver un Livreur Privé' : 'Finaliser la Réservation'}
        </h1>
        {provider && (
            <div className="mt-4 inline-flex items-center gap-3 bg-brand-orange/10 px-4 py-2 rounded-full border border-brand-orange/20">
                <img src={provider.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                <span className="text-sm font-bold text-brand-orange">Livreur : {provider.firstName} {provider.lastName}</span>
            </div>
        )}
        <p className="text-gray-600 mt-2">
          Frais de dossier : 100 FCFA | Commission : 0% (Moto) ou 10% (Autres véhicules).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulaire */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
          
          {step === 'ESTIMATE' ? (
            <>
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <Calculator size={20} /> Paramètres de la course
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Départ (Commune)</label>
                    <select 
                        value={pickup} 
                        onChange={(e) => setPickup(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                        {ABIDJAN_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée (Commune)</label>
                    <select 
                        value={dropoff} 
                        onChange={(e) => setDropoff(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                        {ABIDJAN_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <User size={16} className="text-brand-orange" /> Services Additionnels
                    </label>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${hasLoadingService ? 'bg-brand-orange border-brand-orange' : 'border-gray-300 group-hover:border-brand-orange'}`}>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={hasLoadingService}
                                    onChange={(e) => setHasLoadingService(e.target.checked)}
                                />
                                {hasLoadingService && <CheckCircle size={14} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium text-gray-700">Aide au chargement / Main d'œuvre</span>
                        </label>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 italic">
                        +2 000 F (Moto/Voiture) ou +5 000 F (Camion/Cargo). 
                        <span className="block mt-1 text-brand-orange font-bold">Note : L'aide au chargement concerne uniquement le trajet entre le véhicule et le pas de la porte (RDC).</span>
                    </p>
                </div>

                {/* VEHICLE TYPE SECTION */}
                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <Car size={16} /> Type de Véhicule
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {[VehicleType.MOTO, VehicleType.VOITURE, VehicleType.CAMIONNETTE, VehicleType.CARGO, VehicleType.CAMION].map((type) => (
                            <button
                                key={type}
                                onClick={() => setVehicleType(type)}
                                className={`py-2 px-1 rounded border text-[10px] sm:text-xs font-bold transition-colors ${
                                    vehicleType === type 
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 italic">
                        {vehicleType === VehicleType.MOTO ? "Rapide pour petits colis." : 
                         vehicleType === VehicleType.VOITURE ? "Sécurisé pour objets moyens." : 
                         vehicleType === VehicleType.CAMIONNETTE ? "Pour déménagement ou gros volumes." :
                         vehicleType === VehicleType.CARGO ? "Transport de marchandises lourdes." : "Transport industriel / Gros volumes."}
                    </p>
                </div>

                {/* RISK / INSURANCE SECTION */}
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                   <label className="block text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                      <Gem size={16} /> Valeur & Assurance
                   </label>
                   <select 
                      value={isPrecious} 
                      onChange={(e) => setIsPrecious(e.target.value)}
                      className="w-full p-2 border border-indigo-200 rounded-lg mb-3"
                   >
                      <option value="non">Non - Colis standard</option>
                      <option value="oui">Oui - Activer Assurance</option>
                   </select>

                   {isPrecious === "oui" && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                         <label className="block text-xs font-bold text-indigo-700 mb-1">Valeur déclarée (FCFA)</label>
                         <input
                            type="number"
                            value={declaredValue}
                            onChange={(e) => setDeclaredValue(e.target.value)}
                            placeholder="Ex: 50000"
                            className="w-full p-2 border border-indigo-300 rounded-lg mb-2"
                         />
                         {declaredValue && parseInt(declaredValue) > 0 && (
                             <div className="bg-white p-2 rounded border border-indigo-100">
                                 <p className="text-xs text-indigo-800 flex items-center gap-1 mb-1">
                                    <ShieldCheck size={12} /> Prime Risque : +{Math.round(parseInt(declaredValue) * 0.05).toLocaleString()} F
                                 </p>
                                 <p className="text-[10px] text-indigo-600 leading-tight">
                                    En cas de problème validé, remboursement jusqu'à <strong>{(parseInt(declaredValue) * 0.5).toLocaleString()} FCFA</strong>.
                                 </p>
                             </div>
                         )}
                      </div>
                   )}
                </div>
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <FileText size={20} /> Détails de la livraison
                </h2>
                
                <div className="bg-blue-50 p-3 rounded border border-blue-100 text-sm text-blue-800 mb-4">
                    Trajet : <strong>{pickup}</strong> vers <strong>{dropoff}</strong> <br/>
                    Véhicule : <strong>{vehicleType}</strong>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse Précise Départ <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                            placeholder="Ex: Angré 8ème, Rue des Banques"
                            value={pickupAddress}
                            onChange={e => setPickupAddress(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse Précise Arrivée <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                            placeholder="Ex: Marcory Zone 4, Rue Paul Langevin"
                            value={dropoffAddress}
                            onChange={e => setDropoffAddress(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tél Expéditeur <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                type="tel" 
                                className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                placeholder="0707..."
                                value={senderPhone}
                                onChange={e => setSenderPhone(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tél Destinataire <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                type="tel" 
                                className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                                placeholder="0505..."
                                value={receiverPhone}
                                onChange={e => setReceiverPhone(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nature du colis</label>
                    <textarea 
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                        placeholder="Ex: Documents importants, fragile, liquide..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>
            </div>
          )}
        </div>

        {/* Résultat */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Prix Total</h2>
            <div className="text-5xl font-extrabold text-brand-orange mb-1">
              {quote?.prix_total.toLocaleString()} FCFA
            </div>
            <p className="text-sm text-gray-400 mb-4">Montant à payer par le client</p>

            <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
              <div className="flex justify-between items-center">
                 <div className="text-sm text-gray-300">Gain Livreur (Net)</div>
                 <div className="text-xl font-bold text-green-400">{quote?.gain_livreur.toLocaleString()} FCFA</div>
              </div>
              <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                 <div className="text-xs text-gray-400">Frais fixes (Dossier APNET)</div>
                 <div className="text-sm font-bold text-white">{quote?.apnet_fixed_fee.toLocaleString()} FCFA</div>
              </div>
              <div className="flex justify-between items-center">
                 <div className="text-xs text-gray-400">Frais de service (Commission {vehicleType === VehicleType.MOTO ? '0%' : '10%'})</div>
                 <div className="text-sm font-bold text-white">{quote?.apnet_commission.toLocaleString()} FCFA</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
             <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
               <Info size={18} /> Détails du calcul
             </h3>
             <ul className="space-y-2 text-sm text-orange-800">
               <li className="flex justify-between">
                 <span>Véhicule :</span>
                 <span className="font-bold">{vehicleType}</span>
               </li>
               <li className="flex justify-between">
                 <span>Distance :</span>
                 <span className="font-bold">{quote?.details.distance}</span>
               </li>
               <li className="flex justify-between">
                 <span>Zone :</span>
                 <span className="font-bold">{quote?.details.zone}</span>
               </li>
               {quote?.details.supplements.length > 0 && (
                 <li className="pt-2 border-t border-orange-200">
                   <span className="block mb-1 font-semibold">Suppléments inclus :</span>
                   {quote.details.supplements.map((s, i) => (
                     <span key={i} className="block text-xs bg-white px-2 py-1 rounded border border-orange-200 w-fit mb-1">
                       + {s}
                     </span>
                   ))}
                 </li>
               )}
               
               <li className="pt-4 border-t border-orange-200">
                 <p className="text-[10px] font-bold text-orange-600 uppercase mb-2">Formule Mathématique</p>
                 <div className="bg-white/50 p-3 rounded-lg font-mono text-[10px] leading-relaxed border border-orange-100">
                    <p className="text-orange-900 font-bold">PRIX TOTAL = (B * T * V) + P + S</p>
                    <div className="mt-2 space-y-1 text-orange-700">
                       <p><strong>B (Base) :</strong> Tarif zone x Distance (Auto-calculée)</p>
                       <p><strong>T (Trafic) :</strong> 1.15 si heure de pointe (7h-9h / 17h-19h)</p>
                       <p><strong>V (Véhicule) :</strong> Multiplicateur selon l'engin</p>
                       <p><strong>P (Précieux) :</strong> Manutention + 5% valeur déclarée</p>
                       <p><strong>M (Main d'œuvre) :</strong> +2000F ou +5000F (si coché)</p>
                       <p><strong>S (Service) :</strong> 100 FCFA (Frais fixes dossier)</p>
                       <p className="mt-2 pt-1 border-t border-orange-100 text-orange-900 font-bold italic">Gain Livreur = (PRIX TOTAL - S) - 10% (sauf Moto)</p>
                    </div>
                 </div>
               </li>
             </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center flex gap-4 justify-center">
        {step === 'DETAILS' && (
            <button 
                onClick={() => setStep('ESTIMATE')}
                className="bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full hover:bg-gray-300 transition"
                disabled={isSubmitting}
            >
                Retour
            </button>
        )}
        
        {step === 'ESTIMATE' ? (
            <button 
                onClick={handleNext}
                className="bg-brand-green text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transition transform active:scale-95"
            >
                Commander un Coursier
            </button>
        ) : (
            <button 
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className={`font-bold py-3 px-8 rounded-full shadow-lg transition transform flex items-center gap-2 ${
                    isFormValid && !isSubmitting
                    ? 'bg-brand-orange text-white hover:bg-orange-600 active:scale-95' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                {isSubmitting ? (
                    <><Loader2 size={20} className="animate-spin" /> Envoi en cours...</>
                ) : (
                    <><CheckCircle size={20} /> Confirmer la commande</>
                )}
            </button>
        )}
      </div>
    </div>
  );
};
