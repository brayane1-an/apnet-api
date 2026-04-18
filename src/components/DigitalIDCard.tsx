
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Zap, Droplets, Hammer, Trees, Paintbrush, 
  Utensils, Bike, Briefcase, User, ShieldCheck, 
  Trophy, MapPin, X, Download
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { motion } from 'motion/react';
import { Logo } from './Logo';

interface DigitalIDCardProps {
  user: UserProfile;
  onClose: () => void;
}

const getMetierIcon = (subCategory: string = '') => {
  const normalized = subCategory.toLowerCase();
  if (normalized.includes('élec')) return Zap;
  if (normalized.includes('plom')) return Droplets;
  if (normalized.includes('maçon')) return Hammer;
  if (normalized.includes('menu') || normalized.includes('charp')) return Trees;
  if (normalized.includes('peint')) return Paintbrush;
  if (normalized.includes('cuis') || normalized.includes('serv')) return Utensils;
  if (normalized.includes('livr')) return Bike;
  return Briefcase;
};

export const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ user, onClose }) => {
  const Icon = getMetierIcon(user.subCategory);
  
  // URL dynamique pour le QR Code - Ouvre la page de profil/paiement
  const baseUrl = window.location.origin;
  const qrUrl = `${baseUrl}/pay?providerId=${user.id}&matricule=${user.memberId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative max-w-sm w-full"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-brand-orange transition-colors"
        >
          <X size={32} />
        </button>

        {/* The Badge */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center">
          {/* Top Header - APNET Branding */}
          <div className="w-full bg-brand-dark p-6 flex justify-between items-center border-b-4 border-brand-orange">
            <Logo variant="white" size="sm" subtext="Membre Certifié" />
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="text-brand-orange" size={24} />
            </div>
          </div>

          {/* User Info Section */}
          <div className="p-8 flex flex-col items-center w-full">
            {/* Photo */}
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-brand-orange shadow-lg">
                <img 
                  src={user.photoUrl} 
                  alt={user.firstName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-brand-green text-white p-2 rounded-xl shadow-lg border-2 border-white">
                <Icon size={20} />
              </div>
            </div>

            {/* Name & Title */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-gray-900 leading-tight">
                {user.firstName} <br />
                <span className="uppercase">{user.lastName}</span>
              </h3>
              <p className="text-brand-orange font-bold text-sm mt-1">{user.jobTitle || user.subCategory}</p>
            </div>

            {/* ID / Matricule */}
            <div className="bg-gray-100 w-full rounded-2xl p-4 border border-gray-200 mb-8">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Matricule Officiel</span>
                <span className="px-2 py-0.5 bg-brand-green/10 text-brand-green text-[10px] font-black rounded uppercase">Actif</span>
              </div>
              <p className="text-xl font-mono font-black text-brand-dark tracking-tighter">
                {user.memberId || 'APN-PRO-NC'}
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100 mb-6 group transition-transform hover:scale-105 cursor-pointer">
              <QRCodeSVG 
                value={qrUrl} 
                size={160}
                includeMargin={false}
                level="H"
                imageSettings={{
                  src: "https://via.placeholder.com/40/FF7900/FFFFFF?text=A",
                  height: 30,
                  width: 30,
                  excavate: true,
                }}
              />
              <p className="text-[10px] text-gray-400 font-bold text-center mt-3 uppercase tracking-tighter">Scannez pour valider l'expert</p>
            </div>

            {/* Verification Footer */}
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <MapPin size={12} />
              {user.location.city}, CI • Verifié en {new Date().getFullYear()}
            </div>
          </div>

          {/* Bottom Bar */}
          <button 
            onClick={() => window.print()}
            className="w-full bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-500 font-bold text-sm hover:bg-gray-100 transition-colors"
          >
            <Download size={16} /> Enregistrer en PDF
          </button>
        </div>

        {/* Safety Note */}
        <p className="text-white/60 text-[10px] text-center mt-6 uppercase font-bold tracking-widest px-8">
          Cette carte est la propriété exclusive d'APNET CI. Toute falsification est passible de poursuites.
        </p>
      </motion.div>
    </div>
  );
};
