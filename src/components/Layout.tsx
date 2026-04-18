
import React, { useState } from 'react';
import { ViewState, UserProfile, UserRole, Notification } from '../types';
import { Menu, X, MapPin, ShieldAlert, Wallet, LogIn, Megaphone, LockKeyhole, FileText, User, Bell, Trash2, Truck, Briefcase, Home, GraduationCap, Grid, MessageSquare, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';

export const SecurityBanner = () => (
  <div className="bg-red-600 text-white px-4 py-3 shadow-md text-center relative z-50">
    <div className="flex items-center justify-center gap-2 animate-pulse">
      <ShieldAlert className="w-6 h-6" />
      <span className="font-bold text-sm md:text-base uppercase tracking-wide">
        ATTENTION : Aucune somme ne doit être versée à un particulier avant un emploi ou un service.
      </span>
    </div>
    <p className="text-xs md:text-sm mt-1 opacity-90">Utilisez le paiement sécurisé APNET pour vous protéger.</p>
  </div>
);

interface HeaderProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  currentUser: UserProfile | null;
  onReadNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView, currentUser, onReadNotifications }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const navItemClass = (view: ViewState) =>
    `cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
      currentView === view
        ? 'bg-brand-orange text-white'
        : 'text-gray-700 hover:bg-gray-100 hover:text-brand-orange'
    }`;
  
  const unreadCount = currentUser?.notifications?.filter(n => !n.read).length || 0;
  const isProvider = currentUser?.role === UserRole.PROVIDER;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer group" 
              onClick={() => setView(ViewState.HOME)}
            >
              <Logo size="md" />
            </div>
            
            {/* DESKTOP MENU */}
            <div className="hidden md:ml-8 md:flex md:space-x-2 lg:space-x-4">
              <button onClick={() => setView(ViewState.HOME)} className={navItemClass(ViewState.HOME)}>
                Accueil
              </button>
              
              {/* EXCLUSION: Si Prestataire, on cache le catalogue général et la recherche de travailleurs */}
              <button onClick={() => setView(ViewState.CATALOG)} className={navItemClass(ViewState.CATALOG)}>
                <Grid size={14}/> Catalogue
              </button>
              
              {!isProvider && (
                <button onClick={() => setView(ViewState.FIND_WORKER)} className={navItemClass(ViewState.FIND_WORKER)}>
                  Trouver un prestataire
                </button>
              )}
              
              <button onClick={() => setView(ViewState.REAL_ESTATE)} className={navItemClass(ViewState.REAL_ESTATE)}>
                <Home size={14}/> Immobilier
              </button>
              
              <button onClick={() => setView(ViewState.DELIVERY_ESTIMATOR)} className={navItemClass(ViewState.DELIVERY_ESTIMATOR)}>
                <Truck size={14}/> Livreur Privé
              </button>
              
              <button onClick={() => setView(ViewState.INTERNSHIPS)} className={navItemClass(ViewState.INTERNSHIPS)}>
                <GraduationCap size={14}/> Stage & Étudiants
              </button>
              
              {/* LIENS SPÉCIFIQUES PRESTATAIRE */}
              {isProvider && (
                <button 
                  onClick={() => setView(ViewState.PROVIDER_DASHBOARD)}
                  className={`cursor-pointer px-3 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-1 border border-brand-orange/20 ${
                      currentView === ViewState.PROVIDER_DASHBOARD
                      ? 'bg-brand-orange text-white'
                      : 'text-brand-orange hover:bg-orange-50'
                  }`}
                >
                  <Briefcase size={14} /> Espace Métier
                </button>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
             {currentUser ? (
               <>
                  {/* Messages Button (Visible pour tous connectés) */}
                  <button 
                    onClick={() => setView(ViewState.MESSAGES)}
                    className={`p-2 rounded-full hover:bg-gray-100 relative text-gray-600 ${currentView === ViewState.MESSAGES ? 'bg-blue-50 text-blue-600' : ''}`}
                    title="Messages / Chat"
                  >
                    <MessageSquare size={20} />
                  </button>

                  <button 
                    onClick={() => setView(ViewState.WALLET)}
                    className={`p-2 rounded-full hover:bg-gray-100 relative text-gray-600 ${currentView === ViewState.WALLET ? 'bg-orange-50 text-brand-orange' : ''}`}
                    title="Mon Portefeuille"
                  >
                    <Wallet size={20} />
                    {currentUser.walletBalance > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-500 w-2 h-2 rounded-full border border-white"></span>
                    )}
                  </button>

                  <button 
                    onClick={() => setView(ViewState.DASHBOARD)}
                    className={`p-2 rounded-full hover:bg-gray-100 relative text-gray-600 ${currentView === ViewState.DASHBOARD ? 'bg-orange-50 text-brand-orange' : ''}`}
                    title="Tableau de bord"
                  >
                    <LayoutDashboard size={20} />
                  </button>

                  {/* Notifications */}
                  <div className="relative">
                    <button 
                      onClick={() => { setShowNotifications(!showNotifications); if(onReadNotifications && unreadCount > 0) onReadNotifications(); }}
                      className="p-2 rounded-full hover:bg-gray-100 relative text-gray-600"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="font-bold text-sm text-gray-800">Notifications</h3>
                          <button onClick={() => setShowNotifications(false)}><X size={14} /></button>
                        </div>
                        {currentUser.notifications && currentUser.notifications.length > 0 ? (
                          currentUser.notifications.slice().reverse().map(notif => (
                            <div key={notif.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                              <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-sm text-gray-500">Aucune notification</div>
                        )}
                      </div>
                    )}
                  </div>

                 {/* User Profile Pill */}
                 <div 
                    className="flex items-center gap-2 pl-2 cursor-pointer hover:bg-gray-50 rounded-full pr-2 py-1 transition"
                    onClick={() => setView(ViewState.PROFILE)}
                 >
                    <img 
                      src={currentUser.photoUrl || 'https://via.placeholder.com/40'} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                    />
                    <div className="flex flex-col leading-none">
                      <span className="text-sm font-bold text-gray-800">{currentUser.firstName}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{currentUser.role === UserRole.PROVIDER ? 'Prestataire' : 'Client'}</span>
                    </div>
                 </div>
               </>
             ) : (
               <button
                 onClick={() => setView(ViewState.REGISTER)}
                 className="bg-brand-dark text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition flex items-center gap-2 shadow-sm"
               >
                 <LogIn size={18} />
                 Compte
               </button>
             )}
          </div>

          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => { setView(ViewState.HOME); setIsMenuOpen(false); }} className={`block w-full text-left ${navItemClass(ViewState.HOME)}`}>
              Accueil
            </button>

            <button onClick={() => { setView(ViewState.CATALOG); setIsMenuOpen(false); }} className={`block w-full text-left ${navItemClass(ViewState.CATALOG)}`}>
              <Grid size={16} className="inline mr-2"/> Catalogue
            </button>
            
            {/* MOBILE EXCLUSION */}
            {!isProvider && (
              <button onClick={() => { setView(ViewState.FIND_WORKER); setIsMenuOpen(false); }} className={`block w-full text-left ${navItemClass(ViewState.FIND_WORKER)}`}>
                Trouver un prestataire
              </button>
            )}

            <button onClick={() => { setView(ViewState.INTERNSHIPS); setIsMenuOpen(false); }} className={`block w-full text-left ${navItemClass(ViewState.INTERNSHIPS)}`}>
              Stage & Étudiants
            </button>

            <button onClick={() => { setView(ViewState.REAL_ESTATE); setIsMenuOpen(false); }} className={`block w-full text-left ${navItemClass(ViewState.REAL_ESTATE)}`}>
              Immobilier
            </button>

            <button onClick={() => { setView(ViewState.DELIVERY_ESTIMATOR); setIsMenuOpen(false); }} className={`block w-full text-left ${navItemClass(ViewState.DELIVERY_ESTIMATOR)}`}>
              Livreur Privé
            </button>
            
            {isProvider && (
              <button 
                onClick={() => { setView(ViewState.PROVIDER_DASHBOARD); setIsMenuOpen(false); }} 
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-bold text-brand-orange bg-orange-50 mt-1"
              >
                Mon Espace Métier
              </button>
            )}

            {currentUser && (
               <>
                   <button onClick={() => { setView(ViewState.MESSAGES); setIsMenuOpen(false); }} className={`block w-full text-left mt-2 px-3 py-2 text-sm font-medium text-gray-700`}>
                    <MessageSquare size={16} className="inline mr-2"/> Messages
                   </button>
                   <button onClick={() => { setView(ViewState.WALLET); setIsMenuOpen(false); }} className={`block w-full text-left mt-2 px-3 py-2 text-sm font-medium text-gray-700`}>
                    <Wallet size={16} className="inline mr-2"/> Mon Portefeuille
                   </button>
                   <button onClick={() => { setView(ViewState.DASHBOARD); setIsMenuOpen(false); }} className={`block w-full text-left mt-2 px-3 py-2 text-sm font-medium text-gray-700`}>
                    <LayoutDashboard size={16} className="inline mr-2"/> Tableau de bord
                   </button>
                   <button onClick={() => { setView(ViewState.PROFILE); setIsMenuOpen(false); }} className={`block w-full text-left mt-2 px-3 py-2 text-sm font-medium text-gray-700`}>
                    <User size={16} className="inline mr-2"/> Mon Profil
                   </button>
               </>
            )}

            {!currentUser && (
              <button onClick={() => { setView(ViewState.REGISTER); setIsMenuOpen(false); }} className={`block w-full text-left mt-4 bg-brand-green text-white px-3 py-2 rounded-md font-bold`}>
                S'inscrire
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = "Retour", className = "" }) => (
  <button 
    onClick={onClick} 
    className={`text-gray-500 hover:text-gray-800 flex items-center gap-2 font-bold text-sm transition-colors group ${className}`}
  >
    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
    {label}
  </button>
);

interface FooterProps {
  setView: (view: ViewState) => void;
  currentUser: UserProfile | null;
}

export const Footer: React.FC<FooterProps> = ({ setView, currentUser }) => {
  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4 cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
              <Logo size="md" variant="white" />
            </div>
            <p className="text-gray-400 text-sm">
              La plateforme de référence pour les services en Côte d'Ivoire. Fiable, rapide, sécurisé.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button onClick={() => setView(ViewState.HOME)} className="hover:text-white transition-colors">Accueil</button></li>
              <li><button onClick={() => setView(ViewState.CATALOG)} className="hover:text-white transition-colors">Catalogue</button></li>
              <li><button onClick={() => setView(ViewState.FIND_WORKER)} className="hover:text-white transition-colors">Trouver un pro</button></li>
              <li><button onClick={() => setView(ViewState.REAL_ESTATE)} className="hover:text-white transition-colors">Immobilier</button></li>
              <li><button onClick={() => setView(ViewState.DELIVERY_ESTIMATOR)} className="hover:text-white transition-colors">Livreur Privé</button></li>
              <li><button onClick={() => setView(ViewState.INTERNSHIPS)} className="hover:text-white transition-colors">Stages & Étudiants</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button onClick={() => setView(ViewState.TERMS)} className="hover:text-white transition-colors">Conditions Générales</button></li>
              <li><span className="cursor-not-allowed opacity-50">Politique de Confidentialité</span></li>
              <li>
                <a 
                  href="https://wa.me/22500000000?text=Bonjour, je souhaite faire de la publicité sur APNET." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-orange font-bold hover:underline flex items-center gap-1 mt-2"
                >
                  <Megaphone size={14} /> Faire votre publicité ici
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Abidjan, Côte d'Ivoire</li>
              <li>support@apnet.ci</li>
              <li>+225 01 02 03 04 05</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} APNET CI. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};
