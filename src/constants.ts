
// PUBLICITÉS INTERNES (NATIVES)
export const MOCK_ADS: Advertisement[] = [
  {
    id: 'ad_1',
    sponsorName: 'Ciment Ivoire',
    title: 'Construisez Solide pour la vie',
    body: 'Le meilleur ciment pour vos fondations à prix d\'usine. Livraison partout à Abidjan.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    actionUrl: 'https://wa.me/2250142341095',
    targetCategory: 'Bâtiment & Artisanat',
    zone: 'TOP',
    format: 'BANNER',
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    views: 1200,
    clicks: 45,
    likes: [],
    reviews: []
  },
  {
    id: 'ad_2',
    sponsorName: 'NSIA Assurances',
    title: 'Assurez votre activité',
    body: 'Artisans, protégez-vous contre les accidents de travail. Offre spéciale APNET : à partir de 5000F/mois.',
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1000&auto=format&fit=crop',
    actionUrl: 'https://wa.me/2250142341095',
    targetCategory: undefined, // General
    zone: 'MIDDLE',
    format: 'BANNER',
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    views: 5000,
    clicks: 120,
    likes: [],
    reviews: []
  },
  {
    id: 'ad_3',
    sponsorName: 'PropreNet Produits',
    title: 'Kit de Nettoyage Pro',
    body: 'Tout le matériel pour les femmes de ménage : balais, produits, gants. -20% pour les membres APNET.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop',
    actionUrl: 'https://wa.me/2250142341095',
    targetCategory: 'Services à domicile',
    zone: 'BOTTOM',
    format: 'BANNER',
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    views: 800,
    clicks: 30,
    likes: [],
    reviews: []
  },
  {
    id: 'ad_4',
    sponsorName: 'Orange Money',
    title: 'Payez vos factures sans frais',
    body: 'CIE, SODECI, Canal+... Payez tout depuis votre canapé avec Orange Money. Rapide et sécurisé.',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1000&auto=format&fit=crop',
    actionUrl: 'https://wa.me/2250142341095',
    targetCategory: undefined,
    zone: 'TOP',
    format: 'BANNER',
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    views: 15000,
    clicks: 450,
    likes: [],
    reviews: []
  }
];
// ... rest of the file remains unchanged ...
import { UserProfile, UserRole, JobOffer, JobType, JobUrgency, Advertisement, RealEstateListing, PropertyType, RiderLevel, ProFeedback, ClientReview, InternshipRequest, InternshipType, InternshipStatus, DeliveryOrder, VehicleType, InternshipOffer } from './types';

export const SERVICE_FEE_PERCENTAGE = 0.02; // 2% fee on standard transactions
export const PLATFORM_MAINTENANCE_FEE = 50; // 50 FCFA flat fee for server/support on EVERY transaction
export const COMPANY_SUBSCRIPTION_FEE = 25000; // 25,000 FCFA for certification/premium badge
export const UNLOCK_CONTACT_FEE = 1000; // 1000 FCFA flat fee for Long Term contracts
export const PREMIUM_CANDIDATE_UNLOCK_FEE = 2000; // Fee for companies to see premium intern contacts

// --- PRO SUBSCRIPTIONS ---
export const PRO_CERTIFICATION_MONTHLY = 5000; // Monthly sub for "Badge de Confiance" & Priority
export const AD_SLOT_DAILY_RATE = 1000; // Base rate for internal ads

// --- REAL ESTATE FEES & TEXTS ---
export const RENTAL_VISIT_FEE = 3000; // Fee to unlock rental contact
export const ROOM_VISIT_FEE = 2000;   // Fee to unlock ROOM contact (NEW)
export const HOUSE_VISIT_FEE = 3000;  // Alias if needed
export const EVICTION_INTERVENTION_FEE = 10000; // Fee mentioned in owner notification
export const RESIDENCE_COMMISSION_PERCENTAGE = 0.10; // 10% commission on residences

export const INTERNSHIP_SERVICE_FEE = 5000; // Fee paid ONLY when internship is found

export const TENANT_ENGAGEMENT_TEXT = `
Engagement locataire

Cher(e) locataire,

En signant ce contrat, vous reconnaissez avoir pris connaissance des règles de location et vous vous engagez à respecter vos obligations de paiement envers le propriétaire, conformément aux conditions indiquées sur APNET.

APNET est mandaté pour intervenir en cas de non-paiement prolongé ou de manquement au contrat par le locataire. Les interventions seront effectuées dans le respect de la loi et en coordination avec le propriétaire.

Ce contrat devient irrévocable une fois signé, et vous acceptez que APNET puisse agir pour régulariser la situation conformément à la législation en vigueur.
`;

export const OWNER_INTERVENTION_TEXT = `
Cher propriétaire,

En cas de non-paiement du locataire pendant plus de trois mois, APNET peut intervenir pour vous assister dans la récupération du logement ou du paiement.
Chaque intervention est facturée 10 000 F.
APNET garantit que toutes les actions sont effectuées dans le respect de la loi et de la sécurité.
`;

