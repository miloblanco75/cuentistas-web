/**
 * 🚩 FEATURE FLAGS SYSTEM - CUENTISTAS ARENA
 * Permite despliegues Progresivos y Apagado de Emergencia.
 */

export const COMBAT_FLAGS = {
    live_combat_enabled: process.env.NEXT_PUBLIC_LIVE_COMBAT === 'true',
    combat_hud_enabled: process.env.NEXT_PUBLIC_COMBAT_HUD === 'true',
    ink_powers_enabled: process.env.NEXT_PUBLIC_INK_POWERS === 'true',
    live_events_enabled: process.env.NEXT_PUBLIC_LIVE_EVENTS === 'true',
    finish_pressure_event_enabled: process.env.NEXT_PUBLIC_FINISH_PRESSURE === 'true',
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
