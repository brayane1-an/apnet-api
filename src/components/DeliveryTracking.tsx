
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { DeliveryOrder, UserProfile } from '../types';
import { Truck, Package, MapPin, Clock, CheckCircle2, ShieldCheck, Phone, Info, MessageSquare, User, ShieldAlert, AlertTriangle, Camera } from 'lucide-react';
import { motion } from 'motion/react';

interface DeliveryTrackingProps {
  currentUser: UserProfile;
  onCancelOrder?: (orderId: string) => void;
  onReportDispute?: (orderId: string, reason: string, notes: string, photos: string[]) => void;
}

export const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({ currentUser, onCancelOrder, onReportDispute }) => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [disputePhotos, setDisputePhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to delivery orders where user is client
    const q = query(
      collection(db, 'deliveryOrders'),
      where('clientId', '==', currentUser.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: DeliveryOrder[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as DeliveryOrder);
      });
      setOrders(docs);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching delivery orders:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'En attente', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: <Clock size={16} />, desc: 'Recherche d\'un livreur...' };
      case 'ACCEPTED': return { label: 'Livreur en route', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: <Truck size={16} />, desc: 'Le livreur a accepté la course.' };
      case 'PICKED_UP': return { label: 'Colis récupéré', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: <Package size={16} />, desc: 'Le livreur a récupéré votre colis.' };
      case 'COMPLETED': return { label: 'Livré', color: 'text-green-600 bg-green-50 border-green-100', icon: <CheckCircle2 size={16} />, desc: 'Livraison terminée avec succès.' };
      case 'CANCELLED': return { label: 'Annulé', color: 'text-red-600 bg-red-50 border-red-100', icon: <ShieldCheck size={16} />, desc: 'La course a été annulée.' };
      case 'DISPUTED': return { label: 'Litige Ouvert', color: 'text-red-700 bg-red-50 border-red-200', icon: <AlertTriangle size={16} />, desc: 'Paiement gelé. En attente de l\'admin.' };
      default: return { label: status, color: 'text-gray-600 bg-gray-50 border-gray-100', icon: <Info size={16} />, desc: '' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-brand-dark flex items-center gap-3">
          <Truck className="text-brand-orange" size={32} />
          Mes Livraisons Privées
        </h1>
        <p className="text-gray-500 mt-1">Consultez l'état de vos colis et récupérez vos codes de sécurité.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
            <div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Chargement de vos livraisons...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-900 font-bold">Aucune livraison en cours</p>
            <p className="text-gray-500 text-sm mt-1">Vos commandes de livraison apparaîtront ici.</p>
          </div>
        ) : (
          orders.map((order, index) => {
            const status = getStatusInfo(order.status);
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={order.id} 
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${status.color}`}>
                        {status.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${status.color.split(' ')[0]}`}>{status.label}</p>
                        <p className="text-xs text-gray-500">{status.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Prix Payé</p>
                      <p className="text-xl font-black text-brand-dark">{order.price.toLocaleString()} F</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-brand-green"></div>
                          <div className="w-0.5 h-full bg-gray-100"></div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Départ</p>
                          <p className="text-sm font-bold text-gray-900">{order.pickup.commune}</p>
                          <p className="text-xs text-gray-500">{order.pickup.quartier}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-orange mt-1"></div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Arrivée</p>
                          <p className="text-sm font-bold text-gray-900">{order.dropoff.commune}</p>
                          <p className="text-xs text-gray-500">{order.dropoff.quartier}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Code de Sécurité</p>
                      <p className="text-3xl font-black text-brand-orange tracking-[0.2em]">{order.securityCode}</p>
                      <p className="text-[10px] text-gray-500 mt-2 leading-tight">
                        Donnez ce code au livreur <strong>uniquement</strong> <br/> quand vous avez reçu votre colis.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Package size={14} />
                        {order.description}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Truck size={14} />
                        {order.vehicleType}
                      </div>
                    </div>

                    {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                           {/* Appel Livreur (si accepté) */}
                           {order.riderPhone && (
                             <a 
                                href={`tel:${order.riderPhone}`}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                                title="Appeler le Livreur"
                             >
                                <Phone size={14} /> Appeler Livreur
                             </a>
                           )}

                           {/* Chat */}
                           <button 
                              onClick={() => alert("Ouverture du Chat sécurisé avec le livreur...")}
                              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
                              title="Message"
                           >
                              <MessageSquare size={18} />
                           </button>

                           <a 
                              href={`tel:${order.receiverPhone}`}
                              className="p-2 bg-brand-green/10 text-brand-green rounded-full hover:bg-brand-green hover:text-white transition"
                              title="Appeler Destinataire"
                           >
                              <Phone size={18} />
                           </a>
                        </div>
                        
                        <div className="flex items-center gap-4">
                           {order.status !== 'DISPUTED' && (
                               <button 
                                   onClick={() => {
                                       setSelectedOrderId(order.id);
                                       setShowDisputeModal(true);
                                   }}
                                   className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                               >
                                   <ShieldAlert size={14} /> Signaler un problème
                               </button>
                           )}
                           <button 
                              onClick={() => onCancelOrder && onCancelOrder(order.id)}
                              className="text-xs font-bold text-red-600 hover:underline"
                           >
                              Annuler la course
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <ShieldAlert className="text-red-600" /> Signaler un Litige
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Motif du problème</label>
                <select 
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-brand-orange"
                >
                  <option value="">Sélectionnez un motif...</option>
                  <option value="COLIS_ENDOMMAGE">Colis endommagé</option>
                  <option value="COLIS_NON_CONFORME">Colis non conforme</option>
                  <option value="LIVREUR_INCIVIL">Comportement du livreur</option>
                  <option value="RETARD_EXCESSIF">Retard excessif</option>
                  <option value="AUTRE">Autre problème</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Notes pour l'administrateur</label>
                <textarea 
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  placeholder="Expliquez précisément la situation..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm min-h-[100px] focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Preuves Photos (Simulé)</label>
                <button 
                  onClick={() => {
                      const mockPhoto = `https://picsum.photos/seed/${Date.now()}/400/300`;
                      setDisputePhotos(prev => [...prev, mockPhoto]);
                      alert("📸 Photo ajoutée comme preuve.");
                  }}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Camera size={16} /> Ajouter une photo de preuve
                </button>
                {disputePhotos.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                        {disputePhotos.map((p, i) => (
                            <img key={i} src={p} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                        ))}
                    </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 py-3 text-gray-500 font-bold text-sm"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    if (!disputeReason || !selectedOrderId) return;
                    onReportDispute?.(selectedOrderId, disputeReason, disputeNotes, disputePhotos);
                    setShowDisputeModal(false);
                    setDisputeReason('');
                    setDisputeNotes('');
                    setDisputePhotos([]);
                  }}
                  disabled={!disputeReason}
                  className="flex-[2] py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  Ouvrir un Litige
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
