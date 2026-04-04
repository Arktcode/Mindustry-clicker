// scripts/functions.js

[...productionBlocks, ...energyBlocks, ...liquidBlocks, ...logicBlocks].forEach(block => {
    block.base_cost = JSON.parse(JSON.stringify(block.cost));
});

function recalculateBlockCost(block) {
    block.cost = JSON.parse(JSON.stringify(block.base_cost));
    const prestigeMult = window.getPrestigeCostMultiplier ? window.getPrestigeCostMultiplier() : 1;
    if (prestigeMult > 1) {
        for (const r in block.cost) block.cost[r] = Math.ceil(block.cost[r] * prestigeMult);
    }
    for (let i = 0; i < block.level; i++) {
        for (const r in block.cost) {
            block.cost[r] = Math.ceil(block.cost[r] * (block.cost_multiplier || 1.5));
        }
    }
}

window.triggerThoriumMeltdown = function (reactor) {
    if (window.playExplosion) window.playExplosion();
    [productionBlocks, energyBlocks, liquidBlocks, logicBlocks].forEach(category => {
        category.forEach(block => {
            block.level = Math.max(0, block.level - 15);
            recalculateBlockCost(block);
        });
    });
    if (window.getUpgradesArray) {
        window.getUpgradesArray().forEach(u => {
            u.currentLevel = Math.max(0, u.currentLevel - 15);
            if (window.recalculateUpgradeCost) window.recalculateUpgradeCost(u);
        });
        if (window.recalculateGlobalStats) window.recalculateGlobalStats();
    }
    if (reactor) {
        reactor.level = 0;
        reactor.meltdownTimer = 0;
        recalculateBlockCost(reactor);
    }
    recalculateTotalBlockConsumption();
    recalculateNominalStats();
    window.guiDirty = true;
};

window.energyState = { currentEnergy: 0, maxEnergy: 0, powerOutput: 0, powerConsumption: 0 };
window.fluidsState = {
    water: { current: 0, max: 0, netFlow: 0 },
    oil: { current: 0, max: 0, netFlow: 0 },
    cryo: { current: 0, max: 0, netFlow: 0 },
    slag: { current: 0, max: 0, netFlow: 0 },
};
window.activePowerOutput = 0;
window.totalBlockConsumption = 0;

window.sanitizeEnergyState = function () {
    for (const key in energyState) {
        if (!Number.isFinite(energyState[key])) energyState[key] = 0;
    }
    activePowerOutput = Number.isFinite(activePowerOutput) ? activePowerOutput : 0;
    for (const type in fluidsState) {
        if (!Number.isFinite(fluidsState[type].current)) fluidsState[type].current = 0;
        if (!Number.isFinite(fluidsState[type].netFlow)) fluidsState[type].netFlow = 0;
    }
    window.guiDirty = true;
};

window.getCurrentEnergy = () => energyState.currentEnergy;
window.getEnergyState = () => energyState;
window.getActivePowerOutput = () => activePowerOutput;
window.getFluidsState = () => fluidsState;

window.subtractEnergy = (amount) => {
    energyState.currentEnergy = Math.max(0, energyState.currentEnergy - amount);
    window.guiDirty = true;
};
window.addEnergy = function (amount) {
    const safe = Number.isFinite(amount) ? amount : 0;
    energyState.currentEnergy = Math.min(energyState.maxEnergy, Math.max(0, energyState.currentEnergy + safe));
    window.guiDirty = true;
};
window.subtractFluid = (type, amount) => {
    if (fluidsState[type]) fluidsState[type].current = Math.max(0, fluidsState[type].current - amount);
};
window.addFluid = (type, amount) => {
    if (fluidsState[type]) fluidsState[type].current = Math.min(fluidsState[type].max, Math.max(0, fluidsState[type].current + amount));
};
window.getNetPowerFlow = () => (activePowerOutput || 0) - (energyState.powerConsumption || 0);

function getBlockLevelInternal(blockId) {
    const all = [...productionBlocks, ...energyBlocks, ...liquidBlocks];
    const b = all.find(b => b.id === blockId);
    return b ? b.level : 0;
}

