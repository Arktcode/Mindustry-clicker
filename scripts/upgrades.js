// scripts/upgrades.js

// --- 1. DEFINICIÓN DE MEJORAS (Solo Minería y Automining) ---

const upgrades = [
    // --- MEJORAS DE PODER DE CLIC (Taladros) ---
    {
        id: 'copper-drill',
        name: 'Mechanical Drill',
        sprite: 'assets/sprites/mechanical-drill-copper.png',
        description: 'Increases Copper click power by 5. Unlock Lead mine at 10x.',
        maxLevel: 100,
        currentLevel: 0,
        cost: { cobre: 12 },
        power: { cobre: 5 },
        type: 'mine', 
        unlocked: true,
        onBuy: function() {
            if (this.currentLevel === 50) {
                if (window.unlockResource) window.unlockResource('lead'); 
            }
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    
    {
        id: 'lead-drill',
        name: 'Lead Beta',
        sprite: 'assets/sprites/mechanical-drill-lead.png',
        description: 'Increases Lead click power by 5. Unlock Coal mine at 10x.',
        maxLevel: 100,
        currentLevel: 0,
        cost: { lead: 5, cobre: 12 },
        power: { lead: 5 },
        type: 'mine',
        unlocked: false,
        unlockReq: { resource: 'cobre', minPower: 11 }, 
        onBuy: function() {
            if (this.currentLevel === 50) {
                if (window.unlockResource) window.unlockResource('coal');
            }
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    
    {
        id: 'coal-drill',
        name: 'Coal Beta',
        sprite: 'assets/sprites/mechanical-drill-coal.png',
        description: 'Increases Coal click power by 6.', 
        maxLevel: 100,
        currentLevel: 0,
        cost: { coal: 5, cobre: 12 },
        power: { coal: 6 },
        type: 'mine',
        unlocked: false,
        unlockReq: { resource: 'lead', minPower: 10 }, 
        onBuy: function() {
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    
    {
        id: 'sand-drill',
        name: 'Accidental extraction',
        sprite: 'assets/sprites/mechanical-drill-sand.png', 
        description: 'Increases Sand click power by 7.',
        maxLevel: 100,
        currentLevel: 0,
        cost: { sand: 10, cobre: 12 },
        power: { sand: 7 },
        type: 'mine',
        unlocked: false,
        unlockReq: { resource: 'lead', minPower: 10 }, 
        onBuy: function() {
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    
    {
        id: 'titanium-drill',
        name: 'Pneumatic Drill',
        sprite: 'assets/sprites/pneumatic-drill-titanium.png',
        description: 'Increases Titanium click power by 4. Unlocks Titanium.',
        maxLevel: 100,
        currentLevel: 0,
        cost: { graphite: 10, cobre: 18 },
        power: { titanium: 4 },
        type: 'mine',
        unlocked: false,
        unlockReq: { recipeId: 'graphite-press', minLevel: 5 }, 
        onBuy: function() {
            if (this.currentLevel === 20) {
                if (window.unlockResource) window.unlockResource('plastanium'); 
            }
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },

    {
        id: 'laser-drill-thorium',
        name: 'Laser Drill',
        sprite: 'assets/sprites/laser-drill-thorium.png',
        description: 'Increases Thorium click power by 4. Unlocks Thorium.',
        maxLevel: 100,
        currentLevel: 0,
        cost: { cobre: 35, graphite: 30, silicio: 30, titanium: 20 },
        power: { thorium: 4 },
        type: 'mine',
        unlocked: false,
        unlockReq: { recipeId: 'silicon-smelter', minLevel: 5 }, 
        onBuy: function() {
            if (this.currentLevel === 5) {
                if (window.unlockResource) window.unlockResource('thorium'); 
            }
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    
    /*{
        id: 'overdrive-projector',
        name: 'Overdrive Projector',
        sprite: 'assets/sprites/overdrive-projector.png', 
        description: 'Boosts all drill power by 5%.',
        maxLevel: 50,
        currentLevel: 0,
        cost: { titanium: 7, lead: 10, silicon: 7},
        power: { allMine: 1.05 }, 
        type: 'mine',
        unlocked: false,
        unlockReq: { recipeId: 'silicon-smelter', minLevel: 5 },
        onBuy: function() {
            if (window.applyGlobalPowerBoost) window.applyGlobalPowerBoost(this.power.allMine);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },*/


    // --- MEJORAS DE MINERÍA AUTOMÁTICA (Transportadores) ---
    {
        id: 'auto-cobre',
        name: 'Conveyor Line',
        sprite: 'assets/sprites/conveyor.png', 
        description: 'Increases Copper production rate by 3 resource/s.',
        maxLevel: 100,
        currentLevel: 0,
        cost: { cobre: 15 },
        rate: { cobre: 3 }, 
        type: 'automine', 
        unlocked: true,
        onBuy: function() {
            if (window.upgradeAutomining) window.upgradeAutomining('cobre', this.rate.cobre); 
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },

    {
        id: 'auto-lead',
        name: 'Router System',
        sprite: 'assets/sprites/router.png', 
        description: 'Increases Lead production rate by 3 resource/s.',
        maxLevel: 100,
        currentLevel: 0,
        cost: { cobre: 15, lead: 15 },
        rate: { lead: 3 },
        type: 'automine',
        unlocked: false, 
        unlockReq: { resource: 'lead', minPower: 1 }, 
        onBuy: function() {
            if (window.upgradeAutomining) window.upgradeAutomining('lead', this.rate.lead);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },

    {
        id: 'auto-coal',
        name: 'Bridge System',
        sprite: 'assets/sprites/bridge-conveyor.png', 
        description: 'Increases Coal production rate by 4 resource/s.',
        maxLevel: 120,
        currentLevel: 0,
        cost: { cobre: 15, lead: 15, coal: 15 },
        rate: { coal: 4 },
        type: 'automine',
        unlocked: false, 
        unlockReq: { resource: 'coal', minPower: 1 },
        onBuy: function() {
            if (window.upgradeAutomining) window.upgradeAutomining('coal', this.rate.coal);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        }
    },
    
    {
        id: 'auto-sand',
        name: 'Pulverizer',
        sprite: 'assets/sprites/pulverizer.png', 
        description: 'Increases Sand production rate by 5 resource/s.',
        maxLevel: 120,
        currentLevel: 0,
        cost: { cobre: 15, lead: 20, sand: 30 },
        rate: { sand: 5 },
        type: 'automine',
        unlocked: false, 
        unlockReq: { resource: 'sand', minPower: 1 },
        onBuy: function() {
            if (window.upgradeAutomining) window.upgradeAutomining('sand', this.rate.sand);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks(); 
        }
    },

    {
        id: 'auto-titanium',
        name: 'Titanium Line',
        sprite: 'assets/sprites/titanium-conveyor.png', 
        description: 'Increases Titanium production rate by 3 resource/s.',
        maxLevel: 100,
        currentLevel: 0,
        cost: { cobre: 15, lead: 20, graphite: 30 },
        rate: { titanium: 3 },
        type: 'automine',
        unlocked: false, 
        unlockReq: { resource: 'titanium', minPower: 4 },
        onBuy: function() {
            if (window.upgradeAutomining) window.upgradeAutomining('titanium', this.rate.titanium);
            if (window.checkResourceUnlocks) window.checkResourceUnlocks(); 
        }
    },
];

// --- 2. GESTIÓN DE API GLOBALES ---

window.isUpgradeUnlocked = function(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    return upgrade && upgrade.currentLevel >= 1; 
};

window.getUpgradeLevel = function(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    return upgrade ? upgrade.currentLevel : 0;
};

window.getUpgradesArray = () => upgrades;


// --- 3. GESTIÓN DE PANELES Y BOTONES ---

let upgradeButtonsContainer = null;

function checkUnlockRequirements() {
    upgrades.forEach(upgrade => {
        const req = upgrade.unlockReq;
        if (req && !upgrade.unlocked) {
            
            let shouldUnlock = false;

            if (req.recipeId && window.getCraftingLevel) {
                const currentRecipeLevel = window.getCraftingLevel(req.recipeId);
                if (currentRecipeLevel >= req.minLevel) {
                    shouldUnlock = true;
                }
            } else if (req.upgradeId) {
                const requiredUpgrade = upgrades.find(u => u.id === req.upgradeId);
                if (requiredUpgrade && requiredUpgrade.currentLevel >= req.minLevel) {
                    shouldUnlock = true;
                }
            } else if (req.resource && window.getPowerLevel) {
                const currentPowerLevel = window.getPowerLevel(req.resource); 
                if (currentPowerLevel >= req.minPower) {
                    shouldUnlock = true;
                }
            }
            
            if (shouldUnlock) {
                upgrade.unlocked = true;
                window.guiDirty = true;
            }
        }
    });
    
    document.dispatchEvent(new CustomEvent('checkUpgrades')); 
}

function createUpgradeButton(upgrade) {
    
    let targetContainer = upgradeButtonsContainer;
    
    if (!targetContainer) return; 

    const button = document.createElement('button');
    button.id = `upgrade-btn-${upgrade.id}`;
    button.className = 'upgrade-btn';

    // Generar el HTML inicial con placeholders
    let levelText = upgrade.maxLevel > 1 ? ` (Lvl <span class="current-level">${upgrade.currentLevel}</span>/<span class="max-level">${upgrade.maxLevel}</span>)` : '';
    
    let effectText = upgrade.type === 'automine' 
        ? `Auto: +${upgrade.rate[Object.keys(upgrade.rate)[0]]} /s` 
        : upgrade.description;

    let unlockReqText = '';
    if (upgrade.unlockReq) {
        // Se añade un contenedor explícito para el coste que se ocultará si hay requisito.
        unlockReqText = `<div class="unlock-req-text"></div>`; 
    }
    
    button.innerHTML = `
        <div class="upgrade-info">
            <span class="upgrade-name">${upgrade.name}${levelText}</span>
            <span class="upgrade-effect">${effectText}</span>
            <div class="upgrade-cost-container"><span class="upgrade-cost">Cost: (Initial Cost Placeholder)</span></div>
            ${unlockReqText}
        </div>
        <img src="${upgrade.sprite}" alt="${upgrade.name}" class="upgrade-sprite">
    `;

    button.addEventListener('click', () => {
        attemptBuyUpgrade(upgrade);
    });

    upgrade.element = button;
    targetContainer.appendChild(button);
}

function checkCanAfford(upgrade) {
    if (!window.getGameResources) return false;
    const resources = window.getGameResources();
    for (const res in upgrade.cost) {
        if (Math.floor(resources[res] || 0) < upgrade.cost[res]) { 
            return false;
        }
    }
    return true;
}

function attemptBuyUpgrade(upgrade) {
    if (upgrade.currentLevel < upgrade.maxLevel && checkCanAfford(upgrade)) {
        
        if (!window.subtractResources) return false;
        window.subtractResources(upgrade.cost);

        upgrade.currentLevel++;
        
        if (upgrade.power && window.upgradePower) {
            for (const res in upgrade.power) {
                window.upgradePower(res, upgrade.power[res]); 
            }
        }
        
        if (upgrade.rate && window.upgradeAutomining) {
             for (const res in upgrade.rate) {
                window.upgradeAutomining(res, upgrade.rate[res]);
             }
        }

        if (upgrade.onBuy) {
            upgrade.onBuy(); 
        }
        //aqui ajusto los valores de coste progresivo global en upgrades
        if (upgrade.currentLevel < upgrade.maxLevel) {
            for (const res in upgrade.cost) {
                upgrade.cost[res] = Math.ceil(upgrade.cost[res] * 1.35); 
            }
        }
        
        window.guiDirty = true;
        document.dispatchEvent(new CustomEvent('checkUpgrades')); 
        
        return true;
    }
    return false;
}

window.updateUpgradesPanel = function() {
    checkUnlockRequirements(); 
    
    upgrades.forEach(upgrade => {
        if (!upgrade.element) return;
        
        const isMaxLevel = upgrade.currentLevel >= upgrade.maxLevel;
        const reqTextElement = upgrade.element.querySelector('.unlock-req-text'); 
        const costContainer = upgrade.element.querySelector('.upgrade-cost-container'); // ✅ Elemento del coste

        // 1. MANEJO DE NIVEL MÁXIMO
        if (isMaxLevel) {
            upgrade.element.style.display = 'none';
            return;
        } 
        
        // 2. MANEJO DE BLOQUEO POR REQUISITO
        if (!upgrade.unlocked) {
            if (upgrade.unlockReq) {
                upgrade.element.style.display = 'flex';
                upgrade.element.classList.add('locked');
                upgrade.element.disabled = true; 
                
                // Ocultar el coste, mostrar el requisito
                if (costContainer) costContainer.style.display = 'none'; // Oculta el coste
                if (reqTextElement) reqTextElement.style.display = 'block'; // Muestra el requisito
                
                if (reqTextElement) {
                    let reqText = '';
                    if (upgrade.unlockReq.recipeId) {
                        const recipeName = upgrade.unlockReq.recipeId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        const currentLevel = window.getCraftingLevel ? window.getCraftingLevel(upgrade.unlockReq.recipeId) : 0;
                        reqText = `Requires: ${recipeName} Lvl ${upgrade.unlockReq.minLevel} (Current: ${currentLevel})`;
                    } else if (upgrade.unlockReq.upgradeId) {
                        const requiredUpgrade = upgrades.find(u => u.id === upgrade.unlockReq.upgradeId);
                        const upgradeName = requiredUpgrade ? requiredUpgrade.name : upgrade.unlockReq.upgradeId;
                        const currentLevel = window.getUpgradeLevel ? window.getUpgradeLevel(upgrade.unlockReq.upgradeId) : 0;
                        reqText = `Requires: ${upgradeName} Lvl ${upgrade.unlockReq.minLevel} (Current: ${currentLevel})`;
                    } else if (upgrade.unlockReq.resource) {
                        const currentPower = window.getPowerLevel ? window.getPowerLevel(upgrade.unlockReq.resource) : 0;
                        reqText = `Requires: ${upgrade.unlockReq.minPower}x ${upgrade.unlockReq.resource.charAt(0).toUpperCase() + upgrade.unlockReq.resource.slice(1)} Power (Current: ${currentPower})`;
                    }
                     reqTextElement.textContent = reqText;
                }
            } else {
                 upgrade.element.style.display = 'none'; // Ocultar mejoras sin requisitos iniciales si no están desbloqueadas
            }
            return;
        } 
        
        // 3. DESBLOQUEADO Y COMPRABLE (Se cumplió el requisito)
        upgrade.element.style.display = 'flex';
        upgrade.element.classList.remove('locked');
        
        // Mostrar el coste, ocultar el requisito
        if (costContainer) costContainer.style.display = 'block'; // Muestra el coste
        if (reqTextElement) reqTextElement.style.display = 'none'; // Oculta el requisito
        if (reqTextElement) reqTextElement.textContent = ''; // Limpia el texto por si acaso

        // --- ACTUALIZACIÓN DE ESTADO ---
        
        const levelTextElement = upgrade.element.querySelector('.upgrade-name');
        const currentLevelSpan = upgrade.element.querySelector('.current-level');
        const maxLevelSpan = upgrade.element.querySelector('.max-level');
        
        // Actualizar nivel
        const levelText = upgrade.maxLevel > 1 ? ` (Lvl ${upgrade.currentLevel}/${upgrade.maxLevel})` : '';
        levelTextElement.textContent = `${upgrade.name}${levelText}`;
        if (currentLevelSpan) currentLevelSpan.textContent = upgrade.currentLevel;

        // Actualizar coste (ya sabemos que costContainer existe y está visible)
        const costText = Object.entries(upgrade.cost)
            .map(([res, amount]) => `<span class="cost-item">${amount.toLocaleString()} ${res.charAt(0).toUpperCase() + res.slice(1)}</span>`)
            .join(', ');
        costContainer.innerHTML = `<span class="upgrade-cost">Cost: ${costText}</span>`;

        // Habilitar/deshabilitar por asequibilidad
        const canAfford = checkCanAfford(upgrade);
        upgrade.element.disabled = !canAfford || isMaxLevel;
        
        if (canAfford && !isMaxLevel) {
            upgrade.element.classList.add('can-buy');
        } else {
            upgrade.element.classList.remove('can-buy');
        }
    });
}

// --- 4. CONFIGURACIÓN DE NAVEGACIÓN ---

const panelNavigation = [
    { id: 'upgrades', icon: 'assets/sprites/icons/production.png' }, 
    { id: 'crafting', icon: 'assets/sprites/icons/crafting.png' }, 
    { id: 'power', icon: 'assets/sprites/icons/power.png' } 
];

window.togglePanel = function(panelToShow) {
    const panels = panelNavigation.map(nav => nav.id); 
    
    panels.forEach(panel => {
        const section = document.getElementById(`${panel}-section`);
        const navButton = document.getElementById(`nav-btn-${panel}`);
        
        if (!section || !navButton) return;
        
        if (panel === panelToShow) {
            section.classList.remove('hidden');
            navButton.classList.add('active');
            
            window.guiDirty = true;
        } else {
            section.classList.add('hidden');
            navButton.classList.remove('active');
        }
    });
}

function setupNavigation() {
    const container = document.getElementById('nav-buttons-container');
    if (!container) return;

    panelNavigation.forEach(nav => {
        const button = document.createElement('button');
        button.id = `nav-btn-${nav.id}`;
        button.className = 'nav-icon-btn';
        
        const img = document.createElement('img');
        img.src = nav.icon; 
        img.alt = nav.id;
        
        button.appendChild(img);
        
        button.addEventListener('click', () => {
            window.togglePanel(nav.id);
        });
        
        container.appendChild(button);
    });
    
    if (panelNavigation.length > 0) {
        window.togglePanel(panelNavigation[0].id);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    upgradeButtonsContainer = document.getElementById('upgrade-buttons-container');
    
    if (upgradeButtonsContainer) {
        upgrades.forEach(createUpgradeButton);
    }
    
    setupNavigation();

    document.addEventListener('checkUpgrades', window.updateUpgradesPanel);
    document.addEventListener('resourcesUpdated', window.updateUpgradesPanel);
    
    window.updateUpgradesPanel(); 
});