// --- RIDER LEVEL RULES ---
export const RIDER_LEVEL_RULES = {
  [RiderLevel.BEGINNER]: {
    minPoints: 0,
    minRating: 0,
    label: 'Débutant',
    color: 'text-amber-700 bg-amber-100 border-amber-200',
    benefits: ['Accès standard aux courses'],
    nextLevel: RiderLevel.PRO
  },
  [RiderLevel.PRO]: {
    minPoints: 500,
    minRating: 4.2,
    label: 'Pro',
    color: 'text-blue-600 bg-blue-100 border-blue-200',
    benefits: ['Support prioritaire', 'Bonus hebdo (+2000F si 25 liv.)'],
    nextLevel: RiderLevel.EXPERT
  },
  [RiderLevel.EXPERT]: {
    minPoints: 1500,
    minRating: 4.6,
    label: 'Expert',
    color: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    benefits: [
        'Notifications prioritaires (30s avant)', 
        'Paiement express (<2h)', 
        'Badge "Livreur de Confiance"', 
        'Bonus mensuel (+5000F si 120 liv.)'
    ],
    nextLevel: null
  }
};

export const RIDER_POINTS = {
    ORDER_COMPLETED: 10,
    FIVE_STAR_BONUS: 15,
    BAD_WEATHER_BONUS: 5
};

export const BAD_WEATHER_MULTIPLIER = 1.2; // +20% gain livreur
export const WEEKLY_LEADERBOARD_BONUSES = [5000, 3000, 1000]; // Top 1, 2, 3

export const ABIDJAN_COMMUNES = [
  'Abobo',
  'Adjamé',
  'Attécoubé',
  'Cocody',
  'Koumassi',
  'Marcory',
  'Plateau',
  'Port-Bouët',
  'Treichville',
  'Yopougon',
  'Songon',
  'Bingerville'
];

export const ABIDJAN_DISTANCES: Record<string, Record<string, number>> = {
  'Abobo': { 'Abobo': 2, 'Adjamé': 8, 'Attécoubé': 12, 'Cocody': 10, 'Koumassi': 18, 'Marcory': 16, 'Plateau': 12, 'Port-Bouët': 22, 'Treichville': 15, 'Yopougon': 14, 'Songon': 25, 'Bingerville': 18 },
  'Adjamé': { 'Abobo': 8, 'Adjamé': 2, 'Attécoubé': 4, 'Cocody': 6, 'Koumassi': 12, 'Marcory': 10, 'Plateau': 3, 'Port-Bouët': 16, 'Treichville': 6, 'Yopougon': 10, 'Songon': 20, 'Bingerville': 14 },
  'Attécoubé': { 'Abobo': 12, 'Adjamé': 4, 'Attécoubé': 2, 'Cocody': 10, 'Koumassi': 14, 'Marcory': 12, 'Plateau': 5, 'Port-Bouët': 18, 'Treichville': 8, 'Yopougon': 6, 'Songon': 16, 'Bingerville': 18 },
  'Cocody': { 'Abobo': 10, 'Adjamé': 6, 'Attécoubé': 10, 'Cocody': 2, 'Koumassi': 12, 'Marcory': 8, 'Plateau': 7, 'Port-Bouët': 18, 'Treichville': 10, 'Yopougon': 15, 'Songon': 25, 'Bingerville': 10 },
  'Koumassi': { 'Abobo': 18, 'Adjamé': 12, 'Attécoubé': 14, 'Cocody': 12, 'Koumassi': 2, 'Marcory': 3, 'Plateau': 10, 'Port-Bouët': 6, 'Treichville': 8, 'Yopougon': 20, 'Songon': 30, 'Bingerville': 15 },
  'Marcory': { 'Abobo': 16, 'Adjamé': 10, 'Attécoubé': 12, 'Cocody': 8, 'Koumassi': 3, 'Marcory': 2, 'Plateau': 7, 'Port-Bouët': 8, 'Treichville': 5, 'Yopougon': 18, 'Songon': 28, 'Bingerville': 14 },
  'Plateau': { 'Abobo': 12, 'Adjamé': 3, 'Attécoubé': 5, 'Cocody': 7, 'Koumassi': 10, 'Marcory': 7, 'Plateau': 2, 'Port-Bouët': 14, 'Treichville': 3, 'Yopougon': 12, 'Songon': 22, 'Bingerville': 15 },
  'Port-Bouët': { 'Abobo': 22, 'Adjamé': 16, 'Attécoubé': 18, 'Cocody': 18, 'Koumassi': 6, 'Marcory': 8, 'Plateau': 14, 'Port-Bouët': 2, 'Treichville': 12, 'Yopougon': 25, 'Songon': 35, 'Bingerville': 20 },
  'Treichville': { 'Abobo': 15, 'Adjamé': 6, 'Attécoubé': 8, 'Cocody': 10, 'Koumassi': 8, 'Marcory': 5, 'Plateau': 3, 'Port-Bouët': 12, 'Treichville': 2, 'Yopougon': 15, 'Songon': 25, 'Bingerville': 16 },
  'Yopougon': { 'Abobo': 14, 'Adjamé': 10, 'Attécoubé': 6, 'Cocody': 15, 'Koumassi': 20, 'Marcory': 18, 'Plateau': 12, 'Port-Bouët': 25, 'Treichville': 15, 'Yopougon': 2, 'Songon': 10, 'Bingerville': 25 },
  'Songon': { 'Abobo': 25, 'Adjamé': 20, 'Attécoubé': 16, 'Cocody': 25, 'Koumassi': 30, 'Marcory': 28, 'Plateau': 22, 'Port-Bouët': 35, 'Treichville': 25, 'Yopougon': 10, 'Songon': 2, 'Bingerville': 35 },
  'Bingerville': { 'Abobo': 18, 'Adjamé': 14, 'Attécoubé': 18, 'Cocody': 10, 'Koumassi': 15, 'Marcory': 14, 'Plateau': 15, 'Port-Bouët': 20, 'Treichville': 16, 'Yopougon': 25, 'Songon': 35, 'Bingerville': 2 }
};

