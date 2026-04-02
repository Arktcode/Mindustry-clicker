// scripts/crafting.js

// Definición de Recetas de Crafteo

let totalConsumptionRate = 0;

window.getFactoryConsumption = () => totalConsumptionRate;
window.getCraftingRecipes = () => craftingRecipes;
window.getCraftingLevel = (recipeId) => craftingRecipes.find(r => r.id === recipeId)?.level || 0;

function isUnlockRequirementMet(recipe) {
    if (!recipe.unlockReq) return true;
    const req = recipe.unlockReq;
    const res = window.getGameResources ? window.getGameResources() : {};
    if (req.resource && req.minAmount) return (res[req.resource] || 0) >= req.minAmount;
    if (req.type === 'generator_level' && req.id && req.minLevel) return (window.getPowerGenerators ? window.getPowerGenerators() : []).find(g => g.id === req.id)?.level >= req.minLevel;
    if (req.upgradeId && req.minLevel) return (window.getUpgradeLevel ? window.getUpgradeLevel(req.upgradeId) : 0) >= req.minLevel;
    return true;
}

function recalculateTotalConsumption() {
    totalConsumptionRate = craftingRecipes.reduce((sum, r) => sum + (r.level * r.consumption), 0);
    if (window.setTotalFactoryConsumption) window.setTotalFactoryConsumption(totalConsumptionRate);
}

window.processCraftingTick = function (deltaTime) {
    const timeFactor = deltaTime / 1000;
    let anyResourceChange = false;
    let totalResourcesToSubtract = {};
    let totalResourcesToAdd = {};

    recalculateTotalConsumption();
    const currentEnergy = window.getCurrentEnergy ? window.getCurrentEnergy() : 0;
    if (currentEnergy <= 0 && totalConsumptionRate > 0) return;

    const consumedEnergy = totalConsumptionRate * timeFactor;
    let craftingMultiplier = totalConsumptionRate > 0 ? Math.min(1, currentEnergy / consumedEnergy) : 1;

    if (totalConsumptionRate > 0 && window.subtractEnergy) window.subtractEnergy(consumedEnergy * craftingMultiplier);

    craftingRecipes.forEach(recipe => {
        if (recipe.level > 0 && recipe.unlocked) {
            let inputs = typeof recipe.input_rate === 'number' ? (recipe.input_resource ? { [recipe.input_resource]: recipe.input_rate } : {}) : recipe.input_rate;
            let canCraft = true;
            const requiredCostsForRecipe = {};

            for (const res in inputs) {
                const reqForTick = recipe.level * inputs[res] * timeFactor * craftingMultiplier;
                requiredCostsForRecipe[res] = reqForTick;
                if ((window.getGameResources()[res] || 0) < reqForTick) { canCraft = false; break; }
            }

            if (canCraft) {
                for (const res in requiredCostsForRecipe) totalResourcesToSubtract[res] = (totalResourcesToSubtract[res] || 0) + requiredCostsForRecipe[res];
                totalResourcesToAdd[recipe.output_resource] = (totalResourcesToAdd[recipe.output_resource] || 0) + (recipe.level * recipe.craftSpeed * timeFactor * craftingMultiplier);
                anyResourceChange = true;
            }
        }
    });

    if (Object.keys(totalResourcesToSubtract).length > 0 && window.subtractResources) { window.subtractResources(totalResourcesToSubtract); anyResourceChange = true; }
    if (Object.keys(totalResourcesToAdd).length > 0 && window.addResources) { window.addResources(totalResourcesToAdd); anyResourceChange = true; }
    if (anyResourceChange) window.guiDirty = true;
};

// Compras y GUI
function checkCanAffordForUpgrade(recipe) {
    const resources = window.getGameResources ? window.getGameResources() : {};
    for (const res in recipe.cost) if (Math.floor(resources[res] || 0) < recipe.cost[res]) return false;
    return true;
}

function attemptBuyRecipe(recipe) {
    if (recipe.level >= recipe.maxLevel || !checkCanAffordForUpgrade(recipe)) return false;
    if (recipe.consumption > 0) {
        if ((window.getNetPowerFlow ? window.getNetPowerFlow() : 0) - recipe.consumption < 0 && (window.getCurrentEnergy ? window.getCurrentEnergy() : 0) <= 0) return false;
    }
    if (!window.subtractResources(recipe.cost)) return false;
    recipe.level++; recalculateTotalConsumption();
    for (const res in recipe.cost) recipe.cost[res] = Math.ceil(recipe.cost[res] * 1.5);
    window.guiDirty = true;
    document.dispatchEvent(new CustomEvent('checkUpgrades'));
    return true;
}

