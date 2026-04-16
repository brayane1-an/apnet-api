
import React from 'react';

type InterstitialProps = {
  onClose?: () => void;
};

/**
 * AdMobBanner
 * Simple bannière simulée (tailwind classes — adaptes si tu n'utilises pas tailwind)
 */
export const AdMobBanner: React.FC<{ adText?: string }> = ({ adText }) => {
  return (
    <div className="w-full h-16 bg-gray-200 rounded-lg flex items-center justify-center my-4">
      <span className="text-gray-700">{adText || '[Bannière publicitaire simulée]'}</span>
    </div>
  );
};

/**
 * AdMobInterstitial
 * Simule un interstitiel — rendu comme modal.
 * Ton App.tsx l'utilise comme <AdMobInterstitial onClose={...} />
 */
export const AdMobInterstitial: React.FC<InterstitialProps> = ({ onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="bg-white rounded-lg max-w-md w-full shadow-lg p-6">
        <h3 className="text-lg font-bold mb-2">Publicité interstitielle simulée</h3>
        <p className="text-sm text-gray-700 mb-4">
          Ceci est une publicité factice pour permettre à l'app de fonctionner sans l'API AdMob.
        </p>

        <div className="flex justify-between items-center gap-2">
          <button
            onClick={() => {
              // Simuler un click (analytics) — optionnel
              try { console.log('[AdMob] Interstitial closed (simulé)'); } catch {}
              onClose?.();
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Fermer
          </button>

          <button
            onClick={() => {
              // Simuler action "En savoir plus"
              try { console.log('[AdMob] Interstitial CTA clicked (simulé)'); } catch {}
              alert('Action de publicité simulée (Aucune redirection réelle).');
              onClose?.();
            }}
            className="px-4 py-2 bg-brand-orange text-white rounded hover:opacity-90"
          >
            En savoir plus
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * AdMobNativeAdvanced
 * Composant de type "native ad" simulé (insertable dans les listes)
 */
export const AdMobNativeAdvanced: React.FC<{ adText?: string }> = ({ adText }) => {
  return (
    <div className="w-full bg-gray-100 p-4 rounded-lg border border-gray-200 my-2">
      <div className="flex gap-4 items-center">
        <div className="w-20 h-12 bg-gray-300 rounded flex items-center justify-center">IMG</div>
        <div className="flex-1">
          <div className="font-semibold text-gray-800">{adText || 'Annonce native simulée'}</div>
          <div className="text-sm text-gray-600">Sponsorisé · APNET</div>
        </div>
        <div>
          <button
            onClick={() => {
              console.log('[AdMob] Native ad clicked (simulé)');
              alert('Annonce simulée — clic détecté.');
            }}
            className="px-3 py-1 bg-white border rounded text-sm"
          >
            Voir
          </button>
        </div>
      </div>
    </div>
  );
};
