// scripts/script.js

// Estado del Juego
let gameResources = {
    copper: 0, lead: 0, coal: 0, sand: 0,
    titanium: 0, thorium: 0,
    graphite: 0, silicio: 0, metaglass: 0, plastanium: 0,
    'phase-fabric': 0, 'surge-alloy': 0,
    'spore-pod': 0, pyratite: 0, 'blast-compound': 0,
};

const resourcesToPotentiallyUnlock = [
    'lead', 'coal', 'sand', 'titanium', 'thorium',
    'graphite', 'silicio', 'metaglass', 'plastanium',
    'phase-fabric', 'surge-alloy', 'spore-pod', 'pyratite', 'blast-compound',
];

let gameData = {
    power: { copper: 1, lead: 0, coal: 0, sand: 0, titanium: 0, thorium: 0 },
    automining: { copper: 0, lead: 0, coal: 0, sand: 0, titanium: 0, thorium: 0 },
    fractions: { copper: 0, lead: 0, coal: 0, sand: 0, titanium: 0, thorium: 0 },
    lastTime: performance.now(),
};

window.guiDirty = true;
window.autominingMultiplier = 1.0;

window.applyAutominingBoost = function (percent) {
    window.autominingMultiplier = Math.min(1.5, window.autominingMultiplier + percent);
    window.guiDirty = true;
};

// API de Recursos
window.getGameResources = () => gameResources;

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

// Saneamiento
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

// Modificación de Recursos
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

// Minería con Clic
function mineResource(event) {
    if (event.currentTarget.disabled) return;
    const res = event.currentTarget.getAttribute('data-resource');
    const amount = window.getPowerLevel(res) || 1;
    window.addResources({ [res]: amount });
}

// Desbloqueo de Recursos
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

// Recálculo Global
window.recalculateGlobalStats = function () {
    for (const resId in gameData.power) {
        const data = window.getResourceData ? window.getResourceData(resId) : null;
        gameData.power[resId] = data ? data.clickPower : 0;
    }
    if (!gameData.power.copper) gameData.power.copper = 5;
    for (const resId in gameData.automining) gameData.automining[resId] = 0;

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

// Tick Automining
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

// GUI: Panel de Items
window.updateItemsPanel = function () {
    const allRes = [
        'copper', 'lead', 'coal', 'sand', 'titanium', 'thorium',
        'graphite', 'silicio', 'metaglass', 'plastanium',
        'phase-fabric', 'surge-alloy', 'spore-pod', 'pyratite', 'blast-compound',
    ];
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
                textEl.textContent = `Extraction (+${window.getPowerLevel(res)}) /s: ${window.getAutominingRate(res).toFixed(1)}`;
            }
        }
        if (labelEl) {
            const shouldShow = !!panel ? !panelIsLocked || (gameResources[res] || 0) > 0 : isUnlocked;
            if (shouldShow && isUnlocked) {
                window.sanitizeResource(res);
                labelEl.textContent = Math.floor(gameResources[res] || 0).toLocaleString();
            }
            const headerItem = document.getElementById(`item-${res}`);
            if (headerItem) headerItem.style.display = shouldShow ? 'flex' : 'none';
        }
    });
    document.dispatchEvent(new CustomEvent('resourcesUpdated'));
};