// MAPPING DES QUARTIERS PROCHES (Pour la suggestion automatique)
export const NEARBY_LOCATIONS: Record<string, string[]> = {
  'Angré': ['II Plateaux', 'Palmeraie', 'Riviera', 'Cocody Centre'],
  'II Plateaux': ['Angré', 'Cocody Centre', 'Vallons', 'Aghien'],
  'Riviera': ['Palmeraie', 'Bingerville', 'Cocody', 'M\'Pouto'],
  'Palmeraie': ['Riviera', 'Angré', 'Bingerville'],
  'Zone 4': ['Biétry', 'Marcory Résidentiel', 'Treichville', 'Koumassi'],
  'Biétry': ['Zone 4', 'Marcory', 'Port-Bouët'],
  'Yopougon': ['Songon', 'Attécoubé'],
  'Plateau': ['Adjamé', 'Treichville', 'Cocody'],
  'Cocody': ['Riviera', 'II Plateaux', 'Angré'],
  'Marcory': ['Zone 4', 'Treichville', 'Koumassi']
};

export const AVAILABILITY_OPTIONS = [
  'Immédiat',
  'Week-end',
  'Soirée',
  'Temps plein',
  'Temps partiel',
  'Sur rendez-vous'
];

export const LANGUAGE_OPTIONS = [
  'Français',
  'Anglais',
  'Dioula',
  'Baoulé',
  'Bété',
  'Agni',
  'Sénoufo'
];

// Hierarchical Data Structure
export interface CategoryNode {
  id: string;
  label: string;
  subCategories: SubCategoryNode[];
}

export interface SubCategoryNode {
  id: string;
  label: string;
  specializations: SpecializationNode[];
}

export interface SpecializationNode {
  id: string;
  label: string;
}

