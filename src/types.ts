
export enum MissionStatus {
  REQUESTED = 'REQUESTED',   // Devis envoyé
  ORDERED = 'ORDERED',       // Commande passée (date/durée fixée)
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export interface Mission {
  id: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  providerMatricule: string; // Matricule Professionnel (Ex: APN-MACO-0012)
  
  category: string;
  subCategory: string;
  
  type: 'ORDER' | 'QUOTE';
  contractType: ContractType; // Ponctuelle / Mensuelle
  
  title?: string; // For quotes
  description: string;
  
  preferredDate?: string; // For orders (Ponctuelle)
  duration?: string; // For orders (Monthly)
  
  amount?: number; // Montant payé ou estimatif
  
  photosBefore: string[];
  photosAfter: string[];
  
  status: MissionStatus;
  createdAt: string;
  updatedAt: string;
  
  completionDate?: string;
  isPaid: boolean;
  transactionId?: string;
}

export enum UserRole {
  PROVIDER = 'PROVIDER', // Prestataire
  SEEKER = 'SEEKER',     // Demandeur
  ADMIN = 'ADMIN',       // Administrateur APNET
  COMPANY = 'COMPANY',   // Entreprise / Recruteur
  LANDLORD = 'LANDLORD', // Propriétaire Immobilier
}

export enum UserStatus {
  EN_ATTENTE_DE_VALIDATION = 'EN_ATTENTE_DE_VALIDATION',
  VERIFIE = 'VERIFIE',
  REJETE = 'REJETE',
}

export enum ContractType {
  PIN_POINT = 'PONCTUELLE', // Prestation ponctuelle
  MONTHLY = 'MENSUELLE',  // Contrat mensuel (Placement)
}

export enum ServiceMode {
  DAILY = 'DAILY',           // Prestation journalière (Paiement séquestre)
  LONG_TERM = 'LONG_TERM',   // Contrat longue durée (Frais de déblocage 1000F ou PASS)
}

export enum JobType {
  FULL_TIME = 'Emploi permanent',
  PART_TIME = 'Mission ponctuelle',
  APPRENTICESHIP = 'Apprentissage / Stage',
}

export enum JobUrgency {
  URGENT = 'Urgent',
  STANDARD = 'Standard',
  FLEXIBLE = 'Flexible',
}

export interface Location {
  city: string;
  commune?: string; // Only for Abidjan
  quartier: string;
}

export enum PaymentMethod {
  WAVE = 'WAVE',
  ORANGE_MONEY = 'ORANGE_MONEY',
  MTN_MONEY = 'MTN_MONEY',
  MOOV_MONEY = 'MOOV_MONEY',
  CARD = 'CARD'
}

export interface WithdrawalMethod {
  id: string;
  network: PaymentMethod;
  phoneNumber: string;
  fullName: string; // Nom sur le compte mobile money
  isVerified: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  fee: number; // The fee taken
  netAmount: number; // Amount held in escrow or paid
  providerName: string; // Name of the other party or description
  type: 'PAYMENT' | 'REFUND' | 'DEPOSIT' | 'COMMISSION' | 'WITHDRAWAL' | 'INCOME' | 'SUBSCRIPTION';
  status: 'COMPLETED' | 'PENDING_VALIDATION' | 'BLOCKED' | 'CANCELLED' | 'PENDING_ADMIN';
  method?: PaymentMethod; // For deposits
  isUrgent?: boolean; // For withdrawals (Health/Family)
  aiDecision?: {
    handledByAI: boolean;
    reason: string;
    timestamp: string;
  };
  referenceJobId?: string; // Link to a specific job/service
  referenceId?: string; // Link between payer and payee transactions (usually Provider ID)
  
