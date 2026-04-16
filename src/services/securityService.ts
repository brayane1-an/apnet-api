
/**
 * SERVICE DE SÉCURITÉ (SIMULATION BACKEND)
 * Ce fichier contient la logique stricte pour empêcher l'échange de coordonnées.
 */

export function antiNumInfo(message: string): boolean {
  if (!message) return false;

  // Normalisation : minuscule, sans accent, remplacement des symboles de masquage courants
  const normalized = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,\-_/\\|()\[\]{}]/g, " "); // Remplace séparateurs par espace

  // --- 1. DÉTECTION NUMÉROS DE TÉLÉPHONE (FORMAT IVOIRIEN & VARIANTES) ---
  // On cherche les séquences de chiffres, même espacées
  // Ex: "07 07 45..." ou "0.7.0.7..." ou "+225..."
  
  // Regex stricte pour détecter les numéros (8 à 14 chiffres, avec ou sans indicatif)
  // Catch: 01020304, 07 08 09 10, +225 05..., 00225...
  const phoneRegex = /(?:(?:\+|00)225[\s-]?)?[0157]\d(?:[\s-]*\d){7,}/;
  
  // Analyse de la chaine nettoyée (sans espaces multiples)
  const cleanSpace = normalized.replace(/\s+/g, "");
  
  // Vérification regex sur chaine sans espace (pour attraper "0 7 0 8...")
  if (/\d{8,}/.test(cleanSpace)) {
      // On vérifie si ça ressemble à un prix (contexte)
      // Si le nombre est suivi de "f", "cfa", "francs", on laisse passer (ex: 5000f)
      // Mais si c'est un format tel (commence par 01,05,07 ou +225), on bloque
      if (phoneRegex.test(message) || /(?:^|\D)0[157]\d{8}(?:\D|$)/.test(cleanSpace)) {
          return true;
      }
      
      // Si suite de 10 chiffres (nouveau format) ou 8 (ancien) sans contexte monétaire clair
      if (/\d{8,10}/.test(cleanSpace) && !cleanSpace.includes("fcfa") && !cleanSpace.includes("franc")) {
          return true;
      }
  }

  // --- 2. DÉTECTION ALPHANUMÉRIQUE (Le plus courant pour contourner) ---
  // Ex: "zéro sept, quarante deux..."
  const numberWords = [
    "zero", "un", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
    "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "vingt",
    "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "cent", "mille"
  ];
  
  const words = normalized.split(/\s+/);
  let consecutiveNumbers = 0;
  
  for (const w of words) {
    if (numberWords.includes(w) || /^\d+$/.test(w)) {
      consecutiveNumbers++;
    } else if (w.length > 2) { 
      // Si mot normal, reset sauf si mot de liaison
      if (!["et", "le", "de", "mon", "c'est", "au"].includes(w)) {
          consecutiveNumbers = 0;
      }
    }
    
    // Si 3 chiffres/mots-chiffres à la suite -> BLOQUÉ
    if (consecutiveNumbers >= 3) {
        // Exception pour les prix ronds écrits en toutes lettres "dix mille francs"
        if (normalized.includes("franc") || normalized.includes("fcfa")) {
             if (consecutiveNumbers > 5) return true; // Trop long pour un prix simple
        } else {
            return true;
        }
    }
  }

  // --- 3. EMAILS & LIENS ---
  if (normalized.match(/[\w.-]+@[\w.-]+\.[a-z]{2,}/)) return true; // email
  if (normalized.includes(".com") || normalized.includes(".ci") || normalized.includes(".net") || normalized.includes("www.") || normalized.includes("http")) {
      if (!normalized.includes("apnet")) return true;
  }

  // --- 4. MOTS CLÉS INTERDITS EXPLICITES & RÉSEAUX ---
  const forbiddenPhrases = [
    "mon numero", "mon what", "watsap", "whatsapp", "mon contact", "ecris moi", 
    "mon tel", "joignable au", "bip moi", "inbox", "ib", "mon direct",
    "passe moi ton", "ton numero", "ton contact", "telegram", "snap", "insta", "facebook",
    "gmail", "yahoo", "hotmail", "outlook", "adresse exacte", "habite a", "maison numero"
  ];
  
  if (forbiddenPhrases.some(kw => normalized.includes(kw))) return true;

  return false;
}