export const SERVICE_CATEGORIES: CategoryNode[] = [
  {
    id: '1',
    label: 'Bâtiment & Artisanat',
    subCategories: [
      { id: '1.1', label: 'Maçon', specializations: [{ id: '1.1.1', label: 'Construction murs' }, { id: '1.1.2', label: 'Fondation' }] },
      { id: '1.2', label: 'Plombier', specializations: [{ id: '1.2.1', label: 'Installation' }, { id: '1.2.2', label: 'Réparation' }] },
      { id: '1.3', label: 'Électricien', specializations: [{ id: '1.3.1', label: 'Installation' }, { id: '1.3.2', label: 'Maintenance' }] },
      { id: '1.4', label: 'Carreleur', specializations: [{ id: '1.4.1', label: 'Sols' }, { id: '1.4.2', label: 'Murs' }] },
      { id: '1.5', label: 'Peintre', specializations: [{ id: '1.5.1', label: 'Intérieur' }, { id: '1.5.2', label: 'Extérieur' }] },
      { id: '1.6', label: 'Charpentier / Menuisier', specializations: [{ id: '1.6.1', label: 'Meubles' }, { id: '1.6.2', label: 'Structures' }] },
      { id: '1.7', label: 'Couvreur', specializations: [{ id: '1.7.1', label: 'Toiture' }, { id: '1.7.2', label: 'Réparation' }] },
      { id: '1.8', label: 'Ferronnier / Serrurier', specializations: [{ id: '1.8.1', label: 'Portes' }, { id: '1.8.2', label: 'Grilles' }, { id: '1.8.3', label: 'Serrures' }] },
      { id: '1.9', label: 'Vitrier', specializations: [{ id: '1.9.1', label: 'Fenêtres' }, { id: '1.9.2', label: 'Miroirs' }] },
      { id: '1.10', label: 'Technicien climatisation', specializations: [{ id: '1.10.1', label: 'Installation' }, { id: '1.10.2', label: 'Maintenance' }] },
      { id: '1.11', label: 'Jardinier / Paysagiste', specializations: [{ id: '1.11.1', label: 'Plantation' }, { id: '1.11.2', label: 'Entretien' }] },
      { id: '1.12', label: 'Nettoyeur professionnel', specializations: [{ id: '1.12.1', label: 'Industriel' }, { id: '1.12.2', label: 'Bureaux' }] }
    ]
  },
  {
    id: '2',
    label: 'Commerce & Vente',
    subCategories: [
      { id: '2.1', label: 'Commerçant de rue', specializations: [{ id: '2.1.1', label: 'Alimentaire' }, { id: '2.1.2', label: 'Divers' }] },
      { id: '2.2', label: 'Vendeur boutique', specializations: [{ id: '2.2.1', label: 'Alimentaire' }, { id: '2.2.2', label: 'Mode' }, { id: '2.2.3', label: 'Électronique' }] },
      { id: '2.3', label: 'Représentant commercial', specializations: [{ id: '2.3.1', label: 'Produits' }, { id: '2.3.2', label: 'Services' }] },
      { id: '2.4', label: 'Télévendeur', specializations: [{ id: '2.4.1', label: 'Appels' }, { id: '2.4.2', label: 'Messages' }] },
      { id: '2.5', label: 'Caissier', specializations: [{ id: '2.5.1', label: 'Boutique' }, { id: '2.5.2', label: 'Supermarché' }] },
      { id: '2.6', label: 'Gestionnaire de stock', specializations: [{ id: '2.6.1', label: 'Inventaire' }, { id: '2.6.2', label: 'Magasin' }] },
      { id: '2.7', label: 'Livreur Privé', specializations: [{ id: '2.7.1', label: 'Moto' }, { id: '2.7.2', label: 'Véhicule' }, { id: '2.7.3', label: 'Piéton' }] }
    ]
  },
  {
    id: '3',
    label: 'Restauration & Hôtellerie',
    subCategories: [
      { id: '3.1', label: 'Cuisinier', specializations: [{ id: '3.1.1', label: 'Restaurant' }, { id: '3.1.2', label: 'Traiteur' }] },
      { id: '3.2', label: 'Pâtissier', specializations: [{ id: '3.2.1', label: 'Gâteaux' }, { id: '3.2.2', label: 'Pain' }] },
      { id: '3.3', label: 'Boulanger', specializations: [{ id: '3.3.1', label: 'Fournil' }, { id: '3.3.2', label: 'Artisan' }] },
      { id: '3.4', label: 'Serveur / Serveuse', specializations: [{ id: '3.4.1', label: 'Restaurant' }, { id: '3.4.2', label: 'Événement' }] },
      { id: '3.5', label: 'Barista', specializations: [{ id: '3.5.1', label: 'Café' }, { id: '3.5.2', label: 'Boissons' }] },
      { id: '3.6', label: 'Barman / Mixologue', specializations: [{ id: '3.6.1', label: 'Bar' }, { id: '3.6.2', label: 'Cocktail' }] },
      { id: '3.7', label: 'Hôte / Hôtesse d’accueil', specializations: [{ id: '3.7.1', label: 'Hôtel' }, { id: '3.7.2', label: 'Restaurant' }] },
      { id: '3.8', label: 'Femme / Homme de chambre', specializations: [{ id: '3.8.1', label: 'Nettoyage' }, { id: '3.8.2', label: 'Entretien' }] }
    ]
  },
  {
    id: '4',
    label: 'Transport & Logistique',
    subCategories: [
      { id: '4.1', label: 'Chauffeur', specializations: [{ id: '4.1.1', label: 'Voiture' }, { id: '4.1.2', label: 'Moto' }, { id: '4.1.3', label: 'Camion' }] },
      { id: '4.2', label: 'Conducteur taxi-moto', specializations: [{ id: '4.2.1', label: 'Transport urbain' }] },
      { id: '4.3', label: 'Livreur Privé', specializations: [{ id: '4.3.1', label: 'Moto' }, { id: '4.3.2', label: 'Véhicule' }, { id: '4.3.3', label: 'Piéton' }] },
      { id: '4.4', label: 'Manutentionnaire', specializations: [{ id: '4.4.1', label: 'Chargement' }, { id: '4.4.2', label: 'Déchargement' }] },
      { id: '4.5', label: 'Gestionnaire d’entrepôt', specializations: [{ id: '4.5.1', label: 'Stockage' }, { id: '4.5.2', label: 'Organisation' }] },
      { id: '4.6', label: 'Cariste', specializations: [{ id: '4.6.1', label: 'Chariot élévateur' }] }
    ]
  },
  {
    id: '5',
    label: 'Santé & Bien-être',
    subCategories: [
      { id: '5.8', label: 'Masseuse / Masseur', specializations: [{ id: '5.8.1', label: 'Bien-être' }, { id: '5.8.2', label: 'Rééducation' }] },
      { id: '5.9', label: 'Esthéticien / Coiffeur', specializations: [{ id: '5.9.1', label: 'Soins' }, { id: '5.9.2', label: 'Coupe / Stylisme' }] },
      { id: '5.7', label: 'Coach sportif', specializations: [{ id: '5.7.1', label: 'Fitness' }, { id: '5.7.2', label: 'Musculation' }] }
    ]
  },
  {
    id: '6',
    label: 'Éducation & Formation',
    subCategories: [
       { id: '6.4', label: 'Tuteur / Soutien scolaire', specializations: [{ id: '6.4.1', label: 'Maths' }, { id: '6.4.2', label: 'Sciences' }, { id: '6.4.3', label: 'Langues' }] },
       { id: '6.3', label: 'Professeur de langues', specializations: [{ id: '6.3.1', label: 'Anglais' }, { id: '6.3.2', label: 'Français' }] }
    ]
  },
  {
    id: '7',
    label: 'Technologie & Informatique',
    subCategories: [
      { id: '7.1', label: 'Développeur web / mobile', specializations: [{ id: '7.1.1', label: 'Site web' }, { id: '7.1.2', label: 'Applications' }] },
      { id: '7.2', label: 'Infographiste / Designer', specializations: [{ id: '7.2.1', label: 'Graphique' }, { id: '7.2.2', label: 'UI/UX' }] },
      { id: '7.4', label: 'Technicien informatique', specializations: [{ id: '7.4.1', label: 'Hardware' }, { id: '7.4.2', label: 'Software' }] },
      { id: '7.5', label: 'Community manager', specializations: [{ id: '7.5.1', label: 'Gestion de pages' }] }
    ]
  },
  {
    id: '10',
    label: 'Services à domicile',
    subCategories: [
      { id: '10.1', label: 'Ménage', specializations: [{ id: '10.1.1', label: 'Nettoyage' }, { id: '10.1.2', label: 'Entretien' }] },
      { id: '10.2', label: 'Baby-sitter / Nounou', specializations: [{ id: '10.2.1', label: 'Garde d’enfants' }] },
      { id: '10.6', label: 'Chauffeur personnel', specializations: [{ id: '10.6.1', label: 'Transport particulier' }] }
    ]
  },
  {
    id: '11',
    label: 'Communauté & Opportunités',
    subCategories: [
      { id: '11.1', label: 'Stage & Jeunes Talents', specializations: [{ id: '11.1.1', label: 'Stage' }, { id: '11.1.2', label: 'Alternance' }] }
    ]
  }
];