window.getBlockLevel = getBlockLevelInternal;
window.getCraftingLevel = window.getBlockLevel;
window.getCraftingRecipes = () => productionBlocks;
window.getPowerGenerators = () => energyBlocks;
window.getGeneratorsArray = () => energyBlocks;
window.getProductionBlocks = () => productionBlocks;
window.getEnergyBlocks = () => energyBlocks;
window.getLiquidBlocks = () => liquidBlocks;
window.getAllBlocks = () => [...productionBlocks, ...energyBlocks, ...liquidBlocks, ...logicBlocks];
window.getFactoryConsumption = () => totalBlockConsumption;
window.recalculateNominalStats = recalculateNominalStats;
window.recalculateTotalBlockConsumption = recalculateTotalBlockConsumption;
window.getLogicBlocks = () => logicBlocks;
window.isLogicUnlocked = () => logicBlocks.find(b => b.id === 'micro-processor')?.level > 0;

window.attemptBuyBlockById = function (id, max = true) {
    const all = window.getAllBlocks();
    const block = all.find(b => b.id === id);
    if (!block) return false;
    let bought = false;
    while (attemptBuyBlock(block)) { bought = true; if (!max) break; }
    return bought;
};

window.refundBlock = function (block) {
    if (block.level <= 0) return;
    const tempCost = JSON.parse(JSON.stringify(block.base_cost));
    for (let i = 0; i < block.level - 1; i++) {
        for (const r in tempCost) {
            tempCost[r] = Math.ceil(tempCost[r] * (block.cost_multiplier || 1.5));
        }
    }
    if (window.addResources) {
        const refund = {};
        for (const r in tempCost) refund[r] = Math.floor(tempCost[r] * 0.5);
        window.addResources(refund);
    }
    block.level--;
    recalculateBlockCost(block);
    if (window.recalculateNominalStats) window.recalculateNominalStats();
    if (window.recalculateTotalBlockConsumption) window.recalculateTotalBlockConsumption();
    window.guiDirty = true;
};

function isUnlockRequirementMet(block) {
    if (block.unlockReqs) {
        let allOk = true;
        block.unlockReqs.forEach(req => {
            const resKey = req.resource || req.itemId;
            if (resKey && req.minAmount !== undefined) {
                if ((window.getGameResources ? window.getGameResources()[resKey] : 0) < req.minAmount) allOk = false;
            } else if (req.blockId && req.minLevel !== undefined) {
                if (getBlockLevelInternal(req.blockId) < req.minLevel) allOk = false;
            } else if (req.upgradeId && req.minLevel !== undefined) {
                if ((window.getUpgradeLevel ? window.getUpgradeLevel(req.upgradeId) : 0) < req.minLevel) allOk = false;
            }
        });
        return allOk;
    }
    if (!block.unlockReq) return true;
    const req = block.unlockReq;
    const resKey = req.resource || req.itemId;
    if (resKey && req.minAmount !== undefined)
        return (window.getGameResources ? window.getGameResources()[resKey] : 0) >= req.minAmount;
    if (req.blockId && req.minLevel !== undefined) return getBlockLevelInternal(req.blockId) >= req.minLevel;
    if (req.upgradeId && req.minLevel !== undefined) return window.getUpgradeLevel ? window.getUpgradeLevel(req.upgradeId) >= req.minLevel : false;
    return true;
}

function recalculateTotalBlockConsumption() {
    let total = 0;
    [...productionBlocks, ...liquidBlocks, ...logicBlocks].forEach(b => total += b.level * (b.consumption || 0));
    totalBlockConsumption = total;
    energyState.powerConsumption = total;
}

