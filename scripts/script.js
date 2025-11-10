// --- CONFIGURACIÓN Y ESTADO DEL JUEGO (SOLO TESTEO)
let gameResources = {
    cobre: 0, 
    lead: 0, 
    titanium: 0, 
    thorium: 0,
    coal: 0, 
    sand: 0,
    graphite: 0, 
    silicio: 0, 
    plastanium: 0, 
    'surge-alloy': 0,
};

// Lista de recursos que se inicializan como bloqueados en el DOM
const resourcesToPotentiallyUnlock = ['lead', 'coal', 'sand', 'graphite', 'titanium', 'thorium', 'silicio', 'plastanium', 'surge-alloy'];

let gameData = {
    power: { 
        cobre: 1, lead: 0, titanium: 0, coal: 0, sand: 0, graphite: 0, silicio: 0, thorium: 0,
    },
    automining: { 
        cobre: 0, lead: 0, titanium: 0, coal: 0, sand: 0, graphite: 0, silicio: 0, thorium: 0,
    },
    fractions: { 
        cobre: 0, lead: 0, titanium: 0, thorium: 0, 
        plastanium: 0, 'surge-alloy': 0, graphite: 0, coal: 0, sand: 0,
        silicio: 0 
    },
    lastTime: performance.now(),
};

window.guiDirty = true;
window.getGameResources = () => gameResources;
window.getPowerLevel = (resourceName) => {
    window.sanitizePowerLevel(resourceName);
    return gameData.power.hasOwnProperty(resourceName) ? gameData.power[resourceName] : 0;
};
window.getAutominingRate = (resourceName) => {
    window.sanitizeAutominingRate(resourceName);
    return gameData.automining.hasOwnProperty(resourceName) ? gameData.automining[resourceName] : 0;
};
window.getCraftingLevel = (recipeId) => {
    if (window.getCraftingRecipes) {
        const recipe = window.getCraftingRecipes().find(r => r.id === recipeId);
        return recipe ? recipe.level : 0; 
    }
    return 0; 
};

window.getPowerGenerators = () => {
    if (window.getGeneratorsArray) {
        return window.getGeneratorsArray();
    }
    return [];
};

window.sanitizePowerLevel = function(resourceName) {
    const value = gameData.power[resourceName];
    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
        console.warn(`[SANEAR:POWER] Nivel de poder para '${resourceName}' era ${value}. Reiniciando a 0 (o 1 si es cobre).`);
        gameData.power[resourceName] = (resourceName === 'cobre') ? 1 : 0;
        return true;
    }
    return false;
}
window.sanitizeAutominingRate = function(resourceName) {
    const value = gameData.automining[resourceName];
    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
        console.warn(`[SANEAR:AUTOMINING] Tasa de auto-minado para '${resourceName}' era ${value}. Reiniciando a 0.`);
        gameData.automining[resourceName] = 0;
        return true;
    }
    return false;
}
window.sanitizeResource = function(resourceName) {
    const value = gameResources[resourceName];
    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
        console.warn(`[SANEAR:RESOURCE] Recurso '${resourceName}' era ${value}. Reiniciando a 0.`);
        gameResources[resourceName] = 0;
        return true;
    }
    return false;
}
window.addResources = function (resources) {
    let changed = false;
    for (const res in resources) {
        if (gameResources.hasOwnProperty(res)) {
            gameResources[res] += Math.max(0, resources[res]); 
            
            if (window.sanitizeResource(res)) {
            }

            changed = true;
        }
    }
    if (changed) {
        window.guiDirty = true;
        window.checkResourceUnlocks();
    }
};

window.subtractResources = function (cost) {
    const currentResources = window.getGameResources(); 
    let success = true;
    
    for (const res in cost) {
        if (window.sanitizeResource(res)) {
            success = false;
            break; 
        }
        if (!gameResources.hasOwnProperty(res) || Math.floor(currentResources[res]) < Math.ceil(cost[res])) { 
            success = false;
            break;
        }
    }
        if (success) {
        for (const res in cost) {
            gameResources[res] = Math.max(0, gameResources[res] - cost[res]);
            
            window.sanitizeResource(res);
        }
        window.guiDirty = true;
    }

    return success;
};

