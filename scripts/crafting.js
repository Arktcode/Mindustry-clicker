// --- 1. DEFINICIÓN DE RECETAS DE CRAFTEO
const craftingRecipes = [
    {
        id: 'graphite-press',
        name: 'Graphite Press',
        sprite: 'assets/sprites/graphite-press.png',
        description: 'Crafts 1 Graphite/s from 2 Coal/s.',
        level: 0,
        maxLevel: 20,
        unlocked: false,
        crafting_rate: 3,
        input_rate: 2, // Se manejará como { coal: 2 } en el tick
        input_resource: 'coal',
        output_resource: 'graphite',
        cost: { cobre: 50, lead: 50 },
        cost_multiplier: 1.5,
        consumption: 0,
        unlockReq: { resource: 'coal', minAmount: 500 },
    },
    {
        id: 'silicon-smelter',
        name: 'Silicon Smelter',
        sprite: 'assets/sprites/silicon-smelter.png',
        description: 'Crafts 1 Silicon/s from 1 Sand/s and 1 Coal/s.',
        level: 0,
        maxLevel: 20,
        unlocked: false,
        crafting_rate: 2,
        input_rate: { sand: 4, coal: 2 },
        output_resource: 'silicio',
        cost: { cobre: 300, lead: 200, graphite: 50 },
        cost_multiplier: 1.5,
        consumption: 10,
        unlockReq: { resource: 'sand', minAmount: 1000 } 
    },
];


let totalConsumptionRate = 0; 
window.getFactoryConsumption = () => totalConsumptionRate; 
window.getCraftingRecipes = () => craftingRecipes;

window.getCraftingLevel = function(recipeId) {
    const recipe = craftingRecipes.find(r => r.id === recipeId);
    return recipe ? recipe.level : 0;
};

/**
 * Verifica si se cumplen los requisitos de desbloqueo de una receta.
 */
function isUnlockRequirementMet(recipe) {
    if (!recipe.unlockReq) return true; 

    const req = recipe.unlockReq;
    
    // Requisito basado en cantidad de recurso
    if (req.resource && req.minAmount) {
        const currentResourceAmount = (window.getGameResources ? window.getGameResources() : {})[req.resource] || 0;
        return currentResourceAmount >= req.minAmount;
    }
    
    // Requisito basado en el nivel de un GENERADOR
    if (req.type === 'generator_level' && req.id && req.minLevel) {
        const generators = window.getPowerGenerators ? window.getPowerGenerators() : [];
        const targetGen = generators.find(gen => gen.id === req.id);
        
        if (targetGen) {
            return targetGen.level >= req.minLevel;
        }
        return false;
    }
    
    if (req.upgradeId && req.minLevel) {
        if (window.getUpgradeLevel) {
            const currentUpgradeLevel = window.getUpgradeLevel(req.upgradeId);
            return currentUpgradeLevel >= req.minLevel;
        }
        return false; 
    }
    
    return true;
}

function recalculateTotalConsumption() {
    let newTotal = 0;
    craftingRecipes.forEach(recipe => {
        // Solo cuenta el consumo si la fábrica tiene al menos un nivel
        newTotal += recipe.level * recipe.consumption;
    });
    totalConsumptionRate = newTotal;
    
    if (window.setTotalFactoryConsumption) {
        window.setTotalFactoryConsumption(totalConsumptionRate);
    }
}
window.processCraftingTick = function(deltaTime) {
    const timeFactor = deltaTime / 1000;
    let anyResourceChange = false;
    let totalResourcesToSubtract = {};
    let totalResourcesToAdd = {};
    
    recalculateTotalConsumption(); 
    
    // Asegurar que las funciones de energía existan (de energy.js)
    const currentEnergy = window.getCurrentEnergy ? window.getCurrentEnergy() : 0;
    const subtractEnergy = window.subtractEnergy ? window.subtractEnergy : () => {};
    
    // La producción se detiene si no hay energía Y hay consumo.
    const mustStopDueToEnergy = currentEnergy <= 0 && totalConsumptionRate > 0;
    if (mustStopDueToEnergy) {
        window.guiDirty = true; 
        return;
    }

    const consumedEnergy = totalConsumptionRate * timeFactor;
    let craftingMultiplier = 1; // 1 = Full speed

    if (totalConsumptionRate > 0) {
        if (currentEnergy >= consumedEnergy) {
            subtractEnergy(consumedEnergy);
        } else {
            // Si la energía es insuficiente, reducir la velocidad de crafteo proporcionalmente
            craftingMultiplier = currentEnergy / consumedEnergy; 
            subtractEnergy(currentEnergy); 
        }
        window.guiDirty = true;
    }
    
    // --- Lógica de Crafteo y Consumo de Recursos (V6: Bloqueo Simplificado) ---
    // Asume que las funciones de recursos son globales (de script.js)
    const currentResources = window.getGameResources ? window.getGameResources() : {};
    const subtractResources = window.subtractResources ? window.subtractResources : () => {};
    const addResources = window.addResources ? window.addResources : () => {};


    craftingRecipes.forEach(recipe => {
        if (recipe.level > 0 && recipe.unlocked) { 
            let inputs = {};
            
            if (typeof recipe.input_rate === 'number') {
                if (recipe.input_resource) {
                    inputs = { [recipe.input_resource]: recipe.input_rate };
                }
            } else {
                inputs = recipe.input_rate; 
            }
            
            // 1. Pre-calcular el coste TOTAL y verificar la disponibilidad de recursos
            let canCraft = true;
            const requiredCostsForRecipe = {};

            for (const res in inputs) {
                const requiredPerSecond = recipe.level * inputs[res];
                // El coste de recursos se ajusta por el multiplicador de energía/crafteo
                const requiredForTick = requiredPerSecond * timeFactor * craftingMultiplier;
                
                requiredCostsForRecipe[res] = requiredForTick;
                if ((currentResources[res] || 0) < requiredForTick) {
                    canCraft = false;
                    break;
                }
            }
            
            if (canCraft) { 
                for (const res in requiredCostsForRecipe) {
                    totalResourcesToSubtract[res] = (totalResourcesToSubtract[res] || 0) + requiredCostsForRecipe[res];
                }
                
                const actualCraftingRate = recipe.level * recipe.crafting_rate * timeFactor * craftingMultiplier;
                
                if (actualCraftingRate > 0) {
                    totalResourcesToAdd[recipe.output_resource] = (totalResourcesToAdd[recipe.output_resource] || 0) + actualCraftingRate;
                    anyResourceChange = true;
                }
            }
        }
    });

    if (Object.keys(totalResourcesToSubtract).length > 0) {
        subtractResources(totalResourcesToSubtract); 
        anyResourceChange = true;
    }
    if (Object.keys(totalResourcesToAdd).length > 0) {
        // Nota: addResources maneja la suma de números decimales
        addResources(totalResourcesToAdd);
        anyResourceChange = true;
    }

    if (anyResourceChange) {
        window.guiDirty = true;
    }
    
};