function processBlockCategoryTick(blocksArray, deltaTime) {
    const tf = deltaTime / 1000;
    recalculateTotalBlockConsumption();

    let multiplier = 1;
    if ((window.totalBlockConsumption || 0) > 0) {
        if (window.energyState.currentEnergy <= 0 && window.getNetPowerFlow() < 0) {
            multiplier = (window.activePowerOutput || 0) / window.totalBlockConsumption;
        }
    }

    const res = window.getGameResources();
    const accMult = (window.getBlockLevel && window.getBlockLevel('interplanetary-accelerator') > 0) ? 20 : 1;
    const prestigeProdMult = window.getPrestigeProductionMultiplier ? window.getPrestigeProductionMultiplier() : 1;

    const massDriverLvl = (window.getBlockLevel && window.getBlockLevel('mass-driver')) || 0;

    blocksArray.forEach(block => {
        if (block.level <= 0 || !block.unlocked) return;
        const eff = (block.consumption || 0) > 0 ? multiplier : 1;
        if (eff <= 0 && (block.consumption || 0) > 0) return;

        let productionBonus = 1;
        if (massDriverLvl > 0) {
            const inputCount = Object.keys(block.input_rate || {}).length + (block.fluid_input_resource ? 1 : 0);
            if (inputCount >= 2) {
                productionBonus = Math.pow(1.5, massDriverLvl);
            }
        }

        const input = block.input_rate || {};
        let canCraft = true;
        const needed = {};
        for (const r in input) {
            needed[r] = block.level * input[r] * tf * eff;
            if ((res[r] || 0) < needed[r]) { canCraft = false; break; }
        }
        let reqF = 0;
        if (canCraft && block.fluid_input_resource) {
            reqF = block.level * block.fluid_input_rate * tf * eff;
            if ((fluidsState[block.fluid_input_resource]?.current || 0) < reqF) canCraft = false;
        }
        if (canCraft) {
            if (window.subtractResources) window.subtractResources(needed);
            if (reqF > 0) {
                window.subtractFluid(block.fluid_input_resource, reqF);
                fluidsState[block.fluid_input_resource].netFlow -= block.level * block.fluid_input_rate * eff;
            }
            const multiplier = block.itemOutput || 1;
            if (block.output_resource)
                window.addResources({ [block.output_resource]: block.level * block.craftSpeed * multiplier * tf * eff * accMult * productionBonus * prestigeProdMult });
            if (block.output_resources) {
                const addObj = {};
                for (const or in block.output_resources)
                    addObj[or] = block.level * block.output_resources[or] * tf * eff * accMult * productionBonus * prestigeProdMult;
                window.addResources(addObj);
            }
            if (block.fluid_output_resource) {
                const outF = block.level * block.fluid_output_rate * tf * eff * accMult * productionBonus * prestigeProdMult;
                window.addFluid(block.fluid_output_resource, outF);
                fluidsState[block.fluid_output_resource].netFlow += block.level * block.fluid_output_rate * eff * accMult * productionBonus * prestigeProdMult;
            }
        }
    });
}

window.processLogicTick = function (deltaTime) {
    const tf = deltaTime / 1000;
    const accMult = (window.getBlockLevel && window.getBlockLevel('interplanetary-accelerator') > 0) ? 20 : 1;
    const mono = logicBlocks.find(b => b.id === 'mono');

    let multiplier = 1;
    if ((window.totalBlockConsumption || 0) > 0) {
        if (window.energyState.currentEnergy <= 0 && window.getNetPowerFlow() < 0) {
            multiplier = (window.activePowerOutput || 0) / window.totalBlockConsumption;
        }
    }

    if (mono && mono.level > 0 && mono.unlocked) {
        const eff = multiplier;
        const prestigeProdMult = window.getPrestigeProductionMultiplier ? window.getPrestigeProductionMultiplier() : 1;
        const mineAmt = mono.level * mono.mining_rate * tf * eff * accMult * prestigeProdMult;
        if (window.addResources) {
            window.addResources({ copper: mineAmt, lead: mineAmt });
        }
    }
};

window.processProductionTick = (dt) => processBlockCategoryTick(productionBlocks, dt);
window.processLiquidsTick = (dt) => processBlockCategoryTick(liquidBlocks, dt);

function recalculateNominalStats() {
    energyState.powerOutput = energyBlocks.reduce((sum, g) => sum + (g.level || 0) * (g.output_per_level || 0), 0);
    const addedStorage = energyBlocks.reduce((sum, b) => sum + (b.level || 0) * (b.storage_per_level || 0), 0);
    energyState.maxEnergy = Number.isFinite(addedStorage) ? addedStorage : 0;
    if (energyState.currentEnergy > energyState.maxEnergy) energyState.currentEnergy = energyState.maxEnergy;
    const fluidStorage = liquidBlocks.reduce((sum, b) => sum + (b.level || 0) * (b.storage_per_level || 0), 0);
    for (const f in fluidsState) fluidsState[f].max = fluidStorage;
}

