
import React, { useState, useEffect } from 'react';
import { DeliveryOrder, UserProfile, RiderLevel } from '../types';
import { MapPin, Package, Clock, DollarSign, Navigation, CheckCircle, AlertTriangle, RefreshCw, Phone, User, ShieldAlert, Camera, Car, ArrowRight, Info, Trophy, Star, TrendingUp, Zap, MessageSquare } from 'lucide-react';
import { RIDER_LEVEL_RULES } from '../constants';

interface RiderJobBoardProps {
  orders: DeliveryOrder[];
  currentUser: UserProfile;
  onAcceptOrder: (orderId: string) => void;
  onPickupOrder?: (orderId: string) => void;
  onCompleteOrder?: (orderId: string, code: string) => void;
  onReportProblem?: (orderId: string, reason: string) => void;
}

export const RiderJobBoard: React.FC<RiderJobBoardProps> = ({ 
  orders, currentUser, onAcceptOrder, onPickupOrder, onCompleteOrder, onReportProblem 
}) => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'MY_ORDERS' | 'LEADERBOARD'>('NEW');
  const [now, setNow] = useState(Date.now());

  // Refresh "now" every 5 seconds to update priority filtering
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter orders based on tab and priority (30s delay for non-experts)
  const pendingOrders = orders.filter(o => {
    if (o.status !== 'PENDING') return false;
    
    const ageSeconds = (now - new Date(o.createdAt).getTime()) / 1000;
    const isExpert = currentUser.riderStats?.level === RiderLevel.EXPERT;
    
    return isExpert || ageSeconds >= 30;
  });

  const myOrders = orders.filter(o => o.acceptedBy === currentUser.id && o.status !== 'CANCELLED' && o.status !== 'COMPLETED');

  // Mock Leaderboard Data
  const leaderboard = [
    { id: '1', name: 'Ibrahim S.', points: 2450, deliveries: 142, avatar: 'https://picsum.photos/100/100?random=10' },
    { id: '2', name: 'Moussa K.', points: 2100, deliveries: 128, avatar: 'https://picsum.photos/100/100?random=11' },
    { id: '3', name: 'Awa T.', points: 1950, deliveries: 115, avatar: 'https://picsum.photos/100/100?random=12' },
    { id: '4', name: 'Jean K.', points: 1800, deliveries: 105, avatar: 'https://picsum.photos/100/100?random=13' },
    { id: '5', name: 'Sékou B.', points: 1650, deliveries: 98, avatar: 'https://picsum.photos/100/100?random=14' },
  ];

  const stats = currentUser.riderStats;
  const levelRule = stats ? RIDER_LEVEL_RULES[stats.level] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {/* Rider Profile Header */}
      {stats && (
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={120} />
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={currentUser.photoUrl} className="w-14 h-14 rounded-full border-2 border-brand-orange" />
                            <div className="absolute -bottom-1 -right-1 bg-brand-orange rounded-full p-1 border-2 border-gray-900">
                                <Zap size={12} className="fill-current" />
                            </div>
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">{currentUser.firstName} {currentUser.lastName}</h2>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${levelRule?.color}`}>
                                {levelRule?.label}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Score de Fiabilité</p>
                        <p className="text-2xl font-black text-brand-orange">{stats.reliabilityPoints} pts</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase">Courses</p>
                        <p className="font-bold">{stats.totalDeliveries}</p>
                    </div>
                    <div className="text-center border-x border-white/10">
                        <p className="text-[10px] text-gray-400 uppercase">Note</p>
                        <p className="font-bold flex items-center justify-center gap-1">
                            {stats.rating} <Star size={10} className="fill-current text-yellow-400" />
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase">Bonus Hebdo</p>
                        <p className="font-bold text-green-400">En cours</p>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Navigation className="text-brand-orange" /> Tableau de bord Livreur Privé
        </h1>
        <div className="flex items-center gap-2 text-xs text-green-600 font-bold animate-pulse">
           <span className="w-2 h-2 bg-green-600 rounded-full"></span> En direct
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('NEW')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'NEW' 
              ? 'bg-brand-orange text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Nouvelles Commandes
          {pendingOrders.length > 0 && (
            <span className="bg-white text-brand-orange text-xs px-1.5 py-0.5 rounded-full ml-1">
              {pendingOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('MY_ORDERS')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'MY_ORDERS' 
              ? 'bg-gray-900 text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Mes Courses ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'LEADERBOARD' 
              ? 'bg-yellow-500 text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Trophy size={14} /> Classement
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'NEW' && (
          <>
            {currentUser.riderStats?.level === RiderLevel.EXPERT && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-4 flex items-center gap-3">
                    <div className="bg-yellow-500 text-white p-2 rounded-lg">
                        <Zap size={18} className="fill-current" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-yellow-800">Statut Prioritaire Activé</p>
                        <p className="text-[10px] text-yellow-700">Vous voyez les commandes 30 secondes avant les autres livreurs.</p>
                    </div>
                </div>
            )}
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <RefreshCw className="mx-auto h-10 w-10 text-gray-300 animate-spin-slow mb-3" />
                <p className="text-gray-500 font-medium">En attente de nouvelles commandes...</p>
                <p className="text-xs text-gray-400">Restez connecté, ça peut arriver à tout moment !</p>
              </div>
            ) : (
              pendingOrders.map(order => (
                <DeliveryOrderCard 
                  key={order.id} 
                  order={order} 
                  onAccept={() => onAcceptOrder(order.id)} 
                  onReportProblem={onReportProblem}
                  isAvailable={true}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'MY_ORDERS' && (
          <>
            {myOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Vous n'avez aucune course en cours.</p>
              </div>
            ) : (
              myOrders.map(order => (
                <DeliveryOrderCard 
                  key={order.id} 
                  order={order} 
                  isAvailable={false}
                  isMine={true}
                  onPickup={() => onPickupOrder && onPickupOrder(order.id)}
                  onComplete={(code) => onCompleteOrder && onCompleteOrder(order.id, code)}
                  onAccept={() => onAcceptOrder(order.id)}
                  onReportProblem={onReportProblem}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'LEADERBOARD' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white text-center">
                    <Trophy size={48} className="mx-auto mb-2" />
                    <h2 className="text-xl font-black">Tableau des Leaders</h2>
                    <p className="text-xs opacity-90">Classement Hebdomadaire - Top 3 récompensés</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {leaderboard.map((rider, index) => (
                        <div key={rider.id} className={`flex items-center justify-between p-4 ${rider.id === currentUser.id ? 'bg-yellow-50' : ''}`}>
                            <div className="flex items-center gap-4">
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs ${
                                    index === 0 ? 'bg-yellow-400 text-white' : 
                                    index === 1 ? 'bg-gray-300 text-white' : 
                                    index === 2 ? 'bg-amber-600 text-white' : 'text-gray-400'
                                }`}>
                                    {index + 1}
                                </span>
                                <img src={rider.avatar} className="w-10 h-10 rounded-full border border-gray-200" />
                                <div>
                                    <p className="font-bold text-gray-900">{rider.name} {rider.id === currentUser.id && '(Vous)'}</p>
                                    <p className="text-[10px] text-gray-500">{rider.deliveries} courses terminées</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-brand-orange">{rider.points} pts</p>
                                {index < 3 && (
                                    <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 justify-end">
                                        <TrendingUp size={10} /> Bonus +{index === 0 ? '5000' : index === 1 ? '3000' : '1000'}F
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-gray-50 text-center">
                    <p className="text-xs text-gray-500 italic">Le classement est réinitialisé chaque dimanche à minuit.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for individual card
const DeliveryOrderCard: React.FC<{ 
  order: DeliveryOrder; 
  onAccept?: () => void; 
  onPickup?: () => void;
  onComplete?: (code: string) => void;
  onReportProblem?: (orderId: string, reason: string) => void;
  isAvailable: boolean;
  isMine?: boolean;
}> = ({ order, onAccept, onPickup, onComplete, onReportProblem, isAvailable, isMine }) => {
  // Mock state for photos to enable buttons
  const [pickupPhotoTaken, setPickupPhotoTaken] = useState(false);
  const [dropoffPhotoTaken, setDropoffPhotoTaken] = useState(false);
  const [securityCodeInput, setSecurityCodeInput] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const handleTakePickupPhoto = () => {
      alert("📸 Photo de Départ enregistrée et liée à la commande.");
      setPickupPhotoTaken(true);
  };

  const handleTakeDropoffPhoto = () => {
      alert("📸 Photo de Livraison enregistrée (Preuve de bonne réception).");
      setDropoffPhotoTaken(true);
  };

  const isPhotoMandatory = order.isPrecious || order.hasLoadingService;

  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border relative transition-all duration-300 ${isAvailable ? 'border-gray-200 hover:border-brand-orange hover:shadow-md' : 'border-green-200 bg-green-50'}`}>
      
      {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                  <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="text-red-500" /> Signaler un problème
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                      Pourquoi souhaitez-vous annuler cette course ? (Sans pénalité si justifié)
                  </p>
                  <div className="space-y-2 mb-6">
                      {['Colis trop volumineux / Non conforme', 'Client injoignable', 'Lieu de départ inaccessible', 'Autre'].map(reason => (
                          <button 
                            key={reason}
                            onClick={() => {
                                if (onReportProblem) onReportProblem(order.id, reason);
                                setShowReportModal(false);
                            }}
                            className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-brand-orange hover:bg-orange-50 text-sm font-bold transition-all"
                          >
                              {reason}
                          </button>
                      ))}
                  </div>
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="w-full py-2 text-gray-500 font-bold text-sm"
                  >
                      Annuler
                  </button>
              </div>
          </div>
      )}
      {isAvailable && (
         <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            <Clock size={12} />
            {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
         </div>
      )}

      {isMine && (
         <div className={`absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${order.status === 'DISPUTED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {order.status === 'DISPUTED' ? '⚠️ LITIGE OUVERT (Paiement Gelé)' : order.status === 'ACCEPTED' ? 'En route vers Client' : 'En route vers Destinataire'}
         </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-full flex-shrink-0 ${isAvailable ? 'bg-brand-orange/10 text-brand-orange' : 'bg-green-200 text-green-800'}`}>
           <Package size={24} />
        </div>
        <div>
           <h3 className="font-bold text-gray-900">{order.description}</h3>
           <div className="flex flex-wrap gap-2 mt-1">
               <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Client: {order.clientName}</span>
               {/* INTEGRATION AFFICHAGE ENGIN */}
               <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                   <Car size={10} /> {order.vehicleType || 'Moto'}
               </span>
           </div>
           
           {order.isPrecious && (
               <div className="mt-2 inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded border border-red-200 animate-pulse">
                   <ShieldAlert size={12} /> COLIS PRÉCIEUX ({order.declaredValue}F)
               </div>
           )}

           {order.hasLoadingService && (
               <div className="mt-2 inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded border border-blue-200">
                   <User size={12} /> AIDE AU CHARGEMENT REQUISE (RDC)
               </div>
           )}
        </div>
      </div>

      <div className="space-y-3 text-sm relative pl-4 border-l-2 border-gray-200 ml-2 mb-4">
         <div>
            <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">Départ</p>
            <p className="font-medium text-gray-800 flex items-center gap-1">
               <MapPin size={14} className="text-brand-orange" /> 
               {order.pickup.city}, {order.pickup.commune} - {order.pickup.quartier}
            </p>
         </div>
         <div>
            <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">Arrivée ({order.distanceKm} km)</p>
            <p className="font-medium text-gray-800 flex items-center gap-1">
               <Navigation size={14} className="text-blue-600" /> 
               {order.dropoff.city}, {order.dropoff.commune} - {order.dropoff.quartier}
            </p>
         </div>
      </div>

      {isMine && (
          <div className="bg-white p-3 rounded-lg border border-green-200 mb-4 animate-in fade-in slide-in-from-bottom-1">
              <h4 className="text-xs font-bold text-green-800 uppercase mb-2 flex items-center gap-1">
                  <User size={12} /> Contacts Clients
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                      <span className="text-xs text-gray-500">Expéditeur</span>
                      <a href={`tel:${order.senderPhone}`} className="block font-bold text-blue-600 hover:underline flex items-center gap-1">
                          <Phone size={12} /> {order.senderPhone || 'N/A'}
                      </a>
                  </div>
                  <div>
                      <span className="text-xs text-gray-500">Destinataire</span>
                      <a href={`tel:${order.receiverPhone}`} className="block font-bold text-blue-600 hover:underline flex items-center gap-1">
                          <Phone size={12} /> {order.receiverPhone || 'N/A'}
                      </a>
                  </div>
              </div>

              {/* Nouveau: Contact Client Direct */}
              <div className="flex items-center gap-2 mb-3 pt-2 border-t border-green-50">
                  {order.clientPhone && (
                      <a 
                        href={`tel:${order.clientPhone}`}
                        className="flex-grow flex items-center justify-center gap-2 py-2 bg-brand-green text-white rounded-lg text-xs font-bold hover:bg-green-700 transition"
                      >
                          <Phone size={14} /> Appeler le Client
                      </a>
                  )}
                  <button 
                    onClick={() => alert("Ouverture du Chat sécurisé avec le client...")}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                  >
                      <MessageSquare size={18} />
                  </button>
              </div>

              {/* PHOTO PROOF UPLOAD & ACTIONS */}
              <div className="border-t border-green-100 pt-3">
                  {order.status === 'PENDING' && isMine && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-blue-600 mb-1 font-bold">
                            <Info size={12}/>
                            <span>Nouvelle mission assignée directement</span>
                        </div>
                        <button
                            onClick={onAccept}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm active:scale-95 transform"
                        >
                            Accepter la Mission
                        </button>
                      </div>
                  )}

                  {order.status === 'DISPUTED' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                          <p className="text-xs font-bold text-red-800 flex items-center gap-2">
                              <ShieldAlert size={14} /> Litige en cours d'examen
                          </p>
                          <p className="text-[10px] text-red-600 mt-1">
                              Le paiement de cette course est temporairement gelé par l'administration.
                          </p>
                      </div>
                  )}

                  {order.status === 'ACCEPTED' && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <AlertTriangle size={12} className="text-brand-orange"/>
                                <span>{isPhotoMandatory ? 'Photo OBLIGATOIRE (Précieux/Aide)' : 'Photo recommandée'}</span>
                            </div>
                            <button 
                                onClick={() => setShowReportModal(true)}
                                className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1"
                            >
                                <ShieldAlert size={10} /> Signaler Problème
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                className={`flex items-center justify-center gap-1 py-2 rounded text-xs font-bold border transition-colors ${pickupPhotoTaken ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
                                onClick={handleTakePickupPhoto}
                            >
                                <Camera size={14} /> {pickupPhotoTaken ? 'Photo Validée' : 'Prendre Photo Départ'}
                            </button>
                            <button
                                onClick={onPickup}
                                disabled={isPhotoMandatory && !pickupPhotoTaken}
                                className={`flex items-center justify-center gap-1 py-2 rounded text-xs font-bold transition-colors ${(!isPhotoMandatory || pickupPhotoTaken) ? 'bg-blue-600 text-white hover:bg-blue-700 shadow' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                J'ai le colis <ArrowRight size={12} />
                            </button>
                        </div>
                      </div>
                  )}

                  {order.status === 'PICKED_UP' && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                            <AlertTriangle size={12} className="text-brand-orange"/>
                            <span>Photo et Code de sécurité obligatoires</span>
                        </div>
                        
                        <div className="mb-2">
                            <input 
                                type="text"
                                placeholder="Code de sécurité client (4 chiffres)"
                                className="w-full p-2 border border-gray-300 rounded text-sm font-bold text-center tracking-widest focus:ring-2 focus:ring-brand-green outline-none"
                                value={securityCodeInput}
                                onChange={(e) => setSecurityCodeInput(e.target.value)}
                                maxLength={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                className={`flex items-center justify-center gap-1 py-2 rounded text-xs font-bold border transition-colors ${dropoffPhotoTaken ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
                                onClick={handleTakeDropoffPhoto}
                            >
                                <Camera size={14} /> {dropoffPhotoTaken ? 'Photo Validée' : 'Prendre Photo Arrivée'}
                            </button>
                            <button
                                onClick={() => {
                                    if (securityCodeInput.length !== 4) {
                                        alert("Veuillez entrer le code de sécurité à 4 chiffres.");
                                        return;
                                    }
                                    if (onComplete) onComplete(securityCodeInput);
                                }}
                                disabled={!dropoffPhotoTaken || securityCodeInput.length !== 4}
                                className={`flex items-center justify-center gap-1 py-2 rounded text-xs font-bold transition-colors ${dropoffPhotoTaken && securityCodeInput.length === 4 ? 'bg-green-600 text-white hover:bg-green-700 shadow' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                <CheckCircle size={12} /> Confirmer Livraison
                            </button>
                        </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
         <div className="flex flex-col">
            <span className="text-xs text-gray-500">Votre Gain</span>
            <span className="text-xl font-extrabold text-brand-green">{order.riderGain.toLocaleString()} F</span>
         </div>
         
         {isAvailable && onAccept && (
            <button 
               onClick={onAccept}
               className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-orange transition-colors flex items-center gap-2 shadow-sm active:scale-95 transform"
            >
               Accepter
            </button>
         )}
      </div>
    </div>
  );
};
