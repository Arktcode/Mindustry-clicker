// scripts/script.js

let gameResources = window.getInitialResources ? window.getInitialResources() : {};

let gameData = {
    power: window.getInitialPowerLevel ? window.getInitialPowerLevel() : {},
    automining: window.getInitialAutominingRate ? window.getInitialAutominingRate() : {},
    fractions: window.getInitialAutominingRate ? window.getInitialAutominingRate() : {},
    lastTime: performance.now(),
};

window.guiDirty = true;
window.autominingMultiplier = 1.0;
window.isResetting = false;

// Initialize simplification state immediately to prevent undefined issues
window.isNumberSimplificationEnabled = localStorage.getItem('isNumberSimplificationEnabled') === 'true';

window.applyAutominingBoost = function (percent) {
    window.autominingMultiplier = Math.min(1.5, window.autominingMultiplier + percent);
    window.guiDirty = true;
};

window.getGameResources = () => gameResources;

window.formatNumber = function (num, force = false) {
    // If simplification is disabled and we don't force it, use toLocaleString() for readability
    if (!window.isNumberSimplificationEnabled && !force) {
        return Math.floor(num).toLocaleString();
    }

    const n = Math.floor(num); // Standard simplification always floors
    if (n >= 1000000) {
        return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (n >= 1000) {
        return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return n.toString();
};

window.getPowerLevel = (res) => {
    window.sanitizePowerLevel(res);
    return gameData.power.hasOwnProperty(res) ? gameData.power[res] : 0;
};

window.getAutominingRate = (res) => {
    window.sanitizeAutominingRate(res);
    return gameData.automining.hasOwnProperty(res) ? gameData.automining[res] : 0;
};

window.getCraftingLevel = (blockId) => {
    return window.getBlockLevel ? window.getBlockLevel(blockId) : 0;
};

window.getPowerGenerators = () => {
    return window.getEnergyBlocks ? window.getEnergyBlocks() : [];
};

window.sanitizePowerLevel = function (res) {
    const val = gameData.power[res];
    if (typeof val !== 'number' || !Number.isFinite(val)) {
        gameData.power[res] = (res === 'copper') ? 1 : 0;
        return true;
    }
    return false;
};

window.sanitizeAutominingRate = function (res) {
    const val = gameData.automining[res];
    if (typeof val !== 'number' || !Number.isFinite(val)) {
        gameData.automining[res] = 0;
        return true;
    }
    return false;
};

window.sanitizeResource = function (res) {
    const val = gameResources[res];
    if (typeof val !== 'number' || !Number.isFinite(val)) {
        gameResources[res] = 0;
        return true;
    }
    return false;
};

window.addResources = function (resources) {
    let changed = false;
    for (const res in resources) {
        if (!gameResources.hasOwnProperty(res)) gameResources[res] = 0;
        gameResources[res] += Math.max(0, resources[res]);
        changed = true;
    }
    if (changed) {
        window.fastGuiDirty = true;
    }
};

window.subtractResources = function (cost) {
    const cur = window.getGameResources();
    let ok = true;
    for (const res in cost) {
        if (!gameResources.hasOwnProperty(res) || (cur[res] || 0) < cost[res]) {
            ok = false; break;
        }
    }
    if (ok) {
        for (const res in cost) {
            gameResources[res] = Math.max(0, gameResources[res] - cost[res]);
        }
        window.fastGuiDirty = true;
    }
    return ok;
};

function mineResource(event) {
    if (event.currentTarget.disabled) return;
    const res = event.currentTarget.getAttribute('data-resource');
    const amount = window.getPowerLevel(res) || 1;
    window.addResources({ [res]: amount });
}

window.checkResourceUnlocks = function () {
    if (!window.getUnlockableResources || !window.getPowerLevel ||
        !window.getUpgradeLevel || !window.unlockResource) return;

    const getBlockLvl = window.getBlockLevel || (() => 0);
    window.getUnlockableResources().forEach(resource => {
        if (resource.unlocked) return;
        const req = resource.unlockReq;
        if (!req) return;

        let shouldUnlock = false;
        if (req.upgradeId && req.minLevel !== undefined) {
            shouldUnlock = window.getUpgradeLevel(req.upgradeId) >= req.minLevel;
        } else if (req.blockId && req.minLevel !== undefined) {
            shouldUnlock = getBlockLvl(req.blockId) >= req.minLevel;
        } else if (req.recipeId && req.minLevel !== undefined) {
            shouldUnlock = getBlockLvl(req.recipeId) >= req.minLevel;
        } else if (req.resource && req.minPower !== undefined) {
            shouldUnlock = window.getPowerLevel(req.resource) >= req.minPower;
        }

        if (shouldUnlock) {
            window.unlockResource(resource.id);
            window.guiDirty = true;
        }
    });
};

window.handleResourceUnlockDOM = function (resourceId) {
    const panel = document.getElementById(`${resourceId}-panel`);
    const button = document.querySelector(`#${resourceId}-panel .resource-mine-btn`);
    if (panel) {
        if (!gameData.power.hasOwnProperty(resourceId) || gameData.power[resourceId] === 0) {
            const data = window.getResourceData ? window.getResourceData(resourceId) : null;
            gameData.power[resourceId] = data ? data.clickPower : 1;
        }
        panel.classList.remove('locked');
        const overlay = panel.querySelector('.unlock-overlay');
        if (overlay) overlay.style.display = 'none';
        if (button) button.disabled = false;
        window.guiDirty = true;
        document.dispatchEvent(new CustomEvent('checkUpgrades'));
    }
};

window.recalculateGlobalStats = function () {
    const allResIds = window.getAllResourceIds ? window.getAllResourceIds() : [];
    
    allResIds.forEach(resId => {
        const data = window.getResourceData ? window.getResourceData(resId) : null;
        if (!gameData.power.hasOwnProperty(resId)) gameData.power[resId] = data ? data.clickPower : 1;
        gameData.automining[resId] = 0;
    });

    if (window.getUpgradesArray) {
        window.getUpgradesArray().forEach(upgrade => {
            if (upgrade.currentLevel <= 0) return;
            if (upgrade.power) {
                for (const res in upgrade.power) {
                    gameData.power[res] = (gameData.power[res] || 0) + (upgrade.currentLevel * upgrade.power[res]);
                }
            }
            if (upgrade.rate) {
                for (const res in upgrade.rate) {
                    gameData.automining[res] = (gameData.automining[res] || 0) + (upgrade.currentLevel * upgrade.rate[res]);
                }
            }
        });
    }
    window.guiDirty = true;
};

window.upgradePower = function (res, amount) {
    window.sanitizePowerLevel(res);
    gameData.power[res] = (gameData.power[res] || 0) + amount;
    window.guiDirty = true;
    document.dispatchEvent(new CustomEvent('checkUpgrades'));
};

window.upgradeAutomining = function (res, amount) {
    window.sanitizeAutominingRate(res);
    if (!gameData.automining.hasOwnProperty(res)) gameData.automining[res] = 0;
    if (!gameData.fractions.hasOwnProperty(res)) gameData.fractions[res] = 0;
    gameData.automining[res] = (gameData.automining[res] || 0) + amount;
    window.guiDirty = true;
};

window.processMiningTick = function (deltaTime) {
    const tf = deltaTime / 1000;
    const multiplier = window.autominingMultiplier || 1.0;
    const monoBonus = 1.0 + ((window.getUpgradeLevel ? window.getUpgradeLevel('mono') : 0) * 0.05);

    for (const res in gameData.automining) {
        window.sanitizeAutominingRate(res);
        if (gameData.automining[res] <= 0) continue;
        if (window.sanitizeResource(res)) gameData.fractions[res] = 0;
        
        let finalMult = multiplier;
        if (res === 'copper' || res === 'lead') finalMult *= monoBonus;

        gameData.fractions[res] = (gameData.fractions[res] || 0) + gameData.automining[res] * finalMult * tf;
        const whole = Math.floor(gameData.fractions[res]);
        if (whole >= 1) {
            window.addResources({ [res]: whole });
            gameData.fractions[res] -= whole;
        }
    }
};

window.updateItemsPanel = function () {
    const allRes = window.getAllResourceIds ? window.getAllResourceIds() : [];
    allRes.forEach(res => {
        const textEl = document.getElementById(`${res}-text`);
        const panel = document.getElementById(`${res}-panel`);
        const labelEl = document.getElementById(`item-${res}-label`);
        const resourceData = window.getResourceData ? window.getResourceData(res) : null;
        const isUnlocked = resourceData ? resourceData.unlocked : true;
        const panelIsLocked = !!panel && panel.classList.contains('locked');

        if (textEl) {
            if (panelIsLocked) {
                textEl.textContent = 'Extraction (+?) /s: ?';
            } else if (isUnlocked) {
                window.sanitizeResource(res);
                const power = window.getPowerLevel ? window.getPowerLevel(res) : 0;
                const auto = window.getAutominingRate ? window.getAutominingRate(res) : 0;
                textEl.textContent = `Extraction (+${window.formatNumber(power)}) /s: ${window.formatNumber(auto)}`;
            }
        }
        if (labelEl) {
            const shouldShow = !!panel ? (!panelIsLocked || (gameResources[res] || 0) > 0) : isUnlocked;
            if (shouldShow && isUnlocked) {
                window.sanitizeResource(res);
                labelEl.textContent = window.formatNumber(gameResources[res] || 0);
            }
            const headerItem = document.getElementById(`item-${res}`);
            if (headerItem) headerItem.style.display = (shouldShow && isUnlocked) ? 'flex' : 'none';
        }
    });
    document.dispatchEvent(new CustomEvent('resourcesUpdated'));
};

window.updateFluidsPanel = function () {
    if (!window.getFluidsState) return;
    const fs = window.getFluidsState();
    
    document.getElementById('water-bar-fill').style.width = `${fs.water.max > 0 ? (fs.water.current / fs.water.max) * 100 : 0}%`;
    document.getElementById('water-label').textContent = `Water: ${window.formatNumber(fs.water.current)}/${window.formatNumber(fs.water.max)} (${fs.water.netFlow >= 0 ? '+' : ''}${window.formatNumber(fs.water.netFlow)}/s)`;
    
    const oilUnlocked = window.getLiquidBlocks ? window.getLiquidBlocks().some(b => b.id === 'spore-press' && b.unlocked) : false;
    if (fs.oil.current > 0 || fs.oil.netFlow > 0 || oilUnlocked) {
        document.getElementById('oil-panel').style.display = 'flex';
        document.getElementById('oil-bar-fill').style.width = `${fs.oil.max > 0 ? (fs.oil.current / fs.oil.max) * 100 : 0}%`;
        document.getElementById('oil-label').textContent = `Oil: ${window.formatNumber(fs.oil.current)}/${window.formatNumber(fs.oil.max)} (${fs.oil.netFlow >= 0 ? '+' : ''}${window.formatNumber(fs.oil.netFlow)}/s)`;
    }
    
    const cryoUnlocked = window.getLiquidBlocks ? window.getLiquidBlocks().some(b => b.id === 'cryofluid-mixer' && b.unlocked) : false;
    if (fs.cryo.current > 0 || fs.cryo.netFlow > 0 || cryoUnlocked) {
        document.getElementById('cryo-panel').style.display = 'flex';
        document.getElementById('cryo-bar-fill').style.width = `${fs.cryo.max > 0 ? (fs.cryo.current / fs.cryo.max) * 100 : 0}%`;
        document.getElementById('cryo-label').textContent = `Cryofluid: ${window.formatNumber(fs.cryo.current)}/${window.formatNumber(fs.cryo.max)} (${fs.cryo.netFlow >= 0 ? '+' : ''}${window.formatNumber(fs.cryo.netFlow)}/s)`;
    }

    if (fs.slag) {
        const slagUnlocked = window.getLiquidBlocks ? window.getLiquidBlocks().some(b => b.id === 'slag-extractor' && b.unlocked) : false;
        if (fs.slag.current > 0 || fs.slag.netFlow > 0 || slagUnlocked) {
            document.getElementById('slag-panel').style.display = 'flex';
            document.getElementById('slag-bar-fill').style.width = `${fs.slag.max > 0 ? (fs.slag.current / fs.slag.max) * 100 : 0}%`;
            document.getElementById('slag-label').textContent = `Slag: ${window.formatNumber(fs.slag.current)}/${window.formatNumber(fs.slag.max)} (${fs.slag.netFlow >= 0 ? '+' : ''}${window.formatNumber(fs.slag.netFlow)}/s)`;
        }
    }
};

let timeAccumulator = 0;
let lastUnlockCheck = 0;
let lastSlowGuiUpdate = 0;
const FIXED_TIME_STEP_MS = 50;

function gameLoop(currentTime) {
    let dt = currentTime - gameData.lastTime;
    if (dt < 0) dt = 0;
    gameData.lastTime = currentTime;
    
    const safeDelta = Math.min(dt, 3600000); 
    timeAccumulator += safeDelta;

    while (timeAccumulator >= FIXED_TIME_STEP_MS) {
        const stepDelta = FIXED_TIME_STEP_MS;
        
        if (window.getFluidsState) {
            const fs = window.getFluidsState();
            for (const type in fs) fs[type].netFlow = 0;
        }

        if (window.processMiningTick) window.processMiningTick(stepDelta);
        if (window.consumeGeneratorResources) window.consumeGeneratorResources(stepDelta);
        if (window.processProductionTick) window.processProductionTick(stepDelta);
        if (window.processLiquidsTick) window.processLiquidsTick(stepDelta);

        if (window.addEnergy && window.getNetPowerFlow) {
            window.addEnergy(window.getNetPowerFlow() * (stepDelta / 1000));
        }
        
        timeAccumulator -= stepDelta;
    }

    if (currentTime - lastUnlockCheck > 500) {
        if (window.getUnlockableResources && window.unlockResource) window.checkResourceUnlocks();
        lastUnlockCheck = currentTime;
    }

    if (window.guiDirty || window.fastGuiDirty) {
        if (window.updateItemsPanel) window.updateItemsPanel();
        if (window.updateEnergyPanel) window.updateEnergyPanel();
        if (window.updateFluidsPanel) window.updateFluidsPanel();
        window.fastGuiDirty = false;
    }

    if ((window.guiDirty || window.slowGuiDirty) && (currentTime - lastSlowGuiUpdate > 100)) {
        if (window.updateUpgradesPanel) window.updateUpgradesPanel();
        if (window.updateProductionPanel) window.updateProductionPanel();
        if (window.updateLiquidsPanel) window.updateLiquidsPanel();
        if (window.updateLogicPanel) window.updateLogicPanel();
        window.slowGuiDirty = false;
        window.guiDirty = false;
        lastSlowGuiUpdate = currentTime;
    }

    requestAnimationFrame(gameLoop);
}

window.lastUsername = localStorage.getItem('mindustryClickerCloudUser') || "Anonymous Commander";
window.lastAvatar = localStorage.getItem('mindustryClickerCloudAvatar') || "";

window.saveGame = async function() {
    try {
        const saveObj = {
            resources: window.getGameResources(),
            energyState: window.getEnergyState ? window.getEnergyState() : null,
            fluidsState: window.getFluidsState ? window.getFluidsState() : null,
            allBlocks: window.getAllBlocks ? window.getAllBlocks().map(b => ({ id: b.id, level: b.level, cost: b.cost })) : [],
            craftingRecipes: window.getCraftingRecipes ? window.getCraftingRecipes().map(r => ({ id: r.id, level: r.level, cost: r.cost })) : [],
            upgrades: window.getUpgradesArray ? window.getUpgradesArray().map(u => ({ id: u.id, currentLevel: u.currentLevel, cost: u.cost })) : [],
            autominingMultiplier: window.autominingMultiplier
        };
        
        // Local save
        localStorage.setItem('mindustryClickerSave', JSON.stringify(saveObj));
        console.log("Game saved locally.");
        
        const cloudUser = localStorage.getItem('mindustryClickerCloudUser');
        if(window.saveToCloud && cloudUser) {
            const res = window.getGameResources();
            const fluids = window.getFluidsState ? window.getFluidsState() : {};
            const slagCount = (fluids['slag'] && fluids['slag'].current) ? fluids['slag'].current : 0;
            const score = (res.copper || 0) + (res.silicon || 0) + (res['surge-alloy'] || 0) + slagCount;
            
            await window.saveToCloud(cloudUser, saveObj, score, window.lastAvatar);
        }
        return true;
    } catch (e) {
        console.error("Save failed:", e);
        return false;
    }
};

window.loadGame = async function() {
    if (sessionStorage.getItem('mindustry_clicker_force_wipe') === 'true') {
        console.log("Anti-Ghosting: Ignorando recuperación de datos tras Hard Reset.");
        sessionStorage.removeItem('mindustry_clicker_force_wipe');
        window.isResetting = false;
        if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        return;
    }

    let dataObj = null;
    if(window.loadFromCloud) {
        console.log("Intentando sincronizar con los servidores de la nube...");
        dataObj = await window.loadFromCloud();
    }
    
    if(!dataObj) {
        const saveStr = localStorage.getItem('mindustryClickerSave');
        if(saveStr) {
            console.log("Cargando guardado local de respaldo...");
            dataObj = JSON.parse(saveStr);
        }
    }
    
    if (!dataObj) return false;
    
    try {
        const data = dataObj;
        let needsMigrationSave = false;
        if (data.resources) {
            if (data.resources.silicio !== undefined && (data.resources.silicon === undefined || data.resources.silicon === 0)) {
                data.resources.silicon = data.resources.silicio;
                delete data.resources.silicio;
                needsMigrationSave = true;
            }
            for (const res in data.resources) {
                gameResources[res] = data.resources[res];
            }
        }
        if (data.autominingMultiplier) {
            window.autominingMultiplier = data.autominingMultiplier;
        }
        let savedCurrentEnergy = 0;
        if (data.energyState && window.getEnergyState) {
            const es = window.getEnergyState();
            savedCurrentEnergy = data.energyState.currentEnergy || 0;
        }
        if (data.fluidsState && window.getFluidsState) {
            const fs = window.getFluidsState();
            for (const fluid in data.fluidsState) {
                if (fs[fluid]) {
                    fs[fluid].current = data.fluidsState[fluid].current || 0;
                }
            }
        }
        const blocksToLoad = data.allBlocks || data.blocksArray;
        if (blocksToLoad && window.getAllBlocks) {
            const allBlocks = window.getAllBlocks();
            blocksToLoad.forEach(savedBlock => {
                const block = allBlocks.find(b => b.id === savedBlock.id);
                if (block) {
                    block.level = savedBlock.level || 0;
                    if (savedBlock.cost) {
                        if (savedBlock.cost.silicio !== undefined) {
                            savedBlock.cost.silicon = savedBlock.cost.silicio;
                            delete savedBlock.cost.silicio;
                            needsMigrationSave = true;
                        }
                        block.cost = savedBlock.cost;
                    }
                    if (block.level > 0) block.unlocked = true;
                }
            });
        }
        if (data.craftingRecipes && window.getCraftingRecipes) {
            const recipes = window.getCraftingRecipes();
            data.craftingRecipes.forEach(saved => {
                const recipe = recipes.find(r => r.id === saved.id);
                if (recipe) {
                    recipe.level = saved.level || 0;
                    if (saved.cost) {
                        if (saved.cost.silicio !== undefined) {
                            saved.cost.silicon = saved.cost.silicio;
                            delete saved.cost.silicio;
                            needsMigrationSave = true;
                        }
                        recipe.cost = saved.cost;
                    }
                    if (recipe.level > 0) recipe.unlocked = true;
                }
            });
        }
        if (data.upgrades && window.getUpgradesArray) {
            const allUpgrades = window.getUpgradesArray();
            data.upgrades.forEach(savedUp => {
                const up = allUpgrades.find(u => u.id === savedUp.id);
                if (up) {
                    up.currentLevel = savedUp.currentLevel || 0;
                    if (savedUp.cost) {
                        if (savedUp.cost.silicio !== undefined) {
                            savedUp.cost.silicon = savedUp.cost.silicio;
                            delete savedUp.cost.silicio;
                            needsMigrationSave = true;
                        }
                        up.cost = savedUp.cost;
                    }
                    if (up.currentLevel > 0) up.unlocked = true;
                }
            });
        }
        
        console.log("Game loaded successfully!");
        
        if (needsMigrationSave) {
            console.log("Migration detected: Repairing cloud hash...");
            window.saveGame();
        }
        
        if (window.recalculateNominalStats) window.recalculateNominalStats();
        if (window.recalculateTotalBlockConsumption) window.recalculateTotalBlockConsumption();
        
        if (window.getEnergyState) {
            const es = window.getEnergyState();
            es.currentEnergy = Math.min(savedCurrentEnergy, es.maxEnergy);
        }
        
        if (window.recalculateFluidCapacities) window.recalculateFluidCapacities();
        if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        if (window.updateCraftingPanel) window.updateCraftingPanel();
        if (window.recalculateGlobalStats) window.recalculateGlobalStats();
        
        window.guiDirty = true;
        window.slowGuiDirty = true;
        window.fastGuiDirty = true;
        return true;
    } catch (e) {
        console.error("Error al cargar partida: ", e);
        return false;
    }
};

window.hardReset = function() {
    if (confirm("Are you sure you want to reset your save? ALL local progress will be lost! This will also log you out to prevent cloud recovery.")) {
        window.isResetting = true;
        
        if (window.beforeUnloadSaveListener) {
            window.removeEventListener("beforeunload", window.beforeUnloadSaveListener);
        }
        
        localStorage.clear();
        sessionStorage.clear();
        
        sessionStorage.setItem('mindustry_clicker_force_wipe', 'true');
        
        console.log("Full wipe completed. Session marked for fresh start.");
        
        window.location.replace(window.location.origin + window.location.pathname);
    }
};

const DISCORD_CLIENT_ID = '1489148094162669728';

window.promptUsername = function() {
    const DISCORD_REDIRECT_URI = window.location.origin + window.location.pathname;
    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=token&scope=identify`;
    window.location.href = oauthUrl;
};

function checkDiscordAuth() {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];
    if (accessToken) {
        fetch('https://discord.com/api/users/@me', {
            headers: { authorization: `${tokenType} ${accessToken}` }
        })
        .then(result => result.json())
        .then(response => {
            if (!response || !response.id) {
                console.error("Error logging in:", response);
                alert("Failed to authenticate with Discord. Please try again.");
                return;
            }
            const { username, global_name, avatar, id } = response;
            const finalName = global_name || username;
            let avatarUrl = "";
            let bitmask = 0;
            if(avatar) {
                avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
            } else {
                try { bitmask = Number(BigInt(id) >> 22n) % 6; } catch(e) { bitmask = 0; }
                avatarUrl = `https://cdn.discordapp.com/embed/avatars/${bitmask}.png`;
            }
            
            window.lastUsername = finalName;
            window.lastAvatar = avatarUrl;
            localStorage.setItem('mindustryClickerCloudUser', finalName);
            localStorage.setItem('mindustryClickerCloudAvatar', avatarUrl);
            localStorage.setItem('mindustryClickerDiscordID', id);
            
            alert(`Connected successfully, Commander ${finalName}!`);
            window.loadGame();
            window.updateAuthButtonUI();
        })
        .catch(console.error);

        window.history.replaceState(null, null, window.location.pathname);
    }
}