window.consumeGeneratorResources = function (deltaTime) {
    const tf = deltaTime / 1000;
    let active = 0;
    recalculateNominalStats();
    const res = window.getGameResources();

    energyBlocks.forEach(gen => {
        if (gen.level <= 0) return;
        let canRun = true;
        const needs = {};
        if (gen.input_resources) {
            for (const f in gen.input_resources) {
                needs[f] = gen.level * gen.input_resources[f] * tf;
                if ((res[f] || 0) < needs[f]) { canRun = false; break; }
            }
        } else if (gen.input_resource) {
            needs[gen.input_resource] = gen.level * gen.input_per_level * tf;
            if ((res[gen.input_resource] || 0) < needs[gen.input_resource]) canRun = false;
        }

        let reqF = 0;
        if (canRun && gen.fluid_input_resource) {
            reqF = gen.level * gen.fluid_input_rate * tf;
            if ((fluidsState[gen.fluid_input_resource]?.current || 0) < reqF && gen.id !== 'thorium-reactor') canRun = false;
        }

        if (gen.id === 'thorium-reactor' && gen.level > 0) {
            let hasT = true;
            if (gen.input_resources) {
                for (const f in gen.input_resources) {
                    if ((res[f] || 0) < gen.level * gen.input_resources[f] * tf) { hasT = false; break; }
                }
            } else if (gen.input_resource) {
                hasT = (res[gen.input_resource] || 0) >= (gen.level * gen.input_per_level * tf);
            }
            const neededCryo = gen.level * gen.fluid_input_rate * tf;
            if (hasT && (fluidsState['cryo']?.current || 0) < neededCryo) {
                gen.meltdownTimer = (gen.meltdownTimer || 0) + deltaTime;
                if (gen.meltdownTimer >= 10000) { window.triggerThoriumMeltdown(gen); return; }
            } else gen.meltdownTimer = 0;
        }

        if (canRun) {
            if (window.subtractResources) window.subtractResources(needs);
            if (reqF > 0) {
                window.subtractFluid(gen.fluid_input_resource, reqF);
                fluidsState[gen.fluid_input_resource].netFlow -= (gen.level || 0) * (gen.fluid_input_rate || 0);
            }
            active += (gen.level || 0) * (gen.output_per_level || 0);
        }
    });
    window.activePowerOutput = Number.isFinite(active) ? active : 0;
    if (active > 0) window.fastGuiDirty = true;
};

function checkCanAffordBlock(block) {
    const res = window.getGameResources ? window.getGameResources() : {};
    for (const r in block.cost) if (Math.floor(res[r] || 0) < block.cost[r]) return false;
    return true;
}

function attemptBuyBlock(block) {
    if (block.level >= block.maxLevel || !checkCanAffordBlock(block)) return false;
    if (block.id === 'interplanetary-accelerator') {
        const msg = "You have managed to escape this planet. The universe is collapsing before such a feat. You will receive a prestige and the opportunity to start from scratch with more strength, but also with more difficulty.\n\nAccept prestige?";
        if (!confirm(msg)) return false;
    }

    if (!window.subtractResources(block.cost)) return false;
    block.level++;
    // Trigger prestige when Interplanetary Accelerator is purchased
    if (block.id === 'interplanetary-accelerator') {
        window.guiDirty = true;
        if (window.updateItemsPanel) window.updateItemsPanel();
        document.dispatchEvent(new CustomEvent('checkUpgrades'));
        if (window.doPrestige) setTimeout(() => window.doPrestige(), 80);
        return true;
    }
    if (block.level === 1) {
        if (block.output_resource) window.unlockResource(block.output_resource);
        if (block.fluid_output_resource) window.unlockResource(block.fluid_output_resource);
    }
    recalculateTotalBlockConsumption();
    recalculateNominalStats();
    if (block.level < block.maxLevel) {
        for (const r in block.cost) block.cost[r] = Math.ceil(block.cost[r] * (block.cost_multiplier || 1.5));
    }
    window.guiDirty = true;
    if (window.updateItemsPanel) window.updateItemsPanel();
    document.dispatchEvent(new CustomEvent('checkUpgrades'));
    return true;
}

window.formatRes = function (res) {
    if (!res) return '';
    return res.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
};

