
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  ViewState, UserProfile, UserRole, UserStatus, JobOffer, Transaction, 
  ServiceMode, PaymentMethod, RealEstateListing, PropertyType,
  InternshipRequest, DeliveryOrder, Advertisement, RiderLevel,
  InternshipOffer, ContractType, DigitalContract, InternshipStatus,
  PrivateInternshipData, ApplicationStatus
} from './types';
import { 
  MOCK_PROVIDERS, MOCK_JOBS, MOCK_ADS, MOCK_DELIVERY_ORDERS, 
  MOCK_INTERNSHIP_REQUESTS, MOCK_INTERNSHIP_OFFERS, SERVICE_FEE_PERCENTAGE, 
  PLATFORM_MAINTENANCE_FEE, RIDER_POINTS
} from './constants';
import { authService } from './services/authService';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Components
import { Header, Footer, SecurityBanner, BackButton } from './components/Layout';
import { Logo } from './components/Logo';
import Hero from './components/Hero';
import Filters from './components/Filters';
import { ProviderCard, JobCard } from './components/ListingCards';
import { RegistrationForm } from './components/RegistrationForm';
import { WalletView } from './components/WalletView';
import { PaymentModal } from './components/PaymentModal';
import { ReviewModal } from './components/ReviewModal';
import { ChatModal } from './components/ChatModal';
import { ContractViewer } from './components/ContractViewer';
import { AdminDashboard } from './components/AdminDashboard';
import { ServiceCatalog } from './components/ServiceCatalog';
import { Dashboard } from './components/Dashboard';
import { CategoryGrid } from './components/CategoryGrid';
import { AdCreator } from './components/AdCreator';
import { DeliveryEstimator } from './components/DeliveryEstimator';
import { DeliveryTracking } from './components/DeliveryTracking';
import { RealEstateModule } from './components/RealEstateModule';
import { TradeManifesto } from './components/TradeManifesto';
import { InternshipModule } from './components/InternshipModule';
import { RiderJobBoard } from './components/RiderJobBoard';
import { RecruiterSpace } from './components/RecruiterSpace';
import { TermsOfService } from './components/TermsOfService';
import { OfficialMessage } from './components/OfficialMessage';
import { UniversalOrderModal } from './components/UniversalOrderModal';
import { QuoteRequestModal } from './components/QuoteRequestModal';
import { jobService } from './services/jobService';
import { AdBanner } from './components/Advertisement';
import SafetyTips from './components/SafetyTips';
import Features from './components/Features';
import { ProviderDashboard } from './components/ProviderDashboard';
import { UserProfileView } from './components/UserProfileView';
import { MessagesView } from './components/MessagesView';
import { AdCarousel, CertifiedCompanies, AdvertiserCTA } from './components/AdRegistry';
import { adService } from './services/adService';
import { RealEstateFeed, WorksFeed, LandlordOnboardingForm } from './components/HomeFeed';
import { SmartSearch } from './components/SmartSearch';

