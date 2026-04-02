// src/lib/feature_flags.js - Non-invasive Toggle System
// This allows enabling/disabling new features without deployments.

const FLAGS = {
  REWARDS_SYSTEM: true,
  LEVEL_SYSTEM: true,
  VERSIONED_API: false,
};

export function isFeatureEnabled(flagName) {
  return FLAGS[flagName] === true;
}

export function setFeatureFlag(flagName, value) {
  FLAGS[flagName] = value;
}

export default FLAGS;