window.getCostHTML = function (cost) {
    if (!cost) return '';
    const mult = window.getPrestigeCostMultiplier ? window.getPrestigeCostMultiplier() : 1;
    let html = Object.entries(cost).map(([id, amount]) => {
        const item = window.getResourceData(id);
        let sprite = item ? item.sprite : `assets/sprites/items/item-${id}.png`;
        if (['water', 'oil', 'cryo', 'slag'].includes(id)) {
            const liquidMap = { 'cryo': 'cryofluid' };
            sprite = `assets/sprites/liquids/liquid-${liquidMap[id] || id}.png`;
        }
        const label = window.isItemNamesEnabled ? (item?.name || window.formatRes(id)) : '';
        return `<img src="${sprite}" class="buy-cost-icon"> ${window.formatNumber(amount)} ${label}`;
    }).join(' ');

    if (mult > 1) {
        html += ` <span style="color:#d4af37; font-size:0.85em;">(×${mult.toFixed(2)})</span>`;
    }
    return html;
};

const formatRes = window.formatRes;

function createBlockButton(block, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const btn = document.createElement('button');
    btn.id = `block-btn-${block.id}`;
    btn.className = 'upgrade-btn';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'upgrade-info';

    const nameSpan = document.createElement('span');
    nameSpan.id = `block-name-${block.id}`;
    nameSpan.className = 'upgrade-name';
    nameSpan.textContent = block.name;

    const effectSpan = document.createElement('span');
    effectSpan.id = `block-effect-${block.id}`;
    effectSpan.className = 'upgrade-effect';

    const buyContainer = document.createElement('div');
    buyContainer.id = `block-buy-container-${block.id}`;
    buyContainer.style.marginTop = '5px';

    const buyBtn = document.createElement('button');
    buyBtn.id = `block-buy-btn-${block.id}`;
    buyBtn.className = 'buy-sub-btn';
    buyBtn.style.padding = '3px 8px';
    buyBtn.textContent = block.category === 'energy' ? 'Buy Generator' : 'Buy Block';
    buyContainer.appendChild(buyBtn);

    const qcDiv = document.createElement('div');
    qcDiv.id = `quick-controls-${block.id}`;
    qcDiv.className = 'card-quick-controls';
    qcDiv.style.display = 'none';

    const minusBtn = document.createElement('button');
    minusBtn.id = `minus-${block.id}`;
    minusBtn.className = 'card-quick-btn minus';
    minusBtn.textContent = '−';

    const lvlSpan = document.createElement('span');
    lvlSpan.className = 'quick-lvl-label';
    lvlSpan.textContent = `Lvl ${block.level}`;

    const plusBtn = document.createElement('button');
    plusBtn.id = `plus-${block.id}`;
    plusBtn.className = 'card-quick-btn plus';
    plusBtn.textContent = '+';

    qcDiv.appendChild(minusBtn);
    qcDiv.appendChild(lvlSpan);
    qcDiv.appendChild(plusBtn);

    infoDiv.appendChild(nameSpan);
    infoDiv.appendChild(effectSpan);

    if (block.category !== 'energy') {
        const consSpan = document.createElement('span');
        consSpan.id = `block-consumption-${block.id}`;
        consSpan.className = 'upgrade-auto-rate';
        infoDiv.appendChild(consSpan);
    }

    infoDiv.appendChild(buyContainer);
    infoDiv.appendChild(qcDiv);

    if (block.unlockReq || block.unlockReqs) {
        const reqDiv = document.createElement('div');
        reqDiv.id = `block-unlock-req-${block.id}`;
        reqDiv.className = 'unlock-req-text';
        infoDiv.appendChild(reqDiv);
    }

    const img = document.createElement('img');
    img.src = block.sprite;
    img.alt = block.name;
    img.className = 'upgrade-sprite';

    btn.appendChild(infoDiv);
    btn.appendChild(img);

    minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.refundBlock) window.refundBlock(block);
        document.dispatchEvent(new CustomEvent('checkUpgrades'));
    });
    plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.attemptBuyBlockById) window.attemptBuyBlockById(block.id);
        document.dispatchEvent(new CustomEvent('checkUpgrades'));
    });
    btn.addEventListener('click', (e) => {
        if (e.target.closest('.card-quick-btn')) return;
        attemptBuyBlock(block);
    });

    block.element = btn;
    container.appendChild(btn);
}

