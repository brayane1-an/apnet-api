import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { UserProfile, ViewState } from '../types';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Wallet,
  Sparkles,
  ChevronRight,
  Truck
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  currentUser: UserProfile;
}

interface FirestoreTransaction {
  id: string;
  amount: number;
  status: string;
  description: string;
  createdAt: any;
  clientId: string;
  prestataireId: string;
  method: string;
  isSimulation?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [transactions, setTransactions] = useState<FirestoreTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to transactions where user is client OR provider
    const q = query(
      collection(db, 'transactions'),
      where('clientId', '==', currentUser.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs: FirestoreTransaction[] = [];
      snapshot.forEach((doc) => {
        txs.push({ id: doc.id, ...doc.data() } as FirestoreTransaction);
      });
      setTransactions(txs);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600 bg-green-50 border-green-100';
      case 'PENDING': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle2 size={16} />;
      case 'PENDING': return <Clock size={16} />;
      case 'CANCELLED': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark flex items-center gap-3">
            <LayoutDashboard className="text-brand-orange" size={32} />
            Tableau de bord
          </h1>
          <p className="text-gray-500 mt-1">Suivez vos transactions et paiements en temps réel.</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center">
            <Wallet className="text-brand-orange" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Solde Portefeuille</p>
            <p className="text-2xl font-black text-brand-dark">{currentUser.walletBalance.toLocaleString()} <span className="text-sm font-bold">FCFA</span></p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => (window as any).setView(ViewState.DELIVERY_TRACKING)}
            className="flex items-center justify-between p-4 bg-brand-orange text-white rounded-2xl shadow-lg hover:bg-orange-600 transition group"
          >
              <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                      <Truck size={24} />
                  </div>
                  <div className="text-left">
                      <p className="font-bold">Suivre mes Livraisons (Livreur Privé)</p>
                      <p className="text-xs opacity-80">Consultez l'état de vos colis en cours.</p>
                  </div>
              </div>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => (window as any).setView(ViewState.WALLET)}
            className="flex items-center justify-between p-4 bg-brand-dark text-white rounded-2xl shadow-lg hover:bg-gray-800 transition group"
          >
              <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                      <Wallet size={24} />
                  </div>
                  <div className="text-left">
                      <p className="font-bold">Gérer mon Portefeuille</p>
                      <p className="text-xs opacity-80">Recharger ou retirer vos fonds.</p>
                  </div>
              </div>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <ArrowDownLeft size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Total Dépensé</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {transactions.reduce((acc, tx) => tx.status === 'PAID' ? acc + tx.amount : acc, 0).toLocaleString()} F
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Clock size={24} />
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">En attente</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Paiements Bloqués</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {transactions.reduce((acc, tx) => tx.status === 'PENDING' ? acc + tx.amount : acc, 0).toLocaleString()} F
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Tests</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Transactions Simulées</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {transactions.filter(tx => tx.isSimulation).length}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Historique des Transactions</h2>
          <button className="text-sm font-bold text-brand-orange hover:underline flex items-center gap-1">
            Voir tout <ChevronRight size={16} />
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Chargement de vos transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-900 font-bold">Aucune transaction</p>
              <p className="text-gray-500 text-sm mt-1">Vos paiements apparaîtront ici dès qu'ils seront initiés.</p>
            </div>
          ) : (
            transactions.map((tx, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={tx.id} 
                className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    tx.method === 'MOBILE_MONEY' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-brand-orange'
                  }`}>
                    {tx.method === 'MOBILE_MONEY' ? <Smartphone size={24} /> : <Wallet size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{tx.description}</p>
                      {tx.isSimulation && (
                        <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                          <Sparkles size={10} /> Simulation
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tx.createdAt?.toDate().toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-lg">{tx.amount.toLocaleString()} F</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">XOF</p>
                  </div>
                  
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(tx.status)}`}>
                    {getStatusIcon(tx.status)}
                    {tx.status === 'PAID' ? 'Payé' : tx.status === 'PENDING' ? 'En attente' : tx.status}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Safety Banner */}
      <div className="bg-brand-dark rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h3 className="text-2xl font-bold mb-2">Sécurité APNET Séquestre</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Pour votre protection, l'argent est bloqué par APNET jusqu'à ce que vous validiez la fin des travaux. 
            Ne payez jamais en dehors de la plateforme pour rester couvert par notre garantie.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
          <ShieldCheck size={200} />
        </div>
      </div>
    </div>
  );
};

import { ShieldCheck } from 'lucide-react';
