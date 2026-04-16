import { MOCK_REAL_ESTATE_LISTINGS } from '../constants';
import { RealEstateListing } from '../types';

// Simulation d'une persistance en mémoire pour la session
let dbProperties = [...MOCK_REAL_ESTATE_LISTINGS];

export const realEstateAdminController = {
  getAllProperties: async (): Promise<RealEstateListing[]> => {
    // Simulation délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return dbProperties;
  },

  getAllRooms: async (): Promise<RealEstateListing[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return dbProperties.filter(p => p.type === 'Chambre à louer');
  },

  approveProperty: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const idx = dbProperties.findIndex(p => p.id === id);
    if (idx > -1) {
      dbProperties[idx] = { ...dbProperties[idx], status: 'APPROVED' };
      return true;
    }
    return false;
  },

  rejectProperty: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const idx = dbProperties.findIndex(p => p.id === id);
    if (idx > -1) {
      dbProperties[idx] = { ...dbProperties[idx], status: 'REJECTED' };
      return true;
    }
    return false;
  },

  deleteProperty: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    dbProperties = dbProperties.filter(p => p.id !== id);
    return true;
  }
};
