// scripts/upgrades.js

// Datos de Mejoras
const upgrades = [
    {
        id: 'copper-drill',
        name: 'Copper Extraction',
        sprite: 'assets/sprites/mechanical-drill-copper.png',
        description: 'Increases Copper click power by 5.',
        maxLevel: 50, currentLevel: 0,
        cost: { copper: 12 },
        power: { copper: 3 },
        type: 'mine', unlocked: true,
        onBuy: function () { if (window.checkResourceUnlocks) window.checkResourceUnlocks(); }
    },
    {
        id: 'lead-drill',
        name: 'Lead Extraction',
        sprite: 'assets/sprites/mechanical-drill-lead.png',
        description: 'Increases Lead click power by 3.',
        maxLevel: 50, currentLevel: 0,
        cost: { lead: 5, copper: 12 },
        power: { lead: 3 },
        type: 'mine', unlocked: false,
        unlockReq: { upgradeId: 'copper-drill', minLevel: 10 },
        onBuy: function () { if (window.checkResourceUnlocks) window.checkResourceUnlocks(); }
    },
    {
        id: 'coal-drill',
        name: 'Coal Extraction',
        sprite: 'assets/sprites/mechanical-drill-coal.png',
        description: 'Increases Coal click power by 4.',
        maxLevel: 50, currentLevel: 0,
        cost: { coal: 5, copper: 12 },
        power: { coal: 4 },
        type: 'mine', unlocked: false,
        unlockReq: { upgradeId: 'lead-drill', minLevel: 10 },
        onBuy: function () { if (window.checkResourceUnlocks) window.checkResourceUnlocks(); }
    },
    {
        id: 'sand-drill',
        name: 'Sand Extraction',
        sprite: 'assets/sprites/mechanical-drill-sand.png',
        description: 'Increases Sand click power by 4.',
        maxLevel: 50, currentLevel: 0,
        cost: { sand: 10, copper: 12 },
        power: { sand: 4 },
        type: 'mine', unlocked: false,
        unlockReq: { upgradeId: 'coal-drill', minLevel: 10 },
        onBuy: function () { if (window.checkResourceUnlocks) window.checkResourceUnlocks(); }
    },
    {
        id: 'titanium-drill',
        name: 'Titanium Extraction',
        sprite: 'assets/sprites/pneumatic-drill-titanium.png',
        description: 'Increases Titanium click power by 3. Unlocks Titanium.',
        maxLevel: 50, currentLevel: 0,
        cost: { graphite: 10, copper: 18 },
        power: { titanium: 3 },
        type: 'mine', unlocked: false,
        unlockReq: { upgradeId: 'sand-drill', minLevel: 10 },
        onBuy: function () { if (window.checkResourceUnlocks) window.checkResourceUnlocks(); }
    },
    {
        id: 'laser-drill-thorium',
        name: 'Thorium Extraction',
        sprite: 'assets/sprites/laser-drill-thorium.png',
        description: 'Increases Thorium click power by 3. Unlocks Thorium.',
        maxLevel: 50, currentLevel: 0,
        cost: { copper: 35, graphite: 30, silicio: 30, titanium: 20 },
        power: { thorium: 3 },
        type: 'mine', unlocked: false,
        unlockReq: { upgradeId: 'titanium-drill', minLevel: 10 },
        onBuy: function () {
            if (this.currentLevel === 1 && window.unlockResource) window.unlockResource('thorium');
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    {
        id: 'airblast-drill',
        name: 'Industrial Extraction',
        sprite: 'assets/sprites/blast-drill.png',
        description: 'Heavy drill. Increases Copper, Lead, Titanium and Thorium click power by 5.',
        maxLevel: 50, currentLevel: 0,
        cost: { copper: 50, silicio: 40, titanium: 30, thorium: 20 },
        power: { copper: 5, lead: 5, titanium: 5, thorium: 5 },
        type: 'mine', unlocked: false,
        unlockReq: { upgradeId: 'laser-drill-thorium', minLevel: 10 },
        onBuy: function () { if (window.checkResourceUnlocks) window.checkResourceUnlocks(); }
    },
    {
        id: 'overdrive-projector',
        name: 'Overdrive Projector',
        sprite: 'assets/sprites/overdrive-projector.png',
        description: 'Boosts ALL auto-mining production by +5% per purchase.',
        maxLevel: 10, currentLevel: 0,
        cost: { titanium: 7, lead: 10, silicio: 7 },
        type: 'mine', unlocked: false,
        unlockReq: { blockId: 'silicon-smelter', minLevel: 8 },
        onBuy: function () {
            if (window.applyAutominingBoost) window.applyAutominingBoost(0.05);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    {
        id: 'mono',
        name: 'Mono',
        sprite: 'assets/sprites/mono.png',
        description: 'Automining Copper & Lead multiplier: +5% per purchase. Unlocks at Lvl 20 Copper & Lead Lines.',
        category: 'production',
        currentLevel: 0, maxLevel: 10, unlocked: false,
        cost: { lead: 100, metaglass: 100, silicio: 50 },
        unlockReqs: [
            { upgradeId: 'auto-copper', minLevel: 20 },
            { upgradeId: 'auto-lead', minLevel: 20 }
        ],
    },
    {
        id: 'auto-copper',
        name: 'Copper Line',
        sprite: 'assets/sprites/conveyor-copper.png',
        description: 'Auto-mines +3 Copper/s.',
        maxLevel: 100, currentLevel: 0,
        cost: { copper: 15 },
        rate: { copper: 3 },
        type: 'automine', unlocked: true,
        onBuy: function () {
            if (window.upgradeAutomining) window.upgradeAutomining('copper', this.rate.copper);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    {
        id: 'auto-lead',
        name: 'Lead Line',
        sprite: 'assets/sprites/conveyor-lead.png',
        description: 'Auto-mines +3 Lead/s.',
        maxLevel: 100, currentLevel: 0,
        cost: { copper: 15, lead: 15 },
        rate: { lead: 3 },
        type: 'automine', unlocked: false,
        unlockReq: { upgradeId: 'lead-drill', minLevel: 1 },
        onBuy: function () {
            if (window.upgradeAutomining) window.upgradeAutomining('lead', this.rate.lead);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    {
        id: 'auto-coal',
        name: 'Coal Line',
        sprite: 'assets/sprites/conveyor-coal.png',
        description: 'Auto-mines +4 Coal/s.',
        maxLevel: 120, currentLevel: 0,
        cost: { copper: 15, lead: 15, coal: 15 },
        rate: { coal: 4 },
        type: 'automine', unlocked: false,
        unlockReq: { upgradeId: 'coal-drill', minLevel: 1 },
        onBuy: function () {
            if (window.upgradeAutomining) window.upgradeAutomining('coal', this.rate.coal);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    {
        id: 'auto-sand',
        name: 'Pulverizer',
        sprite: 'assets/sprites/pulverizer.png',
        description: 'Auto-mines +4 Sand/s.',
        maxLevel: 120, currentLevel: 0,
        cost: { copper: 15, lead: 20, sand: 30 },
        rate: { sand: 4 },
        type: 'automine', unlocked: false,
        unlockReq: { upgradeId: 'sand-drill', minLevel: 1 },
        onBuy: function () {
            if (window.upgradeAutomining) window.upgradeAutomining('sand', this.rate.sand);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    {
        id: 'auto-titanium',
        name: 'Titanium Line',
        sprite: 'assets/sprites/titanium-conveyor-titanium.png',
        description: 'Auto-mines +3 Titanium/s.',
        maxLevel: 100, currentLevel: 0,
        cost: { copper: 15, lead: 20, graphite: 30 },
        rate: { titanium: 3 },
        type: 'automine', unlocked: false,
        unlockReq: { upgradeId: 'titanium-drill', minLevel: 1 },
        onBuy: function () {
            if (window.upgradeAutomining) window.upgradeAutomining('titanium', this.rate.titanium);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    {
        id: 'auto-thorium',
        name: 'Thorium line',
        sprite: 'assets/sprites/armored-conveyor-thorium.png',
        description: 'Auto-mines +3 Thorium/s.',
        maxLevel: 100, currentLevel: 0,
        cost: { titanium: 20, silicio: 20, thorium: 10 },
        rate: { thorium: 3 },
        type: 'automine', unlocked: false,
        unlockReq: { upgradeId: 'laser-drill-thorium', minLevel: 1 },
        onBuy: function () {
            if (window.upgradeAutomining) window.upgradeAutomining('thorium', this.rate.thorium);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
];

// API Global
upgrades.forEach(u => u.base_cost = JSON.parse(JSON.stringify(u.cost)));

window.recalculateUpgradeCost = function (u) {
    u.cost = JSON.parse(JSON.stringify(u.base_cost));
    for (let i = 0; i < u.currentLevel; i++) {
        for (const r in u.cost) u.cost[r] = Math.ceil(u.cost[r] * 1.35);
    }
};

window.getUpgradeLevel = (id) => upgrades.find(u => u.id === id)?.currentLevel || 0;
window.getUpgradeData = (id) => upgrades.find(u => u.id === id);
window.getUpgradesArray = () => upgrades;

// Lógica de Desbloqueo
function checkUnlockReqs() {
    upgrades.forEach(u => {
        if (u.unlocked) return;

        if (u.unlockReqs) {
            let allOk = true;
            u.unlockReqs.forEach(r => {
                let ok = false;
                if (r.blockId && window.getBlockLevel) ok = window.getBlockLevel(r.blockId) >= r.minLevel;
                else if (r.upgradeId) ok = (upgrades.find(x => x.id === r.upgradeId)?.currentLevel || 0) >= r.minLevel;
                else if (r.resource && window.getPowerLevel) ok = window.getPowerLevel(r.resource) >= r.minPower;
                if (!ok) allOk = false;
            });
            if (allOk) { u.unlocked = true; window.guiDirty = true; }
        } else if (u.unlockReq) {
            const r = u.unlockReq;
            let ok = false;
            if (r.blockId && window.getBlockLevel) ok = window.getBlockLevel(r.blockId) >= r.minLevel;
            else if (r.upgradeId) ok = (upgrades.find(x => x.id === r.upgradeId)?.currentLevel || 0) >= r.minLevel;
            else if (r.resource && window.getPowerLevel) ok = window.getPowerLevel(r.resource) >= r.minPower;
            if (ok) { u.unlocked = true; window.guiDirty = true; }
        }
    });
}

// Compra
function attemptBuyUpgrade(u) {
    if (u.currentLevel >= u.maxLevel || !window.getGameResources) return false;
    const res = window.getGameResources();
    for (const r in u.cost) if ((res[r] || 0) < u.cost[r]) return false;

    window.subtractResources(u.cost);
    u.currentLevel++;
    if (u.power) for (const r in u.power) window.upgradePower(r, u.power[r]);
    if (u.rate) for (const r in u.rate) window.upgradeAutomining(r, u.rate[r]);
    if (u.onBuy) u.onBuy.call(u);
    if (u.currentLevel < u.maxLevel) for (const r in u.cost) u.cost[r] = Math.ceil(u.cost[r] * 1.35);

    window.guiDirty = true;
    document.dispatchEvent(new CustomEvent('checkUpgrades'));
    return true;
}

// GUI
let upgradeButtonsContainer = null;

function createUpgradeButton(u) {
    if (!upgradeButtonsContainer) return;
    const btn = document.createElement('button');
    btn.id = `upgrade-btn-${u.id}`;
    btn.className = 'upgrade-btn';
    btn.innerHTML = `
        <div class="upgrade-info">
            <span class="upgrade-name">${u.name}</span>
            <span class="upgrade-effect">${u.type === 'automine' ? `Auto: +${u.rate[Object.keys(u.rate)[0]]}/s` : u.description}</span>
            <div class="upgrade-cost-container"><span class="upgrade-cost"></span></div>
            ${u.unlockReq ? '<div class="unlock-req-text"></div>' : ''}
        </div>
        <img src="${u.sprite}" alt="${u.name}" class="upgrade-sprite">
    `;
    btn.addEventListener('click', () => attemptBuyUpgrade(u));
    u.element = btn;
    upgradeButtonsContainer.appendChild(btn);
}

window.updateUpgradesPanel = function () {
    checkUnlockReqs();
    upgrades.forEach(u => {
        if (!u.element) return;
        if (u.currentLevel >= u.maxLevel) { u.element.style.display = 'none'; return; }
        if (!u.unlocked) {
            u.element.style.display = 'flex';
            u.element.classList.add('locked');
            u.element.classList.remove('can-buy');
            u.element.disabled = true;
            const reqEl = u.element.querySelector('.unlock-req-text');
            if (reqEl) {
                let txt = '';
                if (u.unlockReqs) {
                    let parts = [];
                    u.unlockReqs.forEach(r => {
                        if (r.blockId) parts.push(`${r.blockId.replace(/-/g, ' ')} Lvl ${r.minLevel}`);
                        else if (r.upgradeId) parts.push(`${upgrades.find(x => x.id === r.upgradeId)?.name || r.upgradeId} Lvl ${r.minLevel}`);
                        else if (r.resource) parts.push(`${r.minPower} Power ${r.resource}`);
                    });
                    txt = `Requires: ${parts.join(' & ')}`;
                } else if (u.unlockReq) {
                    const r = u.unlockReq;
                    if (r.blockId) txt = `Requires: ${r.blockId.replace(/-/g, ' ')} Lvl ${r.minLevel}`;
                    else if (r.upgradeId) txt = `Requires: ${upgrades.find(x => x.id === r.upgradeId)?.name} Lvl ${r.minLevel}`;
                    else if (r.resource) txt = `Requires: ${r.minPower} Power ${r.resource}`;
                }
                reqEl.textContent = txt;
            }
            return;
        }
        u.element.style.display = 'flex';
        u.element.classList.remove('locked');
        u.element.disabled = false; // RE-HABILITAR CLICS
        const reqEl = u.element.querySelector('.unlock-req-text');
        if (reqEl) reqEl.textContent = '';
        u.element.querySelector('.upgrade-name').textContent = u.name + (u.maxLevel > 1 ? ` (Lvl ${u.currentLevel}/${u.maxLevel})` : '');
        u.element.querySelector('.upgrade-cost').innerHTML = Object.entries(u.cost).map(([r, v]) => `<span class="cost-item">${v.toLocaleString()} ${r}</span>`).join(', ');
        const can = (() => { for (const r in u.cost) if ((window.getGameResources()[r] || 0) < u.cost[r]) return false; return true; })();
        u.element.disabled = !can;
        u.element.classList.toggle('can-buy', can);
    });
};

// Navegación
const navs = [
    { id: 'upgrades', label: 'Extraction', icon: 'assets/sprites/icons/production.png' },
    { id: 'production', label: 'Production', icon: 'assets/sprites/icons/crafting.png' },
    { id: 'energy', label: 'Energy', icon: 'assets/sprites/icons/power.png' },
    { id: 'liquids', label: 'Liquids', icon: 'assets/sprites/icons/liquid.png' },
    { id: 'logic', label: 'Logic', icon: 'assets/sprites/icons/grid.png' },
];

window.togglePanel = function (showId) {
    navs.forEach(n => {
        document.getElementById(`${n.id}-section`)?.classList.toggle('hidden', n.id !== showId);
        document.getElementById(`nav-btn-${n.id}`)?.classList.toggle('active', n.id === showId);
    });
    window.guiDirty = true;
};

function setupNav() {
    const cont = document.getElementById('nav-buttons-container');
    if (!cont) return;
    navs.forEach(n => {
        const b = document.createElement('button');
        b.id = `nav-btn-${n.id}`; b.className = 'nav-icon-btn'; b.title = n.label;
        b.innerHTML = `<img src="${n.icon}" alt="${n.label}">`;
        b.addEventListener('click', () => window.togglePanel(n.id));
        cont.appendChild(b);
    });
    window.togglePanel(navs[0].id);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    upgradeButtonsContainer = document.getElementById('upgrade-buttons-container');
    if (upgradeButtonsContainer) upgrades.forEach(createUpgradeButton);
    setupNav();
    document.addEventListener('checkUpgrades', window.updateUpgradesPanel);
    document.addEventListener('resourcesUpdated', window.updateUpgradesPanel);
    window.updateUpgradesPanel();
});
