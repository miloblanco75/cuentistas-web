/**
 * rankSystem.js - Phase 14 Prestige Engine
 * Manages competitive tiers and ELO calculations.
 */

export const RANKS = {
    ASPIRANTE: "Aspirante",
    NARRADOR: "Narrador",
    CRONISTA: "Cronista",
    MAESTRO: "Maestro del Tribunal",
    LEYENDA: "Leyenda"
};

export const RANK_THRESHOLDS = [
    { name: RANKS.LEYENDA, min: 1700 },
    { name: RANKS.MAESTRO, min: 1400 },
    { name: RANKS.CRONISTA, min: 1200 },
    { name: RANKS.NARRADOR, min: 1000 },
    { name: RANKS.ASPIRANTE, min: 0 }
];

/**
 * Calculates current rank string based on Elo
 */
export function calculateRank(elo) {
    const rank = RANK_THRESHOLDS.find(r => elo >= r.min);
    return rank ? rank.name : RANKS.ASPIRANTE;
}

/**
 * Calculates ELO change based on writing performance or voting precision
 * Standard Elo-like formula: newElo = oldElo + K * (Actual - Expected)
 */
export function updateElo(oldElo, performanceScore, averageScore, kFactor = 32) {
    // performanceScore: User's score in entry (0-10)
    // averageScore: Contest's average entry score (0-10)
    
    // Normalize to 0-1
    const actual = performanceScore / 10;
    const expected = averageScore / 10;
    
    const change = Math.round(kFactor * (actual - expected));
    const newElo = Math.max(0, oldElo + change);
    
    return {
        newElo,
        change,
        rank: calculateRank(newElo)
    };
}
