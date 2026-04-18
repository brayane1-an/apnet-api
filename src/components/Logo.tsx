
import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

interface LogoProps {
  className?: string;
  withText?: boolean;
  variant?: 'default' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  subtext?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  withText = true, 
  variant = 'default',
  size = 'md',
  subtext = "Immobilier & Services"
}) => {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', box: 'w-8 h-8', text: 'text-lg', subtext: 'text-[8px]' },
    md: { icon: 'w-6 h-6', box: 'w-10 h-10', text: 'text-2xl', subtext: 'text-[10px]' },
    lg: { icon: 'w-8 h-8', box: 'w-14 h-14', text: 'text-4xl', subtext: 'text-xs' },
    xl: { icon: 'w-12 h-12', box: 'w-20 h-20', text: 'text-6xl', subtext: 'text-sm' }
  };

  const selectedSize = sizeClasses[size];

  const textColorMain = variant === 'white' ? 'text-white' : 'text-brand-blue';
  const textColorSub = variant === 'white' ? 'text-white' : 'text-brand-orange';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Visual Identity Mark */}
      <div className={`relative ${selectedSize.box} flex items-center justify-center shrink-0`}>
        <div className="absolute inset-0 bg-brand-blue rounded-xl rotate-6 shadow-sm opacity-90 transition-transform group-hover:rotate-12"></div>
        <div className="absolute inset-0 bg-brand-orange rounded-xl -rotate-3 transition-transform group-hover:-rotate-6"></div>
        <div className="relative z-10 flex items-center justify-center">
            <ShieldCheck className={`${selectedSize.icon} text-white`} strokeWidth={3} />
            <Zap className="absolute text-brand-blue w-2 h-2 -bottom-1 -right-1 fill-brand-orange" />
        </div>
      </div>

      {/* Textual Identity */}
      {withText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline">
            <span className={`${selectedSize.text} font-black tracking-tighter ${textColorMain}`}>AP</span>
            <span className={`${selectedSize.text} font-black tracking-tighter ${textColorSub}`}>NET</span>
          </div>
          <span className={`${selectedSize.subtext} font-bold ${variant === 'white' ? 'text-white/80' : 'text-gray-400'} uppercase tracking-widest -mt-0.5`}>
            {subtext}
          </span>
        </div>
      )}
    </div>
  );
};
