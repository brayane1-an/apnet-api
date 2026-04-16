
import { DeliveryQuote, VehicleType } from '../types';

// 🔵 1. Définition des zones d’Abidjan
const ZONE_1 = ["Cocody", "Angré", "II Plateaux", "Bingerville"];
const ZONE_2 = ["Marcory", "Koumassi", "Yopougon", "Treichville"];
const ZONE_3 = ["Plateau", "Adjamé", "Abobo", "Williamsville"];

/**
 * Détermine la zone d'une commune.
 * Par défaut, si non trouvé, renvoie ZONE_2 (Moyenne).
 */
const getZoneLevel = (commune: string): { level: 1 | 2 | 3, name: string } => {
  const c = commune.trim();
  if (ZONE_1.some(z => c.includes(z) || z.includes(c))) return { level: 1, name: 'ZONE_1' };
  if (ZONE_3.some(z => c.includes(z) || z.includes(c))) return { level: 3, name: 'ZONE_3' };
  // Zone 2 inclut sa liste + fallback par défaut
  return { level: 2, name: 'ZONE_2' };
};

/**
 * Calcul du prix de base selon la zone et la distance
 */
const getBasePrice = (zoneLevel: 1 | 2 | 3, distanceKm: number, pickup: string, dropoff: string): number => {
  // Facteur de détour géographique (Ponts, Embouteillages structurels)
  // Exemple: Yopougon <-> Cocody / Plateau <-> Marcory
  let detourFactor = 1.0;
  const p = pickup.toLowerCase();
  const d = dropoff.toLowerCase();

  if ((p.includes('yopougon') && d.includes('cocody')) || (d.includes('yopougon') && p.includes('cocody'))) {
    detourFactor = 1.2; // +20% pour la traversée et les détours habituels
  }
  if ((p.includes('plateau') && d.includes('marcory')) || (d.includes('plateau') && p.includes('marcory'))) {
    detourFactor = 1.15; // Pont HKB ou De Gaulle
  }

  const effectiveDistance = distanceKm * detourFactor;

  // 🔹 ZONE 1 (courtes distances – trafic fluide)
  if (zoneLevel === 1) {
    if (effectiveDistance <= 3) return 500;
    if (effectiveDistance <= 6) return 800;
    if (effectiveDistance <= 10) return 1200;
    return 1500;
  }

  // 🔸 ZONE 2 (trafic moyen)
  if (zoneLevel === 2) {
    if (effectiveDistance <= 3) return 700;
    if (effectiveDistance <= 6) return 1000;
    if (effectiveDistance <= 10) return 1500;
    return 2000;
  }

  // 🔺 ZONE 3 (zones très encombrées)
  if (zoneLevel === 3) {
    if (effectiveDistance <= 3) return 800;
    if (effectiveDistance <= 6) return 1200;
    if (effectiveDistance <= 10) return 1800;
    return 2500;
  }

  return 2000;
};

