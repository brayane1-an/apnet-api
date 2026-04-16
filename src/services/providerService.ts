
import { UserProfile, SubscriptionDetails, DigitalContract, UserRole } from '../types';

// PROMPT 1: Gestion Abonnement & Visibilité
export const checkSubscriptionStatus = (user: UserProfile): UserProfile => {
  if (user.role !== UserRole.PROVIDER || !user.subscription) return user;

  const now = new Date();
  const endDate = new Date(user.subscription.date_fin_contrat);
  const isExpired = now > endDate;

  if (isExpired && user.subscription.statut_visibilite === 'ACTIVE') {
    return {
      ...user,
      subscription: {
        ...user.subscription,
        statut_visibilite: 'INACTIVE',
        renouveller_necessaire: true
      }
    };
  }

  return user;
};

// Vérifie si le prestataire doit être visible en priorité (PASS ACTIF)
export const hasActivePass = (user: UserProfile): boolean => {
    if (user.role !== UserRole.PROVIDER || !user.subscription) return false;
    return user.subscription.statut_visibilite === 'ACTIVE';
};

// PROMPT 5: Priorité dans les recherches
// Tri : Disponibles + PASS actif > Disponibles + PASS inactif > Indisponibles
export const getProviderSortScore = (user: UserProfile): number => {
    let score = 0;

    // 1. Disponibilité (Le plus important)
    const isBusy = user.busyUntil && new Date(user.busyUntil) > new Date();
    if (!isBusy) score += 1000;

    // 2. PASS / Abonnement Actif
    if (hasActivePass(user)) score += 500;

    // 3. Rating (Bonus)
    score += (user.rating || 0) * 10;

    return score;
};

// PROMPT 4: Masquage partiel & Visibilité des contacts
export const canViewContact = (provider: UserProfile, client: UserProfile | null): boolean => {
    // 1. Si PASS Actif -> Visible pour tous
    if (hasActivePass(provider)) return true;

    // 2. Si Client a payé pour débloquer (Frais mise en relation)
    if (client && client.unlockedProviderIds?.includes(provider.id)) return true;

    // 3. Sinon masqué
    return false;
};

export const updateVisibility = (user: UserProfile, isPaid: boolean): UserProfile => {
  if (!user.subscription) return user;

  // Activation après paiement
  if (isPaid) {
    // Calcul nouvelle date fin
    const currentEnd = new Date(user.subscription.date_fin_contrat);
    const now = new Date();
    const startDate = currentEnd > now ? currentEnd : now;
    
    // Ajout 30 jours (Simulation mensuelle par défaut)
    const newEndDate = new Date(startDate);
    newEndDate.setDate(newEndDate.getDate() + 30);

    return {
      ...user,
      subscription: {
        ...user.subscription,
        date_debut_contrat: startDate.toISOString(),
        date_fin_contrat: newEndDate.toISOString(),
        statut_visibilite: 'ACTIVE',
        renouveller_necessaire: false
      }
    };
  }

  return user;
};

// PROMPT 3: Signature Numérique
export const signContract = (
  providerId: string, 
  clientId: string, 
  serviceTitle: string, 
  amount: number
): DigitalContract => {
  return {
    id: `contrat_${Date.now()}`,
    prestataire_id: providerId,
    client_id: clientId,
    service_title: serviceTitle,
    amount: amount,
    signature_date: new Date().toISOString(),
    signature_ip: '192.168.1.10', // Simulation IP
    signature_status: 'signé',
    terms_version: 'v1.2'
  };
};

// PROMPT 4: Gestion Disponibilité
export const setProviderBusy = (user: UserProfile, untilDate: string): UserProfile => {
  return {
    ...user,
    busyUntil: untilDate,
    subscription: user.subscription ? {
        ...user.subscription,
        statut_visibilite: 'INACTIVE' // Masquer temporairement du listing si occupé
    } : undefined
  };
};

export const checkAvailability = (user: UserProfile): boolean => {
  if (!user.busyUntil) return true;
  const now = new Date();
  const busyDate = new Date(user.busyUntil);
  return now > busyDate; // True si la date d'occupation est passée
};