window.updateFluidsPanel = function () {
    if (!window.getFluidsState) return;
    const fs = window.getFluidsState();
    
    document.getElementById('water-bar-fill').style.width = `${fs.water.max > 0 ? (fs.water.current / fs.water.max) * 100 : 0}%`;
    document.getElementById('water-label').textContent = `Water: ${Math.floor(fs.water.current)}/${fs.water.max} (${fs.water.netFlow >= 0 ? '+' : ''}${fs.water.netFlow.toFixed(1)}/s)`;
    
    const oilUnlocked = window.getLiquidBlocks ? window.getLiquidBlocks().some(b => b.id === 'spore-press' && b.unlocked) : false;
    if (fs.oil.current > 0 || fs.oil.netFlow > 0 || oilUnlocked) {
        document.getElementById('oil-panel').style.display = 'flex';
        document.getElementById('oil-bar-fill').style.width = `${fs.oil.max > 0 ? (fs.oil.current / fs.oil.max) * 100 : 0}%`;
        document.getElementById('oil-label').textContent = `Oil: ${Math.floor(fs.oil.current)}/${fs.oil.max} (${fs.oil.netFlow >= 0 ? '+' : ''}${fs.oil.netFlow.toFixed(1)}/s)`;
    }
    
    const cryoUnlocked = window.getLiquidBlocks ? window.getLiquidBlocks().some(b => b.id === 'cryofluid-mixer' && b.unlocked) : false;
    if (fs.cryo.current > 0 || fs.cryo.netFlow > 0 || cryoUnlocked) {
        document.getElementById('cryo-panel').style.display = 'flex';
        document.getElementById('cryo-bar-fill').style.width = `${fs.cryo.max > 0 ? (fs.cryo.current / fs.cryo.max) * 100 : 0}%`;
        document.getElementById('cryo-label').textContent = `Cryofluid: ${Math.floor(fs.cryo.current)}/${fs.cryo.max} (${fs.cryo.netFlow >= 0 ? '+' : ''}${fs.cryo.netFlow.toFixed(1)}/s)`;
    }

    if (fs.slag) {
        const slagUnlocked = window.getLiquidBlocks ? window.getLiquidBlocks().some(b => b.id === 'slag-extractor' && b.unlocked) : false;
        if (fs.slag.current > 0 || fs.slag.netFlow > 0 || slagUnlocked) {
            document.getElementById('slag-panel').style.display = 'flex';
            document.getElementById('slag-bar-fill').style.width = `${fs.slag.max > 0 ? (fs.slag.current / fs.slag.max) * 100 : 0}%`;
            document.getElementById('slag-label').textContent = `Slag: ${Math.floor(fs.slag.current)}/${fs.slag.max} (${fs.slag.netFlow >= 0 ? '+' : ''}${fs.slag.netFlow.toFixed(1)}/s)`;
        }
    }
};

// Bucle del Juego
let timeAccumulator = 0;
let lastUnlockCheck = 0;
let lastSlowGuiUpdate = 0;
const FIXED_TIME_STEP_MS = 50;

function gameLoop(currentTime) {
    let dt = currentTime - gameData.lastTime;
    if (dt < 0) dt = 0;
    gameData.lastTime = currentTime;
    
    // Limitar delta a max 1 hora para prevenir cuelgues gigantes
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
        window.slowGuiDirty = false;
        window.guiDirty = false;
        lastSlowGuiUpdate = currentTime;
    }

    requestAnimationFrame(gameLoop);
}

// Sistema de Guardado (Firebase)
window.lastUsername = localStorage.getItem('mindustryClickerCloudUser') || "Comandante Anónimo";
window.lastAvatar = localStorage.getItem('mindustryClickerCloudAvatar') || "";

window.saveGame = async function() {
    const saveObj = {
        resources: window.getGameResources(),
        energyState: window.getEnergyState ? window.getEnergyState() : null,
        fluidsState: window.getFluidsState ? window.getFluidsState() : null,
        blocksArray: window.blocksArray || [],
        upgrades: window.upgrades || [],
        autominingMultiplier: window.autominingMultiplier
    };
    
    // Guardado de respaldo local híbrido (Por si falla internet)
    localStorage.setItem('mindustryClickerSave', JSON.stringify(saveObj));
    
    // Subida a la Base de Datos Híbrida (Solo si está verificado con Discord)
    const cloudUser = localStorage.getItem('mindustryClickerCloudUser');
    if(window.saveToCloud && cloudUser) {
        const res = window.getGameResources();
        const fluids = window.getFluidsState ? window.getFluidsState() : {};
        const slagCount = (fluids['slag'] && fluids['slag'].current) ? fluids['slag'].current : 0;
        
        // El Score ahora es una combinación de tus materiales más fuertes
        const score = (res.copper || 0) + (res.silicio || 0) + (res['surge-alloy'] || 0) + slagCount;
        
        await window.saveToCloud(cloudUser, saveObj, score, window.lastAvatar);
    }
};