  // NEW: Contract & AI Fields
  contractImage?: string; // URL of the work photo
  aiAnalysis?: string; // Result of the AI analysis
  supplementAmount?: number; // For extra services like loading help
}

export type ReferenceStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';

export interface Reference {
  id: string;
  title: string;
  description: string;
  date: string;
  clientName?: string; // Optional
  status: ReferenceStatus;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

// --- ADVERTISEMENT REVIEW TYPE ---
export interface AdReview {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: number; // timestamp
}

export interface Advertisement {
  id: string;
  sponsorName: string; // Nom de l'entreprise
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl: string; // Lien externe ou WhatsApp
  targetCategory?: string; // Si défini, s'affiche uniquement pour cette catégorie
  zone: 'TOP' | 'MIDDLE' | 'BOTTOM'; // Zone d'affichage sur la page d'accueil
  slotId?: string; // Identifiant unique de l'emplacement (ex: PROMO_APNET_VIDEO)
  format: 'BANNER' | 'CARD';
  startDate: string;
  endDate: string;
  views: number; // Analytics simulés
  clicks: number; // Analytics simulés
  
  // NEW: Social Proof
  likes: string[]; // Array of User IDs
  reviews: AdReview[];
}

// Delivery Types
export interface DeliveryQuote {
  prix_total: number;
  gain_livreur: number;
  gain_apnet: number;
  apnet_fixed_fee: number; // 100F
  apnet_commission: number; // % commission
  hasLoadingService?: boolean;
  promoLabel?: string | null;
  details: {
    zone: string;
    distance: string;
    supplements: string[];
    riskPremium?: number; // Prime de risque
  };
}

// --- DELIVERY JOB BOARD TYPES (NEW) ---
export enum VehicleType {
  MOTO = 'Moto',
  TRICYCLE = 'Tricycle',
  VOITURE = 'Voiture',
  CAMIONNETTE = 'Camionnette',
  CARGO = 'Cargo',
  CAMION = 'Camion'
}

export interface DeliveryOrder {
  id: string;
  clientId: string;
  clientName: string;
  pickup: Location;
  dropoff: Location;
  distanceKm: number;
  price: number; // Total price
  riderGain: number; // 85%
  status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  acceptedBy?: string; // Rider ID
  acceptedAt?: string; // ISO Date when rider accepted
  riderName?: string;
  riderPhone?: string;
  createdAt: string;
  description: string; // e.g., "Colis fragile", "Enveloppe"
  clientPhone?: string;
  senderPhone?: string;
  receiverPhone?: string;
  
  // SECURITY & COMPLIANCE
  isReported?: boolean;
  reportReason?: string;
  disputeNotes?: string;
  disputePhotos?: string[];
  isFrozen?: boolean;
  cancellationFeeApplied?: boolean;
  
  // VEHICLE TYPE INTEGRATION
  vehicleType?: VehicleType;
  packageContent?: string;
  legalComplianceAccepted?: boolean;

