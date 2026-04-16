
import React, { useState, useEffect } from 'react';
import { ABIDJAN_COMMUNES, SERVICE_CATEGORIES } from '../constants';
import { UserRole, UserProfile, UserDocument } from '../types';
import { authService } from '../services/authService';
import { enhanceDescription } from '../services/geminiService';
import { validateIdentityCard as aiCheckIdentity, validateCV as aiCheckCV } from '../services/geminiService'; // Renommé pour éviter conflit
import { validateIdentityCard, validateCV } from '../services/fileValidator'; // Import du validateur local
import { 
  Sparkles, Loader2, Lock, User, Phone, Briefcase, MapPin, 
  FileText, Check, Upload, ArrowRight, LogIn, ChevronRight, 
  ShieldCheck, ArrowLeft, Lightbulb, CheckCircle, AlertTriangle, AlertCircle, X, Key
} from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { storageService } from '../services/storageService';

interface RegistrationFormProps {
  onRegister: (user: UserProfile) => void;
}

// Étapes du flux global
type FlowStep = 'PHONE_ENTRY' | 'OTP_VERIFICATION' | 'LOGIN_PIN' | 'REGISTER_WIZARD';
// Étapes du wizard d'inscription
type WizardStep = 'IDENTITY' | 'CATEGORY' | 'JOB_DETAILS' | 'DOCUMENTS' | 'BIO_SECURITY';

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister }) => {
  const [flowStep, setFlowStep] = useState<FlowStep>('PHONE_ENTRY');
  const [wizardStep, setWizardStep] = useState<WizardStep>('IDENTITY');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingDocs, setIsVerifyingDocs] = useState(false);
  const [error, setError] = useState('');
  
  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  
  // États d'erreurs spécifiques aux fichiers
  const [idRectoError, setIdRectoError] = useState('');
  const [idVersoError, setIdVersoError] = useState('');
  const [cvError, setCvError] = useState('');

  // Données communes
  const [phone, setPhone] = useState('');
  
  // Données Login
  const [loginPin, setLoginPin] = useState('');

  // Données Inscription
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('Abidjan');
  const [commune, setCommune] = useState('');
  const [quartier, setQuartier] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PROVIDER); // Défaut

  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cniRectoFile, setCniRectoFile] = useState<File | null>(null);
  const [cniVersoFile, setCniVersoFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [description, setDescription] = useState('');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [createPin, setCreatePin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // --- HANDLERS FICHIERS ---

  const handleCniRectoChange = (file: File | null) => {
    setIdRectoError('');
    if (file) {
        const validation = validateIdentityCard(file);
        if (!validation.valid) {
            setIdRectoError(validation.error || "Fichier invalide");
            setCniRectoFile(null); // Rejet
            return;
        }
    }
    setCniRectoFile(file);
  };

  const handleCniVersoChange = (file: File | null) => {
    setIdVersoError('');
    if (file) {
        const validation = validateIdentityCard(file);
        if (!validation.valid) {
            setIdVersoError(validation.error || "Fichier invalide");
            setCniVersoFile(null); // Rejet
            return;
        }
    }
    setCniVersoFile(file);
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvError('');
    const file = e.target.files?.[0] || null;
    
    if (file) {
        const validation = validateCV(file);
        if (!validation.valid) {
            setCvError(validation.error || "Fichier invalide");
            e.target.value = ''; // Reset input
            setCvFile(null);
            return;
        }
    }
    setCvFile(file);
  };

  // --- FLOW HANDLERS ---

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('Recaptcha resolved');
      }
    });
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 8) {
          setError("Numéro de téléphone invalide (8 chiffres minimum).");
          return;
      }
      
      // Format for Firebase (+225 for Ivory Coast by default if not provided)
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+225${cleanPhone}`;

      setError('');
      setIsLoading(true);
      try {
          const exists = await authService.checkUserExists(cleanPhone);
          setIsNewUser(!exists);

          setupRecaptcha();
          const appVerifier = (window as any).recaptchaVerifier;
          
          const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
          setConfirmationResult(confirmation);
          setFlowStep('OTP_VERIFICATION');
          setIsLoading(false);
      } catch (err: any) {
          console.error("SMS Error:", err);
          setIsLoading(false);
          setError(err.message || "Erreur lors de l'envoi du SMS. Vérifiez le numéro.");
      }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError("Code de vérification invalide.");
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await confirmationResult?.confirm(otpCode);
      setIsLoading(false);
      
      if (isNewUser) {
        setFlowStep('REGISTER_WIZARD');
        setWizardStep('IDENTITY');
      } else {
        setFlowStep('LOGIN_PIN');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError("Code incorrect ou expiré.");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!loginPin || loginPin.length < 4) {
          setError("Code PIN invalide (4 chiffres min).");
          return;
      }
      setIsLoading(true);
      const res = await authService.login(phone, loginPin);
      setIsLoading(false);

      if (res.success && res.user) {
          onRegister(res.user); 
      } else {
          setError(res.message || "Erreur lors de la connexion.");
      }
  };

  // --- WIZARD LOGIC ---

  useEffect(() => {
    if (category) {
      const catNode = SERVICE_CATEGORIES.find(c => c.label === category);
      setAvailableJobs(catNode ? catNode.subCategories : []);
      setSubCategory('');
      setSpecialization('');
      setAvailableSkills([]);
    }
  }, [category]);

  useEffect(() => {
    if (subCategory) {
      const jobNode = availableJobs.find(j => j.label === subCategory);
      const specs = jobNode ? jobNode.specializations : [];
      setAvailableSkills(specs);
      if (specs.length > 0) {
          setSpecialization(specs[0].label);
          setSelectedSkills([specs[0].label]);
      }
    }
  }, [subCategory, availableJobs]);

  const handleNextWizard = async () => {
    setError('');
    
    if (wizardStep === 'IDENTITY') {
        if (!firstName || !lastName || !quartier) {
            setError("Veuillez remplir tous les champs.");
            return;
        }
        setWizardStep('CATEGORY');
    } else if (wizardStep === 'CATEGORY') {
        if (!role) {
             setError("Veuillez choisir votre rôle.");
             return;
        }
        if (role === UserRole.SEEKER) {
            setWizardStep('DOCUMENTS'); 
        } else {
            if (!category) {
                setError("Veuillez sélectionner un secteur.");
                return;
            }
            setWizardStep('JOB_DETAILS');
        }
    } else if (wizardStep === 'JOB_DETAILS') {
        if (!subCategory) {
            setError("Veuillez sélectionner votre métier.");
            return;
        }
        setWizardStep('DOCUMENTS');
    } else if (wizardStep === 'DOCUMENTS') {
        // 1. Validation présence fichiers
        if (role === UserRole.PROVIDER) {
            if (!photoFile) { setError("La photo de profil est obligatoire pour les prestataires."); return; }
            if (!cniRectoFile || !cniVersoFile) { setError("La Carte Nationale d'Identité (Recto et Verso) est obligatoire."); return; }
            if (!cvFile) { setError("Le CV est obligatoire pour les prestataires."); return; }
        } else {
            if (!cniRectoFile || !cniVersoFile) { setError("La Carte Nationale d'Identité (Recto et Verso) est obligatoire pour valider votre compte."); return; }
        }

        // 2. Validation si erreurs existantes
        if (idRectoError || idVersoError || cvError) {
            setError("Veuillez corriger les erreurs de fichiers (en rouge) avant de continuer.");
            return;
        }

        // 3. ANALYSE IA DES DOCUMENTS (Validation Contenu)
        setIsVerifyingDocs(true);
        
        try {
            // Validation CNI Recto IA
            if (cniRectoFile) {
                const checkRecto = await aiCheckIdentity(cniRectoFile);
                if (!checkRecto.valid) {
                    setIdRectoError(checkRecto.reason || "Document non conforme");
                    setError(`Erreur CNI Recto : ${checkRecto.reason}`);
                    setIsVerifyingDocs(false);
                    return;
                }
            }

            // Validation CNI Verso IA
            if (cniVersoFile) {
                const checkVerso = await aiCheckIdentity(cniVersoFile);
                if (!checkVerso.valid) {
                    setIdVersoError(checkVerso.reason || "Document non conforme");
                    setError(`Erreur CNI Verso : ${checkVerso.reason}`);
                    setIsVerifyingDocs(false);
                    return;
                }
            }

            // Validation CV IA (Pour Prestataire)
            if (role === UserRole.PROVIDER && cvFile) {
                const checkCV = await aiCheckCV(cvFile);
                if (!checkCV.valid) {
                    setCvError(checkCV.reason || "CV non conforme");
                    setError(`Erreur CV : ${checkCV.reason}`);
                    setIsVerifyingDocs(false);
                    return;
                }
            }

        } catch (err) {
            console.error("Erreur verification docs", err);
        }

        setIsVerifyingDocs(false);
        setWizardStep('BIO_SECURITY');
        if (!description && role === UserRole.PROVIDER) generateSmartBio();
    }
  };

  const handleBackWizard = () => {
      if (wizardStep === 'CATEGORY') setWizardStep('IDENTITY');
      if (wizardStep === 'JOB_DETAILS') setWizardStep('CATEGORY');
      if (wizardStep === 'DOCUMENTS') {
          role === UserRole.SEEKER ? setWizardStep('CATEGORY') : setWizardStep('JOB_DETAILS');
      }
      if (wizardStep === 'BIO_SECURITY') setWizardStep('DOCUMENTS');
  };

  const generateSmartBio = async () => {
      setIsGeneratingBio(true);
      const roleStr = `${subCategory} (${specialization})`;
      const skillsStr = selectedSkills.join(', ');
      const locationStr = `${city}, ${commune}`;
      const text = await enhanceDescription(roleStr, skillsStr, locationStr);
      setDescription(text);
      setIsGeneratingBio(false);
  };

  const handleFinalRegister = async () => {
      if (createPin.length < 4) { setError("PIN trop court (4 min)."); return; }
      if (createPin !== confirmPin) { setError("Les PIN ne correspondent pas."); return; }

      setIsLoading(true);
      setError('');
      
      try {
        const userId = `user_${phone}_${Date.now()}`;
        const documents: UserDocument[] = [];
        let photoUrl = 'https://via.placeholder.com/150';

        // 1. Upload Photo de profil
        if (photoFile) {
          photoUrl = await storageService.uploadFile(photoFile, `users/${userId}/profile.jpg`);
        }

        // 2. Upload CNI Recto
        if (cniRectoFile) {
          const url = await storageService.uploadFile(cniRectoFile, `users/${userId}/cni_recto.${cniRectoFile.name.split('.').pop()}`);
          documents.push({ type: 'CNI_RECTO', name: cniRectoFile.name, url });
        }

        // 3. Upload CNI Verso
        if (cniVersoFile) {
          const url = await storageService.uploadFile(cniVersoFile, `users/${userId}/cni_verso.${cniVersoFile.name.split('.').pop()}`);
          documents.push({ type: 'CNI_VERSO', name: cniVersoFile.name, url });
        }

        // 4. Upload CV
        if (cvFile && role === UserRole.PROVIDER) {
          const url = await storageService.uploadFile(cvFile, `users/${userId}/cv.${cvFile.name.split('.').pop()}`);
          documents.push({ type: 'CV', name: cvFile.name, url });
        }

        const newUser: UserProfile = {
            id: userId,
            role: role,
            firstName,
            lastName,
            phone,
            whatsapp: phone,
            photoUrl: photoUrl,
            location: { city, commune: city === 'Abidjan' ? commune : undefined, quartier },
            verified: !!(cniRectoFile && cniVersoFile), 
            password: createPin, 
            description,
            
            category: role === UserRole.PROVIDER ? category : undefined,
            subCategory: role === UserRole.PROVIDER ? subCategory : undefined,
            specialization: role === UserRole.PROVIDER ? specialization : undefined,
            skills: role === UserRole.PROVIDER ? selectedSkills : [],
            jobTitle: role === UserRole.PROVIDER ? subCategory : 'Particulier',
            
            walletBalance: 0,
            transactions: [],
            documents,
            notifications: [],
            experienceYears: 0,
            rating: 5,
            reviewCount: 0,
            completedJobs: 0
        };

        const res = await authService.register(newUser);
        setIsLoading(false);
        
        if (res.success && res.user) {
            onRegister(res.user);
        } else {
            setError(res.message || "Erreur inscription.");
        }
      } catch (err: any) {
        console.error("Registration Error:", err);
        setError("Erreur lors de l'envoi des documents. Vérifiez votre connexion.");
        setIsLoading(false);
      }
  };

  // --- RENDERERS ---

  if (flowStep === 'PHONE_ENTRY') {
      return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden my-12 border border-gray-100">
            <div className="bg-brand-dark p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Bienvenue sur APNET</h2>
                <p className="text-gray-400 text-sm">Entrez votre numéro pour vous connecter ou créer un compte</p>
            </div>
            <div className="p-8">
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            <input 
                                type="tel" 
                                value={phone} 
                                onChange={e => setPhone(e.target.value)}
                                className="w-full pl-12 p-3 border rounded-xl focus:ring-2 focus:ring-brand-orange text-lg font-bold tracking-wide"
                                placeholder="07 07 07 07 07"
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    <div id="recaptcha-container"></div>
                    {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition shadow-lg flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Continuer"} <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
      );
  }

  if (flowStep === 'OTP_VERIFICATION') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden my-12 border border-gray-100 animate-in slide-in-from-right">
          <div className="bg-brand-orange p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Vérification SMS</h2>
              <p className="text-orange-100 text-sm">Entrez le code envoyé au {phone}</p>
          </div>
          <div className="p-8">
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Code de confirmation (6 chiffres)</label>
                      <div className="flex justify-center">
                          <input 
                              type="text" 
                              value={otpCode} 
                              onChange={e => setOtpCode(e.target.value)}
                              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-orange text-center text-3xl font-bold tracking-[0.5em]"
                              placeholder="000000"
                              maxLength={6}
                              autoFocus
                              required
                          />
                      </div>
                  </div>
                  {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded">{error}</p>}
                  <button type="submit" disabled={isLoading} className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition shadow-lg flex items-center justify-center gap-2">
                      {isLoading ? <Loader2 className="animate-spin" /> : <Key size={20} />} Vérifier le code
                  </button>
                  <button type="button" onClick={() => setFlowStep('PHONE_ENTRY')} className="w-full text-gray-500 text-sm hover:underline mt-2">
                      Changer de numéro
                  </button>
              </form>
          </div>
      </div>
    );
  }

  if (flowStep === 'LOGIN_PIN') {
      return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden my-12 border border-gray-100 animate-in slide-in-from-right">
            <div className="bg-brand-green p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-1">Bon retour !</h2>
                <div className="flex justify-center items-center gap-2 text-green-100 bg-white/10 py-1 px-3 rounded-full mx-auto w-fit text-sm">
                    <User size={14}/> {phone}
                </div>
            </div>
            <div className="p-8">
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Entrez votre code PIN secret</label>
                        <div className="flex justify-center">
                            <input 
                                type="password" 
                                value={loginPin} 
                                onChange={e => setLoginPin(e.target.value)}
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-green text-center text-3xl font-bold tracking-[0.5em]"
                                placeholder="••••"
                                maxLength={6}
                                autoFocus
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-brand-green text-white font-bold py-4 rounded-xl hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />} Se Connecter
                    </button>
                    <button type="button" onClick={() => setFlowStep('PHONE_ENTRY')} className="w-full text-gray-500 text-sm hover:underline mt-2">
                        Ce n'est pas moi (Changer de numéro)
                    </button>
                </form>
            </div>
        </div>
      );
  }

  // --- RENDER WIZARD (REGISTER) ---
  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden my-4 md:my-8 border border-gray-100 animate-in slide-in-from-right">
      <div className="bg-brand-dark p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Nouveau Compte</h2>
            <span className="text-xs font-bold bg-white/20 text-white px-2 py-1 rounded">
                Étape {wizardStep === 'IDENTITY' ? 1 : wizardStep === 'CATEGORY' ? 2 : wizardStep === 'JOB_DETAILS' ? 3 : wizardStep === 'DOCUMENTS' ? 4 : 5}/5
            </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div 
                className="bg-brand-orange h-1.5 rounded-full transition-all duration-500" 
                style={{ width: wizardStep === 'IDENTITY' ? '20%' : wizardStep === 'CATEGORY' ? '40%' : wizardStep === 'JOB_DETAILS' ? '60%' : wizardStep === 'DOCUMENTS' ? '80%' : '100%' }}
            ></div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-bold flex items-center gap-2 animate-pulse">
                <AlertCircle size={16}/> {error}
            </div>
        )}

        {wizardStep === 'IDENTITY' && (
            <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-800">Identité</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Prénom</label>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Jean" autoFocus/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nom</label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Kouassi"/>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Numéro (Validé)</label>
                    <input type="text" value={phone} disabled className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500 font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Ville</label>
                        <select value={city} onChange={e => setCity(e.target.value)} className="w-full p-2 border rounded-lg">
                            <option value="Abidjan">Abidjan</option>
                            <option value="Bouaké">Bouaké</option>
                        </select>
                    </div>
                    {city === 'Abidjan' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Commune</label>
                            <select value={commune} onChange={e => setCommune(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option value="">Choisir...</option>
                                {ABIDJAN_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Quartier Précis</label>
                    <input type="text" value={quartier} onChange={e => setQuartier(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Ex: Terminus 81"/>
                </div>
            </div>
        )}

        {wizardStep === 'CATEGORY' && (
            <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-800">Quel type de compte ?</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div 
                        onClick={() => setRole(UserRole.PROVIDER)}
                        className={`p-4 rounded-xl border-2 cursor-pointer text-center transition ${role === UserRole.PROVIDER ? 'border-brand-orange bg-orange-50 text-brand-orange' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <Briefcase className="mx-auto mb-2" size={24}/>
                        <div className="font-bold text-sm">Prestataire</div>
                        <div className="text-xs opacity-70">Je propose des services</div>
                    </div>
                    <div 
                        onClick={() => setRole(UserRole.SEEKER)}
                        className={`p-4 rounded-xl border-2 cursor-pointer text-center transition ${role === UserRole.SEEKER ? 'border-brand-green bg-green-50 text-brand-green' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <User className="mx-auto mb-2" size={24}/>
                        <div className="font-bold text-sm">Client</div>
                        <div className="text-xs opacity-70">Je cherche un pro</div>
                    </div>
                </div>
                {role === UserRole.PROVIDER && (
                    <>
                        <h4 className="font-bold text-gray-700 mb-2">Secteur d'activité</h4>
                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                            {SERVICE_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.label)}
                                    className={`p-3 rounded-lg border text-left text-sm font-medium ${category === cat.label ? 'bg-orange-100 border-brand-orange text-brand-orange' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        )}

        {wizardStep === 'JOB_DETAILS' && (
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Précisons votre métier</h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="block text-sm font-bold text-blue-900 mb-2">Sélectionnez votre métier précis</label>
                    <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
                        <option value="">-- Choisir --</option>
                        {availableJobs.map(job => (<option key={job.id} value={job.label}>{job.label}</option>))}
                    </select>
                </div>
                {subCategory && (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Vos compétences (Suggestions)</label>
                        <div className="flex flex-wrap gap-2">
                            {availableSkills.map(skill => (
                                <button
                                    key={skill.id}
                                    onClick={() => {
                                        if (selectedSkills.includes(skill.label)) setSelectedSkills(selectedSkills.filter(s => s !== skill.label));
                                        else setSelectedSkills([...selectedSkills, skill.label]);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${selectedSkills.includes(skill.label) ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-gray-600'}`}
                                >
                                    {skill.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {wizardStep === 'DOCUMENTS' && (
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Documents Requis</h3>
                <p className="text-xs text-gray-500 -mt-4 mb-4">Pour assurer la sécurité sur APNET, l'IA vérifie automatiquement la validité de vos documents.</p>
                
                {/* 1. PHOTO DE PROFIL */}
                <div className="flex flex-col items-center">
                    <label className="block text-sm font-bold text-gray-700 mb-2 w-full">Photo de profil {role === UserRole.PROVIDER && '(Obligatoire)'}</label>
                    <ImageUpload 
                        label="" 
                        onChange={setPhotoFile} 
                        currentImage={photoFile ? URL.createObjectURL(photoFile) : undefined}
                    />
                </div>

                {/* 2. CNI RECTO / VERSO (Obligatoire pour tous) */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="text-blue-600" size={20} />
                        <span className="font-bold text-sm text-blue-900">Carte d'Identité (CNI) - Obligatoire</span>
                    </div>
                    <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded mb-2">
                        Assurez-vous que la photo est nette, sans reflets et bien cadrée (JPG, PNG ou PDF).
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">RECTO (Face)</span>
                            <ImageUpload 
                                label="" 
                                onChange={handleCniRectoChange} 
                                variant="rectangle"
                                currentImage={cniRectoFile ? URL.createObjectURL(cniRectoFile) : undefined}
                            />
                            {idRectoError && (
                                <p className="text-red-500 text-xs font-bold mt-1 bg-red-50 p-1 rounded border border-red-100 flex items-center gap-1">
                                    <AlertTriangle size={12}/> {idRectoError}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">VERSO (Dos)</span>
                            <ImageUpload 
                                label="" 
                                onChange={handleCniVersoChange} 
                                variant="rectangle"
                                currentImage={cniVersoFile ? URL.createObjectURL(cniVersoFile) : undefined}
                            />
                            {idVersoError && (
                                <p className="text-red-500 text-xs font-bold mt-1 bg-red-50 p-1 rounded border border-red-100 flex items-center gap-1">
                                    <AlertTriangle size={12}/> {idVersoError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. CV (Obligatoire pour Prestataire uniquement) */}
                {role === UserRole.PROVIDER && (
                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Curriculum Vitae (CV)</label>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleCvChange}
                                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {cvFile && !cvError && <CheckCircle size={20} className="text-green-500" />}
                            </div>
                            <p className="text-[10px] text-gray-400">PDF, DOC ou DOCX uniquement (Pas d'images).</p>
                            
                            {cvError && (
                                <p className="text-red-500 text-xs font-bold mt-1 bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2">
                                    <AlertTriangle size={14}/> {cvError}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )}

        {wizardStep === 'BIO_SECURITY' && (
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-gray-700">Bio / Description</label>
                        {role === UserRole.PROVIDER && (
                            <button onClick={generateSmartBio} disabled={isGeneratingBio} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
                                {isGeneratingBio ? '...' : 'Générer via IA'}
                            </button>
                        )}
                    </div>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-3 border rounded-lg text-sm" placeholder="Parlez de vous..."/>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2"><Lock size={18}/> Créer votre Code PIN (Connexion)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="password" value={createPin} onChange={e => setCreatePin(e.target.value)} placeholder="Code (4-6 chiffres)" className="p-2 border rounded-lg w-full text-center font-bold" maxLength={6}/>
                        <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="Confirmer Code" className="p-2 border rounded-lg w-full text-center font-bold" maxLength={6}/>
                    </div>
                </div>
            </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex gap-4 pt-4 border-t border-gray-100">
            {wizardStep !== 'IDENTITY' && (
                <button onClick={handleBackWizard} className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50"><ArrowLeft size={20} /></button>
            )}
            
            {wizardStep === 'BIO_SECURITY' ? (
                <button onClick={handleFinalRegister} disabled={isLoading} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Check />} Créer mon compte
                </button>
            ) : (
                <button 
                    onClick={handleNextWizard} 
                    disabled={isVerifyingDocs || !!(idRectoError || idVersoError || cvError)}
                    className="flex-1 bg-brand-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {isVerifyingDocs ? (
                        <>
                            <Loader2 className="animate-spin" size={20} /> Vérification IA en cours...
                        </>
                    ) : (
                        <>Suivant <ChevronRight size={20} /></>
                    )}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
