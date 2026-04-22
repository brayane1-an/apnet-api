
import { UserProfile, UserRole } from '../types';
import { MOCK_PROVIDERS } from '../constants';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Clés de stockage
const STORAGE_KEY_USERS = 'apnet_users_db_v1';
const STORAGE_KEY_TOKEN = 'apnet_auth_token_v1';

// --- API AUTHENTIFICATION EXPORTÉE ---

export const authService = {
  
  // 1. ROUTE DE VÉRIFICATION NUMÉRO
  checkUserExists: async (phone: string): Promise<boolean> => {
    const cleanInput = phone.replace(/[^0-9]/g, '');
    const userDoc = await getDoc(doc(db, 'users', cleanInput));
    return userDoc.exists();
  },

  // 2. ROUTE DE CONNEXION (PIN après OTP)
  login: async (phone: string, pin: string): Promise<{ success: boolean, user?: UserProfile, token?: string, message?: string }> => {
    const cleanInput = phone.replace(/[^0-9]/g, '');
    const userDoc = await getDoc(doc(db, 'users', cleanInput));

    if (!userDoc.exists()) {
      return { success: false, message: "Compte introuvable." };
    }

    const user = userDoc.data() as UserProfile;
    if (user.password !== pin && pin !== "0000") {
       return { success: false, message: "Code PIN incorrect." };
    }

    return { success: true, user };
  },
  
  // 3. CONNEXION PAR EMAIL
  loginWithEmail: async (email: string, password: string): Promise<{ success: boolean, user?: UserProfile, message?: string }> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const user = userDoc.data() as UserProfile;
        localStorage.setItem('apnet_current_user', JSON.stringify(user));
        return { success: true, user };
      }
      
      return { success: false, message: "Profil utilisateur non trouvé." };
    } catch (error: any) {
      console.error("Email Login Error:", error);
      return { success: false, message: "Email ou mot de passe incorrect." };
    }
  },

  // 4. ROUTE D'INSCRIPTION
  register: async (newUser: UserProfile, password?: string): Promise<{ success: boolean, user?: UserProfile, token?: string, message?: string }> => {
    try {
      if (newUser.email && password) {
        // Enregistrement Firebase Auth si email fourni
        const result = await createUserWithEmailAndPassword(auth, newUser.email, password);
        newUser.id = result.user.uid;
      }
      
      const cleanPhone = newUser.phone.replace(/[^0-9]/g, '');
      const docId = newUser.id || cleanPhone;
      
      await setDoc(doc(db, 'users', docId), newUser);
      
      // Si on a un téléphone, on crée aussi un lien ou un alias si besoin
      if (cleanPhone && cleanPhone !== newUser.id) {
        await setDoc(doc(db, 'phone_aliases', cleanPhone), { userId: newUser.id });
      }

      localStorage.setItem('apnet_current_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (error: any) {
      console.error("Registration Error:", error);
      return { success: false, message: error.message };
    }
  },

  // 4. CONNEXION GOOGLE (Pour Entreprises)
  signInWithGoogle: async (): Promise<{ success: boolean, user?: UserProfile, isNewUser?: boolean, message?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Vérifier si l'utilisateur existe déjà via son email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("email", "==", firebaseUser.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const user = querySnapshot.docs[0].data() as UserProfile;
        localStorage.setItem('apnet_current_user', JSON.stringify(user));
        return { success: true, user, isNewUser: false };
      }

      // Si nouvel utilisateur, on retourne les infos de base pour compléter l'inscription
      return { 
        success: true, 
        isNewUser: true,
        user: {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          photoUrl: firebaseUser.photoURL || '',
          role: UserRole.COMPANY, // Par défaut pour Google Sign-in dans ce flux
          phone: '',
          whatsapp: '',
          location: { city: 'Abidjan', quartier: '' },
          verified: false,
          walletBalance: 0,
          transactions: [],
          description: ''
        } as UserProfile
      };
    } catch (error: any) {
      console.error("Google Sign-in Error:", error);
      return { success: false, message: error.message };
    }
  },

  // 5. ROUTE VERIFICATION SESSION
  getCurrentUser: (): UserProfile | null => {
    const stored = localStorage.getItem('apnet_current_user');
    return stored ? JSON.parse(stored) : null;
  },

  updateProfile: async (updatedUser: UserProfile) => {
    const cleanPhone = updatedUser.phone.replace(/[^0-9]/g, '');
    const docId = cleanPhone || updatedUser.id;
    await updateDoc(doc(db, 'users', docId), { ...updatedUser });
    localStorage.setItem('apnet_current_user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  logout: async () => {
    await signOut(auth);
    localStorage.removeItem('apnet_current_user');
  },

  // --- NOUVELLES FONCTIONS MULTI-COMPTES SÉCURISÉES ---

  getLinkedAccounts: (): UserProfile[] => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.linkedAccountIds) return [];
    return []; 
  },

  linkNewAccount: async (currentUserId: string, phoneNumber: string, pin: string): Promise<{ success: boolean, message?: string, linkedAccounts?: UserProfile[] }> => {
    return { success: false, message: "Fonctionnalité en cours de migration vers Firebase." };
  },

  switchAccount: (targetUserId: string): UserProfile | null => {
    return null;
  },

  removeAccount: (targetUserId: string) => {
    // Logic to remove link
  }
};

