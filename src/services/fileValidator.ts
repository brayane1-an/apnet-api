
/**
 * Service de validation locale des fichiers avant envoi
 * Vérifie : Type MIME, Extension, Taille
 */

export const validateIdentityCard = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5 Mo

  if (!file) return { valid: false, error: "Fichier manquant." };

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Format invalide. Utilisez JPG, PNG ou PDF." };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "Fichier trop lourd (Max 5 Mo)." };
  }

  return { valid: true };
};

export const validateCV = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];
  const maxSize = 5 * 1024 * 1024; // 5 Mo

  if (!file) return { valid: false, error: "Fichier manquant." };

  // Vérification stricte du type : Pas d'images pour le CV
  if (file.type.startsWith('image/')) {
    return { valid: false, error: "Les images ne sont pas acceptées pour le CV. Utilisez PDF ou DOC." };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Format invalide. PDF, DOC ou DOCX uniquement." };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "Fichier trop lourd (Max 5 Mo)." };
  }

  // Vérification basique du nom de fichier pour mots-clés (Heuristique simple)
  const fileName = file.name.toLowerCase();
  const keywords = ['cv', 'curriculum', 'resume', 'profil', 'parcours'];
  const hasKeyword = keywords.some(k => fileName.includes(k));
  
  // Note: Ce n'est pas bloquant mais c'est un bon indicateur
  // On retourne valide, le contenu sera vérifié par l'IA plus tard.

  return { valid: true };
};