export default function App() {
  const [view, setViewInternal] = useState<ViewState>(ViewState.HOME);
  const [viewHistory, setViewHistory] = useState<ViewState[]>([]);
  const [direction, setDirection] = useState(1);
  const [deliveryStep, setDeliveryStep] = useState<'ESTIMATE' | 'DETAILS'>('ESTIMATE');

  const setView = (newView: ViewState, clearHistory: boolean = false) => {
    if (newView !== view) {
      if (clearHistory) {
        setDirection(-1);
        setViewHistory([]);
      } else {
        setDirection(1);
        setViewHistory(prev => [...prev, view]);
      }
      setViewInternal(newView);
      if (newView === ViewState.DELIVERY_ESTIMATOR) {
        setDeliveryStep('ESTIMATE');
      }
    }
  };

  const handleBack = () => {
    if (view === ViewState.DELIVERY_ESTIMATOR && deliveryStep === 'DETAILS') {
      setDirection(-1);
      setDeliveryStep('ESTIMATE');
      return;
    }

    setDirection(-1);
    if (viewHistory.length > 0) {
      const prevView = viewHistory[viewHistory.length - 1];
      setViewHistory(prev => prev.slice(0, -1));
      setViewInternal(prevView);
    } else {
      setViewInternal(ViewState.HOME);
    }
  };

  const variants = {
    initial: (direction: number) => ({
      x: direction > 0 ? '50px' : '-50px',
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-50px' : '50px',
      opacity: 0
    })
  };

  const [isBadWeather, setIsBadWeather] = useState(false);
  
  // Automatic Scroll to Top on View Change (Standard SPA UX)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  // Expose setView to window for global access from components
  useEffect(() => {
    (window as any).setView = setView;
  }, [setView]);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  // Data State
  const [users, setUsers] = useState<UserProfile[]>(MOCK_PROVIDERS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Filters
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [requiredCertification, setRequiredCertification] = useState('');
  const [availability, setAvailability] = useState('');
  const [language, setLanguage] = useState('');

  // Modals & Flows
  const [showPayment, setShowPayment] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<UserProfile | null>(null);
  const [serviceMode, setServiceMode] = useState<ServiceMode>(ServiceMode.DAILY);
  
  const closeOrderModal = React.useCallback(() => setShowOrderModal(false), []);
  const closeQuoteModal = React.useCallback(() => setShowQuoteModal(false), []);
  const closeChatModal = React.useCallback(() => {
    setShowChat(false);
    setPendingOrderData(null);
    setPendingQuoteData(null);
  }, []);
  const closePaymentModal = React.useCallback(() => setShowPayment(false), []);
  const closeSubscriptionModal = React.useCallback(() => setShowSubscriptionModal(false), []);

  const handleSelectService = React.useCallback((c: string, s: string, sp: string) => {
    setCategory(c); 
    setSubCategory(s); 
    setSpecialization(sp);
    setView(ViewState.FIND_WORKER);
  }, []);

  const handleRequestOrder = React.useCallback((c: string, s: string, isDevis: boolean) => {
    if (isDevis) {
      setQuoteModalDetails({ category: c, subCategory: s });
      setShowQuoteModal(true);
    } else {
      setOrderModalDetails({ category: c, subCategory: s });
      setShowOrderModal(true);
    }
  }, []);
  
  const [realEstatePaymentData, setRealEstatePaymentData] = useState<{
    amount: number;
    listing: RealEstateListing;
    bookingDetails?: any;
  } | null>(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [providerToReview, setProviderToReview] = useState<{id: string, name: string, transactionId: string} | null>(null);
  
  const [showChat, setShowChat] = useState(false);
  const [chatProvider, setChatProvider] = useState<UserProfile | null>(null);
  const [pendingContractDetails, setPendingContractDetails] = useState<{ photoUrl: string, analysis: string } | undefined>(undefined);
  
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderModalDetails, setOrderModalDetails] = useState<{category: string, subCategory: string} | null>(null);
  const [pendingOrderData, setPendingOrderData] = useState<{type: ContractType, description: string, preferredDate?: string, duration?: string} | null>(null);

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteModalDetails, setQuoteModalDetails] = useState<{category: string, subCategory: string} | null>(null);
  const [pendingQuoteData, setPendingQuoteData] = useState<{title: string, description: string, budget?: string, photos: string[]} | null>(null);

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [currentContractType, setCurrentContractType] = useState<ContractType>(ContractType.PIN_POINT);

  const [pendingServiceContract, setPendingServiceContract] = useState<DigitalContract | null>(null);

  const [internshipRequests, setInternshipRequests] = useState<InternshipRequest[]>(MOCK_INTERNSHIP_REQUESTS);
  const [privateInternshipData, setPrivateInternshipData] = useState<PrivateInternshipData[]>([]);
  const [internshipOffers, setInternshipOffers] = useState<InternshipOffer[]>(MOCK_INTERNSHIP_OFFERS);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>(MOCK_DELIVERY_ORDERS);
  const [pendingDeliveryData, setPendingDeliveryData] = useState<Partial<DeliveryOrder> | null>(null);
  const [pendingInternshipData, setPendingInternshipData] = useState<Omit<InternshipRequest, 'id' | 'dateSubmitted' | 'status'> | null>(null);
  const [pendingPrivateInternshipData, setPendingPrivateInternshipData] = useState<Partial<PrivateInternshipData> | null>(null);
  const [adminBalance, setAdminBalance] = useState(0);

  // --- 1. PERSISTENT LOGIN CHECK (TOKEN BASED) ---
  useEffect(() => {
    // Vérification de la session via le token stocké
    const sessionUser = authService.getCurrentUser();
    
    if (sessionUser) {
      setCurrentUser(sessionUser);
      
      // Routage intelligent au démarrage selon le rôle
      if (sessionUser.role === UserRole.PROVIDER) {
         setView(ViewState.PROVIDER_DASHBOARD);
      } else if (sessionUser.subCategory?.includes('Stage')) {
         setView(ViewState.INTERNSHIPS);
      } else {
         // Par défaut pour les clients, on reste sur HOME ou Catalogue
         setView(ViewState.HOME);
      }
    }
    
    setIsLoadingSession(false);
  }, []);

  // --- HANDLERS ---

  const handleRegisterOrLogin = (user: UserProfile) => {
    setCurrentUser(user);
    
    // REDIRECTION INTELLIGENTE APRÈS CONNEXION
    if (
        user.category === 'Communauté & Opportunités' || 
        user.subCategory?.includes('Stage')
    ) {
         setView(ViewState.INTERNSHIPS);
         return;
    }

    if (user.role === UserRole.PROVIDER) {
        setView(ViewState.PROVIDER_DASHBOARD);
    } else {
        setView(ViewState.HOME);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setView(ViewState.HOME);
  };

  const handleSwitchAccount = (newUser: UserProfile) => {
      setCurrentUser(newUser);
      // Re-apply routing logic
      if (newUser.role === UserRole.PROVIDER) {
          setView(ViewState.PROVIDER_DASHBOARD);
      } else {
          setView(ViewState.HOME);
      }
  };

  const handleAddAccountRequest = () => {
      // Pour ajouter un compte, on va vers l'écran d'inscription/connexion
      // SANS déconnecter le compte actuel de la liste 'known_sessions'
      // L'utilisateur pourra alors se connecter à un autre compte
      setView(ViewState.REGISTER);
  };

  const handleRecharge = (amount: number, method: PaymentMethod) => {
      if (!currentUser) return;
      const updatedUser = {
          ...currentUser,
          walletBalance: currentUser.walletBalance + amount,
          transactions: [
              ...currentUser.transactions,
              {
                  id: `dep_${Date.now()}`,
                  date: new Date().toISOString(),
                  amount: amount,
                  fee: 0,
                  netAmount: amount,
                  providerName: `Dépôt via ${method}`,
                  type: 'DEPOSIT',
                  status: 'COMPLETED',
                  method: method
              } as Transaction
          ]
      };
      authService.updateProfile(updatedUser);
      setCurrentUser(updatedUser);
      alert(`Recharge de ${amount} F réussie !`);
  };

  const handleWithdrawal = (amount: number, method: PaymentMethod, phone: string, isUrgent: boolean = false) => {
      if (!currentUser || currentUser.walletBalance < amount) return;
      
      const isCertified = currentUser.isCertified;
      const completedJobs = currentUser.completedJobs || 0;
      const rating = currentUser.rating || 0;
      
      const currentHour = new Date().getHours();
      const isNight = currentHour >= 22 || currentHour < 7;
      
      let status: Transaction['status'] = 'PENDING_ADMIN';
      let aiDecision: Transaction['aiDecision'] = undefined;

      // 1. Logique Standard (Journée ou critères normaux)
      const threshold = isCertified ? 10000 : 5000;
      const isStandardAutoApproved = amount < threshold && completedJobs >= 10;

      if (isStandardAutoApproved) {
          status = 'COMPLETED';
      }

      // 2. Système de Relais IA (Nuit: 22h - 07h)
      if (isNight && status === 'PENDING_ADMIN') {
          const aiThreshold = 15000;
          const isHighTrust = rating >= 4.5 && completedJobs >= 20;
          
          // Vérification Comportement Suspect (Retrait total sur compte récent)
          const isSuspicious = completedJobs < 5 && amount > (currentUser.walletBalance * 0.8);

          if (isHighTrust && amount <= aiThreshold && !isSuspicious) {
              status = 'COMPLETED';
              aiDecision = {
                  handledByAI: true,
                  reason: isUrgent ? "Validation IA : Confiance élevée + Urgence signalée" : "Validation IA : Score de confiance élevé",
                  timestamp: new Date().toISOString()
              };
          } else if (isSuspicious) {
              aiDecision = {
                  handledByAI: true,
                  reason: "Blocage IA : Comportement suspect détecté (Retrait massif sur nouveau compte)",
                  timestamp: new Date().toISOString()
              };
          }
      }

      const updatedUser = {
          ...currentUser,
          walletBalance: currentUser.walletBalance - amount,
          transactions: [
              ...currentUser.transactions,
              {
                  id: `with_${Date.now()}`,
                  date: new Date().toISOString(),
                  amount: amount,
                  fee: 0,
                  netAmount: amount,
                  providerName: `Retrait vers ${method} (${phone})`,
                  type: 'WITHDRAWAL',
                  status: status,
                  method: method,
                  isUrgent: isUrgent,
                  aiDecision: aiDecision
              } as Transaction
          ]
      };

      authService.updateProfile(updatedUser);
      setCurrentUser(updatedUser);
      
      if (status === 'COMPLETED') {
          const msg = aiDecision?.handledByAI 
            ? `Retrait de ${amount} F validé par le Relais IA Nocturne.`
            : `Retrait de ${amount} F validé automatiquement.`;
          alert(msg);
      } else {
          const msg = aiDecision?.handledByAI && aiDecision.reason.includes("Blocage")
            ? "Le Relais IA a suspendu votre retrait pour vérification de sécurité. L'administration traitera votre demande dès 07h00."
            : `Demande de retrait de ${amount} F en attente de validation (Seuil de sécurité).`;
          alert(msg);
      }
  };

  const handleApproveWithdrawal = (userId: string, transactionId: string) => {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const updatedTransactions = user.transactions.map(t => 
          t.id === transactionId ? { ...t, status: 'COMPLETED' as const } : t
      );

      const updatedUser = { ...user, transactions: updatedTransactions };
      authService.updateProfile(updatedUser);
      
      if (currentUser?.id === userId) setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      alert("Retrait approuvé avec succès.");
  };

  const handleRejectWithdrawal = (userId: string, transactionId: string) => {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const transaction = user.transactions.find(t => t.id === transactionId);
      if (!transaction) return;

      const updatedTransactions = user.transactions.map(t => 
          t.id === transactionId ? { ...t, status: 'CANCELLED' as const } : t
      );

      const updatedUser = { 
          ...user, 
          walletBalance: user.walletBalance + transaction.amount,
          transactions: updatedTransactions 
      };
      authService.updateProfile(updatedUser);
      
      if (currentUser?.id === userId) setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      alert("Retrait rejeté. Les fonds ont été retournés au prestataire.");
  };

  const handleHire = (provider: UserProfile) => {
    if (!currentUser) {
      setView(ViewState.REGISTER);
      return;
    }
    setSelectedProvider(provider);
    
    // Si c'est un Livreur Privé, on va vers l'estimateur
    if (provider.subCategory?.includes('Livreur Privé') || provider.jobTitle?.includes('Livreur Privé')) {
        setView(ViewState.DELIVERY_ESTIMATOR);
    } else {
        setServiceMode(ServiceMode.DAILY); 
        setShowPayment(true);
    }
  };

  const handleDiscussAction = async (provider: UserProfile, isQuote: boolean = false) => {
    setChatProvider(provider);

    // If we have pending data from Catalog flow, create the mission now that we have a provider
    if (currentUser) {
      if (pendingOrderData) {
        await jobService.createOrderMission(currentUser, provider, pendingOrderData);
        setPendingOrderData(null);
        setShowChat(true);
        return;
      }
      if (pendingQuoteData) {
        await jobService.createQuoteMission(currentUser, provider, pendingQuoteData);
        setPendingQuoteData(null);
        setShowChat(true);
        return;
      }
    }

    if (isQuote) {
      setQuoteModalDetails({ 
        category: provider.category || 'Services à domicile', 
        subCategory: provider.subCategory || provider.jobTitle || 'Expert APNET'
      });
      setShowQuoteModal(true);
    } else {
      setOrderModalDetails({ 
        category: provider.category || 'Services à domicile', 
        subCategory: provider.subCategory || provider.jobTitle || 'Expert APNET'
      });
      setShowOrderModal(true);
    }
  };

  const handlePaymentConfirm = (amount: number, isExternal: boolean = false, isSubscription: boolean = false) => {
    if (!currentUser) return;
    if (!isSubscription && !selectedProvider) return;

    // 1. Déduction du solde client (Simulation seulement si interne)
    const newBalance = isExternal ? currentUser.walletBalance : currentUser.walletBalance - amount;
    
    const isPlacementContract = currentContractType === ContractType.MONTHLY && !!pendingServiceContract;

    // 2. Création de la transaction pour le CLIENT
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString(),
      amount: amount,
      fee: 0, 
      netAmount: amount,
      providerName: isSubscription 
        ? 'Abonnement Premium APNET'
        : (isPlacementContract
            ? `Placement: ${selectedProvider?.firstName} (Contrat Mensuel)`
            : (pendingDeliveryData 
                ? `Livraison APNET (${pendingDeliveryData.dropoff?.quartier || 'Course'})` 
                : (selectedProvider ? `${selectedProvider.firstName} ${selectedProvider.lastName}` : 'Service'))),
      type: isSubscription ? 'SUBSCRIPTION' : (isExternal ? 'DEPOSIT' : 'PAYMENT'),
      status: (pendingDeliveryData || isPlacementContract) ? 'BLOCKED' : 'COMPLETED',
      referenceId: selectedProvider?.id,
      contractImage: pendingContractDetails?.photoUrl,
      aiAnalysis: pendingContractDetails?.analysis
    };

    // Mise à jour Client
    let updatedUser = { 
        ...currentUser, 
        walletBalance: newBalance,
        pendingBalance: (pendingDeliveryData || isPlacementContract) ? (currentUser.pendingBalance || 0) + amount : currentUser.pendingBalance,
        transactions: [...currentUser.transactions, newTransaction],
        contracts: isPlacementContract ? [...(currentUser.contracts || []), pendingServiceContract] : currentUser.contracts
    };

    // Gestion spécifique Abonnement
    if (isSubscription) {
        updatedUser = {
            ...updatedUser,
            isCertified: true,
            subscription: {
                type_de_prestation: 'ANNUEL',
                date_debut_contrat: new Date().toISOString(),
                date_fin_contrat: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                statut_visibilite: 'ACTIVE',
                renouveller_necessaire: false
            }
        };
        setAdminBalance(prev => prev + amount);
        setShowSubscriptionModal(false);
        alert("Félicitations ! Votre abonnement Premium est activé. Vous bénéficiez maintenant du badge de confiance et de la priorité d'affichage.");
    }
    // Gestion spécifique Immobilier
    else if (realEstatePaymentData) {
        const { listing } = realEstatePaymentData;
        updatedUser = {
            ...updatedUser,
            unlockedRealEstateIds: [...(updatedUser.unlockedRealEstateIds || []), listing.id]
        };
        setRealEstatePaymentData(null);
        
        alert(listing.type === PropertyType.RESIDENCE || listing.type === PropertyType.VILLA_WEEKEND 
            ? "Réservation confirmée ! Le propriétaire a été notifié." 
            : "Contact débloqué ! Vous pouvez maintenant voir les coordonnées.");
    } else if (pendingInternshipData) {
        // LIAISON PAIEMENT-STAGE : Création de la demande après paiement
        const requestId = `req_${Date.now()}`;
        const newReq: InternshipRequest = {
            ...pendingInternshipData,
            id: requestId,
            dateSubmitted: new Date().toISOString(),
            status: InternshipStatus.VALIDATED
        };

        // Sauvegarde sécurisée de la lettre IA dans la collection PRIVEE (Propriété APNET)
        if (pendingPrivateInternshipData?.aiCoverLetter) {
            const privateData: PrivateInternshipData = {
                requestId: requestId,
                aiCoverLetter: pendingPrivateInternshipData.aiCoverLetter
            };
            setPrivateInternshipData(prev => [...prev, privateData]);
        }

        setInternshipRequests(prev => [...prev, newReq]);
        setPendingInternshipData(null);
        setPendingPrivateInternshipData(null);
        alert("Paiement des frais de recherche réussi ! Votre dossier est maintenant prioritaire. APNET s'engage à vous trouver un stage ou à vous rembourser.");
    } else if (pendingDeliveryData) {
        // LIAISON PAIEMENT-LIVRAISON : Création automatique de la commande
        const securityCode = Math.floor(1000 + Math.random() * 9000).toString();
        const newOrder: DeliveryOrder = {
            ...pendingDeliveryData as DeliveryOrder,
            id: `del_${Date.now()}`,
            clientId: currentUser.id,
            clientName: `${currentUser.firstName} ${currentUser.lastName}`,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            securityCode: securityCode
        };
        setDeliveryOrders(prev => [newOrder, ...prev]);
        setPendingDeliveryData(null);
        alert(`Paiement Livraison réussi ! Votre code de sécurité est : ${securityCode}. Donnez-le au livreur à l'arrivée.`);
        setView(ViewState.HOME);
    } else {
        alert(isExternal ? "Paiement Mobile Money réussi et service activé !" : "Somme bloquée sur APNET. Le prestataire a été notifié pour commencer le travail.");
    }
    
    authService.updateProfile(updatedUser); 
    setCurrentUser(updatedUser);

    // 3. Mise à jour du PRESTATAIRE (Simulation Backend)
    console.log(`[BACKEND SIM] Notification envoyée à ${selectedProvider.firstName}: "Paiement de ${amount}F reçu/sécurisé."`);

    // 4. Enregistrement dans Firestore pour le Dashboard
    try {
        addDoc(collection(db, 'transactions'), {
            amount: amount,
            status: realEstatePaymentData ? 'PAID' : 'PENDING',
            description: realEstatePaymentData 
                ? (realEstatePaymentData.listing.type === PropertyType.RESIDENCE ? `Réservation: ${realEstatePaymentData.listing.title}` : `Déblocage: ${realEstatePaymentData.listing.title}`)
                : `Service: ${selectedProvider.firstName}`,
            clientId: currentUser.id,
            prestataireId: selectedProvider.id,
            method: isExternal ? 'MOBILE_MONEY' : 'WALLET',
            createdAt: serverTimestamp(),
            isSimulation: true // On marque comme simulation pour le Dashboard
        });
    } catch (e) {
        console.error("Error adding transaction to Firestore:", e);
    }
    
    // Reset
    setShowPayment(false);
    setSelectedProvider(null);
    setPendingContractDetails(undefined);
    setShowChat(false);
  };

  const handleUnlockFunds = (transactionId: string) => {
      if (!currentUser) return;

      // Retrouver la transaction
      const transaction = currentUser.transactions.find(t => t.id === transactionId);
      if (!transaction || transaction.status !== 'BLOCKED') return;

      // 1. Calcul des frais (Commission % + Frais de maintenance fixe)
      const commission = Math.round(transaction.amount * SERVICE_FEE_PERCENTAGE);
      const fee = commission + PLATFORM_MAINTENANCE_FEE;
      const netAmount = transaction.amount - fee;

      // 2. Update Transaction Status Client Side
      const updatedTransactions = currentUser.transactions.map(t => 
          t.id === transactionId ? { ...t, status: 'COMPLETED' as const } : t
      );
      
      const updatedUser = { ...currentUser, transactions: updatedTransactions };
      authService.updateProfile(updatedUser);
      setCurrentUser(updatedUser);

      // 3. Update Provider Wallet (Simulation Backend)
      // Ici, on simule que le backend reçoit l'ordre de libérer les fonds
      // Le provider recevrait netAmount dans son walletBalance
      setAdminBalance(prev => prev + fee);
      console.log(`[BACKEND SIM] Fonds libérés pour le prestataire. Montant Net: ${netAmount}F (Frais: ${fee}F reversés à l'admin)`);
      
      // 4. Prompt for review
      if (transaction.referenceId) {
          setProviderToReview({ 
              id: transaction.referenceId, 
              name: transaction.providerName, 
              transactionId: transaction.id 
          });
          setShowReviewModal(true);
      }

      alert("Travail confirmé ! Les fonds ont été versés au prestataire.");
  };

  const handleDeposit = (amount: number, method: PaymentMethod) => {
    if (!currentUser) return;
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString(),
      amount: amount,
      fee: 0,
      netAmount: amount,
      providerName: 'Recharge Compte',
      type: 'DEPOSIT',
      status: 'COMPLETED',
      method: method
    };
    const updatedUser = { 
        ...currentUser, 
        walletBalance: currentUser.walletBalance + amount,
        transactions: [...currentUser.transactions, newTransaction]
    };
    
    authService.updateProfile(updatedUser); // SAVE TO STORAGE
    setCurrentUser(updatedUser);
  };

  // ... (Other handlers kept mostly same, but ensure they use authService if they modify user)

  if (isLoadingSession) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <Logo size="lg" className="mb-6" />
          <div className="text-sm text-gray-500 font-medium animate-pulse">Vérification de la session sécurisée...</div>
      </div>
  );

  const filteredProviders = users.filter(user => {
      if (user.role !== UserRole.PROVIDER) return false;
      // KYC Security: Unverified providers are hidden from the public
      if (user.status === UserStatus.EN_ATTENTE_DE_VALIDATION && currentUser?.role !== UserRole.ADMIN) return false;
      if (category && user.category !== category) return false;
      if (subCategory && user.subCategory !== subCategory) return false;
      if (location && user.location.commune !== location && user.location.city !== location) return false;
      return true;
  }).sort((a, b) => (b.isCertified ? 1 : 0) - (a.isCertified ? 1 : 0));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-brand-orange selection:text-white">
          {/* CRITICAL MODALS (TOP LEVEL) */}
          <AnimatePresence>
            {showOrderModal && orderModalDetails && (
              <UniversalOrderModal 
                onClose={closeOrderModal}
                category={orderModalDetails.category}
                subCategory={orderModalDetails.subCategory}
                onSubmit={async (details) => {
                  setPendingOrderData(details);
                  setCurrentContractType(details.type);
                  setShowOrderModal(false);
                  
                  if (!currentUser) {
                    setView(ViewState.REGISTER);
                  } else {
                    if (chatProvider) {
                        await jobService.createOrderMission(currentUser, chatProvider, details);
                        setPendingOrderData(null);
                        setShowChat(true);
                    } else {
                        alert(`Votre commande pour ${orderModalDetails.subCategory} (${details.type}) est enregistrée. Choisissez maintenant votre prestataire.`);
                        setView(ViewState.FIND_WORKER);
                    }
                  }
                }}
              />
            )}

            {showQuoteModal && quoteModalDetails && (
              <QuoteRequestModal 
                onClose={closeQuoteModal}
                category={quoteModalDetails.category}
                subCategory={quoteModalDetails.subCategory}
                onSubmit={async (details) => {
                  setPendingQuoteData(details);
                  setShowQuoteModal(false);
                  
                  if (!currentUser) {
                    setView(ViewState.REGISTER);
                  } else {
                    if (chatProvider) {
                        await jobService.createQuoteMission(currentUser, chatProvider, details);
                        setPendingQuoteData(null);
                        setShowChat(true);
                    } else {
                        alert(`Votre demande de devis pour "${details.title}" est enregistrée. Choisissez maintenant un artisan pour chiffrer votre projet.`);
                        setView(ViewState.FIND_WORKER);
                    }
                  }
                }}
              />
            )}

            {showPayment && selectedProvider && (
                <PaymentModal 
                  provider={selectedProvider}
                  balance={currentUser?.walletBalance || 0}
                  currentUser={currentUser}
                  onClose={closePaymentModal}
                  onConfirm={(amt, ext) => handlePaymentConfirm(amt, ext, false)}
                  isUnlockFee={serviceMode === ServiceMode.LONG_TERM}
                  contractType={currentContractType}
                />
            )}

            {showSubscriptionModal && currentUser && (
                <PaymentModal 
                  balance={currentUser.walletBalance}
                  currentUser={currentUser}
                  onClose={closeSubscriptionModal}
                  onConfirm={(amt, ext) => handlePaymentConfirm(amt, ext, true)}
                  isSubscription={true}
                />
            )}

            {showChat && chatProvider && currentUser && (
                <ChatModal 
                  provider={chatProvider}
                  client={currentUser}
                  onClose={closeChatModal}
                  onPayRequest={(amount, contractDetails, contract) => {
                      setSelectedProvider(chatProvider);
                      setPendingContractDetails(contractDetails);
                      if (contract) setPendingServiceContract(contract);
                      setShowPayment(true);
                  }}
                  contractType={currentContractType}
                  initialRequest={pendingOrderData ? { ...pendingOrderData, isQuote: false } : (pendingQuoteData ? { ...pendingQuoteData, isQuote: true, type: ContractType.PIN_POINT } : undefined)}
                />
            )}
          </AnimatePresence>

          <SecurityBanner />
          <Header 
            currentView={view} 
            setView={(v) => setView(v, v === ViewState.HOME)} 
            currentUser={currentUser} 
          />

          <main className="flex-grow overflow-x-hidden">
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={view}
                    custom={direction}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="w-full"
                >
            {view === ViewState.HOME && (
              <div className="flex flex-col space-y-0">
                <Hero setView={setView} currentUser={currentUser} />
                
                <AdCarousel 
                  ads={adService.getAllAds()} 
                  zone="TOP"
                  slotId="PROMO_HEADER"
                  onInteract={adService.trackInteraction}
                />

                <OfficialMessage />

                <CategoryGrid 
                  setView={setView} 
                  onSelectCategory={(cat) => {
                    setCategory(cat);
                    setView(ViewState.FIND_WORKER);
                  }} 
                />

                {/* --- FEED: IMMOBILIER À LA UNE --- */}
                <RealEstateFeed 
                  onSelect={(listing) => {
                    // Logic to view the listing in RealEstateModule view
                    // We can pass the listing ID via some global or local state if needed
                    // For now, let's just go to REAL_ESTATE view
                    setView(ViewState.REAL_ESTATE);
                  }} 
                />

                {/* --- FEED: MIXITÉ BANNIÈRE --- */}
                <AdCarousel 
                  ads={adService.getAllAds()} 
                  zone="MIDDLE"
                  slotId="PROMO_APNET_VIDEO"
                  onInteract={adService.trackInteraction}
                  onQuoteRequest={(c, s) => {
                    setQuoteModalDetails({ category: c, subCategory: s });
                    setShowQuoteModal(true);
                  }}
                />

                {/* --- FEED: TRAVAUX TERMINÉS --- */}
                <WorksFeed />

                <div className="max-w-7xl mx-auto px-4 py-12">
                  {currentUser?.role !== UserRole.PROVIDER && (
                    <>
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-black tracking-tight">Prestataires d'Exception</h2>
                          <button onClick={() => setView(ViewState.FIND_WORKER)} className="text-brand-orange font-bold text-sm hover:underline">Voir tout</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {users
                            .filter(u => u.role === UserRole.PROVIDER && (u.status !== UserStatus.EN_ATTENTE_DE_VALIDATION || currentUser?.role === UserRole.ADMIN))
                            .sort((a, b) => (b.isCertified ? 1 : 0) - (a.isCertified ? 1 : 0))
                            .slice(0, 4)
                            .map(p => (
                              <ProviderCard 
                                key={p.id} 
                                provider={p} 
                                onHire={handleHire} 
                                onDiscuss={handleDiscussAction}
                                serviceMode={ServiceMode.DAILY}
                                currentUser={currentUser}
                              />
                          ))}
                      </div>
                    </>
                  )}
                </div>

                {/* --- FEED: MIXITÉ BANNIÈRE 2 --- */}
                <AdCarousel 
                  ads={adService.getAllAds()} 
                  zone="BOTTOM"
                  slotId="PROMO_PARTENAIRE_IMAGE"
                  onInteract={adService.trackInteraction}
                  onQuoteRequest={(c, s) => {
                    setQuoteModalDetails({ category: c, subCategory: s });
                    setShowQuoteModal(true);
                  }}
                />

                {/* --- FEED: DEVENIR PROPRIÉTAIRE --- */}
                <LandlordOnboardingForm />

                <Features />
                <CertifiedCompanies />
                <SafetyTips />
                <AdvertiserCTA />
              </div>
            )}

            {view === ViewState.CATALOG && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <ServiceCatalog 
                        setView={setView}
                        onSelectService={handleSelectService}
                        onRequestOrder={handleRequestOrder}
                    />
                </div>
            )}

            {view === ViewState.SMART_SEARCH && (
                <div className="max-w-7xl mx-auto px-4 pt-6 pb-20">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <SmartSearch 
                        onContact={(provider) => {
                            setSelectedProvider(provider);
                            if (currentUser) {
                                setShowChat(true);
                            } else {
                                setView(ViewState.REGISTER);
                            }
                        }}
                    />
                </div>
            )}

            {view === ViewState.FIND_WORKER && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <Filters 
                        category={category} setCategory={setCategory}
                        subCategory={subCategory} setSubCategory={setSubCategory}
                        specialization={specialization} setSpecialization={setSpecialization}
                        location={location} setLocation={setLocation}
                        minRating={minRating} setMinRating={setMinRating}
                        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                        requiredCertification={requiredCertification} setRequiredCertification={setRequiredCertification}
                        availability={availability} setAvailability={setAvailability}
                        language={language} setLanguage={setLanguage}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredProviders.map(p => (
                            <ProviderCard 
                                key={p.id} 
                                provider={p} 
                                onHire={handleHire}
                                onDiscuss={handleDiscussAction}
                                serviceMode={serviceMode}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* AUTH / REGISTER / LOGIN PORTAL */}
            {view === ViewState.REGISTER && (
                <div className="py-12 px-4 bg-gray-50 min-h-screen">
                    <div className="max-w-2xl mx-auto mb-6">
                        <BackButton onClick={handleBack} label="Retour" className="mb-6" />
                    </div>
                    <RegistrationForm onRegister={handleRegisterOrLogin} />
                </div>
            )}

            {/* WALLET */}
            {view === ViewState.WALLET && currentUser && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <WalletView 
                        currentUser={currentUser}
                        onRecharge={handleRecharge}
                        onWithdraw={handleWithdrawal}
                        onCloseWelcome={() => {
                            const updatedUser = { ...currentUser, hasSeenWalletWelcome: true };
                            authService.updateProfile(updatedUser);
                            setCurrentUser(updatedUser);
                        }}
                    />
                </div>
            )}

            {view === ViewState.DASHBOARD && currentUser && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <Dashboard currentUser={currentUser} />
                </div>
            )}

            {/* ESPACES MÉTIERS */}
            {view === ViewState.PROVIDER_DASHBOARD && currentUser && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <ProviderDashboard currentUser={currentUser} setView={setView} />
                </div>
            )}

            {view === ViewState.PROFILE && currentUser && (
                <div className="relative">
                    <div className="max-w-7xl mx-auto px-4 pt-6">
                        <BackButton onClick={handleBack} className="mb-6" />
                    </div>
                    <UserProfileView 
                        user={currentUser} 
                        onSwitchAccount={handleSwitchAccount}
                        onAddAccount={handleAddAccountRequest}
                        onLogout={handleLogout}
                    />
                    <div className="max-w-3xl mx-auto px-4 pb-8 text-center">
                        <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-bold border border-red-200 px-6 py-2 rounded-full mt-4">
                            Déconnexion Complète
                        </button>
                    </div>
                </div>
            )}

            {view === ViewState.MESSAGES && currentUser && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <MessagesView currentUser={currentUser} />
                </div>
            )}

            {view === ViewState.RECRUITER_SPACE && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <RecruiterSpace 
                        currentUser={currentUser} 
                        setView={setView} 
                        offers={internshipOffers}
                        allApplications={internshipRequests.map(r => ({
                            id: r.id,
                            offerId: 'off_1', 
                            studentId: r.studentId || r.id,
                            studentName: r.fullName,
                            studentLocation: `${r.location.city}, ${r.location.commune || ''} ${r.location.quartier}`,
                            studentSkills: [r.field],
                            status: r.status as unknown as ApplicationStatus, 
                            appliedAt: r.dateSubmitted,
                            isPremium: !!r.isPremium,
                            offerTitle: r.offerTitle
                        }))}
                        privateInternshipData={privateInternshipData}
                        onPostOffer={(offer) => {
                            const newOffer: InternshipOffer = {
                                ...offer,
                                id: `off_${Date.now()}`,
                                postedAt: new Date().toISOString(),
                                status: 'PENDING_VALIDATION'
                            };
                            setInternshipOffers([...internshipOffers, newOffer]);
                            alert("Offre soumise ! Elle sera visible après validation par l'équipe APNET.");
                        }}
                        onUpdateApplicationStatus={(id, status) => {
                            setInternshipRequests(prev => prev.map(r => r.id === id ? { ...r, status: status as unknown as InternshipStatus } : r));
                        }}
                        onLogin={(user) => {
                            setCurrentUser(user);
                            localStorage.setItem('apnet_current_user', JSON.stringify(user));
                        }}
                        onSubscribe={() => {
                            if (!currentUser) { setView(ViewState.REGISTER); return; }
                            setShowSubscriptionModal(true);
                        }}
                    />
                </div>
            )}

            {view === ViewState.INTERNSHIPS && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <InternshipModule 
                        currentUser={currentUser}
                        userRequests={internshipRequests.filter(r => r.studentId === currentUser?.id)} 
                        offers={internshipOffers}
                        onSubmitRequest={(req, privateData) => {
                            if (!currentUser) { setView(ViewState.REGISTER); return; }
                            setPendingInternshipData(req);
                            if (privateData) setPendingPrivateInternshipData(privateData);
                            setSelectedProvider({
                                id: 'apnet_internship_service',
                                firstName: "APNET",
                                lastName: "Stages",
                                jobTitle: "Service Recherche de Stage",
                                role: UserRole.PROVIDER,
                                photoUrl: "https://ais-pre-sj36nhezt2gmp3dgebo46m-185123666437.europe-west2.run.app/favicon.ico",
                                location: { city: 'Abidjan', quartier: 'Plateau' },
                                phone: "",
                                whatsapp: "",
                                verified: true,
                                description: "Frais de recherche de stage (Remboursable si aucun résultat)",
                                walletBalance: 0,
                                transactions: []
                            } as UserProfile);
                            setServiceMode(ServiceMode.DAILY);
                            setShowPayment(true);
                        }}
                        onPayFee={(reqId) => alert(`Paiement pour demande ${reqId}`)}
                        setView={setView}
                    />
                </div>
            )}

            {view === ViewState.REAL_ESTATE && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <RealEstateModule 
                        setView={setView} 
                        currentUser={currentUser} 
                        onPaymentRequest={(amount, listing, bookingDetails) => {
                           if (!currentUser) { setView(ViewState.REGISTER); return; }
                           setRealEstatePaymentData({ amount, listing, bookingDetails });
                           setSelectedProvider({
                              id: listing.ownerId, 
                              firstName: "Propriétaire", 
                              lastName: "Immo", 
                              jobTitle: "Agent Immobilier APNET",
                              role: UserRole.PROVIDER,
                              photoUrl: listing.photos[0], 
                              location: listing.location, 
                              phone: "", 
                              whatsapp: "", 
                              verified: true, 
                              description: "", 
                              walletBalance: 0, 
                              transactions: []
                           } as UserProfile);
                           setServiceMode(ServiceMode.LONG_TERM);
                           setShowPayment(true);
                        }}
                    />
                </div>
            )}

            {view === ViewState.DELIVERY_ESTIMATOR && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <DeliveryEstimator 
                        step={deliveryStep}
                        onStepChange={setDeliveryStep}
                        provider={selectedProvider}
                        currentUser={currentUser}
                        isBadWeather={isBadWeather}
                        onOrder={(orderData) => {
                            if(!currentUser) { setView(ViewState.REGISTER); return; }
                            
                            // Préparation de la commande
                            setPendingDeliveryData(orderData);
                            
                            // Si aucun prestataire n'est sélectionné (cas improbable avec le nouveau flux), on met un fallback
                            if (!selectedProvider) {
                                setSelectedProvider({
                                    id: 'apnet_delivery_service',
                                    firstName: 'Livreur',
                                    lastName: 'Privé',
                                    jobTitle: 'Logistique APNET',
                                    role: UserRole.PROVIDER,
                                    photoUrl: 'https://ui-avatars.com/api/?name=Livreur+Prive&background=f97316&color=fff',
                                    location: { city: 'Abidjan' },
                                    phone: '',
                                    whatsapp: '',
                                    verified: true,
                                    description: 'Service de livraison APNET',
                                    walletBalance: 0,
                                    transactions: []
                                } as UserProfile);
                            }
                            
                            setServiceMode(ServiceMode.DAILY);
                            setShowPayment(true);
                        }}
                    />
                </div>
            )}

            {view === ViewState.DELIVERY_TRACKING && currentUser && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <DeliveryTracking 
                        currentUser={currentUser} 
                        onCancelOrder={(orderId) => {
                            const order = deliveryOrders.find(o => o.id === orderId);
                            if (!order) return;

                            if (order.status === 'COMPLETED' || order.status === 'CANCELLED') return;

                            let fee = 0;
                            // Si le livreur a accepté (et donc potentiellement commencé à se déplacer)
                            if (order.status === 'ACCEPTED' || order.status === 'PICKED_UP') {
                                fee = 500;
                            }

                            setDeliveryOrders(prev => prev.map(o => 
                                o.id === orderId ? { ...o, status: 'CANCELLED' } : o
                            ));

                            // Remboursement client (moins frais éventuels)
                            const refundAmount = order.price - fee;
                            const updatedUser = { 
                                ...currentUser, 
                                walletBalance: currentUser.walletBalance + refundAmount,
                                pendingBalance: (currentUser.pendingBalance || 0) - order.price,
                                transactions: [
                                    ...currentUser.transactions,
                                    {
                                        id: `tx_refund_${Date.now()}`,
                                        date: new Date().toISOString(),
                                        amount: refundAmount,
                                        fee: fee,
                                        netAmount: refundAmount,
                                        providerName: fee > 0 ? 'Remboursement partiel (Frais d\'annulation déduits)' : 'Remboursement intégral course annulée',
                                        type: 'REFUND',
                                        status: 'COMPLETED'
                                    } as Transaction
                                ]
                            };
                            authService.updateProfile(updatedUser);
                            setCurrentUser(updatedUser);
                            
                            if (fee > 0) {
                                alert(`Course annulée. Dédommagement de ${fee}F versé au livreur. ${refundAmount}F retournés sur votre solde.`);
                            } else {
                                alert("Course annulée. Montant intégral remboursé sur votre solde.");
                            }
                        }}
                        onReportDispute={(orderId, reason, notes, photos) => {
                            setDeliveryOrders(prev => prev.map(o => 
                                o.id === orderId ? { 
                                    ...o, 
                                    status: 'DISPUTED', 
                                    isReported: true, 
                                    reportReason: reason,
                                    disputeNotes: notes,
                                    disputePhotos: photos,
                                    isFrozen: true
                                } : o
                            ));
                            alert("Litige ouvert. Le paiement est gelé. L'administration va examiner vos preuves.");
                        }}
                    />
                </div>
            )}

            {view === ViewState.RIDER_JOB_BOARD && currentUser && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <RiderJobBoard 
                        orders={deliveryOrders}
                        currentUser={currentUser}
                        onAcceptOrder={(orderId) => {
                            setDeliveryOrders(prev => prev.map(o => 
                                o.id === orderId ? { 
                                    ...o, 
                                    status: 'ACCEPTED', 
                                    acceptedBy: currentUser.id, 
                                    acceptedAt: new Date().toISOString(),
                                    riderName: `${currentUser.firstName} ${currentUser.lastName}`,
                                    riderPhone: currentUser.phone
                                } : o
                            ));
                            alert("Course acceptée ! Allez chercher le colis.");
                        }}
                        onPickupOrder={(orderId) => {
                            setDeliveryOrders(prev => prev.map(o => 
                                o.id === orderId ? { ...o, status: 'PICKED_UP' } : o
                            ));
                        }}
                        onReportProblem={(orderId, reason) => {
                            const isSuspicious = reason.includes("COLIS_SUSPECT");
                            setDeliveryOrders(prev => prev.map(o => 
                                o.id === orderId ? { 
                                    ...o, 
                                    status: isSuspicious ? 'CANCELLED' : 'DISPUTED', 
                                    isReported: true, 
                                    reportReason: reason,
                                    isFrozen: !isSuspicious // Suspicious cancellation doesn't need to freeze payment since it's not accepted yet
                                } : o
                            ));
                            
                            if (isSuspicious) {
                                alert(`🚨 ALERTE SÉCURITÉ : La course a été annulée. Une notification de non-conformité a été envoyée au client. L'administration APNET a été alertée.`);
                            } else {
                                alert(`Signalement enregistré : ${reason}. Le paiement est gelé pour vérification admin.`);
                            }
                        }}
                        onCompleteOrder={(orderId, code) => {
                            const order = deliveryOrders.find(o => o.id === orderId);
                            if (!order) return;

                            if (code === order.securityCode) {
                                setDeliveryOrders(prev => prev.map(o => 
                                    o.id === orderId ? { ...o, status: 'COMPLETED' } : o
                                ));
                                
                                // Simulation versement livreur + Points
                                const pointsEarned = RIDER_POINTS.ORDER_COMPLETED + (isBadWeather ? RIDER_POINTS.BAD_WEATHER_BONUS : 0);
                                
                                const updatedUser = { 
                                    ...currentUser, 
                                    walletBalance: currentUser.walletBalance + order.riderGain,
                                    riderStats: currentUser.riderStats ? {
                                        ...currentUser.riderStats,
                                        reliabilityPoints: (currentUser.riderStats.reliabilityPoints || 0) + pointsEarned,
                                        totalDeliveries: currentUser.riderStats.totalDeliveries + 1,
                                        weeklyDeliveries: (currentUser.riderStats.weeklyDeliveries || 0) + 1,
                                    } : undefined,
                                    transactions: [
                                        ...currentUser.transactions,
                                        {
                                            id: `inc_${Date.now()}`,
                                            date: new Date().toISOString(),
                                            amount: order.riderGain,
                                            fee: order.price - order.riderGain,
                                            netAmount: order.riderGain,
                                            providerName: `Course Livrée (${order.vehicleType})`,
                                            type: 'INCOME',
                                            status: 'COMPLETED',
                                            supplementAmount: order.hasLoadingService ? 3000 : 0
                                        } as Transaction
                                    ]
                                };

                                // Level Progression Check
                                if (updatedUser.riderStats) {
                                    const stats = updatedUser.riderStats;
                                    if (stats.reliabilityPoints >= 1500 && stats.rating >= 4.6) {
                                        stats.level = RiderLevel.EXPERT;
                                    } else if (stats.reliabilityPoints >= 500 && stats.rating >= 4.2) {
                                        stats.level = RiderLevel.PRO;
                                    }
                                }

                                authService.updateProfile(updatedUser);
                                setCurrentUser(updatedUser);
                                
                                alert(`Course terminée ! ${order.riderGain} F ajoutés et +${pointsEarned} points de fiabilité.`);
                            } else {
                                alert("Code incorrect. L'argent reste bloqué.");
                            }
                        }}
                    />
                </div>
            )}

            {view === ViewState.ADMIN && currentUser?.role === UserRole.ADMIN && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <AdminDashboard 
                        balance={adminBalance}
                        transactions={transactions} 
                        users={users}
                        onWithdraw={() => alert('Withdraw Admin Funds')}
                        onVerifyUser={(uid) => {
                            setUsers(prev => prev.map(u => u.id === uid ? { ...u, verified: true } : u));
                            alert('Utilisateur vérifié avec succès.');
                        }}
                        proFeedbacks={[]} 
                        clientReviews={[]} 
                        internshipRequests={internshipRequests}
                        privateInternshipData={privateInternshipData}
                        onUpdateInternshipStatus={(id, status, company) => {
                            setInternshipRequests(prev => prev.map(r => r.id === id ? { ...r, status, matchedCompany: company } : r));
                        }}
                        internshipOffers={internshipOffers}
                        onUpdateOfferStatus={(id, status, reason) => {
                            setInternshipOffers(prev => prev.map(o => o.id === id ? { ...o, status } : o));
                            if (status === 'APPROVED') {
                                alert("L'offre a été validée et est maintenant en ligne.");
                            } else {
                                alert(`L'offre a été rejetée. Motif envoyé par WhatsApp : ${reason}`);
                            }
                        }}
                        onApproveWithdrawal={handleApproveWithdrawal}
                        onRejectWithdrawal={handleRejectWithdrawal}
                        isBadWeather={isBadWeather}
                        onToggleBadWeather={setIsBadWeather}
                    />
                </div>
            )}

            {view === ViewState.TERMS && (
                <div className="max-w-7xl mx-auto px-4 pt-6">
                    <BackButton onClick={handleBack} className="mb-6" />
                    <TermsOfService />
                </div>
            )}

                </motion.div>
            </AnimatePresence>
          </main>

          <Footer setView={(v) => setView(v, v === ViewState.HOME)} currentUser={currentUser} />
    </div>
  );
}
