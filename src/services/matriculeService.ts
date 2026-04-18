
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Mapping des métiers APNET vers les codes matricules
 */
const METIER_CODE_MAP: Record<string, string> = {
  'Électricien': 'ELEC',
  'Plombier': 'PLOM',
  'Maçon': 'MACO',
  'Charpentier / Menuisier': 'MENU',
  'Peintre': 'PEIN',
  
  // Services & Hôtellerie
  'Cuisinier': 'SERV',
  'Serveur / Serveuse': 'SERV',
  'Pâtissier': 'SERV',
  'Boulanger': 'SERV',
  'Barista': 'SERV',
  'Barman / Mixologue': 'SERV',
  'Hôte / Hôtesse d’accueil': 'SERV',
  'Femme / Homme de chambre': 'SERV',
  'Ménage': 'SERV',
  'Nettoyeur professionnel': 'SERV',
  'Baby-sitter / Nounou': 'SERV',
  'Livreur Privé': 'LIVR',
  
  // Fallbacks
  'Bâtiment & Artisanat': 'TECH',
  'Technologie & Informatique': 'DATA',
};

export const matriculeService = {
  /**
   * Génère un Matricule Professionnel unique
   * Format: APN-[CODE]-[NUMÉRO] (Ex: APN-ELEC-0001)
   */
  generate: async (subCategory: string, category?: string): Promise<string> => {
    // 1. Déterminer le code métier
    const code = METIER_CODE_MAP[subCategory] || (category ? METIER_CODE_MAP[category] : 'PRO');
    
    try {
      // 2. Rechercher le dernier matricule avec ce code dans Firestore
      const usersRef = collection(db, 'users');
      const prefix = `APN-${code}-`;
      
      // On cherche le matricule le plus élevé commençant par ce préfixe
      const q = query(
        usersRef, 
        where('memberId', '>=', prefix), 
        where('memberId', '<', prefix + '\uf8ff'),
        orderBy('memberId', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      let nextNumber = 1;
      
      if (!querySnapshot.empty) {
        const lastMemberId = querySnapshot.docs[0].data().memberId as string;
        const parts = lastMemberId.split('-');
        if (parts.length >= 3) {
          const numPart = parts[parts.length - 1];
          const lastNum = parseInt(numPart);
          if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
          }
        }
      }
      
      // 3. Formater avec padding (0001)
      const paddedNumber = nextNumber.toString().padStart(4, '0');
      return `APN-${code}-${paddedNumber}`;
      
    } catch (error) {
      console.error("Matricule Generation Error:", error);
      // Fallback sécurisé en cas d'erreur Firestore (timestamp pour unicité)
      return `APN-${code}-${Date.now().toString().slice(-4)}`;
    }
  }
};