function createCraftingButton(recipe) {
    const button = document.createElement('button');
    button.id = `crafting-btn-${recipe.id}`; button.className = 'upgrade-btn';
    button.addEventListener('click', (e) => { e.stopPropagation(); attemptBuyRecipe(recipe); });
    let unlockReqTextHTML = recipe.unlockReq ? `<div id="crafting-unlock-req-${recipe.id}" class="unlock-req-text"></div>` : '';
    button.innerHTML = `
        <div class="upgrade-info">
            <span id="crafting-name-${recipe.id}" class="upgrade-name">${recipe.name}</span>
            <span id="crafting-effect-${recipe.id}" class="upgrade-effect"></span>
            <span id="crafting-consumption-${recipe.id}" class="upgrade-auto-rate"></span>
            <div id="crafting-buy-container-${recipe.id}" style="margin-top: 5px;">
                <button id="crafting-buy-btn-${recipe.id}" class="buy-sub-btn" style="padding: 3px 8px;">Buy Factory</button>
            </div>
            ${unlockReqTextHTML}
        </div>
        <img src="${recipe.sprite}" alt="${recipe.name}" class="upgrade-sprite">
    `;
    recipe.element = button;
    const container = document.getElementById('crafting-buttons-container');
    if (container) container.appendChild(button);
}

window.updateCraftingPanel = function () {
    craftingRecipes.forEach(recipe => {
        if (!recipe.element) return;
        const unlockMet = isUnlockRequirementMet(recipe);
        const unlockReqElement = document.getElementById(`crafting-unlock-req-${recipe.id}`);
        if (!recipe.unlocked && unlockMet) { recipe.unlocked = true; window.guiDirty = true; }
        if (!recipe.unlocked) {
            recipe.element.style.display = 'flex'; recipe.element.classList.add('locked');
            if (unlockReqElement && recipe.unlockReq) {
                let reqText = '';
                if (recipe.unlockReq.resource) reqText = `Requires: ${recipe.unlockReq.minAmount} ${recipe.unlockReq.resource.charAt(0).toUpperCase() + recipe.unlockReq.resource.slice(1)}`;
                else if (recipe.unlockReq.type === 'generator_level') reqText = `Requires: ${recipe.unlockReq.id} Level ${recipe.unlockReq.minLevel}`;
                else if (recipe.unlockReq.upgradeId) reqText = `Requires: ${recipe.unlockReq.upgradeId} Lvl ${recipe.unlockReq.minLevel}`;
                unlockReqElement.textContent = reqText;
            }
            return;
        }
        recipe.element.style.display = 'flex'; recipe.element.classList.remove('locked');
        if (unlockReqElement) unlockReqElement.textContent = '';
        const nameElement = document.getElementById(`crafting-name-${recipe.id}`);
        const effectElement = document.getElementById(`crafting-effect-${recipe.id}`);
        const consumptionElement = document.getElementById(`crafting-consumption-${recipe.id}`);
        const buyBtn = document.getElementById(`crafting-buy-btn-${recipe.id}`);
        const isMaxLevel = recipe.level >= recipe.maxLevel;
        nameElement.textContent = `${recipe.name}${recipe.level > 0 || isMaxLevel ? ` (Lvl ${recipe.level}/${recipe.maxLevel})` : ''}`;
        let inputs = typeof recipe.input_rate === 'number' ? (recipe.input_resource ? { [recipe.input_resource]: recipe.input_rate } : null) : recipe.input_rate;
        if (inputs) {
            const inputRateText = Object.entries(inputs).map(([res, amount]) => `${amount} ${res.charAt(0).toUpperCase() + res.slice(1)}/s`).join(' & ');
            effectElement.textContent = `Produces ${recipe.craftSpeed} ${recipe.output_resource.charAt(0).toUpperCase() + recipe.output_resource.slice(1)}/s by consuming ${inputRateText}.`;
        } else effectElement.textContent = `Produces ${recipe.craftSpeed} ${recipe.output_resource.charAt(0).toUpperCase() + recipe.output_resource.slice(1)}/s.`;
        if (recipe.consumption > 0) { consumptionElement.textContent = `Consumes: ${recipe.consumption} Energy/s.`; consumptionElement.style.color = '#F3E979'; }
        else { consumptionElement.textContent = `Consumes: None.`; consumptionElement.style.color = '#90EE90'; }
        if (isMaxLevel) { buyBtn.textContent = 'MAX LEVEL'; buyBtn.disabled = true; buyBtn.classList.remove('can-buy'); }
        else {
            const canAfford = checkCanAffordForUpgrade(recipe);
            buyBtn.disabled = !canAfford; buyBtn.classList.toggle('can-buy', canAfford);
            const costText = Object.entries(recipe.cost).map(([res, amount]) => `${amount.toLocaleString()} ${res.charAt(0).toUpperCase() + res.slice(1)}`).join(', ');
            buyBtn.textContent = `Buy (Cost: ${costText})`;
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const craftingContainer = document.getElementById('crafting-buttons-container');
    if (craftingContainer) craftingRecipes.forEach(createCraftingButton);
});
document.addEventListener('resourcesUpdated', window.updateCraftingPanel);
document.addEventListener('checkUpgrades', window.updateCraftingPanel);
