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

window.showExistingPrestigeOverlay = function() {
    if (window.prestigeData.level > 0) {
        _showPrestigeOverlay(window.prestigeData.level);
    }
};

let particleInterval = null;
window.spawnPrestigeParticles = function() {
    const btn = document.getElementById('leaderboard-prestige-btn');
    if (!btn) return;

    if (particleInterval) clearInterval(particleInterval);
    
    particleInterval = setInterval(() => {
        const modal = document.getElementById('leaderboard-modal');
        if (!modal || modal.style.display === 'none') {
            clearInterval(particleInterval);
            particleInterval = null;
            return;
        }

        // Spawn 2 particles
        for(let i=0; i<2; i++) {
            const p = document.createElement('div');
            p.className = 'prestige-particle';
            
            // Random position along the 4 edges
            const side = Math.floor(Math.random() * 4);
            const rect = btn.getBoundingClientRect();
            const pad = 2;

            if (side === 0) { // Top
                p.style.left = (Math.random() * rect.width) + 'px';
                p.style.top = -pad + 'px';
            } else if (side === 1) { // Right
                p.style.left = (rect.width + pad) + 'px';
                p.style.top = (Math.random() * rect.height) + 'px';
            } else if (side === 2) { // Bottom
                p.style.left = (Math.random() * rect.width) + 'px';
                p.style.top = (rect.height + pad) + 'px';
            } else { // Left
                p.style.left = -pad + 'px';
                p.style.top = (Math.random() * rect.height) + 'px';
            }

            // Random rotation/length
            p.style.height = (8 + Math.random() * 10) + 'px';
            p.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
            
            btn.appendChild(p);
            setTimeout(() => p.remove(), 1200);
        }
    }, 300);
};

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
        if (badgeText) {
            const mult = window.getPrestigeProductionMultiplier();
            badgeText.textContent = `${window.toRoman(window.prestigeData.level)} (×${mult.toFixed(1)})`;
        }
    } else {
        badge.style.display = 'none';
    }
};