// IMPORTANT: Les soldes (walletBalance) sont initialisés à 0 pour garantir la séparation avec le compte Admin.
export const MOCK_PROVIDERS: UserProfile[] = [
  // ADMIN ACCOUNT
  {
    id: 'admin_001',
    role: UserRole.ADMIN,
    firstName: 'Super',
    lastName: 'Admin',
    photoUrl: 'https://ui-avatars.com/api/?name=Admin+Apnet&background=000&color=fff',
    location: { city: 'Abidjan', commune: 'Plateau', quartier: 'Siège APNET' },
    phone: '+225 0102030405',
    whatsapp: '2250102030405',
    password: '0000', // Default PIN for Admin
    verified: true,
    description: 'Compte Administrateur Principal',
    walletBalance: 1000000, 
    transactions: [],
    notifications: []
  },
  // ... (Jean, Awa, Moussa, Sophie, Ibrahim - keep as is) ...
  {
    id: '1',
    role: UserRole.PROVIDER,
    firstName: 'Jean',
    lastName: 'Kouassi',
    photoUrl: 'https://picsum.photos/200/200?random=1',
    location: { city: 'Abidjan', commune: 'Yopougon', quartier: 'Siporex' },
    phone: '+225 0707070707',
    whatsapp: '2250707070707',
    verified: true,
    category: 'Bâtiment & Artisanat',
    subCategory: 'Maçon',
    specialization: 'Construction murs',
    jobTitle: 'Maçon Professionnel',
    skills: ['Brique', 'Béton', 'Carrelage'],
    rate: '5000 FCFA / jour',
    priceRange: { min: 5000, max: 10000 },
    rating: 4.8,
    reviewCount: 12,
    completedJobs: 34,
    experienceYears: 5,
    description: "Maçon sérieux et ponctuel, disponible pour tous vos travaux de gros œuvre et finitions. Spécialisé dans la rénovation.",
    languages: ['Français', 'Baoulé'],
    availability: ['Immédiat', 'Temps plein'],
    certifications: ['CAP Maçonnerie'],
    walletBalance: 0, 
    transactions: [],
    isCertified: true,
    unlockedProviderIds: [],
    adminNotes: [
        { id: 'n1', author: 'Support APNET', role: 'Support', content: 'Vérification CNI OK le 12/01/2023.', date: '2023-01-12', type: 'NOTE' },
        { id: 'n2', author: 'System', role: 'Automated', content: 'Signalement client: Retard mineur.', date: '2023-05-20', type: 'WARNING' }
    ],
    subscription: {
        type_de_prestation: 'MENSUEL',
        date_debut_contrat: '2023-11-01T00:00:00Z',
        date_fin_contrat: '2023-12-01T00:00:00Z',
        statut_visibilite: 'ACTIVE',
        renouveller_necessaire: false
    }
  },
  {
    id: '2',
    role: UserRole.PROVIDER,
    firstName: 'Awa',
    lastName: 'Touré',
    photoUrl: 'https://picsum.photos/200/200?random=2',
    location: { city: 'Abidjan', commune: 'Cocody', quartier: 'Riviera 2' },
    phone: '+225 0505050505',
    whatsapp: '2250505050505',
    verified: true,
    category: 'Santé & Bien-être',
    subCategory: 'Esthéticien / Coiffeur',
    specialization: 'Soins',
    jobTitle: 'Coiffeuse à domicile',
    skills: ['Tresses', 'Nattes', 'Soins'],
    rate: 'Sur devis',
    priceRange: { min: 10000, max: 50000 },
    rating: 5.0,
    reviewCount: 24,
    completedJobs: 85,
    experienceYears: 3,
    description: "Je me déplace à domicile pour vous sublimer. Spécialiste des tresses africaines et soins naturels.",
    languages: ['Français', 'Dioula', 'Anglais'],
    availability: ['Week-end', 'Soirée'],
    certifications: ['Diplôme Esthétique'],
    walletBalance: 0,
    transactions: [],
    unlockedProviderIds: [],
    adminNotes: [
        { id: 'n3', author: 'Admin APNET', role: 'Admin', content: 'Prestataire exemplaire, très bons retours.', date: '2023-08-10', type: 'NOTE' }
    ],
    busyUntil: '2025-12-31T00:00:00Z', 
    subscription: {
        type_de_prestation: 'ANNUEL',
        date_debut_contrat: '2023-01-01T00:00:00Z',
        date_fin_contrat: '2023-12-31T00:00:00Z',
        statut_visibilite: 'INACTIVE', 
        renouveller_necessaire: false
    }
  },
  {
    id: '3',
    role: UserRole.PROVIDER,
    firstName: 'Moussa',
    lastName: 'Koné',
    photoUrl: 'https://picsum.photos/200/200?random=3',
    location: { city: 'Bouaké', quartier: 'Commerce' },
    phone: '+225 0101010101',
    whatsapp: '2250101010101',
    verified: false,
    category: 'Bâtiment & Artisanat',
    subCategory: 'Électricien',
    specialization: 'Installation',
    jobTitle: 'Électricien Bâtiment',
    skills: ['Installation', 'Dépannage'],
    rate: '3000 FCFA / visite',
    priceRange: { min: 3000, max: 5000 },
    rating: 4.2,
    reviewCount: 5,
    completedJobs: 8,
    experienceYears: 2,
    description: "Jeune diplômé en électricité bâtiment cherchant petits chantiers ou poste d'apprenti pour parfaire mes compétences.",
    languages: ['Français', 'Malinké'],
    availability: ['Immédiat', 'Temps partiel'],
    certifications: ['BT Électricité'],
    walletBalance: 0,
    transactions: [],
    unlockedProviderIds: []
  },
  {
    id: '4',
    role: UserRole.PROVIDER,
    firstName: 'Sophie',
    lastName: 'Akissi',
    photoUrl: 'https://picsum.photos/200/200?random=4',
    location: { city: 'Abidjan', commune: 'Marcory', quartier: 'Zone 4' },
    phone: '+225 0101010102',
    whatsapp: '2250101010102',
    verified: true,
    category: 'Services à domicile',
    subCategory: 'Ménage',
    specialization: 'Nettoyage',
    jobTitle: 'Femme de ménage',
    skills: ['Nettoyage', 'Repassage', 'Cuisine'],
    rate: '15000 FCFA / jour',
    priceRange: { min: 10000, max: 20000 },
    rating: 4.9,
    reviewCount: 30,
    completedJobs: 120,
    experienceYears: 8,
    description: "Dame expérimentée propose services de ménage et cuisine pour particuliers et expatriés. Références disponibles.",
    languages: ['Français', 'Anglais'],
    availability: ['Temps plein', 'Semaine'],
    certifications: [],
    walletBalance: 0,
    transactions: [],
    unlockedProviderIds: []
  },
  {
    id: '5',
    role: UserRole.PROVIDER,
    firstName: 'Ibrahim',
    lastName: 'Sow',
    photoUrl: 'https://picsum.photos/200/200?random=5',
    location: { city: 'Abidjan', commune: 'Adjamé', quartier: '220 Logements' },
    phone: '+225 0708080808',
    whatsapp: '2250708080808',
    verified: true,
    category: 'Commerce & Vente',
    subCategory: 'Livreur Privé',
    specialization: 'Moto',
    jobTitle: 'Livreur Privé Express',
    skills: ['Livraison rapide', 'Connaissance Abidjan', 'Sérieux'],
    rate: 'Selon zone',
    priceRange: { min: 1000, max: 5000 },
    rating: 4.6,
    reviewCount: 45,
    completedJobs: 90,
    experienceYears: 4,
    description: "Livreur moto expérimenté, je connais tous les raccourcis d'Abidjan. Colis livrés en temps et en heure.",
    languages: ['Français', 'Dioula'],
    availability: ['Immédiat', 'Temps plein'],
    certifications: ['Permis A'],
    walletBalance: 15000,
    transactions: [],
    unlockedProviderIds: [],
    riderStats: {
        level: RiderLevel.PRO,
        reliabilityPoints: 650,
        totalDeliveries: 90,
        monthlyDeliveries: 15,
        weeklyDeliveries: 5,
        rating: 4.6,
        lastLevelUpdate: new Date().toISOString()
    }
  }
];