  // RISK PREMIUM & SECURITY
  isPrecious?: boolean;
  declaredValue?: number;
  hasLoadingService?: boolean;
  maxRefund?: number; // 50% of declared value
  pickupPhoto?: string; // URL/Blob of photo taken at pickup
  dropoffPhoto?: string; // URL/Blob of photo taken at dropoff
  securityCode?: string; // OTP code for delivery validation
}

// Rider Feedback Type
export interface RiderFeedback {
  id: string;
  riderId?: string; // Optionnel si anonyme
  category: 'SECURITY' | 'APP' | 'PAYMENT' | 'OTHER';
  message: string;
  date: string;
}

// --- RIDER LEVEL SYSTEM TYPES ---

export enum RiderLevel {
  BEGINNER = 'Débutant',
  PRO = 'Pro',
  EXPERT = 'Expert'
}

export interface RiderStats {
  level: RiderLevel;
  reliabilityPoints: number; // Score de Fiabilité
  totalDeliveries: number;
  monthlyDeliveries: number; // For bonuses
  weeklyDeliveries: number; // For bonuses
  rating: number; // Average rating for level calculation
  lastLevelUpdate: string; // Date ISO
}

// --- REAL ESTATE TYPES ---

export enum PropertyType {
  RENT = 'Maison à louer',
  SALE = 'Maison à vendre',
  RESIDENCE = 'Résidence Meublée',
  VILLA_WEEKEND = 'Villa (Week-end)',
  ROOM = 'Chambre à louer' // NOUVEAU TYPE POUR CHAMBRES
}

export enum LandlordServiceLevel {
  BASIC = 'BASIC',
  SECURE = 'SECURE',
  PREMIUM = 'PREMIUM'
}

export interface PropertyReview {
  id: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  ownerResponse?: string;
}

export interface RealEstateListing {
  id: string;
  ownerId: string;
  type: PropertyType;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: Location;
  features: {
    rooms: number;
    bathrooms: number;
    surface?: number; // m2
    furnished: boolean;
    pool: boolean;
    wifi: boolean;
    airConditioning?: boolean;
    parking?: boolean;
    capacity?: number;
    utilitiesIncluded?: boolean;
    sharedAmenities?: string[];
    houseRules?: string;
  };
  landlordServiceLevel?: LandlordServiceLevel;
  photos: string[]; // Array of URLs
  availability: string[]; // Dates or "Available"
  reviews: PropertyReview[];
  rating: number; // Avg rating
  isPromoted?: boolean;
  isActive?: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Landlord {
  id?: string;
  name: string;
  phone: string;
  location: string;
  status: 'PENDING' | 'VALIDATED';
  createdAt: string;
}

export interface CompletedWork {
  id: string;
  workerName: string;
  workType: string;
  location: string;
  timestamp: string;
  amount?: number;
}

// --- INTERNSHIP TYPES ---

export enum InternshipType {
  VALIDATION = 'Stage de Validation',
  DISCOVERY = 'Stage de Découverte',
  PROFESSIONAL = 'Stage Professionnel'
}

export enum InternshipStatus {
  PENDING = 'EN_ATTENTE',
  MATCHED = 'TROUVE', // Stage trouvé par APNET, en attente de paiement
  VALIDATED = 'VALIDE', // Payé et infos transmises
  REJECTED = 'REJETE'
}

export interface InternshipRequest {
  id: string;
  studentId?: string; // Optional if guest
  fullName: string;
  email: string; // GMAIL mandatory
  field: string; // Filière
  type: InternshipType;
  location: Location;
  phone: string;
  cvUrl: string; // Mock URL or Blob URL
  status: InternshipStatus;
  dateSubmitted: string;
  matchedCompany?: string; // Filled by Admin when status -> MATCHED
  companyId?: string; // ID of the company linked (for security rules)
  offerTitle?: string;
  isPremium?: boolean;
}

// Propriété exclusive d'APNET - Interdit à l'étudiant
export interface PrivateInternshipData {
  requestId: string;
  aiCoverLetter: string;
  adminNotes?: string;
}

// --- ADMIN & FEEDBACK TYPES ---

// Internal notes for Admins about Users
export interface AdminNote {
  id: string;
  author: string; // "Admin" or "System" or "Support"
  role: string; // Role of the author
  content: string;
  date: string;
  type: 'NOTE' | 'WARNING' | 'COMPLAINT';
}

// NEW: Feedback sent by Providers TO Admin/Platform
export interface ProFeedback {
  id: string;
  providerId: string;
  providerName: string;
  metier: string;
  category: 'SECURITY' | 'PAYMENT' | 'APP' | 'OTHER';
  message: string;
  date: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
}

// NEW: Reviews sent by Clients ABOUT Providers
export interface ClientReview {
  id: string;
  providerId: string;
  providerName?: string; // Optional for UI convenience
  clientId: string;
  clientName: string;
  transactionId?: string; // Linked to a specific payment/job
  rating: number; // 1-5
  comment: string;
  date: string;
}

// --- PROMPT 3: DIGITAL CONTRACT ---
export interface DigitalContract {
  id: string;
  prestataire_id: string;
  client_id: string;
  prestataire_name: string;
  client_name: string;
  service_title: string;
  amount: number;
  duration: string;
  tasks: string[];
  startDate: string;
  endDate: string;
  signature_date?: string;
  signature_ip?: string;
  client_signature?: string; // Base64 signature
  provider_signature?: string; // Base64 signature
  status: 'DRAFT' | 'PENDING_PROVIDER' | 'SIGNED' | 'COMPLETED' | 'CANCELLED';
  terms_version: string;
  createdAt: string;
}

// --- PROMPT 1: SUBSCRIPTION ---
export interface SubscriptionDetails {
  type_de_prestation: 'ANNUEL' | 'MENSUEL' | 'GRATUIT'; // 30k/an ou 3k/mois
  date_debut_contrat: string;
  date_fin_contrat: string;
  statut_visibilite: 'ACTIVE' | 'INACTIVE' | 'HIDDEN';
  renouveller_necessaire: boolean;
}

// --- NEW: USER DOCUMENTS ---
export interface UserDocument {
  type: 'CV' | 'CNI_RECTO' | 'CNI_VERSO' | 'DIPLOME' | 'TITRE_PROPRIETE' | 'AUTRE';
  name: string;
  url: string; // Mock URL or Blob URL
}

// --- MESSAGING SYSTEM (UNIFIED) ---
export interface ChatMessage {
  id: number;
  senderId: string;
  text: string;
  timestamp: string;
  image?: string;
  isSystem?: boolean; // For automated alerts/info
  aiAnalysis?: { // For AI analyzed images
      analysis: string;
      anomalies: string[];
      advice: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[]; // [userId1, userId2]
  participantNames: Record<string, string>; // { id1: 'Name 1', id2: 'Name 2' }
  participantRoles: Record<string, string>; // { id1: 'Provider', id2: 'Client' }
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: Record<string, number>; // { userId: count }
}

export interface UserRoles {
  isClient: boolean;
  isProvider: boolean;
  isStudent: boolean;
  isDelivery: boolean;
  isLandlord: boolean;
}

export interface ProviderProfile {
  jobTitle: string;
  category: string;
  skills: string[];
  languages: string[];
  yearsExperience: number;
  bio: string;
  hourlyRate: number;
  location: Location;
  availableDays: string[];
  availableHours: string;
  isAvailableNow: boolean;
  physicalInfo: {
    height?: string;
    consentVisible: boolean;
  };
  certifications: string[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  verificationLevel: string;
}

export interface StudentProfile {
  university?: string;
  fieldOfStudy: string;
  skills: string[];
  bio: string;
}

export interface ClientProfile {
  preferences?: string[];
  orderHistorySummary?: string;
}

export interface DeliveryProfile {
  vehicleType: VehicleType;
  licenseNumber?: string;
  rating: number;
}

export interface UserProfile {
  id: string;
  memberId?: string; // Matricule Professionnel (Ex: APN-ELEC-0001)
  roles: UserRoles;
  activeRole: string; // e.g. "PROVIDER", "CLIENT", "STUDENT", "DELIVERY", "LANDLORD"
  