function updateBlockButton(block) {
    if (!block.element) return;
    const unlocked = isUnlockRequirementMet(block);
    const reqEl = document.getElementById(`block-unlock-req-${block.id}`);
    const nameEl = document.getElementById(`block-name-${block.id}`);
    const effectEl = document.getElementById(`block-effect-${block.id}`);
    const buyBtn = document.getElementById(`block-buy-btn-${block.id}`);
    const consEl = document.getElementById(`block-consumption-${block.id}`);

    if (!block.unlocked && unlocked) { block.unlocked = true; window.guiDirty = true; }
    if (!block.unlocked) {
        block.element.style.display = 'flex';
        block.element.classList.add('locked');
        block.element.classList.remove('can-buy');
        block.element.disabled = true;
        nameEl.textContent = block.name;
        const qc = block.element.querySelector('.card-quick-controls');
        if (qc) {
            const qcLvl = qc.querySelector('.quick-lvl-label');
            if (qcLvl) qcLvl.textContent = `Lvl 0`;
        }
        if (reqEl) {
            if (block.unlockReqs) {
                let parts = [];
                block.unlockReqs.forEach(req => {
                    const resKey = req.resource || req.itemId;
                    if (resKey) parts.push(`${window.formatNumber(req.minAmount)} ${formatRes(resKey)}`);
                    else if (req.blockId) parts.push(`${formatRes(req.blockId)} Lvl ${req.minLevel}`);
                    else if (req.recipeId) parts.push(`${formatRes(req.recipeId)} Lvl ${req.minLevel}`);
                    else if (req.upgradeId) {
                        const upgData = window.getUpgradeData ? window.getUpgradeData(req.upgradeId) : null;
                        const upgName = upgData ? upgData.name : formatRes(req.upgradeId);
                        parts.push(`${upgName} Lvl ${req.minLevel}`);
                    }
                });
                reqEl.textContent = 'Requires: ' + parts.join(' & ');
            } else if (block.unlockReq) {
                const req = block.unlockReq;
                let reqText = 'Requires: ';
                const resKey = req.resource || req.itemId;
                if (resKey) reqText += `${window.formatNumber(req.minAmount)} ${formatRes(resKey)}`;
                else if (req.blockId) reqText += `${formatRes(req.blockId)} Lvl ${req.minLevel}`;
                else if (req.recipeId) reqText += `${formatRes(req.recipeId)} Lvl ${req.minLevel}`;
                else if (req.upgradeId) {
                    const upgData = window.getUpgradeData ? window.getUpgradeData(req.upgradeId) : null;
                    const upgName = upgData ? upgData.name : formatRes(req.upgradeId);
                    reqText += `${upgName} Lvl ${req.minLevel}`;
                }
                reqEl.textContent = reqText;
            }
        }
        return;
    }

    block.element.style.display = 'flex';
    block.element.classList.remove('locked');
    block.element.disabled = false;
    if (reqEl) reqEl.textContent = '';
    const isMax = block.level >= block.maxLevel;
    nameEl.textContent = block.name + (block.level > 0 || isMax ? ` (Lvl ${block.level}/${block.maxLevel})` : '');

    if (block.category === 'energy') {
        if (block.storage_per_level) {
            effectEl.innerHTML = `Capacity: <b>+${window.formatNumber(block.level * block.storage_per_level)} E</b> (+${window.formatNumber(block.storage_per_level)} /lvl)`;
        } else {
            const fuel = block.input_resources
                ? Object.entries(block.input_resources).map(([r, v]) => `${window.formatNumber(v)}/s ${formatRes(r)}`).join(' + ')
                : (block.input_resource ? `${window.formatNumber(block.input_per_level)} ${formatRes(block.input_resource)}/s` : 'None');
            effectEl.innerHTML = `Generates <b>${window.formatNumber(block.output_per_level)} E/s</b> · Consumes ${fuel}`;
        }
    } else {
        let inArr = [];
        if (block.input_rate) Object.entries(block.input_rate).forEach(([r, v]) => inArr.push(`${window.formatNumber(v)} ${formatRes(r)}/s`));
        if (block.fluid_input_resource) inArr.push(`${window.formatNumber(block.fluid_input_rate)} ${formatRes(block.fluid_input_resource)}/s`);
        let outStr = '';
        if (block.output_resource) outStr = formatRes(block.output_resource);
        else if (block.output_resources)
            outStr = Object.entries(block.output_resources).map(([r, v]) => `${window.formatNumber(v)} ${formatRes(r)}/s`).join(' + ');
        if (block.fluid_output_resource) outStr += (outStr ? ' + ' : '') + formatRes(block.fluid_output_resource);

        if (block.category === 'logic') {
            effectEl.textContent = block.description;
        } else if (block.storage_per_level) {
            effectEl.innerHTML = `Capacity: <b>+${window.formatNumber(block.level * block.storage_per_level)} L</b> (+${window.formatNumber(block.storage_per_level)} /lvl)`;
        } else {
            const mainOut = block.itemOutput && block.itemOutput > 1 ? `${window.formatNumber(block.itemOutput)} ` : '';
            effectEl.textContent = `${inArr.join(' + ') || 'None'} → ${mainOut}${outStr || 'Nothing'}`;
        }
        if (consEl) {
            consEl.textContent = block.consumption > 0 ? `⚡ ${window.formatNumber(block.consumption)} E/s` : '⚡ No power needed';
            consEl.style.color = block.consumption > 0 ? '#F3E979' : '#90EE90';
        }
    }

    if (block.id === 'thorium-reactor' && (block.meltdownTimer || 0) > 0) {
        buyBtn.innerHTML = `<span style="color:#ff4444; font-weight:bold; animation: blink 0.5s infinite">⚠️ MELTDOWN: ${Math.max(0, 10 - Math.floor(block.meltdownTimer / 1000))}s</span>`;
    } else if (isMax) {
        buyBtn.textContent = 'MAX LEVEL';
        buyBtn.disabled = true;
        buyBtn.classList.remove('can-buy');
    } else {
        const canAfford = checkCanAffordBlock(block);
        buyBtn.disabled = !canAfford;
        buyBtn.classList.toggle('can-buy', canAfford);
        const action = block.level === 0 ? 'Buy' : 'Upgrade';
        buyBtn.innerHTML = `${action} ${window.getCostHTML(block.cost)}`;
    }

    const qc = block.element.querySelector('.card-quick-controls');
    if (qc) {
        const isLogic = window.isLogicUnlocked ? window.isLogicUnlocked() : false;
        qc.style.display = isLogic ? 'flex' : 'none';
        if (isLogic) {
            qc.querySelector('.quick-lvl-label').textContent = `Lvl ${block.level}`;
            qc.querySelector('.minus').disabled = block.level <= 0;
            qc.querySelector('.plus').disabled = block.level >= block.maxLevel || !checkCanAffordBlock(block);
        }
    }
}