export const MOCK_JOBS: JobOffer[] = [
  {
    id: '101',
    title: 'Cherche Apprenti Menuisier',
    description: 'Atelier de menuiserie cherche un jeune motivé pour apprendre le métier. Débutant accepté.',
    category: 'Bâtiment & Artisanat',
    subCategory: 'Charpentier / Menuisier',
    specialization: 'Meubles',
    type: JobType.APPRENTICESHIP,
    location: { city: 'Abidjan', commune: 'Abobo', quartier: 'PK 18' },
    employerName: 'Atelier Bois Ivoire',
    budget: 'Transport + Déjeuner',
    datePosted: 'Il y a 2 jours',
    requiredCount: 2,
    whatsappContact: '2250700000000',
    urgency: JobUrgency.STANDARD
  },
  {
    id: '102',
    title: 'Cuisinière pour restaurant',
    description: 'Restaurant africain cherche dame expérimentée pour gérer la cuisine. Spécialités ivoiriennes exigées.',
    category: 'Restauration & Hôtellerie',
    subCategory: 'Cuisinier',
    specialization: 'Restaurant',
    type: JobType.FULL_TIME,
    location: { city: 'Abidjan', commune: 'Marcory', quartier: 'Zone 4' },
    employerName: 'Maquis Le Résistant',
    budget: '80.000 FCFA / mois',
    datePosted: 'Aujourd\'hui',
    requiredCount: 1,
    whatsappContact: '2250500000000',
    urgency: JobUrgency.URGENT
  },
  {
    id: '103',
    title: 'Besoin d\'un plombier d\'urgence',
    description: 'Fuite d\'eau importante dans la salle de bain. Besoin d\'intervention immédiate.',
    category: 'Bâtiment & Artisanat',
    subCategory: 'Plombier',
    specialization: 'Réparation',
    type: JobType.PART_TIME,
    location: { city: 'Abidjan', commune: 'Cocody', quartier: 'Angré' },
    employerName: 'M. Kouamé',
    budget: 'À discuter',
    datePosted: 'Il y a 1 heure',
    requiredCount: 1,
    whatsappContact: '2250102030405',
    urgency: JobUrgency.URGENT
  }
];

