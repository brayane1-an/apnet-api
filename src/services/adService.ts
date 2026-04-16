
import { MOCK_ADS } from '../constants';
import { Advertisement, AdReview } from '../types';
import { antiNumInfo } from './securityService';

// Clé de stockage pour simuler la base de données des pubs avec interactions
const STORAGE_KEY_ADS = 'apnet_ads_db_v1';

// Initialisation des données (charge depuis LocalStorage ou Mocks)
const loadAds = (): Advertisement[] => {
  const stored = localStorage.getItem(STORAGE_KEY_ADS);
  if (stored) {
    return JSON.parse(stored);
  }
  // Si pas de données stockées, on utilise les mocks et on sauvegarde
  // (Les mocks sont déjà mis à jour avec les tableaux vides dans constants.ts)
  localStorage.setItem(STORAGE_KEY_ADS, JSON.stringify(MOCK_ADS));
  return MOCK_ADS;
};

const saveAds = (ads: Advertisement[]) => {
  localStorage.setItem(STORAGE_KEY_ADS, JSON.stringify(ads));
};

export const adService = {
  // Récupérer toutes les pubs (avec likes et reviews à jour)
  getAllAds: (): Advertisement[] => {
    return loadAds();
  },

  // Ajouter/Retirer un Like
  toggleLike: (adId: string, userId: string): { success: boolean, isLiked: boolean, count: number } => {
    const ads = loadAds();
    const adIndex = ads.findIndex(a => a.id === adId);
    
    if (adIndex === -1) return { success: false, isLiked: false, count: 0 };

    const ad = ads[adIndex];
    const userIndex = ad.likes.indexOf(userId);
    let isLiked = false;

    if (userIndex === -1) {
      // Ajouter like
      ad.likes.push(userId);
      isLiked = true;
    } else {
      // Retirer like
      ad.likes.splice(userIndex, 1);
      isLiked = false;
    }

    // Mise à jour atomic simulée
    ads[adIndex] = ad;
    saveAds(ads);

    return { success: true, isLiked, count: ad.likes.length };
  },

  // Ajouter un avis sécurisé
  addReview: (adId: string, userId: string, userName: string, rating: number, comment: string): { success: boolean, error?: string, review?: AdReview } => {
    // 1. Vérification Sécurité Contenu (Anti-spam/contact)
    if (antiNumInfo(comment)) {
      return { success: false, error: 'SECURITY_BLOCK: Votre commentaire contient des coordonnées interdites.' };
    }

    // 2. Vérification Note
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'La note doit être comprise entre 1 et 5.' };
    }

    const ads = loadAds();
    const adIndex = ads.findIndex(a => a.id === adId);
    if (adIndex === -1) return { success: false, error: 'Publicité introuvable.' };

    const ad = ads[adIndex];

    // Création de l'avis
    const newReview: AdReview = {
      id: `rev_${Date.now()}`,
      userId,
      userName,
      rating,
      comment,
      date: Date.now()
    };

    // Ajout
    ad.reviews.unshift(newReview); // Le plus récent en premier
    ads[adIndex] = ad;
    saveAds(ads);

    return { success: true, review: newReview };
  },

  // Récupérer les détails (utile si on veut rafraîchir juste une pub)
  getAdDetails: (adId: string): Advertisement | undefined => {
    return loadAds().find(a => a.id === adId);
  },

  // Suivre les interactions (Vues / Clics)
  trackInteraction: (adId: string, action: 'VIEW' | 'CLICK') => {
    const ads = loadAds();
    const adIndex = ads.findIndex(a => a.id === adId);
    if (adIndex === -1) return;

    if (action === 'VIEW') {
      ads[adIndex].views += 1;
    } else {
      ads[adIndex].clicks += 1;
    }

    saveAds(ads);
  },

  // --- MANAGEMENT METHODS (ADMIN) ---
  addAd: (ad: Omit<Advertisement, 'id' | 'views' | 'clicks' | 'likes' | 'reviews'>): Advertisement => {
    const ads = loadAds();
    const newAd: Advertisement = {
      ...ad,
      id: `ad_${Date.now()}`,
      views: 0,
      clicks: 0,
      likes: [],
      reviews: []
    };
    ads.push(newAd);
    saveAds(ads);
    return newAd;
  },

  updateAd: (adId: string, updates: Partial<Advertisement>): boolean => {
    const ads = loadAds();
    const index = ads.findIndex(a => a.id === adId);
    if (index === -1) return false;
    ads[index] = { ...ads[index], ...updates };
    saveAds(ads);
    return true;
  },

  deleteAd: (adId: string): boolean => {
    const ads = loadAds();
    const filtered = ads.filter(a => a.id !== adId);
    if (filtered.length === ads.length) return false;
    saveAds(filtered);
    return true;
  }
};
