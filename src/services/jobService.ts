
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { Mission, MissionStatus, ContractType, UserProfile } from '../types';

export const jobService = {
  /**
   * Creates a mission registry entry for an ORDER (immediate hire)
   */
  async createOrderMission(client: UserProfile, provider: UserProfile, details: {
    type: ContractType;
    description: string;
    preferredDate?: string;
    duration?: string;
    amount?: number;
  }): Promise<string> {
    const missionRef = collection(db, 'missions');
    const newMission = {
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      providerId: provider.id,
      providerName: `${provider.firstName} ${provider.lastName}`,
      providerMatricule: provider.memberId || 'APN-TEMP-0012', // Placeholder if not defined
      category: provider.category || 'Services',
      subCategory: provider.subCategory || 'Expert',
      type: 'ORDER',
      contractType: details.type,
      description: details.description,
      preferredDate: details.preferredDate || null,
      duration: details.duration || null,
      amount: details.amount || 0,
      photosBefore: [],
      photosAfter: [],
      status: MissionStatus.ORDERED,
      isPaid: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(missionRef, newMission);
    return docRef.id;
  },

  /**
   * Creates a mission registry entry for a QUOTE (project estimation)
   */
  async createQuoteMission(client: UserProfile, provider: UserProfile, details: {
    title: string;
    description: string;
    budget?: string;
    photos: string[];
  }): Promise<string> {
    const missionRef = collection(db, 'missions');
    const newMission = {
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      providerId: provider.id,
      providerName: `${provider.firstName} ${provider.lastName}`,
      providerMatricule: provider.memberId || 'APN-TEMP-0012',
      category: provider.category || 'Services',
      subCategory: provider.subCategory || 'Expert',
      type: 'QUOTE',
      contractType: ContractType.PIN_POINT,
      title: details.title,
      description: details.description,
      amount: details.budget ? parseFloat(details.budget) : 0,
      photosBefore: details.photos,
      photosAfter: [],
      status: MissionStatus.REQUESTED,
      isPaid: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(missionRef, newMission);
    return docRef.id;
  },

  async updateMissionPhotos(missionId: string, photos: string[], type: 'BEFORE' | 'AFTER') {
    const missionRef = doc(db, 'missions', missionId);
    if (type === 'BEFORE') {
      await updateDoc(missionRef, { photosBefore: photos, updatedAt: serverTimestamp() });
    } else {
      await updateDoc(missionRef, { photosAfter: photos, updatedAt: serverTimestamp(), status: MissionStatus.COMPLETED });
    }
  },

  async getClientMissions(clientId: string): Promise<Mission[]> {
    const q = query(
      collection(db, 'missions'), 
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Mission));
  },

  async getProviderMissions(providerId: string): Promise<Mission[]> {
    const q = query(
      collection(db, 'missions'), 
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Mission));
  }
};
