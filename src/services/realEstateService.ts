
// === AJOUT POUR LA GESTION DES CHAMBRES À LOUER ===

export { ROOM_UNLOCK_FEE as ROOM_UNLOCK_PRICE, RENT_UNLOCK_FEE as HOUSE_UNLOCK_PRICE } from '../constants';

// Vérification disponibilité chambre
export const checkRoomAvailability = async (roomId: string): Promise<boolean> => {
  // Simulation délai réseau
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // TODO : remplacer par la vraie logique Firebase ou API
  // Simulation : si l'ID contient 'unavailable', on retourne false
  if (roomId.includes('unavailable') || roomId.includes('occupied')) {
      return false;
  }
  return true;
};

// Vérification disponibilité maison (si manquant)
export const checkHouseAvailability = async (houseId: string): Promise<boolean> => {
  // TODO : laisser sans modifier si déjà existant
  return true;
};

export const getRoomDetails = async (roomId: string) => {
  return null; // TODO DB
};

export const unlockRoomContact = async (roomId: string, userId: string) => {
  // TODO intégrer APNET paiement
  // Simulation success
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};
