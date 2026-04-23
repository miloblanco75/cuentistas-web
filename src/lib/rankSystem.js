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
 * Dampened V2 Formula (Phase 14A):
 * delta = (Score% - 50) * 0.5
 * Clamped between -25 and +25
 */
export function updateElo(oldElo, performanceScorePercent) {
    // performanceScorePercent: 0-100 (e.g. expertScore normalized to 100)
    
    // 1. Calculate Dampened Delta
    let delta = (performanceScorePercent - 50) * 0.5;
    
    // 1.1 Neutral Zone (Phase 14A Patch)
    // Avoid micro-noise if performance is very close to baseline (±5%)
    if (Math.abs(performanceScorePercent - 50) < 5) {
        delta = 0;
    }
    
    // 2. Clamp Delta (-25 to +25)
    delta = Math.min(25, Math.max(-25, delta));
    
    // 3. Preliminary New Elo
    const targetElo = oldElo + delta;
    
    // 4. Apply Soft Smoothing (10% adjustment speed)
    // newElo = (oldElo * 0.9) + (targetElo * 0.1)
    let smoothedElo = (oldElo * 0.9) + (targetElo * 0.1);
    
    // 5. Finalize: Round and check floor
    const finalElo = Math.round(Math.max(0, smoothedElo));
    
    return {
        newElo: finalElo,
        change: finalElo - oldElo,
        rank: calculateRank(finalElo)
    };
}