  // Base Identity
  firstName: string;
  lastName: string;
  photoUrl: string;
  email?: string;
  phone: string;
  whatsapp: string;
  
  // Specific Profiles
  providerProfile?: ProviderProfile;
  studentProfile?: StudentProfile;
  clientProfile?: ClientProfile;
  deliveryProfile?: DeliveryProfile;

  // Global Metadata
  verified: boolean;
  status?: UserStatus;
  
  // Financial & History
  walletBalance: number;
  pendingBalance?: number;
  transactions: Transaction[];
  notifications?: Notification[];
  documents?: UserDocument[];

  // Legacy / Migration fields
  description?: string;
  category?: string;
  subCategory?: string;
  specialization?: string;
  skills?: string[];
  jobTitle?: string;
  experienceYears?: number;
  rating?: number;
  reviewCount?: number;
  completedJobs?: number;
  languages?: string[];
  availability?: string[];
  certifications?: string[];
  isCertified?: boolean;
  location?: Location;
  hasSeenWalletWelcome?: boolean;
  linkedAccountIds?: string[];
  subscription?: SubscriptionDetails;
  contracts?: DigitalContract[];
  role?: UserRole;
  password?: string;
  unlockedRealEstateIds?: string[];
  unlockedProviderIds?: string[];
  riderStats?: RiderStats;
  busyUntil?: string;
  adminNotes?: AdminNote[];
  rate?: string;
  priceRange?: { min: number, max: number };
  residenceScore?: number; // Score de confiance pour les résidences (1-5)
}

export interface Reservation {
  id: string;
  listingId: string;
  listingTitle: string;
  clientId: string;
  clientName: string;
  ownerId: string;
  amount: number;
  cautionAmount: number;
  cautionStatus: 'HELD' | 'RELEASED' | 'CLAIMED';
  cautionReleasedAt: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  startDate: string;
  startTime: string;
  checkInDate?: string;
  checkOutDate?: string;
  checkInPhotos?: string[];
  checkOutPhotos?: string[];
  createdAt: string;
}

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  
  // Hierarchical Categorization
  category?: string;
  subCategory?: string;
  specialization?: string;