window.loadGame = async function() {
    // Intentar traer de la nube (Toma prelación)
    let dataObj = null;
    if(window.loadFromCloud) {
        console.log("Intentando sincronizar con los servidores de la nube...");
        dataObj = await window.loadFromCloud();
    }
    
    // Si la red falla o está vacío en la nube, recuperamos del disco C:/ de respaldo
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
        // Cargar Recursos
        if (data.resources) {
            for (const res in data.resources) {
                gameResources[res] = data.resources[res];
            }
        }
        // Cargar Multiplicador Mono
        if (data.autominingMultiplier) {
            window.autominingMultiplier = data.autominingMultiplier;
        }
        // Cargar Energía
        if (data.energyState && window.getEnergyState) {
            const es = window.getEnergyState();
            es.currentEnergy = data.energyState.currentEnergy || 0;
            es.capacity = data.energyState.capacity || 100;
        }
        // Cargar Líquidos
        if (data.fluidsState && window.getFluidsState) {
            const fs = window.getFluidsState();
            for (const fluid in data.fluidsState) {
                if (fs[fluid]) {
                    fs[fluid].current = data.fluidsState[fluid].current || 0;
                }
            }
        }
        // Cargar Niveles de Bloques
        if (data.blocksArray && window.blocksArray) {
            data.blocksArray.forEach(savedBlock => {
                const block = window.blocksArray.find(b => b.id === savedBlock.id);
                if (block) {
                    block.level = savedBlock.level || 0;
                }
            });
        }
        // Cargar Mejoras
        if (data.upgrades && window.upgrades) {
            data.upgrades.forEach(savedUp => {
                const up = window.upgrades.find(u => u.id === savedUp.id);
                if (up) {
                    up.currentLevel = savedUp.currentLevel || 0;
                }
            });
        }
        
        console.log("Game loaded successfully!");
        
        // Recalcular
        if (window.recalculateEnergyCapacity) window.recalculateEnergyCapacity();
        if (window.recalculateAutominingRates) window.recalculateAutominingRates();
        if (window.recalculateFluidCapacities) window.recalculateFluidCapacities();
        if (window.checkResourceUnlocks) window.checkResourceUnlocks();
        
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
    if (confirm("Are you sure you want to reset your save? ALL local progress will be lost! Cloud saves may still exist — clear your cache first if you want a full wipe.")) {
        localStorage.removeItem('mindustryClickerSave');
        location.reload();
    }
};

// Sistema de Login Oauth Discord
const DISCORD_CLIENT_ID = '1489148094162669728';
const DISCORD_REDIRECT_URI = 'https://arktcode.github.io/Mindustry-clicker/';

window.promptUsername = function() {
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
            const { username, global_name, avatar, id } = response;
            const finalName = global_name || username;
            let avatarUrl = "";
            if(avatar) avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
            else avatarUrl = `https://cdn.discordapp.com/embed/avatars/${parseInt(id) % 5}.png`;
            
            window.lastUsername = finalName;
            window.lastAvatar = avatarUrl;
            localStorage.setItem('mindustryClickerCloudUser', finalName);
            localStorage.setItem('mindustryClickerCloudAvatar', avatarUrl);
            
            alert(`Connected successfully, Commander ${finalName}!`);
            window.saveGame();
            window.updateAuthButtonUI();
        })
        .catch(console.error);

        // Limpiar URL hash de manera limpia
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

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.resource-mine-btn').forEach(btn => {
        btn.addEventListener('click', mineResource);
        const res = btn.getAttribute('data-resource');
        if (resourcesToPotentiallyUnlock.includes(res)) {
            btn.disabled = true;
            const panel = document.getElementById(`${res}-panel`);
            if (panel && !panel.classList.contains('locked')) {
                panel.classList.add('locked');
                const overlay = panel.querySelector('.unlock-overlay');
                if (overlay) overlay.style.display = 'block';
            }
        }
    });
    
    // Revisar si volvimos de Discord Oauth
    checkDiscordAuth();
    
    // Cargar partida o iniciar de cero (Ahora es Asíncrono por la Base de datos en la red)
    setTimeout(() => {
        window.loadGame();
    }, 1500); // 1.5s delay max esperando que inicialice firebase.js SDK module
    
    // Configurar autoguardado a 2 minutos
    setInterval(window.saveGame, 120000);
    
    // Guardar también si el usuario cierra la pestaña
    window.addEventListener("beforeunload", function () {
        window.saveGame();
    });

    requestAnimationFrame(gameLoop);
    window.guiDirty = true;
    
    // Integrar Modals UI listeners
    window.updateAuthButtonUI();
});