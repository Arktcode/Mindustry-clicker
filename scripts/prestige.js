// scripts/prestige.js

const MAX_PRESTIGE = 15;
const ROMAN_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV'];

window.prestigeData = { level: 0 };

window.toRoman = function (n) {
    return ROMAN_NUMERALS[n] || String(n);
};

window.getPrestigeLevel = () => window.prestigeData.level;
window.getPrestigeRoman = () => window.prestigeData.level > 0 ? window.toRoman(window.prestigeData.level) : '';

// Prestige 0=×1.0, I=×1.5, II=×2.0, III=×2.5 ...
window.getPrestigeProductionMultiplier = () => 1 + 0.5 * window.prestigeData.level;

// Cost multiplier: 1.15^level
window.getPrestigeCostMultiplier = () => Math.pow(1.15, window.prestigeData.level);

window.doPrestige = function () {
    if (window.prestigeData.level >= MAX_PRESTIGE) {
        alert('You have already reached the maximum Prestige (XV)!');
        return;
    }

    window.prestigeData.level++;
    const newLevel = window.prestigeData.level;

    // Reset resources
    const gameRes = window.getGameResources ? window.getGameResources() : {};
    for (const key in gameRes) gameRes[key] = 0;

    // Reset fluids
    if (window.getFluidsState) {
        const fs = window.getFluidsState();
        for (const t in fs) { fs[t].current = 0; fs[t].netFlow = 0; }
    }

    // Reset energy
    if (window.getEnergyState) {
        const es = window.getEnergyState();
        es.currentEnergy = 0;
    }

    // Reset all blocks
    if (window.getAllBlocks) {
        window.getAllBlocks().forEach(b => {
            b.level = 0;
            b.unlocked = false;
            if (window.recalculateBlockCost) window.recalculateBlockCost(b);
        });
    }

    // Reset all upgrades
    if (window.getUpgradesArray) {
        window.getUpgradesArray().forEach(u => {
            u.currentLevel = 0;
            u.unlocked = u.base_unlocked === true;
            if (window.recalculateUpgradeCost) window.recalculateUpgradeCost(u);
        });
    }

    // Reset power and automining
    if (window.resetPowerLevels) window.resetPowerLevels();
    window.autominingMultiplier = 1.0;

    // Recalculate stats
    if (window.recalculateGlobalStats) window.recalculateGlobalStats();
    if (window.recalculateNominalStats) window.recalculateNominalStats();
    if (window.recalculateTotalBlockConsumption) window.recalculateTotalBlockConsumption();

    window.guiDirty = true;
    window.slowGuiDirty = true;
    window.fastGuiDirty = true;

    window.updatePrestigeBadge();

    if (window.saveGame) window.saveGame();
    _showPrestigeOverlay(newLevel);
};

function _showPrestigeOverlay(level) {
    const overlay = document.getElementById('prestige-overlay');
    if (!overlay) return;
    const prodMult = window.getPrestigeProductionMultiplier();
    const costMult = window.getPrestigeCostMultiplier();
    document.getElementById('prestige-level-display').textContent = `Prestige ${window.toRoman(level)}`;
    document.getElementById('prestige-prod-mult').textContent = `×${prodMult.toFixed(1)} production speed`;
    document.getElementById('prestige-cost-mult').textContent = `×${costMult.toFixed(2)} build costs`;
    overlay.style.display = 'flex';
}

window.closePrestigeScreen = function () {
    const el = document.getElementById('prestige-overlay');
    if (el) el.style.display = 'none';
};

window.updatePrestigeBadge = function () {
    const badge = document.getElementById('prestige-badge');
    const badgeText = document.getElementById('prestige-badge-text');
    if (!badge) return;
    if (window.prestigeData.level > 0) {
        badge.style.display = 'block';
        if (badgeText) badgeText.textContent = window.toRoman(window.prestigeData.level);
    } else {
        badge.style.display = 'none';
    }
};
