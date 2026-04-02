// scripts/items.js

// Datos de Recursos
const resources = [
    { id: 'copper', name: 'Copper', sprite: 'assets/sprites/copper.png', unlocked: true, clickPower: 5, tier: 0 },
    { id: 'lead', name: 'Lead', sprite: 'assets/sprites/lead.png', unlocked: false, clickPower: 1, unlockReq: { upgradeId: 'copper-drill', minLevel: 10 }, tier: 0 },
    { id: 'coal', name: 'Coal', sprite: 'assets/sprites/coal.png', unlocked: false, clickPower: 1, unlockReq: { upgradeId: 'lead-drill', minLevel: 10 }, tier: 0 },
    { id: 'sand', name: 'Sand', sprite: 'assets/sprites/sand.png', unlocked: false, clickPower: 1, unlockReq: { upgradeId: 'coal-drill', minLevel: 10 }, tier: 0 },
    { id: 'titanium', name: 'Titanium', sprite: 'assets/sprites/titanium.png', unlocked: false, clickPower: 1, unlockReq: { upgradeId: 'sand-drill', minLevel: 10 }, tier: 1 },
    { id: 'thorium', name: 'Thorium', sprite: 'assets/sprites/thorium.png', unlocked: false, clickPower: 1, unlockReq: { upgradeId: 'titanium-drill', minLevel: 10 }, tier: 1 },
    { id: 'graphite', name: 'Graphite', sprite: 'assets/sprites/graphite.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'graphite-press', minLevel: 1 }, tier: 2 },
    { id: 'silicon', name: 'Silicon', sprite: 'assets/sprites/silicon.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'silicon-smelter', minLevel: 1 }, tier: 2 },
    { id: 'metaglass', name: 'Metaglass', sprite: 'assets/sprites/metaglass.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'kiln', minLevel: 1 }, tier: 2 },
    { id: 'plastanium', name: 'Plastanium', sprite: 'assets/sprites/plastanium.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'plastanium-compressor', minLevel: 1 }, tier: 2 },
    { id: 'phase-fabric', name: 'Phase Fabric', sprite: 'assets/sprites/phase-fabric.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'phase-weaver', minLevel: 1 }, tier: 3 },
    { id: 'surge-alloy', name: 'Surge Alloy', sprite: 'assets/sprites/surge-alloy.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'surge-smelter', minLevel: 1 }, tier: 3 },
    { id: 'spore-pod', name: 'Spore Pod', sprite: 'assets/sprites/spore-pod.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'spore-press', minLevel: 1 }, tier: 'L' },
    { id: 'pyratite', name: 'Pyratite', sprite: 'assets/sprites/pyratite.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'pyratite-mixer', minLevel: 1 }, tier: 'L' },
    { id: 'blast-compound', name: 'Blast Compound', sprite: 'assets/sprites/blast-compound.png', unlocked: false, clickPower: 1, unlockReq: { blockId: 'blast-mixer', minLevel: 1 }, tier: 'L' },
];

// API
window.getResourceData = (id) => resources.find(r => r.id === id);
window.getUnlockableResources = () => resources.filter(r => !r.unlocked);

window.unlockResource = function (resourceId) {
    const r = resources.find(x => x.id === resourceId);
    if (r && !r.unlocked) {
        r.unlocked = true;
        window.guiDirty = true;
        if (window.handleResourceUnlockDOM) window.handleResourceUnlockDOM(resourceId);
    }
};

const ALL_ITEM_IDS = resources.map(r => r.id);

function updateItemPanel() {
    if (!window.getGameResources) return;
    const cur = window.getGameResources();
    ALL_ITEM_IDS.forEach(res => {
        const lbl = document.getElementById(`item-${res}-label`);
        if (lbl) lbl.textContent = Math.floor(cur[res] || 0).toLocaleString();
    });
}

document.addEventListener('resourcesUpdated', updateItemPanel);
document.addEventListener('DOMContentLoaded', updateItemPanel);