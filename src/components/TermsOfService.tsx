
import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Lock, Star } from 'lucide-react';

export const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-white">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Conditions Générales d’Utilisation (CGU)
        </h1>
        <p className="text-gray-600">Version officielle - APNET Côte d'Ivoire</p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-12">
        
        <section>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <span className="bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Objet de la plateforme
          </h2>
          <p>
            APNET est une plateforme de mise en relation entre :
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Les prestataires de services (personnes offrant un métier ou un savoir-faire).</li>
            <li>Les demandeurs de services (particuliers, entreprises, organisations).</li>
          </ul>
          <p className="mt-4">
            APNET permet la recherche de profils, la mise en relation, la gestion des paiements (selon les paramètres activés) et la sécurisation des échanges.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <span className="bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Création de compte
          </h2>
          <p>
            Pour utiliser APNET, l’utilisateur doit créer un compte avec des informations exactes (Nom, Prénom, Téléphone, Localisation, Photo, etc.).
          </p>
          <div className="bg-red-50 p-4 rounded-lg mt-4 border-l-4 border-red-500">
            <p className="font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle size={18} /> Important
            </p>
            <p className="text-sm text-red-700 mt-1">
              APNET se réserve le droit de supprimer un compte en cas de fraude, d'identité fausse, de comportement suspect ou de non-respect des règles.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <span className="bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            Fonctionnement général
          </h2>
          <p>
            APNET agit exclusivement comme intermédiaire et facilitateur. APNET n’est pas le prestataire final et n’est pas responsable de la qualité intrinsèque du service rendu par l'artisan ou le professionnel.
          </p>
        </section>

        <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2 mb-4">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
            Visibilité des contacts (Règle Officielle)
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Lock size={16} /> 4.1 Avant paiement
              </h3>
              <p className="text-sm mb-2">Les informations suivantes sont strictement masquées :</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Numéro de téléphone</li>
                <li>WhatsApp</li>
                <li>Localisation détaillée</li>
                <li>Adresse exacte</li>
              </ul>
              <p className="text-sm mt-2 italic">Le demandeur peut uniquement voir le profil professionnel et discuter via le chat interne.</p>
            </div>
            <div>
              <h3 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                <CheckCircle size={16} /> 4.2 Après paiement
              </h3>
              <p className="text-sm mb-2">Une fois le paiement effectué via APNET :</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Les contacts se débloquent automatiquement.</li>
                <li>Le demandeur peut appeler et rencontrer le prestataire.</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-blue-800 mt-4 font-semibold text-center uppercase">
            Toute tentative de partage de contacts avant paiement est une violation des CGU.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <span className="bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
            Paiements & Commissions
          </h2>
          <p className="mb-4">
            Le montant payé par le demandeur est déposé sur le compte collecteur APNET et réparti automatiquement :
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Portefeuille prestataire :</strong> Montant dû pour la prestation.</li>
            <li><strong>Portefeuille APNET :</strong> Commission prélevée pour les frais de service.</li>
          </ul>
          <p>
            La commission APNET est définitive, même en cas d’annulation, car elle couvre les frais de mise en relation et de gestion de la plateforme.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <span className="bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">8</span>
            Comportement interdit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">⛔ Contourner APNET en échangeant les contacts avant paiement.</div>
            <div className="bg-gray-50 p-3 rounded">⛔ Utiliser l’application pour arnaquer des utilisateurs.</div>
            <div className="bg-gray-50 p-3 rounded">⛔ Créer de faux profils.</div>
            <div className="bg-gray-50 p-3 rounded">⛔ Harceler des prestataires ou demandeurs.</div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <span className="bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">9</span>
            Sécurité & Responsabilités
          </h2>
          <p className="mb-4">
            APNET utilise la vérification des profils, les badges de confiance et un système de notation pour sécuriser les échanges.
          </p>
          <p>
            Cependant, APNET n’est pas responsable des retards d'un prestataire, de la qualité subjective du travail ou des accords privés conclus hors plateforme. En cas de conflit, les preuves internes (chat, paiement) seront utilisées pour l'arbitrage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <span className="bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">10</span>
            Système d’Évaluation des Prestataires
          </h2>
          <p className="mb-4">
            Afin de garantir la qualité des services proposés sur APNET, chaque prestataire pourra être évalué par les utilisateurs ayant réellement bénéficié d’un service.
          </p>

          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-lg text-yellow-800 flex items-center gap-2 mb-3">
              <Star className="fill-current" size={20} /> Fonctionnement du système
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-yellow-900">
              <li>Après la réalisation d’un service, l’utilisateur reçoit une demande d’évaluation.</li>
              <li>L’évaluation se fait sous forme de notation de 1 à 5 étoiles, accompagnée d’un commentaire optionnel.</li>
              <li>La note globale d’un prestataire est calculée sur la moyenne des évaluations reçues.</li>
              <li>Les évaluations permettront aux futurs clients de connaître la fiabilité et la qualité du travail du prestataire.</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <div>
               <h4 className="font-bold text-gray-900 mb-2">🔹 Affichage de la note</h4>
               <p className="text-sm text-gray-600">
                 La note du prestataire (ex : 4,5 ★) sera affichée sur son profil, ses annonces de services et les résultats de recherche pour une transparence totale.
               </p>
             </div>
             <div>
               <h4 className="font-bold text-gray-900 mb-2">🔹 Objectifs</h4>
               <ul className="text-sm text-gray-600 space-y-1">
                 <li>✓ Renforcer la confiance entre prestataires et demandeurs.</li>
                 <li>✓ Assurer un haut niveau de qualité sur la plateforme.</li>
                 <li>✓ Favoriser les prestataires sérieux et professionnels.</li>
               </ul>
             </div>
          </div>
        </section>

        <section className="border-t pt-8 mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acceptation</h2>
          <p className="text-gray-600 text-sm">
            En utilisant APNET, l’utilisateur accepte automatiquement les présentes Conditions Générales d’Utilisation, la politique de commission, le système de masquage des contacts, la gestion des paiements et le système d'évaluation.
          </p>
        </section>

      </div>
    </div>
  );
};
