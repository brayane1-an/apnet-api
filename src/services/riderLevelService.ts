
import { RiderLevel, RiderStats } from '../types';
import { RIDER_LEVEL_RULES } from '../constants';

/**
 * Calculates the appropriate level for a rider based on their statistics.
 * The logic checks from Platinum down to Bronze.
 */
export const calculateRiderLevel = (currentStats: RiderStats): RiderLevel => {
    // Check eligibility in descending order
    const levels = [RiderLevel.EXPERT, RiderLevel.PRO];
    
    for (const level of levels) {
        const rules = RIDER_LEVEL_RULES[level];
        // Rules: Must meet Points AND Rating Requirement
        if ((currentStats.reliabilityPoints || 0) >= rules.minPoints && currentStats.rating >= rules.minRating) {
            return level;
        }
    }

    // Default to BEGINNER if no higher criteria met
    return RiderLevel.BEGINNER;
};

/**
 * Get details about the next level to motivate the rider
 */
export const getNextLevelDetails = (currentLevel: RiderLevel) => {
    const rules = RIDER_LEVEL_RULES[currentLevel];
    const nextLevelKey = rules.nextLevel;
    
    if (!nextLevelKey) return null; // Already max level

    const nextRules = RIDER_LEVEL_RULES[nextLevelKey];
    return {
        level: nextLevelKey,
        label: nextRules.label,
        minPoints: nextRules.minPoints,
        minRating: nextRules.minRating,
        benefits: nextRules.benefits
    };
};