function mineResource(event) {
    if (event.currentTarget.disabled) return;
    const resourceName = event.currentTarget.getAttribute('data-resource');
    const amount = window.getPowerLevel(resourceName) || 1; 
    
    window.addResources({ [resourceName]: amount });
}
window.checkResourceUnlocks = function() {
        if (!window.getUnlockableResources || !window.getPowerLevel || !window.getUpgradeLevel || !window.getCraftingLevel || !window.unlockResource) {
        return; 
    }

    const unlockableResources = window.getUnlockableResources();
    let anyUnlocked = false;

    unlockableResources.forEach(resource => {
        if (resource.unlocked) return; 

        if (!resource.unlockReq) return; 

        const req = resource.unlockReq;
        let shouldUnlock = false;

        if (req.upgradeId && req.minLevel !== undefined) { 
            const currentUpgradeLevel = window.getUpgradeLevel(req.upgradeId);
            if (currentUpgradeLevel >= req.minLevel) {
                shouldUnlock = true;
            }
        }
        else if (req.recipeId && req.minLevel !== undefined) {
            if (window.getCraftingLevel(req.recipeId) >= req.minLevel) {
                shouldUnlock = true;
            }
        }
        else if (req.resource && req.minPower !== undefined) {
            const currentPower = window.getPowerLevel(req.resource);
            if (currentPower >= req.minPower) {
                shouldUnlock = true;
            }
        } 
        
        if (shouldUnlock) {
            window.unlockResource(resource.id); 
            anyUnlocked = true;
        }
    });
    
    if (anyUnlocked) {
        window.guiDirty = true;
    }
};
window.handleResourceUnlockDOM = function(resourceId) {
    const panel = document.getElementById(`${resourceId}-panel`);
    const button = document.querySelector(`#${resourceId}-panel .resource-mine-btn`); 

    if (panel) {
        if (!gameData.power.hasOwnProperty(resourceId) || gameData.power[resourceId] === 0) {
            const resourceData = window.getResourceData ? window.getResourceData(resourceId) : null;
            gameData.power[resourceId] = resourceData ? resourceData.clickPower : 1; 
        }

        panel.classList.remove('locked');
        
        const overlay = panel.querySelector('.unlock-overlay');
        if (overlay) {
            overlay.style.display = 'none'; 
        }
        
        if (button) {
            button.disabled = false;
        }
        window.guiDirty = true;
        document.dispatchEvent(new CustomEvent('checkUpgrades')); 
    }
}
window.upgradePower = function(resourceName, amount) {
    window.sanitizePowerLevel(resourceName);
    gameData.power[resourceName] = (gameData.power[resourceName] || 0) + amount;

    window.guiDirty = true; 
    document.dispatchEvent(new CustomEvent('checkUpgrades')); 
};

window.upgradeAutomining = function(resourceName, amount) {
    window.sanitizeAutominingRate(resourceName);
    gameData.automining[resourceName] = (gameData.automining[resourceName] || 0) + amount;
    
    window.guiDirty = true; 
};



// 1. Minería Pasiva (Implementación Corregida)
window.processMiningTick = function(deltaTime) {
    const timeFactor = deltaTime / 1000;

    for (const res in gameData.automining) {
        
        window.sanitizeAutominingRate(res); 

        if (gameData.automining[res] > 0) {
            if (window.sanitizeResource(res)) {
                gameData.fractions[res] = 0;
            }

            gameData.fractions[res] = (gameData.fractions[res] || 0) + gameData.automining[res] * timeFactor;
            
            const wholeAmount = Math.floor(gameData.fractions[res]);
            
            if (wholeAmount >= 1) {
                window.addResources({ [res]: wholeAmount }); 
                gameData.fractions[res] -= wholeAmount;
            }
        }
    }
};

