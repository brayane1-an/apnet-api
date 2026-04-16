
import React, { useState } from 'react';
import { Transaction, UserProfile, UserRole, ProFeedback, ClientReview, InternshipRequest, InternshipStatus, InternshipOffer } from '../types';
import { Wallet, TrendingUp, PieChart, Building2, Download, Users, CheckCircle, XCircle, Search, Trophy, MessageSquare, Star, MessageCircle, Filter, GraduationCap, FileText, Send, Mail, AlertTriangle, CloudRain, Megaphone, ShieldCheck, MapPin, Clock, Plus, Trash2, Edit2 } from 'lucide-react';
import { RIDER_LEVEL_RULES } from '../constants';
import { AdminUserModal } from './AdminUserModal';
import { realEstateAdminController } from "../admin/realEstateAdminController";
import RealEstateAdminPanel from "./RealEstateAdminPanel";
import { adService } from '../services/adService';

interface AdminDashboardProps {
  balance: number;
  transactions: Transaction[];
  onWithdraw: () => void;
  users: UserProfile[];
  onVerifyUser: (userId: string) => void;
  proFeedbacks: ProFeedback[];
  clientReviews: ClientReview[];
  internshipRequests?: InternshipRequest[];
  onUpdateInternshipStatus?: (id: string, status: InternshipStatus, companyName?: string) => void;
  internshipOffers?: InternshipOffer[];
  onUpdateOfferStatus?: (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => void;
  onApproveWithdrawal?: (userId: string, transactionId: string) => void;
  onRejectWithdrawal?: (userId: string, transactionId: string) => void;
  isBadWeather: boolean;
  onToggleBadWeather: (active: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    balance, transactions, onWithdraw, users, onVerifyUser, proFeedbacks, clientReviews,
    internshipRequests = [], onUpdateInternshipStatus, 
    internshipOffers = [], onUpdateOfferStatus,
    onApproveWithdrawal, onRejectWithdrawal,
    isBadWeather, onToggleBadWeather
}) => {
  const [activeTab, setActiveTab] = useState<'FINANCE' | 'USERS' | 'KYC' | 'FEEDBACK_PRO' | 'REVIEWS_CLIENT' | 'STAGES' | 'MODERATION_STAGES' | 'REAL_ESTATE' | 'WITHDRAWALS'>('FINANCE');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const commissionTransactions = transactions.filter(t => t.type === 'COMMISSION');
  const unverifiedUsers = users.filter(u => !u.verified && u.role === 'PROVIDER');
  const pendingOffers = internshipOffers.filter(o => o.status === 'PENDING_VALIDATION');

  // Find all pending withdrawals across all users
  const pendingWithdrawals = users.flatMap(u => 
    u.transactions
      .filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING_ADMIN')
      .map(t => ({ ...t, userId: u.id, userName: `${u.firstName} ${u.lastName}`, userJobs: u.completedJobs || 0, isCertified: u.isCertified }))
  );

  // Find AI decisions from the night
  const aiNightActivity = users.flatMap(u => 
    u.transactions
      .filter(t => t.type === 'WITHDRAWAL' && t.aiDecision?.handledByAI)
      .map(t => ({ ...t, userId: u.id, userName: `${u.firstName} ${u.lastName}` }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getUserReviews = (userId: string) => {
    return clientReviews.filter(r => r.providerId === userId);
  };
  const getUserFeedbacks = (userId: string) => {
    return proFeedbacks.filter(f => f.providerId === userId);
  };

  // Enhanced CV Viewer with Error Handling
  const handleViewCV = (url: string) => {
      if (!url || url === '#' || url === '') {
          alert("CV non disponible. L'étudiant n'a pas téléversé de fichier valide.");
      } else {
          // Open in new tab
          const win = window.open(url, '_blank');
          if (!win) alert("Le navigateur a bloqué l'ouverture du CV. Veuillez autoriser les popups.");
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Building2 className="text-brand-orange" size={32} />
            Administration APNET
          </h1>
          <p className="text-gray-600 mt-1">Gestion centralisée de la plateforme.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 overflow-x-auto max-w-full">
          {[
              { id: 'FINANCE', label: 'Finance' },
              { id: 'USERS', label: `Utilisateurs (${users.length})` },
              { id: 'KYC', label: `KYC (${unverifiedUsers.length})` },
              { id: 'FEEDBACK_PRO', label: 'Avis Pros' },
              { id: 'REVIEWS_CLIENT', label: 'Notes Clients' },
              { id: 'STAGES', label: `Stages (${internshipRequests.length})` },
              { id: 'MODERATION_STAGES', label: `Modération Stages`, badge: pendingOffers.length },
              { id: 'WITHDRAWALS', label: 'Retraits', badge: pendingWithdrawals.length },
              { id: 'ADS', label: 'Régie Pub' },
              { id: 'REAL_ESTATE', label: 'Immobilier' }
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors whitespace-nowrap relative ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {tab.label}
                {tab.badge ? (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                        {tab.badge}
                    </span>
                ) : null}
              </button>
          ))}
        </div>
      </div>

      {/* FINANCE TAB */}
      {activeTab === 'FINANCE' && (
        <>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 mb-8 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CloudRain className="text-blue-500" /> Mode Mauvais Temps (Pluie/Nuit)
              </h3>
              <p className="text-sm text-gray-500">Active un bonus de +20% sur le gain des livreurs instantanément.</p>
            </div>
            <button 
              onClick={() => onToggleBadWeather(!isBadWeather)}
              className={`px-6 py-2 rounded-full font-bold transition-all ${isBadWeather ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-600'}`}
            >
              {isBadWeather ? 'DÉSACTIVER' : 'ACTIVER'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-brand-green">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Revenus Plateforme (Frais & Pub)</h2>
              <div className="text-4xl font-extrabold text-gray-900 mb-4">{balance.toLocaleString()} FCFA</div>
              <button onClick={onWithdraw} disabled={balance <= 0} className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Building2 size={16} /> Virement Bancaire
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-brand-orange">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Commissions perçues</h2>
              <div className="text-2xl font-bold text-gray-900">{commissionTransactions.length}</div>
              <p className="text-xs text-gray-500 mt-2">Sur un total de {transactions.length} transactions.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Fonds en Transit</h2>
              <div className="text-2xl font-bold text-gray-900">0 FCFA</div>
              <p className="text-xs text-gray-500 mt-2">Montant actuellement bloqué en séquestre.</p>
            </div>
          </div>

           {/* Recent Income Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-lg font-bold text-gray-900">Journal des Commissions</h3>
             <button className="text-sm text-brand-orange hover:underline flex items-center gap-1">
               <Download size={14} /> Exporter CSV
             </button>
           </div>
           <div className="flex-1 overflow-auto max-h-[300px]">
             {commissionTransactions.length === 0 ? (
               <div className="p-8 text-center text-gray-500">Aucune commission pour le moment.</div>
             ) : (
               <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 sticky top-0">
                   <tr>
                     <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                     <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Origine</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {commissionTransactions.slice().reverse().map((t) => (
                     <tr key={t.id} className="hover:bg-gray-50">
                       <td className="px-6 py-3 text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                       <td className="px-6 py-3 font-medium text-gray-900">Service: {t.providerName}</td>
                       <td className="px-6 py-3 text-right text-brand-green font-bold">+{t.amount.toLocaleString()} FCFA</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
           </div>
        </div>
        </>
      )}

      {/* USERS TAB */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Rechercher un utilisateur..." className="bg-transparent border-none outline-none text-sm flex-1" />
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Utilisateur</th>
                <th className="px-6 py-3 font-medium">Rôle</th>
                <th className="px-6 py-3 font-medium">Localisation</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 font-medium">Niveau</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.photoUrl} className="w-8 h-8 rounded-full bg-gray-200" />
                      <div>
                        <div className="font-bold text-gray-900">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-gray-500">{u.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-bold">{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.location.city}</td>
                  <td className="px-6 py-4">
                    {u.verified ? <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Vérifié</span> : <span className="text-gray-400">Non vérifié</span>}
                  </td>
                  <td className="px-6 py-4">
                     {u.riderStats ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${RIDER_LEVEL_RULES[u.riderStats.level].color}`}>
                           {RIDER_LEVEL_RULES[u.riderStats.level].label}
                        </span>
                     ) : (
                        <span className="text-gray-300">-</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedUser(u)}
                      className="text-blue-600 hover:underline font-medium text-xs bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition"
                    >
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* KYC TAB */}
      {activeTab === 'KYC' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {unverifiedUsers.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <p>Tous les prestataires sont vérifiés !</p>
            </div>
          ) : (
            unverifiedUsers.map(u => (
              <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={u.photoUrl} className="w-12 h-12 rounded-full" />
                    <div>
                       <h3 className="font-bold text-gray-900">{u.firstName} {u.lastName}</h3>
                       <p className="text-sm text-gray-500">{u.jobTitle}</p>
                    </div>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">En attente</span>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 mb-4 space-y-1">
                  <p>📍 {u.location.city}, {u.location.quartier}</p>
                  <p>📞 {u.phone}</p>
                  <p>🆔 CNI: (Fichier simulé)</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => onVerifyUser(u.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> Valider
                  </button>
                  <button className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg font-bold hover:bg-red-50 flex items-center justify-center gap-2">
                    <XCircle size={16} /> Rejeter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PROVIDER FEEDBACK TAB */}
      {activeTab === 'FEEDBACK_PRO' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-gray-800"><MessageSquare size={18}/> Avis des Prestataires</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Filter size={14}/>
                    <select className="bg-transparent border-none font-bold">
                        <option>Tous les sujets</option>
                        <option>Sécurité</option>
                        <option>Paiements</option>
                    </select>
                </div>
            </div>
            {proFeedbacks.length === 0 ? (
                <div className="p-10 text-center text-gray-500">Aucun message de prestataire.</div>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Prestataire</th>
                            <th className="px-6 py-3 font-medium">Métier</th>
                            <th className="px-6 py-3 font-medium">Sujet</th>
                            <th className="px-6 py-3 font-medium w-1/3">Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {proFeedbacks.map(fb => (
                            <tr key={fb.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500 text-xs">{new Date(fb.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{fb.providerName}</td>
                                <td className="px-6 py-4 text-gray-600">{fb.metier}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700">{fb.category}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-800">{fb.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      )}

      {/* CLIENT REVIEWS TAB */}
      {activeTab === 'REVIEWS_CLIENT' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-gray-800"><Star size={18} className="text-yellow-500 fill-current"/> Notes & Évaluations Clients</h3>
                <div className="text-sm font-bold text-gray-500">Moyenne: {(clientReviews.reduce((acc, r) => acc + r.rating, 0) / (clientReviews.length || 1)).toFixed(1)}/5</div>
            </div>
            {clientReviews.length === 0 ? (
                <div className="p-10 text-center text-gray-500">Aucune évaluation client pour le moment.</div>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Client</th>
                            <th className="px-6 py-3 font-medium">Prestataire Noté</th>
                            <th className="px-6 py-3 font-medium">Note</th>
                            <th className="px-6 py-3 font-medium w-1/3">Commentaire</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clientReviews.map(review => (
                            <tr key={review.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500 text-xs">{new Date(review.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-gray-900">{review.clientName}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{review.providerName}</td>
                                <td className="px-6 py-4">
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-300"} />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 italic">"{review.comment}"</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      )}

      {/* STAGES TAB */}
      {activeTab === 'STAGES' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-blue-900"><GraduationCap size={18}/> Gestion des Stages</h3>
                <div className="text-sm font-bold text-blue-800">{internshipRequests.length} Dossiers</div>
            </div>
            
            {internshipRequests.length === 0 ? (
                <div className="p-10 text-center text-gray-500">Aucune demande de stage pour le moment.</div>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">Candidat</th>
                            <th className="px-6 py-3 font-medium">Email</th>
                            <th className="px-6 py-3 font-medium">Filière / Type</th>
                            <th className="px-6 py-3 font-medium">Localisation</th>
                            <th className="px-6 py-3 font-medium">CV</th>
                            <th className="px-6 py-3 font-medium">Statut</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {internshipRequests.map(req => (
                            <tr key={req.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{req.fullName}</div>
                                    <div className="text-xs text-gray-500">{req.phone}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-xs">
                                    <div className="flex items-center gap-1">
                                        <Mail size={12}/> {req.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-900 font-medium">{req.field}</div>
                                    <div className="text-xs text-blue-600">{req.type}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {req.location.city}, {req.location.commune} <br/>
                                    <span className="text-xs italic">{req.location.quartier}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {req.cvUrl ? (
                                        <button 
                                            onClick={() => handleViewCV(req.cvUrl)}
                                            className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-bold bg-blue-50 px-2 py-1 rounded border border-blue-200"
                                        >
                                            <FileText size={12} /> Voir CV
                                        </button>
                                    ) : (
                                        <span className="text-red-500 text-xs italic">CV non disponible</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {req.status === 'EN_ATTENTE' && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">En attente</span>}
                                    {req.status === 'TROUVE' && (
                                        <div className="flex flex-col gap-1">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold text-center">Trouvé</span>
                                            <span className="text-[10px] text-gray-500 italic">Partenaire: {req.matchedCompany}</span>
                                        </div>
                                    )}
                                    {req.status === 'VALIDE' && (
                                        <div className="flex flex-col gap-1">
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold text-center">Validé</span>
                                            <span className="text-[10px] text-gray-500 italic">Envoyé à {req.matchedCompany}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {req.status === 'EN_ATTENTE' && onUpdateInternshipStatus && (
                                        <button 
                                            onClick={() => {
                                                const company = prompt("Nom de l'entreprise partenaire trouvée pour ce stage ?");
                                                if(company) onUpdateInternshipStatus(req.id, 'TROUVE' as any, company);
                                            }}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 flex items-center gap-1 ml-auto"
                                        >
                                            <CheckCircle size={12} /> Trouver Stage
                                        </button>
                                    )}
                                    {req.status === 'TROUVE' && (
                                        <span className="text-xs text-gray-400 italic">Attente paiement étudiant...</span>
                                    )}
                                    {req.status === 'VALIDE' && (
                                        <button 
                                            onClick={() => alert(`Notification renvoyée à ${req.phone} avec les détails de ${req.matchedCompany}`)}
                                            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 ml-auto text-xs"
                                        >
                                            <Send size={12} /> Renvoyer Notif
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      )}

      {/* MODERATION STAGES TAB */}
      {activeTab === 'MODERATION_STAGES' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-yellow-900"><ShieldCheck size={18}/> Modération des Offres de Stage</h3>
                <div className="text-sm font-bold text-yellow-800">{pendingOffers.length} Offres en attente</div>
            </div>
            
            {pendingOffers.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                    <p className="font-bold text-lg">Aucune offre en attente !</p>
                    <p className="text-sm">Toutes les offres ont été traitées.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {pendingOffers.map(offer => (
                        <div key={offer.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase">{offer.type}</span>
                                        <span className="text-xs text-gray-400">{new Date(offer.postedAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-xl font-black text-gray-900 mb-1">{offer.title}</h4>
                                    <p className="text-brand-orange font-bold text-sm mb-3">{offer.companyName}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin size={14} /> {offer.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock size={14} /> {offer.duration}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed border border-gray-100">
                                        {offer.description}
                                    </div>
                                </div>
                                
                                <div className="flex flex-row md:flex-col gap-3 justify-center">
                                    <button 
                                        onClick={() => onUpdateOfferStatus?.(offer.id, 'APPROVED')}
                                        className="flex-1 md:flex-none px-6 py-3 bg-brand-green text-white font-black rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} /> Valider
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const reason = prompt("Motif du refus (sera envoyé par WhatsApp) :");
                                            if (reason) onUpdateOfferStatus?.(offer.id, 'REJECTED', reason);
                                        }}
                                        className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 font-black rounded-xl border border-red-100 hover:bg-red-100 transition flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} /> Rejeter
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}

      {/* ADS TAB */}
      {activeTab === 'ADS' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-brand-orange/10 border-b border-brand-orange/20 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-brand-orange"><Megaphone size={18}/> Régie Publicitaire & Visibilité</h3>
            <button 
              onClick={() => {
                const sponsor = prompt("Nom du partenaire (ex: Orange, Banque) :");
                const title = prompt("Titre de la campagne :");
                const zone = prompt("Zone d'affichage (TOP, MIDDLE, BOTTOM) :", "TOP")?.toUpperCase();
                const actionUrl = prompt("Lien de redirection (WhatsApp ou Site) :", "https://wa.me/225...");
                const imageUrl = prompt("URL de l'image :", "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop");

                if (sponsor && title && zone && (zone === 'TOP' || zone === 'MIDDLE' || zone === 'BOTTOM')) {
                  adService.addAd({
                    sponsorName: sponsor,
                    title: title,
                    body: "Nouvelle offre partenaire disponible sur APNET.",
                    imageUrl: imageUrl || "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop",
                    actionUrl: actionUrl || "https://apnet.ci",
                    zone: zone as 'TOP' | 'MIDDLE' | 'BOTTOM',
                    format: 'BANNER',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '2025-12-31',
                    targetCategory: 'GENERAL'
                  });
                  alert("Publicité ajoutée !");
                  setActiveTab('FINANCE'); setActiveTab('ADS'); // Force refresh
                } else if (zone && !['TOP', 'MIDDLE', 'BOTTOM'].includes(zone)) {
                  alert("Zone invalide. Utilisez TOP, MIDDLE ou BOTTOM.");
                }
              }}
              className="bg-brand-orange text-white px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 hover:bg-orange-600 transition"
            >
              <Plus size={14} /> Ajouter une Pub
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Vues</p>
                <p className="text-2xl font-black text-gray-900">
                  {adService.getAllAds().reduce((acc: number, ad: any) => acc + ad.views, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Clics</p>
                <p className="text-2xl font-black text-gray-900">
                  {adService.getAllAds().reduce((acc: number, ad: any) => acc + ad.clicks, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">CTR Moyen</p>
                <p className="text-2xl font-black text-brand-green">
                  {((adService.getAllAds().reduce((acc: number, ad: any) => acc + ad.clicks, 0) / 
                    adService.getAllAds().reduce((acc: number, ad: any) => acc + ad.views, 1)) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Revenus Pub</p>
                <p className="text-2xl font-black text-blue-600">45 000F</p>
              </div>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Annonceur</th>
                  <th className="px-6 py-3 font-medium">Zone</th>
                  <th className="px-6 py-3 font-medium text-center">Vues</th>
                  <th className="px-6 py-3 font-medium text-center">Clics</th>
                  <th className="px-6 py-3 font-medium text-center">CTR</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adService.getAllAds().map((ad: any) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{ad.sponsorName}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{ad.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        ad.zone === 'TOP' ? 'bg-blue-100 text-blue-700' : 
                        ad.zone === 'MIDDLE' ? 'bg-purple-100 text-purple-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {ad.zone}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">{ad.views.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center font-bold">{ad.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-brand-green font-bold">
                      {((ad.clicks / (ad.views || 1)) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            const newUrl = prompt("Nouveau lien de redirection :", ad.actionUrl);
                            if (newUrl !== null) {
                              adService.updateAd(ad.id, { actionUrl: newUrl });
                              setActiveTab('FINANCE'); setActiveTab('ADS');
                            }
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier le lien"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Supprimer cette campagne ?")) {
                              adService.deleteAd(ad.id);
                              setActiveTab('FINANCE'); setActiveTab('ADS');
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-[10px] font-black uppercase">Actif</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* REAL ESTATE ADMIN TAB */}
      {activeTab === 'REAL_ESTATE' && (
        <RealEstateAdminPanel controller={realEstateAdminController} />
      )}

      {/* WITHDRAWALS TAB */}
      {activeTab === 'WITHDRAWALS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="text-brand-green" /> Retraits en attente de validation
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Les retraits &gt; 5 000 F (ou &gt; 10 000 F pour certifiés) ou de nouveaux prestataires (&lt; 10 courses) demandent votre accord.
              </p>
            </div>
            
            {pendingWithdrawals.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                <p className="font-medium">Aucun retrait en attente.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">Prestataire</th>
                    <th className="px-6 py-3 font-medium">Montant</th>
                    <th className="px-6 py-3 font-medium">Méthode</th>
                    <th className="px-6 py-3 font-medium">Raison Blocage</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{w.userName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          {w.isCertified && <span className="text-brand-orange font-bold">Certifié</span>}
                          <span>• {w.userJobs} courses</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">{w.amount.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold">{w.method}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-red-600 font-medium">
                          {w.userJobs < 10 ? "Nouveau (< 10 courses)" : "Seuil dépassé"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => onApproveWithdrawal?.(w.userId, w.id)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition"
                          >
                            Approuver
                          </button>
                          <button 
                            onClick={() => onRejectWithdrawal?.(w.userId, w.id)}
                            className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 transition"
                          >
                            Rejeter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* AI Night Activity Report */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-brand-dark text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="text-brand-orange" /> Rapport d'Activité de Nuit (Relais IA)
              </h3>
              <p className="text-xs opacity-80 mt-1">
                Décisions prises automatiquement par l'IA entre 22h00 et 07h00.
              </p>
            </div>

            {aiNightActivity.length === 0 ? (
              <div className="p-8 text-center text-gray-500 italic">
                Aucune activité IA détectée cette nuit.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {aiNightActivity.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${log.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {log.status === 'COMPLETED' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{log.userName}</span>
                          {log.isUrgent && <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-black uppercase">Urgence</span>}
                        </div>
                        <p className="text-xs text-gray-500">{log.aiDecision?.reason}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(log.date).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">{log.amount.toLocaleString()} F</p>
                      <span className={`text-[10px] font-bold uppercase ${log.status === 'COMPLETED' ? 'text-green-600' : 'text-red-600'}`}>
                        {log.status === 'COMPLETED' ? 'Validé par IA' : 'Bloqué par IA'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN USER MODAL */}
      {selectedUser && (
        <AdminUserModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          clientReviews={getUserReviews(selectedUser.id)}
          proFeedbacks={getUserFeedbacks(selectedUser.id)} 
        />
      )}
    </div>
  );
};
