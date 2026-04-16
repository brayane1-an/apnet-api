
import React, { useState } from 'react';
import { generateAdContent } from '../services/geminiService';
import { Megaphone, Sparkles, Loader2, Copy, Check, MessageCircle } from 'lucide-react';

export const AdCreator = () => {
  const [businessName, setBusinessName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [offerDetails, setOfferDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{slogan: string, body: string} | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!businessName || !offerDetails) return;
    setIsGenerating(true);
    setResult(null);
    const data = await generateAdContent(businessName, targetAudience, offerDetails);
    setResult(data);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const fullText = `${result.slogan}\n\n${result.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappLink = result 
    ? `https://wa.me/2250142341095?text=${encodeURIComponent(`Bonjour Régie APNET, je souhaite diffuser cette publicité :\n\n*${result.slogan}*\n${result.body}`)}`
    : '#';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-brand-orange/10 rounded-full mb-4">
            <Megaphone className="h-8 w-8 text-brand-orange" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Espace Publicité & Création IA
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Utilisez l'intelligence artificielle d'APNET pour rédiger vos annonces publicitaires en quelques secondes.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de votre entreprise / Service</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="Ex: Maquis Le Délice, ou Plomberie Express"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cible (Qui voulez-vous toucher ?)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="Ex: Les habitants de Cocody, les jeunes étudiants, les propriétaires de voiture..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Détails de votre offre (Promo, Nouveauté...)</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="Ex: -20% sur tout le menu ce weekend. Livraison gratuite."
                  value={offerDetails}
                  onChange={(e) => setOfferDetails(e.target.value)}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !businessName || !offerDetails}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="text-brand-orange" />}
                {isGenerating ? 'L\'IA rédige votre pub...' : 'Générer ma Publicité'}
              </button>
            </div>
          </div>

          {result && (
            <div className="bg-brand-orange/5 border-t border-brand-orange/20 p-8 animate-in slide-in-from-bottom-5">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Résultat Généré</h3>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 relative">
                <button 
                  onClick={handleCopy}
                  className="absolute top-4 right-4 text-gray-400 hover:text-brand-orange transition"
                  title="Copier le texte"
                >
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>

                <div className="mb-4">
                  <span className="text-xs font-bold text-brand-orange bg-orange-100 px-2 py-1 rounded">SLOGAN</span>
                  <p className="text-xl font-bold text-gray-900 mt-2">{result.slogan}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">TEXTE</span>
                  <p className="text-gray-700 mt-2 whitespace-pre-line leading-relaxed">{result.body}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={whatsappLink}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
                >
                  <MessageCircle size={20} />
                  Envoyer à la Régie Pub
                </a>
                <button
                  onClick={() => setIsGenerating(false)} // Just resets loading, keeps text
                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Modifier ma demande
                </button>
              </div>
              <p className="text-center text-xs text-gray-500 mt-4">
                En cliquant sur "Envoyer", ce texte sera pré-rempli dans WhatsApp pour contacter notre équipe commerciale.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