window.updateItemsPanel = function() {
    const resourcesToUpdate = ['cobre', 'lead', 'titanium', 'coal', 'sand', 'silicio', 'graphite', 'thorium', 'plastanium', 'surge-alloy']; 
    
    resourcesToUpdate.forEach(res => {
        const textElement = document.getElementById(`${res}-text`);
        const panel = document.getElementById(`${res}-panel`);
        
        
        if (textElement) {
            const currentPower = window.getPowerLevel(res);
            const currentAutomining = window.getAutominingRate(res);
            
            if (panel && panel.classList.contains('locked')) {
                textElement.textContent = `Extraction (+?) /s: ?`;
            } else {
                window.sanitizeResource(res);
                const currentResourceAmount = gameResources[res] || 0;
                
                const formattedResource = currentResourceAmount.toLocaleString(undefined, { maximumFractionDigits: 0 });
                const formattedAutomining = currentAutomining.toLocaleString(undefined, { maximumFractionDigits: 2 });
                
                const labelElement = document.getElementById(`item-${res}-label`);
                if (labelElement) {
                    labelElement.textContent = `${formattedResource}`;
                }
                
                textElement.textContent = `Extraction (+${currentPower}) /s: ${formattedAutomining}`;
            }
        }
        
        
        const labelElement = document.getElementById(`item-${res}-label`);
        
        if (labelElement && panel) {
            const headerItem = document.getElementById(`item-${res}`);
            if (headerItem) {
                if (panel.classList.contains('locked') && (gameResources[res] || 0) === 0) {
                    headerItem.style.display = 'none'; 
                } else {
                    headerItem.style.display = 'flex';
                }
            }
        }
        
    });

    document.dispatchEvent(new CustomEvent('resourcesUpdated'));
    window.guiDirty = false;
}



function gameLoop(currentTime) {
    
    for (const res in gameResources) {
        window.sanitizeResource(res);
    }
    for (const res in gameData.power) {
        window.sanitizePowerLevel(res);
    }
    for (const res in gameData.automining) {
        window.sanitizeAutominingRate(res);
    }
    
    for (const res in gameData.fractions) {
        const value = gameData.fractions[res];
        if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
             gameData.fractions[res] = 0;
        }
    }
    
    const deltaTime = currentTime - gameData.lastTime;
    gameData.lastTime = currentTime;

    if (window.processMiningTick) {
        window.processMiningTick(deltaTime);
    }
    
    if (window.consumeGeneratorResources) {
        window.consumeGeneratorResources(deltaTime);
    }

    // 3. Crafteo (de crafting.js)
    if (window.processCraftingTick) {
        window.processCraftingTick(deltaTime);
    }

    // 4. Energía Pasiva (de energy.js)
    if (window.addEnergy && window.getNetPowerFlow) {
        const netFlow = window.getNetPowerFlow();
        window.addEnergy(netFlow * (deltaTime / 1000));
    }

    if (window.getUnlockableResources && window.unlockResource) {
        window.checkResourceUnlocks();
    }
    
    if (window.guiDirty) {
        if (window.updateItemsPanel) window.updateItemsPanel();
        if (window.updateEnergyPanel) window.updateEnergyPanel();
        if (window.updateUpgradesPanel) window.updateUpgradesPanel();
        if (window.updateCraftingPanel) window.updateCraftingPanel();

        window.guiDirty = false;
    }

    requestAnimationFrame(gameLoop);
}



document.addEventListener('DOMContentLoaded', () => {
    const mineButtons = document.querySelectorAll('.resource-mine-btn');
    mineButtons.forEach(button => {
        button.addEventListener('click', mineResource);
        
        const resourceName = button.getAttribute('data-resource');
        
        if (resourcesToPotentiallyUnlock.includes(resourceName)) {
            button.disabled = true;
            const panel = document.getElementById(`${resourceName}-panel`);
            if(panel && !panel.classList.contains('locked')) {
                panel.classList.add('locked');
                const overlay = panel.querySelector('.unlock-overlay');
                if (overlay) overlay.style.display = 'block'; 
            }
        }
    });

    requestAnimationFrame(gameLoop);
    
    window.guiDirty = true;
    
    if (window.getUnlockableResources && window.unlockResource) {
        window.checkResourceUnlocks();
    }

});