// --- 3. FUNCIONES DE COMPRA Y GUI

function checkCanAffordForUpgrade(recipe) {
    const resources = window.getGameResources ? window.getGameResources() : {}; 
    for (const res in recipe.cost) {
        if (Math.floor(resources[res] || 0) < recipe.cost[res]) {
            return false;
        }
    }
    return true;
}

function attemptBuyRecipe(recipe) {
    const cost = recipe.cost;

    if (recipe.level >= recipe.maxLevel) return false;
    if (!checkCanAffordForUpgrade(recipe)) return false;

    // --- LÓGICA DE VERIFICACIÓN DE ENERGÍA
    if (recipe.consumption > 0) {
        const currentEnergy = window.getCurrentEnergy ? window.getCurrentEnergy() : 0;
        const netFlow = window.getNetPowerFlow ? window.getNetPowerFlow() : 0; 
        
        const totalGeneration = netFlow + totalConsumptionRate; 
        
        const newConsumption = recipe.consumption;
        const totalConsumptionIfPurchased = totalConsumptionRate + newConsumption;
        const newNetFlow = totalGeneration - totalConsumptionIfPurchased;

        if (newNetFlow < 0 && currentEnergy <= 0) { 
            console.log("Purchase blocked: Buying this factory would result in negative net power flow with zero energy reserves.");
            return false;
        } 
    }
    // --- FIN DE LÓGICA DE VERIFICACIÓN DE ENERGÍA

    if (!window.subtractResources(cost)) {
        return false;
    }
    
    recipe.level++;
    recalculateTotalConsumption();

    if (recipe.level < recipe.maxLevel) {
        for (const res in recipe.cost) {
            recipe.cost[res] = Math.ceil(recipe.cost[res] * recipe.cost_multiplier);
        }
    }
    
    window.guiDirty = true;
    // CRÍTICO: Disparar evento para que otros módulos re-evalúen (como upgrades.js) etc :v
    document.dispatchEvent(new CustomEvent('checkUpgrades')); 
    return true;
}


function createCraftingButton(recipe) {
    const button = document.createElement('button');
    button.id = `crafting-btn-${recipe.id}`;
    button.className = 'upgrade-btn';

    button.addEventListener('click', (e) => {
        e.stopPropagation(); 
        attemptBuyRecipe(recipe);
    });
    
    let unlockReqTextHTML = '';
    
    if (recipe.unlockReq) {
        unlockReqTextHTML = `<div id="crafting-unlock-req-${recipe.id}" class="unlock-req-text"></div>`;
    }

    button.innerHTML = `
        <div class="upgrade-info">
            <span id="crafting-name-${recipe.id}" class="upgrade-name">${recipe.name}</span>
            <span id="crafting-effect-${recipe.id}" class="upgrade-effect"></span>
            <span id="crafting-consumption-${recipe.id}" class="upgrade-auto-rate"></span>
            <div id="crafting-buy-container-${recipe.id}" style="margin-top: 5px;">
                <button id="crafting-buy-btn-${recipe.id}" class="buy-sub-btn" style="padding: 3px 8px;">
                    Buy Factory
                </button>
            </div>
            ${unlockReqTextHTML}
        </div>
        <img src="${recipe.sprite}" alt="${recipe.name}" class="upgrade-sprite">
    `;
    
    recipe.element = button;
    const container = document.getElementById('crafting-buttons-container');
    if (container) {
        container.appendChild(button);
    }
}