window.updateBlocksPanel = () => window.getAllBlocks().forEach(updateBlockButton);
window.recalculateBlockCost = recalculateBlockCost;
window.updateProductionPanel = () => productionBlocks.forEach(updateBlockButton);
window.updateLiquidsPanel = () => liquidBlocks.forEach(updateBlockButton);
window.updateLogicPanel = () => logicBlocks.forEach(updateBlockButton);
window.updateEnergyPanel = () => {
    const cur = energyState.currentEnergy, max = energyState.maxEnergy, net = window.getNetPowerFlow();
    const lbl = document.getElementById('energy-label');
    const fill = document.getElementById('energy-bar-fill');
    if (lbl) {
        const netStr = Number.isFinite(net) ? `${net > 0 ? '+' : ''}${window.formatNumber(net)}` : '0';
        lbl.textContent = `Energy: ${window.formatNumber(cur)}/${window.formatNumber(max)} (${netStr}/s)`;
    }
    if (fill) fill.style.width = `${Math.min(100, Math.max(0, max > 0 ? (cur / max) * 100 : 0))}%`;
    energyBlocks.forEach(updateBlockButton);
};

document.addEventListener('DOMContentLoaded', () => {
    productionBlocks.forEach(b => createBlockButton(b, 'production-buttons-container'));
    energyBlocks.forEach(b => createBlockButton(b, 'energy-buttons-container'));
    liquidBlocks.forEach(b => createBlockButton(b, 'liquids-buttons-container'));
    logicBlocks.forEach(b => createBlockButton(b, 'logic-buttons-container'));
    document.addEventListener('resourcesUpdated', () => { window.updateProductionPanel(); window.updateEnergyPanel(); window.updateLiquidsPanel(); window.updateLogicPanel(); });
    document.addEventListener('checkUpgrades', () => { window.updateProductionPanel(); window.updateEnergyPanel(); window.updateLiquidsPanel(); window.updateLogicPanel(); });
    window.updateEnergyPanel(); window.updateProductionPanel(); window.updateLiquidsPanel(); window.updateLogicPanel();
});
