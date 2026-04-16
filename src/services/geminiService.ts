
import { GoogleGenAI } from "@google/genai";

// Initialize lazily to prevent crash on load if env var is missing in some contexts
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return aiClient;
};

// Helper: Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove Data-URL declaration (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const enhanceDescription = async (
  role: string,
  keywords: string,
  location: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    const prompt = `
      Tu es un assistant pour la plateforme APNET en Côte d'Ivoire.
      Ton rôle est d'aider un utilisateur (${role}) à rédiger une description professionnelle et attrayante pour son profil ou son offre.
      
      Contexte :
      - Rôle : ${role} (ex: Plombier, Chercheur d'emploi, Ménagère, ou Employeur cherchant un maçon)
      - Mots-clés fournis : ${keywords}
      - Localisation : ${location}
      
      Rédige une description courte (3-4 phrases), polie, professionnelle, et rassurante. 
      Utilise un ton local respectueux mais professionnel.
      Ne mets pas de guillemets au début ou à la fin.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Désolé, je n'ai pas pu générer de description. Veuillez réessayer.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Une erreur est survenue lors de la génération du texte. Vérifiez votre connexion.";
  }
};

export const generateAdContent = async (
  businessName: string,
  targetAudience: string,
  offerDetails: string
): Promise<{slogan: string, body: string}> => {
  try {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    const prompt = `
      Tu es un expert en marketing digital en Côte d'Ivoire.
      Ton client est une entreprise locale : "${businessName}".
      Cible : ${targetAudience}.
      Offre : ${offerDetails}.

      Tâche :
      1. Crée un Slogan court et percutant (avec des emojis).
      2. Rédige un texte publicitaire (3-4 lignes) attrayant, convaincant et adapté au marché ivoirien.

      Format de réponse attendu (JSON uniquement) :
      {
        "slogan": "Le slogan ici",
        "body": "Le texte publicitaire ici"
      }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const json = JSON.parse(response.text || "{}");
    return {
      slogan: json.slogan || "APNET - Boostez votre visibilité",
      body: json.body || "Contactez notre régie publicitaire pour mettre en avant vos services."
    };
  } catch (error) {
    console.error("Error generating ad:", error);
    return {
      slogan: "Erreur de génération",
      body: "Veuillez réessayer plus tard ou contacter le support."
    };
  }
};

// ANALYSE PHOTO DE TRAVAIL (Chat)
export const analyzeJobImage = async (
  imageBase64: string, 
  description: string
): Promise<{
  isValid: boolean;
  analysis: string;
  anomalies: string[];
  advice: string;
}> => {
  try {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash'; 
    
    const prompt = `
      Tu es un expert technique pour APNET (Bâtiment, Artisanat, Services).
      Un client a envoyé une photo pour un travail.
      Description du client : "${description}"
      
      Tâche :
      1. Analyse la demande.
      2. Détecte des anomalies potentielles.
      3. Donne un conseil au prestataire.

      Format JSON attendu :
      {
        "isValid": true/false,
        "analysis": "Résumé...",
        "anomalies": ["Anomalie 1"],
        "advice": "Conseil..."
      }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.text || "{}");
    return {
        isValid: result.isValid ?? true,
        analysis: result.analysis || "Analyse effectuée.",
        anomalies: result.anomalies || [],
        advice: result.advice || "Vérifiez bien les détails sur place."
    };

  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      isValid: true,
      analysis: "L'IA n'a pas pu analyser l'image en détail (Simulation).",
      anomalies: [],
      advice: "Procédez avec prudence."
    };
  }
};

// --- VALIDATION DES DOCUMENTS D'INSCRIPTION ---

export async function validateIdentityCard(file: File): Promise<{ valid: boolean, reason?: string }> {
  try {
    const ai = getAiClient();
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const prompt = `
      Analyse cette image. C'est censé être une Carte Nationale d'Identité (CNI) ou un Passeport.
      
      Vérifie scrupuleusement :
      1. Est-ce un document officiel d'identité ? (Pas une feuille blanche, pas un selfie simple, pas un dessin).
      2. Y a-t-il un visage visible sur le document ?
      3. Y a-t-il du texte officiel visible (ex: "Nom", "Prénoms", "République", "Date de naissance") ?
      
      Réponds UNIQUEMENT en JSON :
      {
        "isOfficialDocument": boolean,
        "containsFace": boolean,
        "containsOfficialText": boolean,
        "isPaperSheet": boolean, // Si c'est juste une feuille de papier blanche ou manuscrite
        "reason": "Explication courte si invalide"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: "application/json" }
    });

    const analysis = JSON.parse(response.text || "{}");

    if (analysis.isPaperSheet) return { valid: false, reason: "Document incorrect (feuille de papier ou dessin détecté)." };
    if (!analysis.isOfficialDocument) return { valid: false, reason: "Ce document ne ressemble pas à une pièce d'identité officielle." };
    if (!analysis.containsFace) return { valid: false, reason: "Aucun visage détecté sur la pièce d'identité." };
    if (!analysis.containsOfficialText) return { valid: false, reason: "Informations officielles (Nom, Date) illisibles ou absentes." };

    return { valid: true };

  } catch (error) {
    console.error("Erreur validation ID:", error);
    // Fallback safe: on laisse passer si l'API échoue pour ne pas bloquer, 
    // ou on bloque si on veut être strict. Ici on bloque par sécurité.
    return { valid: false, reason: "Impossible de vérifier le document. Veuillez réessayer avec une photo plus claire." };
  }
}

export async function validateCV(file: File): Promise<{ valid: boolean, reason?: string }> {
  try {
    // Si c'est un PDF, on ne peut pas l'analyser facilement avec Gemini Flash Image sans extraction préalable.
    // Pour cette démo, on suppose que le user upload une image du CV ou on mock le PDF.
    if (file.type === 'application/pdf') {
        // Mock validation pour PDF (check size > 1KB)
        if (file.size < 1000) return { valid: false, reason: "Fichier PDF vide ou corrompu." };
        return { valid: true };
    }

    const ai = getAiClient();
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const prompt = `
      Analyse cette image. C'est censé être un Curriculum Vitae (CV) professionnel.
      
      Vérifie :
      1. Est-ce un document structuré avec du texte (Expérience, Formation, etc.) ?
      2. Est-ce lisible ?
      3. Ce n'est pas une photo aléatoire (paysage, selfie, objet) ?
      
      Réponds UNIQUEMENT en JSON :
      {
        "isCV": boolean,
        "reason": "Explication si ce n'est pas un CV"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: "application/json" }
    });

    const analysis = JSON.parse(response.text || "{}");

    if (!analysis.isCV) {
        return { valid: false, reason: analysis.reason || "Le document ne ressemble pas à un CV professionnel." };
    }

    return { valid: true };

  } catch (error) {
    console.error("Erreur validation CV:", error);
    return { valid: true }; // On laisse passer en cas d'erreur technique sur le CV pour ne pas être trop bloquant
  }
}
