
import React from 'react';
import { UserProfile, JobOffer, Location, JobUrgency, ServiceMode } from '../types';
import { MapPin, Star, CheckCircle, MessageCircle, Users, Clock, Globe, Award, Wallet, ShieldCheck, Trophy, Zap, Medal, TrendingUp, Lock, Unlock, Phone, CalendarX, EyeOff, Briefcase, Eye, MessageSquare } from 'lucide-react';
import { UNLOCK_CONTACT_FEE } from '../constants';
import { canViewContact, hasActivePass } from '../services/providerService';

export const LocationBadge = ({ location }: { location: Location }) => (
  <div className="flex items-center text-gray-500 text-xs md:text-sm mt-1">
    <MapPin size={14} className="mr-1" />
    <span>
      {location.city}
      {location.commune ? `, ${location.commune}` : ''}
      {location.quartier ? ` - ${location.quartier}` : ''}
    </span>
  </div>
);

export const WhatsAppButton = ({ number, message }: { number: string, message: string }) => (
  <a
    href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex-1 inline-flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-2 px-4 rounded-lg transition-colors gap-2 text-sm"
  >
    <MessageCircle size={16} />
    WhatsApp
  </a>
);

interface BadgeData {
  icon: React.ElementType;
  label: string;
  colorBg: string;
  colorText: string;
}

const getTrustBadges = (provider: UserProfile): BadgeData[] => {
  const badges: BadgeData[] = [];

  // 1. Abonnement PRO (PASS)
  if (hasActivePass(provider)) {
      badges.push({
          icon: CheckCircle,
          label: 'PASS PRO ACTIF',
          colorBg: 'bg-green-600',
          colorText: 'text-white'
      });
  }

  if (provider.isCertified) {
      badges.push({
          icon: Award,
          label: 'CERTIFIÉ APNET',
          colorBg: 'bg-brand-dark',
          colorText: 'text-white'
      });
  }

  if (provider.verified) {
    badges.push({
      icon: ShieldCheck,
      label: 'Identité Vérifiée',
      colorBg: 'bg-blue-100',
      colorText: 'text-blue-700'
    });
  }

  if ((provider.rating || 0) >= 4.8 && (provider.reviewCount || 0) >= 5) {
    badges.push({
      icon: Star,
      label: 'Top Note',
      colorBg: 'bg-yellow-100',
      colorText: 'text-yellow-700'
    });
  }

  if ((provider.experienceYears || 0) >= 5) {
    badges.push({
      icon: Trophy,
      label: 'Expérimenté',
      colorBg: 'bg-purple-100',
      colorText: 'text-purple-700'
    });
  }

  if ((provider.completedJobs || 0) > 50) {
    badges.push({
      icon: Zap,
      label: 'Très Demandé',
      colorBg: 'bg-orange-100',
      colorText: 'text-orange-700'
    });
  }

  return badges;
};

const getNextMilestone = (completed: number) => {
  if (completed < 10) return { next: 10, label: 'Débutant', icon: Medal };
  if (completed < 50) return { next: 50, label: 'Habitué', icon: Medal };
  if (completed < 100) return { next: 100, label: 'Expert', icon: Trophy };
  return null; 
};