window.updateAuthButtonUI = function() {
    const authBtn = document.getElementById('leaderboard-auth-btn');
    const avatarBtn = document.getElementById('config-btn-img');
    
    if(localStorage.getItem('mindustryClickerCloudUser')) {
        if(authBtn) {
            authBtn.innerText = "Logout";
            authBtn.style.background = "#da3633";
            authBtn.onmouseover = () => { authBtn.style.background = '#b62324'; };
            authBtn.onmouseout = () => { authBtn.style.background = '#da3633'; };
            authBtn.onclick = () => {
                if(confirm("Log out? You will stop syncing your score to the global leaderboard.")) {
                    localStorage.removeItem('mindustryClickerCloudUser');
                    localStorage.removeItem('mindustryClickerCloudAvatar');
                    window.lastUsername = "Anonymous Commander";
                    window.lastAvatar = "";
                    window.updateAuthButtonUI();
                    alert("Global session disconnected.");
                }
            };
        }
        if(avatarBtn) {
            avatarBtn.src = localStorage.getItem('mindustryClickerCloudAvatar') || "assets/sprites/router.png";
        }
    } else {
        if(authBtn) {
            authBtn.innerText = "Login with Discord";
            authBtn.style.background = "#5865F2";
            authBtn.onmouseover = () => { authBtn.style.background = '#4752C4'; };
            authBtn.onmouseout = () => { authBtn.style.background = '#5865F2'; };
            authBtn.onclick = window.promptUsername;
        }
        if(avatarBtn) {
            avatarBtn.src = "assets/sprites/router.png";
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.resource-mine-btn').forEach(btn => {
        btn.addEventListener('click', mineResource);
        const res = btn.getAttribute('data-resource');
        const resData = window.getResourceData ? window.getResourceData(res) : null;
        if (resData && !resData.unlocked) {
            btn.disabled = true;
            const panel = document.getElementById(`${res}-panel`);
            if (panel && !panel.classList.contains('locked')) {
                panel.classList.add('locked');
                const overlay = panel.querySelector('.unlock-overlay');
                if (overlay) overlay.style.display = 'block';
            }
        }
    });
    
    checkDiscordAuth();
    
    setTimeout(() => {
        window.loadGame();
    }, 500);
    
    setInterval(window.saveGame, 120000);
    
    window.beforeUnloadSaveListener = function () {
        if (!window.isResetting) {
            window.saveGame();
        }
    };
    window.addEventListener("beforeunload", window.beforeUnloadSaveListener);

    requestAnimationFrame(gameLoop);
    window.guiDirty = true;
    
    window.updateAuthButtonUI();
});