// scripts/items.js

const resources = [
    { id: 'copper', name: 'Copper', sprite: 'assets/sprites/items/item-copper.png', unlocked: true, clickPower: 5, tier: 0 },
    { id: 'lead', name: 'Lead', sprite: 'assets/sprites/items/item-lead.png', unlocked: false, clickPower: 1, unlockReq: { upgradeId: 'copper-drill', minLevel: 10 }, tier: 0 },
    { id: 'coal', name: 'Coal', sprite: 'assets/sprites/items/item-coal.png', unlocked: false, clickPower: 1, unlockReq: { upgradeId: 'lead-drill', minLevel: 10 }, tier: 0 },
    { id: 'sand', name: 'Sand', sprite: 'assets/sprites/items/item-sand.png', unlocked: false, clickPower: 1, unlockReq: { upgradeId: 'coal-drill', minLevel: 10 }, tier: 0 },
    { id: 'scrap', name: 'Scrap', sprite: 'assets/sprites/items/item-scrap.png', unlocked: false, clickPower: 1, unlockReq: { upgradeId: 'sand-drill', minLevel: 10 }, tier: 0 },
    { id: 'titanium', name: 'Titanium', sprite: 'assets/sprites/items/item-titanium.png', unlocked: false, clickPower: 1, unlockReq: { upgradeId: 'scrap-drill', minLevel: 10 }, tier: 1 },
    { id: 'thorium', name: 'Thorium', sprite: 'assets/sprites/items/item-thorium.png', unlocked: false, clickPower: 1, unlockReq: { upgradeId: 'titanium-drill', minLevel: 10 }, tier: 1 },
    { id: 'graphite', name: 'Graphite', sprite: 'assets/sprites/items/item-graphite.png', unlocked: true, clickPower: 1, unlockReq: { blockId: 'graphite-press', minLevel: 1 }, tier: 2 },
    { id: 'silicon', name: 'Silicon', sprite: 'assets/sprites/items/item-silicon.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'silicon-smelter', minLevel: 1 }, tier: 2 },
    { id: 'metaglass', name: 'Metaglass', sprite: 'assets/sprites/items/item-metaglass.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'kiln', minLevel: 1 }, tier: 2 },
    { id: 'plastanium', name: 'Plastanium', sprite: 'assets/sprites/items/item-plastanium.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'plastanium-compressor', minLevel: 1 }, tier: 2 },
    { id: 'phase-fabric', name: 'Phase Fabric', sprite: 'assets/sprites/items/item-phase-fabric.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'phase-weaver', minLevel: 1 }, tier: 3 },
    { id: 'surge-alloy', name: 'Surge Alloy', sprite: 'assets/sprites/items/item-surge-alloy.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'surge-smelter', minLevel: 1 }, tier: 3 },
    { id: 'spore-pod', name: 'Spore Pod', sprite: 'assets/sprites/items/item-spore-pod.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'spore-press', minLevel: 1 }, tier: 'L' },
    { id: 'pyratite', name: 'Pyratite', sprite: 'assets/sprites/items/item-pyratite.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'pyratite-mixer', minLevel: 1 }, tier: 'L' },
    { id: 'blast-compound', name: 'Blast Compound', sprite: 'assets/sprites/items/item-blast-compound.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'blast-mixer', minLevel: 1 }, tier: 'L' },
];

// Helper to get ALL resource IDs
const ALL_ITEM_IDS = resources.map(r => r.id);

// Data Retrieval API
window.getResourceData = (id) => resources.find(r => r.id === id);
window.getUnlockableResources = () => resources.filter(r => !r.unlocked);
window.getAllResources = () => resources;
window.getAllResourceIds = () => ALL_ITEM_IDS;

// Initialization API for script.js
window.getInitialResources = () => {
    const res = {};
    resources.forEach(r => res[r.id] = 0);
    return res;
};

window.getInitialPowerLevel = () => {
    const p = {};
    resources.forEach(r => p[r.id] = r.clickPower || 0);
    return p;
};

window.getInitialAutominingRate = () => {
    const a = {};
    resources.forEach(r => a[r.id] = 0);
    return a;
};

window.unlockResource = function (resourceId) {
    const r = resources.find(x => x.id === resourceId);
    if (r && !r.unlocked) {
        r.unlocked = true;
        window.guiDirty = true;
        if (window.handleResourceUnlockDOM) window.handleResourceUnlockDOM(resourceId);
    }
};

function updateItemPanel() {
    if (!window.getGameResources) return;
    const cur = window.getGameResources();
    ALL_ITEM_IDS.forEach(res => {
        const lbl = document.getElementById(`item-${res}-label`);
        if (lbl) lbl.textContent = window.formatNumber(cur[res] || 0);
    });
}

document.addEventListener('resourcesUpdated', updateItemPanel);
document.addEventListener('DOMContentLoaded', updateItemPanel);