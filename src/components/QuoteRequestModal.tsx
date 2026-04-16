
import React, { useEffect, useMemo, useState } from 'react';
import { SERVICE_CATEGORIES } from '../constants';
import { X } from 'lucide-react';

type QuoteRequestModalProps = {
  category: string;               // label de la catégorie (ex: "Bâtiment")
  subCategory: string;            // label de la sous-catégorie (ex: "Maçon")
  onClose: () => void;
  onSubmit: (details: {
    category: string;
    subCategory: string;
    specialization?: string;
    description: string;
    name?: string;
    phone?: string;
    email?: string;
  }) => void;
};

const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({ category, subCategory, onClose, onSubmit }) => {
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [selectedSpec, setSelectedSpec] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Charge dynamiquement les spécialisations depuis les constantes
  useEffect(() => {
    const catNode = SERVICE_CATEGORIES.find(c => c.label === category);
    const subNode = catNode?.subCategories?.find(s => s.label === subCategory);
    const specs = subNode?.specializations?.map(sp => sp.label) || [];
    setSpecializations(specs);
    setSelectedSpec(''); // reset lorsque modal change de contexte
    setError(null);
    setDescription('');
  }, [category, subCategory]);

  // Validation avant envoi
  const validateAndSubmit = () => {
    // Si la sous-catégorie a des spécialisations, la sélection est obligatoire
    if (specializations.length > 0 && !selectedSpec) {
      setError('Veuillez choisir une spécialisation pour cette demande.');
      return;
    }

    if (!description.trim()) {
      setError('Veuillez décrire votre besoin (même quelques mots).');
      return;
    }

    // Contact optionnel mais on renverra ce qui est fourni
    const payload = {
      category,
      subCategory,
      specialization: selectedSpec || undefined,
      description: description.trim(),
      name: contactName.trim() || undefined,
      phone: contactPhone.trim() || undefined,
      email: contactEmail.trim() || undefined,
    };

    setError(null);
    onSubmit(payload);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Demande de devis — {subCategory}</h3>
          <button onClick={onClose} aria-label="Fermer" className="p-1 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-600">
            Catégorie : <span className="font-medium text-gray-800">{category}</span>
            <br />
            Sous-catégorie : <span className="font-medium text-gray-800">{subCategory}</span>
          </div>

          {specializations.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spécialisation requise</label>
              <select
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Choisir une spécialisation --</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">La spécialisation est requise pour que les prestataires sachent exactement votre besoin.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spécialisation (optionnelle)</label>
              <input
                type="text"
                placeholder="Ex: Fondation, Réfection toiture..."
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <p className="mt-1 text-xs text-gray-500">Aucune spécialisation prédéfinie — tu peux préciser librement.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description du besoin</label>
            <textarea
              rows={4}
              placeholder="Décris brièvement ce que tu attends (dimensions, matériaux, contraintes...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Ton nom (optionnel)"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="tel"
              placeholder="Téléphone (optionnel)"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email (optionnel)"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border rounded">Annuler</button>
            <button onClick={validateAndSubmit} className="px-4 py-2 bg-brand-orange text-white rounded font-medium">Envoyer la demande</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestModal;
