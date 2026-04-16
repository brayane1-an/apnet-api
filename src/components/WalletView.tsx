
import React, { useState } from 'react';
import { UserProfile, Transaction, PaymentMethod, UserRole } from '../types';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowRight, 
  History, 
  ShieldCheck, 
  Smartphone,
  CreditCard,
  TrendingUp,
  Truck,
  Package,
  Gift,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WalletViewProps {
  currentUser: UserProfile;
  onRecharge: (amount: number, method: PaymentMethod) => void;
  onWithdraw: (amount: number, method: PaymentMethod, phone: string, isUrgent?: boolean) => void;
  onCloseWelcome?: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ currentUser, onRecharge, onWithdraw, onCloseWelcome }) => {
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(currentUser.role === UserRole.PROVIDER && !currentUser.hasSeenWalletWelcome);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.WAVE);
  const [withdrawPhone, setWithdrawPhone] = useState(currentUser.phone || '');
  const [isUrgent, setIsUrgent] = useState(false);

  const isProvider = currentUser.role === UserRole.PROVIDER;

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'INCOME': return <ArrowDownLeft className="text-green-600" />;
      case 'PAYMENT': return <ArrowUpRight className="text-red-600" />;
      case 'DEPOSIT': return <Plus className="text-blue-600" />;
      case 'WITHDRAWAL': return <ArrowUpRight className="text-orange-600" />;
      case 'COMMISSION': return <AlertCircle className="text-gray-600" />;
      default: return <History className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'PENDING_VALIDATION': return 'bg-orange-100 text-orange-700';
      case 'PENDING_ADMIN': return 'bg-orange-100 text-orange-700';
      case 'BLOCKED': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const sortedTransactions = [...currentUser.transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header & Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-brand-dark to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-2">Solde Disponible</p>
            <h2 className="text-5xl font-black mb-6">{currentUser.walletBalance.toLocaleString()} <span className="text-2xl font-normal">FCFA</span></h2>
            
            <div className="flex flex-wrap gap-4">
              {!isProvider ? (
                <button 
                  onClick={() => setShowRechargeModal(true)}
                  className="bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <Plus size={20} /> Recharger mon compte
                </button>
              ) : (
                <button 
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-brand-green hover:bg-green-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <ArrowUpRight size={20} /> Retirer mes gains
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <ShieldCheck size={20} />
              <span className="text-sm font-bold uppercase tracking-tight">Séquestre Sécurisé</span>
            </div>
            <p className="text-gray-500 text-xs mb-1">{isProvider ? 'Solde en attente' : 'Fonds bloqués'}</p>
            <h3 className="text-2xl font-black text-gray-900">{(currentUser.pendingBalance || 0).toLocaleString()} FCFA</h3>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 leading-tight">
            {isProvider 
              ? "Gains en attente de validation par le client via code OTP." 
              : "L'argent est bloqué en toute sécurité jusqu'à la validation de la livraison."}
          </p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{isProvider ? 'Courses livrées' : 'Commandes passées'}</p>
          <p className="text-xl font-black text-gray-900">{currentUser.completedJobs || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{isProvider ? 'Gain Total' : 'Dépenses Totales'}</p>
          <p className="text-xl font-black text-brand-green">
            {currentUser.transactions
              .filter(t => (isProvider ? t.type === 'INCOME' : t.type === 'PAYMENT') && t.status === 'COMPLETED')
              .reduce((acc, t) => acc + t.amount, 0)
              .toLocaleString()} F
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Frais APNET cumulés</p>
          <p className="text-xl font-black text-gray-900">
            {currentUser.transactions
              .reduce((acc, t) => acc + (t.fee || 0), 0)
              .toLocaleString()} F
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Fiabilité</p>
          <p className="text-xl font-black text-blue-600">{currentUser.riderStats?.reliabilityPoints || 100}%</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <History className="text-brand-orange" /> Historique des Transactions
          </h3>
          <button className="text-xs font-bold text-brand-orange hover:underline">Tout voir</button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {sortedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <History className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-500 font-medium">Aucune transaction pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {sortedTransactions.map((tx) => (
                <div key={tx.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-2xl">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{tx.providerName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusColor(tx.status)}`}>
                          {tx.status === 'COMPLETED' ? 'Validé' : tx.status === 'BLOCKED' ? 'Séquestre' : tx.status === 'PENDING_ADMIN' ? 'Vérification Admin' : tx.status}
                        </span>
                      </div>
                      
                      {/* Detailed Breakdown for Providers */}
                      {isProvider && tx.type === 'INCOME' && (
                        <div className="mt-2 text-[10px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <div className="flex justify-between mb-1">
                            <span>Prix de la course</span>
                            <span className="font-bold text-gray-700">+{(tx.amount + tx.fee - (tx.supplementAmount || 0)).toLocaleString()} F</span>
                          </div>
                          {(tx.supplementAmount || 0) > 0 && (
                            <div className="flex justify-between mb-1">
                              <span>Bonus 'Aide au chargement'</span>
                              <span className="font-bold text-green-600">+{(tx.supplementAmount || 0).toLocaleString()} F</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-red-500 pt-1 border-t border-gray-200">
                            <span>Frais fixes APNET</span>
                            <span>-{tx.fee} F</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${tx.type === 'INCOME' || tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'INCOME' || tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount.toLocaleString()} F
                    </p>
                    {tx.fee > 0 && !isProvider && (
                      <p className="text-[10px] text-gray-400 font-medium">Frais APNET: {tx.fee} F</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recharge Modal */}
      <AnimatePresence>
        {showRechargeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Plus className="text-brand-orange" /> Recharger mon compte
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Montant à recharger (FCFA)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ex: 5000"
                    className="w-full text-2xl font-black p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-orange focus:outline-none transition-all mb-3"
                  />
                  <div className="flex gap-2">
                    {[2000, 5000, 10000].map(val => (
                      <button 
                        key={val}
                        onClick={() => setAmount(val.toString())}
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-colors"
                      >
                        {val.toLocaleString()} F
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Choisir le réseau</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: PaymentMethod.WAVE, name: 'Wave', color: 'bg-blue-500' },
                      { id: PaymentMethod.ORANGE_MONEY, name: 'Orange', color: 'bg-orange-500' },
                      { id: PaymentMethod.MTN_MONEY, name: 'MTN', color: 'bg-yellow-500' },
                      { id: PaymentMethod.MOOV_MONEY, name: 'Moov', color: 'bg-blue-800' }
                    ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedMethod === method.id ? 'border-brand-orange bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className={`w-8 h-8 rounded-full ${method.color} flex items-center justify-center text-white`}>
                          <Smartphone size={16} />
                        </div>
                        <span className="text-xs font-bold">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowRechargeModal(false)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={() => {
                      onRecharge(parseInt(amount), selectedMethod);
                      setShowRechargeModal(false);
                      setAmount('');
                    }}
                    disabled={!amount || parseInt(amount) < 100}
                    className="flex-[2] py-4 bg-brand-orange text-white font-bold rounded-2xl shadow-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmer le dépôt
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <ArrowUpRight className="text-brand-green" /> Retirer mes gains
              </h3>
              
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                  <p className="text-xs text-green-800 font-bold mb-1">Disponible pour retrait</p>
                  <p className="text-2xl font-black text-green-900">{currentUser.walletBalance.toLocaleString()} FCFA</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Montant à retirer</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ex: 10000"
                    className="w-full text-2xl font-black p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-green focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Numéro de téléphone Mobile Money</label>
                  <input 
                    type="tel" 
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    placeholder="07 00 00 00 00"
                    className="w-full font-bold p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-green focus:outline-none transition-all"
                  />
                </div>

                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="text-sm font-bold text-red-900">Urgence Santé / Famille</span>
                      <p className="text-[10px] text-red-700 leading-tight mt-0.5">
                        Cochez cette case uniquement en cas de besoin vital. Traitement prioritaire par l'IA.
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Choisir le réseau de retrait</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: PaymentMethod.WAVE, name: 'Wave', color: 'bg-blue-500' },
                      { id: PaymentMethod.ORANGE_MONEY, name: 'Orange', color: 'bg-orange-500' },
                      { id: PaymentMethod.MTN_MONEY, name: 'MTN', color: 'bg-yellow-500' },
                      { id: PaymentMethod.MOOV_MONEY, name: 'Moov', color: 'bg-blue-800' }
                    ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedMethod === method.id ? 'border-brand-green bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className={`w-8 h-8 rounded-full ${method.color} flex items-center justify-center text-white`}>
                          <Smartphone size={16} />
                        </div>
                        <span className="text-xs font-bold">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={() => {
                      onWithdraw(parseInt(amount), selectedMethod, withdrawPhone, isUrgent);
                      setShowWithdrawModal(false);
                      setAmount('');
                      setIsUrgent(false);
                    }}
                    disabled={!amount || parseInt(amount) > currentUser.walletBalance || parseInt(amount) < 500}
                    className="flex-[2] py-4 bg-brand-green text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmer le retrait
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Referral Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-brand-orange to-orange-400 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl">
            <Gift size={24} />
          </div>
          <div>
            <h4 className="font-black text-lg">Le Parrainage APNET</h4>
            <p className="text-sm opacity-90">Invitez un ami et gagnez <span className="font-bold">200F</span> sur votre prochain service !</p>
          </div>
        </div>
        <button className="bg-white text-brand-orange font-bold px-4 py-2 rounded-xl text-sm hover:bg-orange-50 transition-colors flex items-center gap-2">
          <Users size={16} /> Inviter
        </button>
      </motion.div>

      {/* Welcome Popup for Providers */}
      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-lg">
                  <TrendingUp className="text-brand-orange w-10 h-10" />
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
                  Bienvenue dans l'équipe <span className="text-brand-green">AP</span><span className="text-brand-orange">NET</span> ! 🚀
                </h2>

                <div className="space-y-6 text-gray-600 mb-10">
                  <p className="text-lg font-medium text-gray-800">
                    Félicitations ! Votre portefeuille est maintenant actif. Voici comment booster vos gains :
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">Gains 100% Net</h4>
                        <p className="text-xs leading-relaxed">Sur APNET, nous ne prenons aucune commission sur les petites courses. Ce que vous voyez est ce que vous gagnez.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">Retrait Rapide</h4>
                        <p className="text-xs leading-relaxed">Récupérez votre argent instantanément via Wave ou Orange Money dès que la course est validée.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 md:col-span-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-brand-orange">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">Soyez Ponctuel</h4>
                        <p className="text-xs leading-relaxed">Chaque mission réussie vous rapporte des points pour devenir un prestataire <strong>"Expert"</strong> et recevoir les meilleures missions en priorité.</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm italic font-medium text-brand-dark pt-4 border-t border-gray-100">
                    Bonne route et beaucoup de succès dans vos missions !
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setShowWelcome(false);
                    if (onCloseWelcome) onCloseWelcome();
                  }}
                  className="w-full py-5 bg-brand-dark text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                >
                  C'est parti ! <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
