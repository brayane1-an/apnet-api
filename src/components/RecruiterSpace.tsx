
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Users, 
  Briefcase, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  ChevronRight,
  Sparkles,
  Calendar,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  Phone,
  Mail,
  Loader2,
  ExternalLink,
  Award
} from 'lucide-react';
import { 
  SERVICE_FEE_PERCENTAGE, 
  PLATFORM_MAINTENANCE_FEE,
  PREMIUM_CANDIDATE_UNLOCK_FEE 
} from '../constants';
import { BackButton } from './Layout';
import { motion, AnimatePresence } from 'motion/react';
import { 
  InternshipOffer, 
  InternshipApplication, 
  ApplicationStatus, 
  InternshipType,
  UserProfile,
  ViewState,
  UserRole 
} from '../types';
import { authService } from '../services/authService';

interface RecruiterSpaceProps {
  currentUser: UserProfile | null;
  setView: (view: ViewState) => void;
  onLogin?: (user: UserProfile) => void;
  offers: InternshipOffer[];
  onPostOffer: (offer: Omit<InternshipOffer, 'id' | 'postedAt' | 'status'>) => void;
  onSubscribe?: () => void;
}

export const RecruiterSpace: React.FC<RecruiterSpaceProps> = ({ currentUser, setView, onLogin, offers, onPostOffer, onSubscribe }) => {
  const [mode, setMode] = useState<'landing' | 'registration' | 'post_form' | 'matching_result' | 'dashboard'>(
    currentUser?.role === UserRole.COMPANY ? 'dashboard' : 'landing'
  );
  const [activeTab, setActiveTab] = useState<'offers' | 'candidates' | 'matching'>('offers');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Registration State
  const [regData, setRegData] = useState({
    companyName: '',
    city: 'Abidjan',
    commune: '',
    whatsapp: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    duration: '',
    type: InternshipType.ACADEMIC
  });

  // Registration State

  const [applications, setApplications] = useState<InternshipApplication[]>([
    {
      id: 'app_1',
      offerId: 'off_1',
      studentId: 'std_1',
      studentName: 'Koffi Kouassi',
      studentLocation: 'Angré, Cocody',
      studentSkills: ['React', 'JavaScript'],
      status: ApplicationStatus.TO_CONTACT,
      appliedAt: new Date().toISOString(),
      isPremium: true
    },
    {
      id: 'app_2',
      offerId: 'off_1',
      studentId: 'std_2',
      studentName: 'Awa Koné',
      studentLocation: 'Yopougon',
      studentSkills: ['UI Design', 'Figma'],
      status: ApplicationStatus.TO_CONTACT,
      appliedAt: new Date().toISOString(),
      isPremium: false
    }
  ]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    const res = await authService.signInWithGoogle();
    setIsLoading(false);
    
    if (res.success && res.user) {
      if (res.isNewUser) {
        // Pré-remplir avec les infos Google et demander le reste
        setRegData({
          ...regData,
          companyName: res.user.firstName + ' ' + res.user.lastName
        });
        setMode('registration');
      } else {
        if (onLogin) onLogin(res.user);
        setMode('dashboard');
      }
    } else {
      setError(res.message || "Erreur lors de la connexion Google.");
    }
  };

  const handleFinalRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.companyName || !regData.whatsapp) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    setError('');

    const newUser: UserProfile = {
      id: `comp_${Date.now()}`,
      role: UserRole.COMPANY,
      firstName: regData.companyName,
      lastName: '',
      phone: regData.whatsapp,
      whatsapp: regData.whatsapp,
      photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&h=200&auto=format&fit=crop',
      location: { city: regData.city, commune: regData.commune, quartier: '' },
      verified: true,
      walletBalance: 0,
      transactions: [],
      description: `Entreprise basée à ${regData.city}`
    };

    const res = await authService.register(newUser);
    setIsLoading(false);

    if (res.success && res.user) {
      if (onLogin) onLogin(res.user);
      setMode('dashboard');
    } else {
      setError(res.message || "Erreur lors de l'inscription.");
    }
  };

  const KanbanColumn = ({ title, status, color }: { title: string, status: ApplicationStatus, color: string }) => (
    <div className="flex-1 min-w-[300px] bg-gray-50 rounded-3xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          {title}
        </h4>
        <span className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-gray-400 border border-gray-100">
          {applications.filter(a => a.status === status).length}
        </span>
      </div>
      <div className="space-y-3">
        {applications.filter(a => a.status === status).map(app => (
          <motion.div 
            layoutId={app.id}
            key={app.id} 
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-brand-dark">
                {app.studentName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{app.studentName}</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <MapPin size={10} /> {app.studentLocation}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {app.studentSkills.map(s => (
                <span key={s} className="text-[9px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md font-medium">{s}</span>
              ))}
            </div>
            
            {app.isPremium ? (
               <button 
                 onClick={() => alert(`Ce candidat est PREMIUM. Frais de déblocage : ${PREMIUM_CANDIDATE_UNLOCK_FEE} F`)}
                 className="w-full py-2 bg-brand-orange/10 text-brand-orange rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-brand-orange hover:text-white transition-all"
               >
                 <Zap size={12} /> Débloquer Profil Premium ({PREMIUM_CANDIDATE_UNLOCK_FEE}F)
               </button>
            ) : (
              <a 
                href={`https://wa.me/${app.studentId}?text=Bonjour ${app.studentName}, nous avons vu votre candidature sur APNET...`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-green-50 text-brand-green rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-brand-green hover:text-white transition-all"
              >
                <MessageSquare size={12} /> Contacter via WhatsApp
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-green via-transparent to-transparent" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-brand-green rounded-full text-xs font-black uppercase tracking-widest mb-8"
              >
                <Sparkles size={14} /> Espace Entreprise Partenaire
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[1.1]"
              >
                Recrutez vos futurs <span className="text-brand-green">talents</span> en quelques clics.
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-500 mb-12 font-medium"
              >
                Accédez à une base de données qualifiée d'étudiants ivoiriens. Publiez vos offres de stage et laissez notre IA faire le matching.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <button 
                  onClick={() => setMode('registration')}
                  className="w-full sm:w-auto px-10 py-5 bg-brand-dark text-white font-black rounded-2xl shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 text-lg group"
                >
                  Recrutez ici <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={handleGoogleSignIn}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 font-black rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Mail className="text-red-500" /> S'inscrire avec Google
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Rapide", desc: "Publiez votre besoin en moins de 2 minutes chrono." },
                { icon: Sparkles, title: "Matching IA", desc: "L'IA vous suggère les profils les plus pertinents à proximité." },
                { icon: ShieldCheck, title: "Qualifié", desc: "Accédez à des étudiants vérifiés issus des meilleures écoles." }
              ].map((f, i) => (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-brand-green mb-6">
                    <f.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">{f.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'registration') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] p-8 md:p-12 max-w-xl w-full shadow-2xl"
        >
          <div className="mb-8">
            <BackButton onClick={() => setMode('landing')} className="mb-4" />
            <h2 className="text-3xl font-black text-gray-900">Inscription Entreprise</h2>
            <p className="text-gray-500 font-medium">Rejoignez le réseau APNET pour recruter vos stagiaires.</p>
          </div>

          <form onSubmit={handleFinalRegistration} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nom de l'entreprise</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  value={regData.companyName}
                  onChange={(e) => setRegData({...regData, companyName: e.target.value})}
                  placeholder="Ex: APNET Solutions" 
                  className="w-full pl-12 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-green focus:outline-none font-bold" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Ville</label>
                <select 
                  value={regData.city}
                  onChange={(e) => setRegData({...regData, city: e.target.value})}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-green focus:outline-none font-bold"
                >
                  <option value="Abidjan">Abidjan</option>
                  <option value="Bouaké">Bouaké</option>
                  <option value="Yamoussoukro">Yamoussoukro</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Commune</label>
                <input 
                  type="text" 
                  value={regData.commune}
                  onChange={(e) => setRegData({...regData, commune: e.target.value})}
                  placeholder="Ex: Cocody" 
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-green focus:outline-none font-bold" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Contact WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="tel" 
                  value={regData.whatsapp}
                  onChange={(e) => setRegData({...regData, whatsapp: e.target.value})}
                  placeholder="07 00 00 00 00" 
                  className="w-full pl-12 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-green focus:outline-none font-bold" 
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-brand-green text-white font-black rounded-2xl shadow-xl hover:bg-green-700 transition flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Check />} Valider mon inscription
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (mode === 'post_form') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] p-8 md:p-12 max-w-xl w-full shadow-2xl relative overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              className="h-full bg-brand-green"
            />
          </div>

          <div className="mb-10 flex justify-between items-center">
            <span className="text-xs font-black text-brand-green uppercase tracking-widest">Étape {step} sur 3</span>
            <button onClick={() => setMode('dashboard')} className="text-gray-400 hover:text-gray-600 font-bold text-sm">Annuler</button>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-black text-gray-900 leading-tight">Quel profil recherchez-vous ? 💼</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Intitulé du poste</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Stagiaire Comptable" 
                      className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-green focus:outline-none font-bold text-lg" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Type de stage</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: InternshipType.ACADEMIC, label: 'Stage Académique (Validation)' },
                        { id: InternshipType.VACATION, label: 'Stage de Vacances / Job d\'été' },
                        { id: InternshipType.GRADUATION, label: 'Stage de Fin d\'Études' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setFormData({...formData, type: t.id})}
                          className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                            formData.type === t.id ? 'border-brand-green bg-green-50 text-brand-green' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-black text-gray-900 leading-tight">Où se déroulera le stage ? 📍</h2>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Ville / Commune</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Ex: Cocody, Abidjan" 
                    className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-green focus:outline-none font-bold text-lg" 
                  />
                  <p className="mt-4 text-sm text-gray-400 font-medium">
                    L'IA utilisera cette information pour trouver des étudiants résidant à proximité.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-black text-gray-900 leading-tight">Quelle est la durée prévue ? ⏳</h2>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Durée (en mois ou semaines)</label>
                  <input 
                    type="text" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="Ex: 3 mois" 
                    className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-green focus:outline-none font-bold text-lg" 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex gap-4">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex-1 py-5 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition"
              >
                Retour
              </button>
            )}
            <button 
              onClick={() => {
                if (step < 3) setStep(step + 1);
                else {
                    onPostOffer({
                        companyId: currentUser?.id || 'demo',
                        companyName: currentUser?.firstName || 'Entreprise',
                        title: formData.title,
                        location: formData.location,
                        type: formData.type,
                        duration: formData.duration,
                        description: `Offre de stage pour ${formData.title}`,
                        skills: ['React', 'JavaScript'] // Mock skills
                    });
                    setMode('matching_result');
                }
              }}
              disabled={step === 1 ? !formData.title : step === 2 ? !formData.location : !formData.duration}
              className="flex-[2] py-5 bg-brand-green text-white font-black rounded-2xl shadow-xl hover:bg-green-700 transition disabled:opacity-50"
            >
              {step === 3 ? 'Valider l\'offre' : 'Continuer'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === 'matching_result') {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-10 md:p-16 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Sparkles size={180} className="text-brand-green" />
          </div>

          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="text-brand-green w-12 h-12" strokeWidth={4} />
          </div>

          <h2 className="text-4xl font-black text-gray-900 mb-6">Offre publiée avec succès !</h2>
          
          <div className="bg-green-50 p-8 rounded-3xl border-2 border-green-100 mb-10">
            <div className="flex items-center justify-center gap-3 text-brand-green mb-2">
              <Sparkles size={24} />
              <span className="text-2xl font-black">Matching IA APNET</span>
            </div>
            <p className="text-xl font-bold text-gray-700">
              Nous avons trouvé <span className="text-brand-green text-3xl">12</span> profils correspondants dans votre zone.
            </p>
          </div>

          <p className="text-gray-500 font-medium mb-10 leading-relaxed">
            Votre offre est maintenant visible par les étudiants. Vous pouvez suivre les candidatures depuis votre tableau de bord.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => setMode('dashboard')}
              className="w-full py-5 bg-brand-dark text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all text-lg"
            >
              Accéder à mon tableau de bord
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Building2 className="text-brand-green" size={32} /> Espace Recruteur
          </h1>
          <p className="text-gray-500 font-medium">Bienvenue, {currentUser?.firstName || 'Entreprise'}. Gérez vos talents.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!currentUser?.isCertified && (
            <button 
              onClick={onSubscribe}
              className="bg-orange-50 text-brand-orange font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-orange hover:text-white transition-all shadow-sm border border-orange-100"
            >
              <Award size={20} /> Devenir Partenaire (25 000F)
            </button>
          )}
          <button 
            onClick={() => {
              setStep(1);
              setMode('post_form');
            }}
            className="bg-brand-dark text-white font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
          >
            <Plus size={20} /> Publier une offre
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        {[
          { id: 'offers', label: 'Mes Offres', icon: Briefcase },
          { id: 'candidates', label: 'Candidatures', icon: Users },
          { id: 'matching', label: 'Matching IA', icon: Sparkles },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-brand-dark shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'offers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.filter(o => o.companyId === currentUser?.id || o.companyId === 'demo').map(offer => (
              <div key={offer.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                {offer.status === 'PENDING_VALIDATION' && (
                    <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1">
                        <Clock size={10} /> En attente de validation
                    </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    offer.type === InternshipType.VACATION ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {offer.type === InternshipType.VACATION ? 'Stage de Vacances' : 'Stage Académique'}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">{offer.duration}</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-brand-green transition-colors">{offer.title}</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">{offer.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <MapPin size={14} /> {offer.location}
                  </div>
                  <button className="text-brand-green font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Détails <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-8">
            <KanbanColumn title="À contacter" status={ApplicationStatus.TO_CONTACT} color="bg-blue-400" />
            <KanbanColumn title="En entretien" status={ApplicationStatus.INTERVIEW} color="bg-orange-400" />
            <KanbanColumn title="Retenu" status={ApplicationStatus.HIRED} color="bg-green-400" />
          </div>
        )}

        {activeTab === 'matching' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand-dark to-gray-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10 max-w-xl">
                <h2 className="text-2xl font-black mb-2">Matching Intelligent IA</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Notre IA a analysé vos offres et suggère les profils les plus pertinents à proximité de vos bureaux.
                </p>
                <div className="flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-xl border border-white/10">
                  <Filter size={14} />
                  <span className="text-xs font-bold">Filtré par : Compétences + Proximité (Cocody)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Saliou Traoré', match: 98, location: 'Angré (2km)', skills: ['React', 'Node.js'], school: 'ESATIC' },
                { name: 'Marie-Noëlle Kouamé', match: 95, location: 'Riviera 2 (3.5km)', skills: ['React', 'Figma'], school: 'INP-HB' },
                { name: 'Ibrahim Koné', match: 92, location: 'Deux Plateaux (4km)', skills: ['JavaScript', 'Tailwind'], school: 'UVCI' },
                { name: 'Esther Bakayoko', match: 89, location: 'Cocody Centre (5km)', skills: ['React', 'API Rest'], school: 'UFHB' },
                { name: 'Oumar Sylla', match: 87, location: 'Riviera Palmeraie (6km)', skills: ['Node.js', 'MongoDB'], school: 'ESATIC' },
              ].map((student, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-brand-green transition-all">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-xl text-brand-dark">
                        {student.name.charAt(0)}
                      </div>
                      <div className="absolute -top-2 -right-2 bg-brand-green text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                        {student.match}%
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{student.name}</h4>
                      <p className="text-xs text-gray-400 font-medium mb-2">{student.school} • {student.location}</p>
                      <div className="flex gap-1">
                        {student.skills.map(s => (
                          <span key={s} className="text-[9px] bg-brand-green/5 text-brand-green px-2 py-0.5 rounded-md font-bold">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-brand-green group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