window.updateCraftingPanel = function() {
    craftingRecipes.forEach(recipe => {
        if (!recipe.element) return;
        
        const unlockMet = isUnlockRequirementMet(recipe);
        const unlockReqElement = document.getElementById(`crafting-unlock-req-${recipe.id}`);
        
        // 1. Lógica de Desbloqueo de Receta
        if (!recipe.unlocked && unlockMet) {
            recipe.unlocked = true;
            window.guiDirty = true;
        }
        
        if (!recipe.unlocked) {
            // Mostrar y bloquear el elemento
            recipe.element.style.display = 'flex'; 
            recipe.element.classList.add('locked'); 
            
            // Actualizar texto de requisito de desbloqueo
            if (unlockReqElement && recipe.unlockReq) {
                let reqText = '';
                
                if (recipe.unlockReq.resource) {
                    reqText = `Requires: ${recipe.unlockReq.minAmount} ${recipe.unlockReq.resource.charAt(0).toUpperCase() + recipe.unlockReq.resource.slice(1)}`;
                } else if (recipe.unlockReq.type === 'generator_level') {
                    const genName = recipe.unlockReq.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    reqText = `Requires: ${genName} Level ${recipe.unlockReq.minLevel}`;
                } else if (recipe.unlockReq.upgradeId) { // Requisito de mejora
                    const upgradeName = recipe.unlockReq.upgradeId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    const currentLevel = window.getUpgradeLevel ? window.getUpgradeLevel(recipe.unlockReq.upgradeId) : 0;
                    reqText = `Requires: ${upgradeName} Lvl ${recipe.unlockReq.minLevel} (Current: ${currentLevel})`;
                }

                unlockReqElement.textContent = reqText;
            }
            return; 
        } 
        
        // 2. Estado Desbloqueado
        recipe.element.style.display = 'flex';
        recipe.element.classList.remove('locked');
        
        if (unlockReqElement) {
            unlockReqElement.textContent = ''; 
        }
        
        // --- Lógica de nivel y compra
        
        const nameElement = document.getElementById(`crafting-name-${recipe.id}`);
        const effectElement = document.getElementById(`crafting-effect-${recipe.id}`);
        const consumptionElement = document.getElementById(`crafting-consumption-${recipe.id}`);
        const buyBtn = document.getElementById(`crafting-buy-btn-${recipe.id}`);
        
        const isMaxLevel = recipe.level >= recipe.maxLevel;
        const levelText = recipe.level > 0 || isMaxLevel ? ` (Lvl ${recipe.level}/${recipe.maxLevel})` : '';
        nameElement.textContent = `${recipe.name}${levelText}`;
        
        let inputs = typeof recipe.input_rate === 'number' ? 
            (recipe.input_resource ? { [recipe.input_resource]: recipe.input_rate } : null) : recipe.input_rate;
        
        if (inputs) {
            const inputRateText = Object.entries(inputs)
                .map(([res, amount]) => `${amount} ${res.charAt(0).toUpperCase() + res.slice(1)}/s`)
                .join(' & ');
            effectElement.textContent = `Produces ${recipe.crafting_rate} ${recipe.output_resource.charAt(0).toUpperCase() + recipe.output_resource.slice(1)}/s by consuming ${inputRateText}.`;
        } else {
            effectElement.textContent = `Produces ${recipe.crafting_rate} ${recipe.output_resource.charAt(0).toUpperCase() + recipe.output_resource.slice(1)}/s.`;
        }
        
        if (recipe.consumption > 0) {
            consumptionElement.textContent = `Consumes: ${recipe.consumption} Energy/s.`;
            consumptionElement.style.color = '#F3E979'; 
        } else {
            consumptionElement.textContent = `Consumes: None.`;
            consumptionElement.style.color = '#90EE90';
        }
        
        if (isMaxLevel) {
            buyBtn.textContent = 'MAX LEVEL';
            buyBtn.disabled = true;
            buyBtn.classList.remove('can-buy');
        } else {
            const canAfford = checkCanAffordForUpgrade(recipe);
            buyBtn.disabled = !canAfford;
            
            if (canAfford) {
                buyBtn.classList.add('can-buy');
            } else {
                buyBtn.classList.remove('can-buy');
            }
            
            const costText = Object.entries(recipe.cost)
                .map(([res, amount]) => `${amount.toLocaleString()} ${res.charAt(0).toUpperCase() + res.slice(1)}`)
                .join(', ');
                
            buyBtn.textContent = `Buy (Cost: ${costText})`;
        }
    });
};


document.addEventListener('DOMContentLoaded', () => {
    const craftingContainer = document.getElementById('crafting-buttons-container');
    if (craftingContainer) {
        craftingRecipes.forEach(createCraftingButton);
    }
});

document.addEventListener('resourcesUpdated', window.updateCraftingPanel);

document.addEventListener('checkUpgrades', window.updateCraftingPanel);

