/**
 * 🚩 FEATURE FLAGS SYSTEM - CUENTISTAS ARENA
 * Permite despliegues Progresivos y Apagado de Emergencia.
 */

export const COMBAT_FLAGS = {
    live_combat_enabled: true,
    combat_hud_enabled: true,
    ink_powers_enabled: true,
    live_events_enabled: true,
    finish_pressure_event_enabled: true,
    aftermath_enabled: true,
    revenge_loop_enabled: true,
    post_defeat_offers_enabled: true,
    prestige_throne_enabled: true,
    league_system_enabled: true,
    prestige_titles_enabled: true,
    seasonal_crowns_enabled: true,
    scarcity_law_enabled: true,
    prestige_decay_enabled: true,
    crown_defense_enabled: true,
    limited_relics_enabled: true,
    imperial_analytics_enabled: true,
    sovereign_dashboard_enabled: true,
    danger_alerts_enabled: true,
    ab_test_engine_enabled: true,
};

/**
 * 🛡️ Verificador de exposición (Rollout por %)
 * @param {string} userId 
 * @param {number} rolloutPercentage (0-100)
 */
export const isUserInRollout = (userId, rolloutPercentage = 10) => {
    if (!userId) return false;
    // Simple hash para consistencia del usuario
    const charSum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (charSum % 100) < rolloutPercentage;
};
