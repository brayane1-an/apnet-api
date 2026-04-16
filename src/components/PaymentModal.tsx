
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { SERVICE_FEE_PERCENTAGE, UNLOCK_CONTACT_FEE, PLATFORM_MAINTENANCE_FEE, COMPANY_SUBSCRIPTION_FEE } from '../constants';
import { X, ShieldAlert, Wallet, CheckCircle, Lock, Unlock, Smartphone, Award } from 'lucide-react';

interface PaymentModalProps {
  provider?: UserProfile; // Optional for subscription
  balance: number;
  currentUser: UserProfile | null;
  onClose: () => void;
  onConfirm: (amount: number, isExternal?: boolean) => void;
  isUnlockFee?: boolean;
  isSubscription?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ provider, balance, currentUser, onClose, onConfirm, isUnlockFee = false, isSubscription = false }) => {
  const [amount, setAmount] = useState<string>(
    isSubscription ? COMPANY_SUBSCRIPTION_FEE.toString() : 
    (isUnlockFee ? UNLOCK_CONTACT_FEE.toString() : '')
  );
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'mobile_money'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);

  // If unlocking contact or subscription, amount is fixed. Otherwise, user inputs it.
  const parsedAmount = isSubscription ? COMPANY_SUBSCRIPTION_FEE : (isUnlockFee ? UNLOCK_CONTACT_FEE : (parseFloat(amount) || 0));
  
  // Fee calculation:
  // - If Unlock Fee or Subscription: 100% goes to APNET
  // - If Service Payment: 2% fee + 50F maintenance
  const commission = (isUnlockFee || isSubscription) ? parsedAmount : Math.round(parsedAmount * SERVICE_FEE_PERCENTAGE);
  const fee = (isUnlockFee || isSubscription) ? parsedAmount : (commission + PLATFORM_MAINTENANCE_FEE);
  const netAmount = (isUnlockFee || isSubscription) ? 0 : (parsedAmount - fee);
  
  const isValid = parsedAmount > 0 && (paymentMethod === 'mobile_money' || parsedAmount <= balance);
  const error = (paymentMethod === 'wallet' && parsedAmount > balance) ? "Solde insuffisant" : "";

  const handleNext = () => {
    if (isValid) setStep('confirm');
  };

  const handlePayment = async (isSimulation: boolean = false) => {
    if (paymentMethod === 'wallet') {
      onConfirm(parsedAmount, false);
    } else {
      // CinetPay Integration
      setIsProcessing(true);
      try {
        const response = await fetch('/api/payments/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parsedAmount,
            currency: 'XOF',
            description: isUnlockFee ? `Déblocage contact: ${provider.firstName}` : `Paiement service: ${provider.firstName}`,
            customer_name: 'Client',
            customer_surname: 'APNET',
            transaction_id: `APNET_${Date.now()}`,
            userId: currentUser?.id || 'GUEST',
            providerId: provider.id,
            isSimulation: isSimulation
          })
        });

        const data = await response.json();
        if (data.success) {
          if (isSimulation) {
            alert("SIMULATION : Paiement initié. Le statut passera à 'PAYÉ' dans 2 secondes.");
            // For simulation, we call onConfirm to update local state immediately
            onConfirm(parsedAmount, true);
          } else if (data.payment_url) {
            // Redirect to CinetPay
            window.location.href = data.payment_url;
          }
        } else {
          alert("Erreur lors de l'initialisation du paiement: " + (data.message || 'Erreur inconnue'));
        }
      } catch (err) {
        console.error('Payment Init Error:', err);
        alert("Erreur de connexion au serveur de paiement.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            {isSubscription ? <Award size={20} className="text-brand-orange"/> : (isUnlockFee ? <Unlock size={20} className="text-brand-orange"/> : <Wallet size={20}/>)}
            {step === 'input' ? (isSubscription ? 'Abonnement Premium' : (isUnlockFee ? 'Débloquer le contact' : 'Réserver une prestation')) : 'Confirmer le paiement'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'input' ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <img src={provider.photoUrl} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-medium text-gray-900">Pour : {provider.firstName} {provider.lastName}</p>
                  <p className="text-sm text-gray-500">{provider.jobTitle}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Mode de paiement</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('wallet')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${
                      paymentMethod === 'wallet' ? 'border-brand-orange bg-orange-50 text-brand-orange' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <Wallet size={24} className="mb-1" />
                    <span className="text-xs font-bold">Portefeuille</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('mobile_money')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition ${
                      paymentMethod === 'mobile_money' ? 'border-brand-orange bg-orange-50 text-brand-orange' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <Smartphone size={24} className="mb-1" />
                    <span className="text-xs font-bold">Mobile Money</span>
                  </button>
                </div>
              </div>

              {isSubscription ? (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                   <p className="text-sm text-orange-800 mb-2">
                     <strong>Devenez Partenaire Certifié APNET</strong>
                   </p>
                   <ul className="text-xs text-orange-700 space-y-1 mb-3 list-disc list-inside">
                     <li>Badge de confiance sur votre profil</li>
                     <li>Priorité d'affichage dans les recherches</li>
                     <li>Accès illimité aux coordonnées des candidats</li>
                   </ul>
                   <div className="mt-3 flex justify-between items-center font-bold text-orange-900">
                     <span>Frais d'abonnement :</span>
                     <span className="text-xl">{COMPANY_SUBSCRIPTION_FEE.toLocaleString()} FCFA</span>
                   </div>
                </div>
              ) : isUnlockFee ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                   <p className="text-sm text-blue-800 mb-2">
                     Vous avez choisi un <strong>Contrat Longue Durée</strong>.
                   </p>
                   <p className="text-xs text-blue-700">
                     Pour accéder aux coordonnées complètes (Téléphone, WhatsApp) de ce prestataire, des frais de mise en relation fixes sont requis.
                   </p>
                   <div className="mt-3 flex justify-between items-center font-bold text-blue-900">
                     <span>Frais de déblocage :</span>
                     <span className="text-xl">{UNLOCK_CONTACT_FEE.toLocaleString()} FCFA</span>
                   </div>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Montant convenu (FCFA)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-brand-orange focus:outline-none"
                    placeholder="Ex: 10000"
                  />
                </div>
              )}
              
              <div className="flex justify-between mt-2 text-sm mb-6">
                <span className="text-gray-500">
                  {paymentMethod === 'wallet' ? `Votre solde: ${balance.toLocaleString()} FCFA` : 'Paiement via CinetPay'}
                </span>
                {error && <span className="text-red-600 font-medium">{error}</span>}
              </div>

              {!isUnlockFee && parsedAmount > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Montant total</span>
                    <span>{parsedAmount.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 font-medium">
                    <span>Commission APNET ({(SERVICE_FEE_PERCENTAGE * 100).toFixed(1)}%)</span>
                    <span>- {commission.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 font-medium">
                    <span>Frais de maintenance plateforme</span>
                    <span>- {PLATFORM_MAINTENANCE_FEE.toLocaleString()} FCFA</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                    <span>Net versé au prestataire</span>
                    <span>{netAmount.toLocaleString()} FCFA</span>
                  </div>
                </div>
              )}

              <button 
                onClick={handleNext}
                disabled={!isValid}
                className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {isSubscription ? "S'abonner maintenant" : (isUnlockFee ? "Débloquer maintenant" : "Continuer")}
              </button>
            </>
          ) : (
            <>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-red-800 uppercase mb-1">Attention : Paiement Définitif</h4>
                    {isSubscription ? (
                      <p className="text-xs text-red-700 leading-relaxed">
                        Le montant de <strong>{COMPANY_SUBSCRIPTION_FEE.toLocaleString()} FCFA</strong> sera débité pour votre abonnement annuel. Aucun remboursement possible.
                      </p>
                    ) : isUnlockFee ? (
                      <p className="text-xs text-red-700 leading-relaxed">
                        Le montant de <strong>{UNLOCK_CONTACT_FEE.toLocaleString()} FCFA</strong> sera débité pour débloquer les contacts. Ces frais ne sont pas remboursables.
                      </p>
                    ) : (
                       <p className="text-xs text-red-700 leading-relaxed">
                        Les frais APNET de <strong>{fee.toLocaleString()} FCFA</strong> sont prélevés automatiquement.
                        Le reste ({netAmount.toLocaleString()} FCFA) sera bloqué en séquestre jusqu'à validation.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {!isSubscription && provider && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Prestataire</span>
                    <span className="font-medium">{provider.firstName} {provider.lastName}</span>
                    </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                   <span className="text-gray-600">Montant débité</span>
                   <span className="font-bold text-xl">{parsedAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                   <span className="text-gray-600">Méthode</span>
                   <span className="font-medium">{paymentMethod === 'wallet' ? 'Portefeuille' : 'Mobile Money (CinetPay)'}</span>
                </div>
              </div>

              <button 
                onClick={() => handlePayment(false)}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition flex justify-center items-center gap-2 disabled:bg-gray-400"
              >
                {isProcessing ? (
                  <span className="animate-pulse">Traitement...</span>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Confirmer et Payer
                  </>
                )}
              </button>

              {paymentMethod === 'mobile_money' && (
                <button 
                  onClick={() => handlePayment(true)}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2 mt-2"
                >
                  <CheckCircle size={20} />
                  Simuler Réussite (Test)
                </button>
              )}
              <button 
                onClick={() => setStep('input')}
                className="w-full text-gray-500 font-medium py-3 mt-2 hover:text-gray-800"
              >
                Retour
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