  type: JobType;
  location: Location;
  employerName: string;
  budget?: string;
  datePosted: string;
  requiredCount: number; // Number of people needed
  whatsappContact: string;
  urgency?: JobUrgency;
}

export enum ViewState {
  HOME = 'HOME',
  FIND_WORKER = 'FIND_WORKER',
  FIND_JOB = 'FIND_JOB',
  REGISTER = 'REGISTER',
  WALLET = 'WALLET',
  ADMIN = 'ADMIN',
  TERMS = 'TERMS',
  CATALOG = 'CATALOG',
  AD_CREATOR = 'AD_CREATOR', // Générateur de Pub IA
  DELIVERY_ESTIMATOR = 'DELIVERY_ESTIMATOR', // Calculateur de livraison
  REAL_ESTATE = 'REAL_ESTATE', // Module Immobilier
  TRADE_SPACE = 'TRADE_SPACE', // Espace Métier
  INTERNSHIPS = 'INTERNSHIPS', // Espace Stage Étudiant
  RIDER_JOB_BOARD = 'RIDER_JOB_BOARD', // Tableau de bord Livreur Privé (Commandes)
  DELIVERY_TRACKING = 'DELIVERY_TRACKING', // Suivi de livraison client (Livreur Privé)
  
  // NOUVELLES VUES (PROMPT GLOBAL)
  PROVIDER_DASHBOARD = 'PROVIDER_DASHBOARD',
  DASHBOARD = 'DASHBOARD',
  PROFILE = 'PROFILE',
  MESSAGES = 'MESSAGES',
  RECRUITER_SPACE = 'RECRUITER_SPACE', // Espace Entreprise / Recruteur
  SMART_SEARCH = 'SMART_SEARCH', // Recherche intelligente avec Gemini
}

export enum InternshipType {
  ACADEMIC = 'ACADEMIC',
  VACATION = 'VACATION', // Stage de vacances / Job d'été
  GRADUATION = 'GRADUATION'
}

export enum ApplicationStatus {
  TO_CONTACT = 'TO_CONTACT',
  INTERVIEW = 'INTERVIEW',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED'
}

export interface InternshipOffer {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  location: string;
  type: InternshipType;
  skills: string[];
  duration: string;
  stipend?: string;
  postedAt: string;
  status: 'PENDING_VALIDATION' | 'APPROVED' | 'REJECTED';
}

export interface InternshipApplication {
  id: string;
  offerId: string;
  offerTitle?: string;
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  studentLocation: string;
  studentSkills: string[];
  status: ApplicationStatus;
  appliedAt: string;
  isPremium?: boolean;
}