export const MOCK_REAL_ESTATE_LISTINGS: RealEstateListing[] = [
  {
    id: 'prop_1',
    ownerId: 'owner_1',
    type: PropertyType.RESIDENCE,
    title: 'Résidence Meublée Luxueuse',
    description: 'Appartement 3 pièces haut standing, entièrement meublé et équipé. Idéal pour séjours professionnels ou vacances. Sécurisé 24h/24.',
    price: 50000,
    currency: 'FCFA / jour',
    location: { city: 'Abidjan', commune: 'Cocody', quartier: 'Angré' },
    features: {
      rooms: 3,
      bathrooms: 2,
      surface: 120,
      furnished: true,
      pool: false,
      wifi: true
    },
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    availability: ['Disponible'],
    rating: 4.8,
    reviews: [
      {
        id: 'rev_1',
        authorName: 'Marc A.',
        rating: 5,
        comment: 'Très propre et propriétaire accueillant. Je recommande !',
        date: '2023-10-15'
      }
    ],
    isPromoted: true
  },
  {
    id: 'prop_2',
    ownerId: 'owner_2',
    type: PropertyType.VILLA_WEEKEND,
    title: 'Villa Détente Assinie',
    description: 'Magnifique villa avec piscine en bordure de lagune. Parfait pour vos week-ends en famille ou entre amis.',
    price: 150000,
    currency: 'FCFA / week-end',
    location: { city: 'Assinie', quartier: 'Km 5' },
    features: {
      rooms: 5,
      bathrooms: 4,
      surface: 300,
      furnished: true,
      pool: true,
      wifi: true
    },
    photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    availability: ['Week-end'],
    rating: 4.9,
    reviews: [],
  },
  {
    id: 'prop_3',
    ownerId: 'owner_3',
    type: PropertyType.RENT,
    title: 'Studio Américain',
    description: 'Studio spacieux et lumineux, non meublé. Cuisine équipée. Situé dans une zone calme.',
    price: 150000,
    currency: 'FCFA / mois',
    location: { city: 'Abidjan', commune: 'Yopougon', quartier: 'Niangon' },
    features: {
      rooms: 1,
      bathrooms: 1,
      surface: 40,
      furnished: false,
      pool: false,
      wifi: false
    },
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    availability: ['Immédiat'],
    rating: 4.0,
    reviews: []
  },
  {
    id: 'prop_room_1',
    ownerId: 'owner_5',
    type: PropertyType.ROOM, // Nouvelle catégorie Chambre
    title: 'Chambre Étudiant Yopougon',
    description: 'Chambre ventilée avec douche interne. Idéal pour étudiant. Cour commune calme et sécurisée.',
    price: 30000,
    currency: 'FCFA / mois',
    location: { city: 'Abidjan', commune: 'Yopougon', quartier: 'Andokoi' },
    features: {
      rooms: 1,
      bathrooms: 1,
      surface: 15,
      furnished: false,
      pool: false,
      wifi: false
    },
    photos: ['https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    availability: ['Disponible'],
    rating: 0,
    reviews: []
  },
  {
    id: 'prop_room_2',
    ownerId: 'owner_6',
    type: PropertyType.ROOM, // Nouvelle catégorie Chambre
    title: 'Chambre Haut Standing Cocody',
    description: 'Grande chambre climatisée avec chauffe-eau. Accès cuisine et salon commun. Dans une villa sécurisée.',
    price: 80000,
    currency: 'FCFA / mois',
    location: { city: 'Abidjan', commune: 'Cocody', quartier: 'Angré 7ème' },
    features: {
      rooms: 1,
      bathrooms: 1,
      surface: 20,
      furnished: true,
      pool: false,
      wifi: true
    },
    photos: ['https://images.unsplash.com/photo-1522771753035-0a1539503ed2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    availability: ['Disponible'],
    rating: 0,
    reviews: []
  },
  {
    id: 'prop_unavailable_1',
    ownerId: 'owner_4',
    type: PropertyType.RENT,
    title: 'Maison Indisponible (Test Admin)',
    description: 'Ce bien est marqué comme indisponible (loué). Seul l\'admin doit le voir.',
    price: 200000,
    currency: 'FCFA / mois',
    location: { city: 'Abidjan', commune: 'Cocody', quartier: 'Riviera 3' },
    features: {
      rooms: 4,
      bathrooms: 3,
      surface: 150,
      furnished: false,
      pool: false,
      wifi: false
    },
    photos: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
    availability: ['Indisponible'], // Marqué indisponible
    rating: 0,
    reviews: []
  }
];

export const MOCK_PRO_FEEDBACKS: ProFeedback[] = [
  {
    id: 'pf_1',
    providerId: '1',
    providerName: 'Jean Kouassi',
    metier: 'Maçon',
    category: 'SECURITY',
    message: "Certains clients refusent de payer les frais de déplacement avant le chantier. Il faudrait sécuriser cela.",
    date: "2023-11-15T10:00:00Z",
    status: 'NEW'
  },
  {
    id: 'pf_2',
    providerId: '5',
    providerName: 'Ibrahim Sow',
    metier: 'Livreur Privé',
    category: 'APP',
    message: "L'application est lente quand je suis en zone de faible réseau à Abobo.",
    date: "2023-11-20T14:30:00Z",
    status: 'READ'
  }
];

export const MOCK_CLIENT_REVIEWS: ClientReview[] = [
  {
    id: 'cr_1',
    providerId: '1',
    providerName: 'Jean Kouassi',
    clientId: 'seeker_001',
    clientName: 'Michel Kouamé',
    rating: 5,
    comment: "Travail impeccable, mur monté en 2 jours. Je recommande !",
    date: "2023-12-01T09:00:00Z"
  },
  {
    id: 'cr_2',
    providerId: '4',
    providerName: 'Sophie Akissi',
    clientId: 'seeker_001',
    clientName: 'Michel Kouamé',
    rating: 4,
    comment: "Très bon ménage, mais arrivée avec 30min de retard.",
    date: "2023-12-05T16:00:00Z"
  }
];

const MOCK_CV_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

export const MOCK_INTERNSHIP_REQUESTS: InternshipRequest[] = [
  {
    id: 'req_1',
    fullName: 'Kouassi Aya Prisca',
    email: 'prisca.kouassi@gmail.com',
    field: 'Marketing Digital',
    type: InternshipType.VALIDATION,
    location: { city: 'Abidjan', commune: 'Cocody', quartier: 'Riviera 2' },
    phone: '+225 0708091011',
    cvUrl: MOCK_CV_URL,
    status: InternshipStatus.PENDING,
    dateSubmitted: '2023-12-10T10:00:00Z'
  },
  {
    id: 'req_2',
    fullName: 'Ouattara Drissa',
    email: 'drissa.o@gmail.com',
    field: 'Informatique / Dév Web',
    type: InternshipType.PROFESSIONAL,
    location: { city: 'Abidjan', commune: 'Plateau', quartier: 'Commerce' },
    phone: '+225 0102030405',
    cvUrl: MOCK_CV_URL,
    status: InternshipStatus.MATCHED,
    matchedCompany: 'Tech Ivoire Solutions',
    dateSubmitted: '2023-12-08T14:00:00Z'
  }
];

export const MOCK_DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    id: 'del_1',
    clientId: 'seeker_001',
    clientName: 'Michel Kouamé',
    pickup: { city: 'Abidjan', commune: 'Cocody', quartier: 'Angré 8ème' },
    dropoff: { city: 'Abidjan', commune: 'Marcory', quartier: 'Zone 4' },
    distanceKm: 12,
    price: 2500,
    riderGain: 2000,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    description: 'Colis moyen (Chaussures)',
    vehicleType: VehicleType.MOTO
  },
  {
    id: 'del_2',
    clientId: 'client_X',
    clientName: 'Boutique Mode',
    pickup: { city: 'Abidjan', commune: 'Adjamé', quartier: 'Marché Gouro' },
    dropoff: { city: 'Abidjan', commune: 'Yopougon', quartier: 'Siporex' },
    distanceKm: 8,
    price: 1500,
    riderGain: 1200,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    description: 'Enveloppe urgente',
    vehicleType: VehicleType.MOTO
  }
];

export const MOCK_INTERNSHIP_OFFERS: InternshipOffer[] = [
    {
        id: 'off_1',
        companyId: 'comp_1',
        companyName: 'Orange CI',
        title: 'Stagiaire Développeur Web',
        description: 'Nous recherchons un étudiant passionné par React et Node.js pour notre équipe digitale.',
        location: 'Cocody, Abidjan',
        type: InternshipType.ACADEMIC,
        skills: ['React', 'TypeScript', 'Tailwind'],
        duration: '3 mois',
        postedAt: new Date().toISOString(),
        status: 'APPROVED'
    },
    {
        id: 'off_2',
        companyId: 'comp_2',
        companyName: 'MTN CI',
        title: 'Stagiaire Marketing Digital',
        description: 'Aidez-nous à gérer nos réseaux sociaux et nos campagnes publicitaires.',
        location: 'Plateau, Abidjan',
        type: InternshipType.PROFESSIONAL,
        skills: ['Social Media', 'SEO', 'Content Creation'],
        duration: '6 mois',
        postedAt: new Date().toISOString(),
        status: 'PENDING_VALIDATION'
    }
];
