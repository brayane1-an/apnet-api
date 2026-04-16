
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserRole } from '../types';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { User, MapPin, Phone, Briefcase, FileText, ShieldCheck, Camera, Wallet, TrendingUp, Download, History, LogOut, Users, PlusCircle, Check, X, Loader2 } from 'lucide-react';

interface UserProfileViewProps {
  user: UserProfile;
  onSwitchAccount?: (newUser: UserProfile) => void;
  onAddAccount?: () => void;
  onLogout?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onSwitchAccount, onAddAccount, onLogout }) => {
  const [linkedAccounts, setLinkedAccounts] = useState<UserProfile[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Link Account Form State
  const [linkPhone, setLinkPhone] = useState('');
  const [linkPin, setLinkPin] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
      refreshLinkedAccounts();
  }, [user]);

  const refreshLinkedAccounts = () => {
      const accounts = authService.getLinkedAccounts();
      setLinkedAccounts(accounts);
  };

  const handleSwitch = (targetUser: UserProfile) => {
      if (targetUser.id === user.id) return;
      const switchedUser = authService.switchAccount(targetUser.id);
      if (switchedUser && onSwitchAccount) {
          onSwitchAccount(switchedUser);
      }
  };

  const handleUnlinkAccount = (e: React.MouseEvent, accountId: string) => {
      e.stopPropagation();
      if (confirm("Voulez-vous dissocier ce compte ? Il ne sera plus accessible rapidement.")) {
          authService.removeAccount(accountId);
          refreshLinkedAccounts();
      }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!linkPhone || !linkPin) {
          setLinkError("Veuillez remplir le numéro et le code PIN.");
          return;
      }
      
      setIsLinking(true);
      setLinkError('');
      
      try {
          const res = await authService.linkNewAccount(user.id, linkPhone, linkPin);
          if (res.success) {
              refreshLinkedAccounts();
              setShowLinkModal(false);
              setLinkPhone('');
              setLinkPin('');
              alert("Compte associé avec succès !");
          } else {
              setLinkError(res.message || "Erreur lors de l'association.");
          }
      } catch (err) {
          setLinkError("Erreur technique.");
      } finally {
          setIsLinking(false);
      }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validation basique
      if (!file.type.startsWith('image/')) {
          alert("Veuillez choisir une image.");
          return;
      }

      setIsUploading(true);
      try {
          const path = `avatars/${user.id}_${Date.now()}`;
          const downloadURL = await storageService.uploadFile(file, path);
          
          const updatedUser = { ...user, photoUrl: downloadURL };
          await authService.updateProfile(updatedUser);
          
          if (onSwitchAccount) {
              onSwitchAccount(updatedUser);
          }
          
          alert("Photo de profil mise à jour !");
      } catch (error) {
          console.error("Upload error:", error);
          alert("Erreur lors de l'upload de la photo.");
      } finally {
          setIsUploading(false);
      }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        {/* Banner */}
        <div className={`h-32 bg-gradient-to-r ${user.role === UserRole.PROVIDER ? 'from-brand-orange to-orange-400' : 'from-brand-green to-green-500'}`}></div>
        
        <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
                <div className="relative">
                    <img 
                        src={user.photoUrl} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md bg-white"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow cursor-pointer text-gray-500 hover:text-brand-orange disabled:opacity-50"
                        title="Modifier ma photo"
                    >
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${user.role === UserRole.PROVIDER ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {user.role === UserRole.PROVIDER ? 'Prestataire' : 'Demandeur'}
                    </span>
                    <button 
                        onClick={onLogout} 
                        className="flex items-center gap-1 text-xs text-red-500 font-bold border border-red-200 px-3 py-1 rounded-full hover:bg-red-50"
                    >
                        <LogOut size={12} /> Déconnexion
                    </button>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-500 flex items-center gap-1 mb-6">
                <MapPin size={14} /> {user.location.city}, {user.location.commune}
            </p>

            {/* --- MODULE MULTI-COMPTES SÉCURISÉ --- */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                    <Users size={16} /> Comptes Associés
                </h3>
                
                <div className="space-y-2">
                    {/* Compte Actuel */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white border-2 border-brand-orange shadow-sm">
                        <div className="flex items-center gap-3">
                            <img src={user.photoUrl} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                            <div>
                                <p className="font-bold text-sm text-brand-orange">
                                    {user.firstName} {user.lastName} (Actif)
                                </p>
                                <p className="text-xs text-gray-500">{user.phone}</p>
                            </div>
                        </div>
                        <Check size={20} className="text-brand-orange mr-2" />
                    </div>

                    {/* Autres comptes liés */}
                    {linkedAccounts.filter(acc => acc.id !== user.id).map(acc => (
                        <div 
                            key={acc.id}
                            onClick={() => handleSwitch(acc)}
                            className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition bg-white border border-gray-100 hover:shadow-md hover:border-gray-300"
                        >
                            <div className="flex items-center gap-3">
                                <img src={acc.photoUrl} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                                <div>
                                    <p className="font-bold text-sm text-gray-800">
                                        {acc.firstName} {acc.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {acc.role === UserRole.PROVIDER ? `Pro - ${acc.jobTitle}` : 'Client'} • {acc.phone}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => handleUnlinkAccount(e, acc.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                title="Dissocier ce compte"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    
                    <button 
                        onClick={() => setShowLinkModal(true)}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:text-brand-orange hover:border-brand-orange hover:bg-white transition text-sm font-bold mt-2"
                    >
                        <PlusCircle size={16} /> Associer un autre compte
                    </button>
                </div>
            </div>
            {/* -------------------------------------- */}

            {/* --- SECTION COMPTE / SOLDE --- */}
            {user.role === UserRole.PROVIDER && (
                <div className="bg-gray-900 text-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold flex items-center gap-2 text-brand-orange">
                            <Wallet size={20} /> Mon Compte & Solde
                        </h3>
                        <span className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-300">ID Unique: {user.phone}</span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Solde Disponible</p>
                            <p className="text-4xl font-extrabold tracking-tight text-white">{(user.walletBalance || 0).toLocaleString()} <span className="text-lg font-normal text-gray-400">FCFA</span></p>
                        </div>
                        <button 
                            className="bg-brand-orange text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-lg"
                            onClick={() => alert("Demande de retrait initiée. Vous recevrez un SMS.")}
                        >
                            <Download size={18} /> Demander un retrait
                        </button>
                    </div>
                    
                    {/* Mini Historique */}
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><History size={12}/> Historique récent</p>
                        {user.transactions && user.transactions.length > 0 ? (
                            <div className="space-y-3">
                                {user.transactions.slice(0, 3).map(tx => (
                                    <div key={tx.id} className="flex justify-between text-sm bg-gray-800 p-3 rounded-lg">
                                        <div>
                                            <span className="block text-white font-medium">{tx.providerName}</span>
                                            <span className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} F
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic bg-gray-800 p-3 rounded-lg text-center">Aucune transaction récente.</p>
                        )}
                    </div>
                </div>
            )}
            {/* -------------------------------------- */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Info Perso */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 border-b pb-2">Informations</h3>
                    
                    <div className="flex items-center gap-3 text-gray-700">
                        <Phone size={18} className="text-gray-400" />
                        <span>{user.phone}</span>
                    </div>
                    {user.role === UserRole.PROVIDER && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <Briefcase size={18} className="text-gray-400" />
                            <span>{user.jobTitle}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-3 text-gray-700">
                        <User size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-500">ID: {user.id.split('_')[1]}</span>
                    </div>
                </div>

                {/* Documents */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 border-b pb-2">Documents du dossier</h3>
                    
                    {user.documents && user.documents.length > 0 ? (
                        <div className="space-y-2">
                            {user.documents.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-blue-500" />
                                        <span className="font-medium text-sm">{doc.type}</span>
                                    </div>
                                    <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                        <ShieldCheck size={12} /> Stocké
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Aucun document dans le dossier numérique.</p>
                    )}
                </div>
            </div>

            {user.description && (
                <div className="mt-8">
                    <h3 className="font-bold text-gray-900 mb-2">Bio / Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl">
                        {user.description}
                    </p>
                </div>
            )}
        </div>
      </div>

      {/* --- MODALE D'ASSOCIATION DE COMPTE --- */}
      {showLinkModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Associer un compte</h3>
                      <button onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  </div>
                  
                  <form onSubmit={handleLinkSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Numéro du compte</label>
                          <input 
                              type="tel" 
                              value={linkPhone}
                              onChange={e => setLinkPhone(e.target.value)}
                              className="w-full p-2 border rounded-lg"
                              placeholder="0707..."
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Code PIN Secret</label>
                          <input 
                              type="password" 
                              value={linkPin}
                              onChange={e => setLinkPin(e.target.value)}
                              className="w-full p-2 border rounded-lg text-center font-bold tracking-widest"
                              placeholder="••••"
                              maxLength={6}
                              required
                          />
                          <p className="text-xs text-gray-500 mt-1">Le PIN est requis pour prouver que ce compte vous appartient.</p>
                      </div>

                      {linkError && <p className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded">{linkError}</p>}

                      <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => setShowLinkModal(false)} className="flex-1 py-2 text-gray-600 font-bold bg-gray-100 rounded-lg hover:bg-gray-200">
                              Annuler
                          </button>
                          <button type="submit" disabled={isLinking} className="flex-1 py-2 text-white font-bold bg-brand-orange rounded-lg hover:bg-orange-600 flex justify-center items-center gap-2">
                              {isLinking ? <Loader2 size={16} className="animate-spin" /> : "Associer"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