interface ProviderCardProps {
  provider: UserProfile;
  onHire: (provider: UserProfile) => void;
  onDiscuss?: (provider: UserProfile) => void; // New for Daily
  serviceMode: ServiceMode; 
  currentUser: UserProfile | null;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onHire, onDiscuss, serviceMode, currentUser }) => {
  const badges = getTrustBadges(provider);
  const milestone = getNextMilestone(provider.completedJobs || 0);

  // PROMPT 4: Check Availability
  const isBusy = provider.busyUntil && new Date(provider.busyUntil) > new Date();
  const busyDate = provider.busyUntil ? new Date(provider.busyUntil).toLocaleDateString() : '';

  // PROMPT 2 & 4: Check Visibility
  const canSeeContacts = canViewContact(provider, currentUser);

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border flex flex-col h-full ${isBusy ? 'border-red-200 opacity-90' : (hasActivePass(provider) ? 'border-brand-green ring-1 ring-brand-green' : 'border-gray-100')}`}>
      
      {/* PROMPT 4: Busy Overlay/Badge */}
      {isBusy && (
          <div className="bg-red-50 text-red-700 px-4 py-2 text-xs font-bold text-center border-b border-red-100 flex items-center justify-center gap-2">
              <CalendarX size={14} /> Occupé jusqu'au {busyDate}
          </div>
      )}

      {/* PROMPT 5: Priority Badge if Pass Active */}
      {!isBusy && hasActivePass(provider) && (
          <div className="bg-green-600 text-white px-4 py-1 text-[10px] font-bold text-center uppercase tracking-wide">
              Prestataire Recommandé
          </div>
      )}

      <div className="p-5 flex-1">
        <div className="flex items-start gap-4">
          <img 
            src={provider.photoUrl} 
            alt={`${provider.firstName}`} 
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex flex-col truncate">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {provider.firstName} {provider.lastName}
                </h3>
                {provider.memberId && (
                  <span className="text-[10px] text-gray-400 font-mono tracking-wider">
                    Matricule: {provider.memberId}
                  </span>
                )}
              </div>
              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 flex-shrink-0">
                <Star size={14} className="fill-current mr-1" />
                <span className="text-sm font-bold">{provider.rating}</span>
                <span className="text-xs text-yellow-600 ml-1">({provider.reviewCount})</span>
              </div>
            </div>
            <p className="text-brand-orange font-medium text-sm">{provider.jobTitle}</p>
            <LocationBadge location={provider.location} />
          </div>
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {badges.map((badge, idx) => (
              <div key={idx} className={`flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${badge.colorBg} ${badge.colorText}`}>
                <badge.icon size={12} className="mr-1" />
                {badge.label}
              </div>
            ))}
          </div>
        )}

        {milestone && (
          <div className="mt-3">
             <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
               <span>Progression niveau {milestone.label}</span>
               <span>{provider.completedJobs} / {milestone.next} missions</span>
             </div>
             <div className="w-full bg-gray-100 rounded-full h-1.5">
               <div 
                 className="bg-brand-green h-1.5 rounded-full transition-all duration-500" 
                 style={{ width: `${Math.min(100, ((provider.completedJobs || 0) / milestone.next) * 100)}%` }}
               ></div>
             </div>
          </div>
        )}

        <div className="mt-4 space-y-2">
           {/* PROMPT 2: Show Experience & Skills (Visible even if locked) */}
           <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Briefcase size={12}/> {provider.experienceYears} ans d'expérience
           </div>

           <div className="bg-gray-50 p-2 rounded text-sm text-gray-600 line-clamp-2 italic">
             "{provider.description}"
           </div>
           
           <div className="flex flex-wrap gap-1">
             {provider.skills?.slice(0, 3).map(skill => (
               <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
                 {skill}
               </span>
             ))}
           </div>
        </div>
      </div>

      {/* PROMPT 2: MASKING SECTION - CONTACTS & ACTION */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2">
        
        {/* OPTION B - DAILY: DISCUSS FIRST */}
        {serviceMode === ServiceMode.DAILY && (
            <>
               <div className="bg-white p-2 rounded border border-gray-200 text-center mb-2">
                  <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                     <EyeOff size={12} />
                     <span className="font-semibold uppercase">Contacts Masqués</span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Discutez d'abord, payez après accord.
                  </p>
               </div>
               <button 
                 onClick={() => onDiscuss && onDiscuss(provider)}
                 disabled={isBusy}
                 className="w-full bg-brand-orange text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 shadow-sm"
               >
                 <MessageSquare size={16} /> Discuter / Demander dispo
               </button>
            </>
        )}

        {/* OPTION B - LONG TERM: UNLOCK IF NOT SUBSCRIBED */}
        {serviceMode === ServiceMode.LONG_TERM && (
            <>
                {canSeeContacts ? (
                    <div className="space-y-2 animate-in fade-in">
                        <div className="flex gap-2">
                            <WhatsAppButton number={provider.whatsapp} message="Bonjour, je vous ai trouvé sur APNET." />
                            <a 
                            href={`tel:${provider.phone}`}
                            className="flex-1 inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors gap-2 text-sm"
                            >
                            <Phone size={16} /> Appeler
                            </a>
                        </div>
                        <div className="text-center text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                            <CheckCircle size={12} /> Accès débloqué (PASS Actif ou Payé)
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-white p-2 rounded border border-gray-200 text-center mb-2">
                            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                                <Lock size={12} />
                                <span className="font-semibold uppercase">Contacts Verrouillés</span>
                            </div>
                            <p className="text-[10px] text-gray-400">
                                Ce prestataire n'a pas activé son PASS. Payez pour voir.
                            </p>
                        </div>
                        <button 
                            onClick={() => onHire(provider)}
                            disabled={isBusy}
                            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Unlock size={16} /> Débloquer ({UNLOCK_CONTACT_FEE} F)
                        </button>
                    </>
                )}
            </>
        )}
      </div>
    </div>
  );
};

interface JobCardProps {
  job: JobOffer;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-6 flex flex-col h-full relative overflow-hidden group">
      {job.urgency === JobUrgency.URGENT && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 animate-pulse">
          URGENT
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
           <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
             job.type === 'Emploi permanent' ? 'bg-blue-100 text-blue-700' : 
             job.type === 'Apprentissage / Stage' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
           }`}>
             {job.type}
           </span>
           <span className="text-xs text-gray-400 flex items-center gap-1">
             <Clock size={12} /> {job.datePosted}
           </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-brand-orange transition-colors">{job.title}</h3>
        <p className="text-sm font-semibold text-gray-700 mb-3">{job.employerName}</p>
        
        <LocationBadge location={job.location} />
        
        <div className="mt-4 mb-4">
          <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Wallet size={16} className="text-brand-green" />
            <span className="font-semibold text-gray-900">{job.budget || 'À discuter'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{job.requiredCount} place(s)</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <WhatsAppButton number={job.whatsappContact} message={`Bonjour, je suis intéressé par votre annonce : ${job.title}`} />
      </div>
    </div>
  );
};