export const calculateDeliveryPrice = (
  pickupCommune: string,
  dropoffCommune: string,
  distanceKm: number,
  weightKg: number,
  hour: number,
  declaredValue: number = 0,
  vehicleType: VehicleType = VehicleType.MOTO,
  isBadWeather: boolean = false,
  hasLoadingService: boolean = false
): DeliveryQuote => {
  
  const pickupZone = getZoneLevel(pickupCommune);
  const dropoffZone = getZoneLevel(dropoffCommune);
  
  const zoneLevel = Math.max(pickupZone.level, dropoffZone.level) as 1 | 2 | 3;
  const zoneName = zoneLevel === 1 ? 'ZONE_1' : zoneLevel === 2 ? 'ZONE_2' : 'ZONE_3';

  // 1. Prix de base avec facteur géographique
  let basePrice = getBasePrice(zoneLevel, distanceKm, pickupCommune, dropoffCommune);
  const supplements: string[] = [];

  // 2. Coefficient de Temps (Trafic Heures de Pointe)
  // 7h-9h ou 17h-19h : +15% (Doublé pour les camions -> +30%)
  const isPeakHour = (hour >= 7 && hour < 9) || (hour >= 17 && hour < 19);
  const isHeavyVehicle = vehicleType === VehicleType.CAMIONNETTE || vehicleType === VehicleType.CARGO || vehicleType === VehicleType.CAMION;
  
  if (isPeakHour) {
    const trafficRate = isHeavyVehicle ? 0.30 : 0.15;
    const trafficSurcharge = Math.round(basePrice * trafficRate);
    basePrice += trafficSurcharge;
    supplements.push(`Trafic Heure de Pointe (+${trafficRate * 100}% : ${trafficSurcharge}F)`);
  }

  // Tarif de nuit
  if (hour >= 22 || hour < 5) {
    basePrice += 300;
    supplements.push("Tarif de nuit (+300F)");
  }

  // 3. Suppléments Poids
  if (weightKg > 5) {
    const weightFee = weightKg > 20 ? 1000 : 500;
    basePrice += weightFee;
    supplements.push(`Colis lourd (+${weightFee}F)`);
  }

  // 4. Multiplicateur Véhicule (Ajusté pour le marché d'Abidjan)
  let vehicleMultiplier = 1.0;
  if (vehicleType === VehicleType.VOITURE) vehicleMultiplier = 2.5;
  if (vehicleType === VehicleType.CAMIONNETTE) vehicleMultiplier = 7.0; // Augmenté
  if (vehicleType === VehicleType.TRICYCLE) vehicleMultiplier = 1.5;
  if (vehicleType === VehicleType.CARGO) vehicleMultiplier = 15.0; // Réalité marché
  if (vehicleType === VehicleType.CAMION) vehicleMultiplier = 15.0; // Réalité marché

  let riderPrice = Math.round(basePrice * vehicleMultiplier);
  
  // 4.5 Prime de Pluie & Nuit (Mauvais Temps)
  if (isBadWeather) {
      const weatherBonus = Math.round(riderPrice * 0.20);
      riderPrice += weatherBonus;
      supplements.push(`Prime Mauvais Temps (+20% : ${weatherBonus}F)`);
  }
  
  // Règle de prix minimum (Tarif de base plancher)
  if (vehicleType === VehicleType.MOTO && riderPrice < 1000) {
    riderPrice = 1000;
    supplements.push("Tarif minimum Moto (1000F)");
  }
  if (vehicleType === VehicleType.CAMIONNETTE && riderPrice < 7000) {
    riderPrice = 7000;
    supplements.push("Tarif minimum Camionnette (7000F)");
  }
  if ((vehicleType === VehicleType.CARGO || vehicleType === VehicleType.CAMION) && riderPrice < 15000) {
    riderPrice = 15000;
    supplements.push("Tarif minimum Poids Lourd (15000F)");
  }

  if (vehicleMultiplier > 1) {
      supplements.push(`Véhicule ${vehicleType} (x${vehicleMultiplier})`);
  }

  // 5. Option Objet Précieux (Manutention & Assurance)
  let riskPremium = 0;
  if (declaredValue > 0) {
      // Frais fixes de manutention selon le poids + 5% de la valeur
      const handlingFee = weightKg > 10 ? 1000 : 500;
      riskPremium = handlingFee + Math.round(declaredValue * 0.05);
      riderPrice += riskPremium;
      supplements.push(`Objet Précieux / Assurance (+${riskPremium}F)`);
  }

  // 5.5 Service de Chargement / Main d'œuvre
  if (hasLoadingService) {
      const loadingFee = isHeavyVehicle ? 5000 : 2000;
      riderPrice += loadingFee;
      supplements.push(`Main d'œuvre / Chargement (+${loadingFee}F)`);
  }

  // 6. Commission & Frais APNET
  // Stratégie : 100F de frais de service fixes pour le client (Frais de dossier)
  // Commission de 10% prélevée sur le livreur pour TOUS sauf MOTO (0%)
  const isMoto = vehicleType === VehicleType.MOTO;
  
  let commission = 0;
  if (!isMoto) {
      commission = Math.round(riderPrice * 0.10); // 10% commission
      supplements.push(`Commission APNET 10% (${commission}F)`);
  } else {
      supplements.push("Commission Livreur 0% (Spécial Moto)");
  }
  
  const serviceFee = 100; // Frais de dossier fixes payés par le client
  const finalPrice = riderPrice + serviceFee;
  const finalRiderGain = riderPrice - commission;
  const totalApnetGain = commission + serviceFee;

  return {
    prix_total: finalPrice,
    gain_livreur: finalRiderGain,
    gain_apnet: totalApnetGain,
    apnet_fixed_fee: serviceFee,
    apnet_commission: commission,
    hasLoadingService,
    details: {
      zone: zoneName,
      distance: `${distanceKm} km`,
      supplements: supplements,
      riskPremium: riskPremium
    }
  };
};
