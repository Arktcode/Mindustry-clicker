// scripts/script.js

// --- CONFIGURACIÓN Y ESTADO DEL JUEGO ---

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
    // 'power' y 'automining' son la fuente de verdad para las mejoras.
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

// --- EXPORTACIONES GLOBALES (Necesarias para la interconexión de módulos) ---

window.guiDirty = true; // Indica que la GUI necesita ser actualizada

// Recursos y Niveles
window.getGameResources = () => gameResources;

// ✅ SANEAR: Asegura que la potencia sea numérica antes de devolverla
window.getPowerLevel = (resourceName) => {
    window.sanitizePowerLevel(resourceName);
    return gameData.power.hasOwnProperty(resourceName) ? gameData.power[resourceName] : 0;
};

// ✅ SANEAR: Asegura que la tasa sea numérica antes de devolverla
window.getAutominingRate = (resourceName) => {
    window.sanitizeAutominingRate(resourceName);
    return gameData.automining.hasOwnProperty(resourceName) ? gameData.automining[resourceName] : 0;
};


// Implementación de funciones auxiliares que otros módulos deben definir
window.getCraftingLevel = (recipeId) => {
    if (window.getCraftingRecipes) {
        const recipe = window.getCraftingRecipes().find(r => r.id === recipeId);
        // ✅ CORRECCIÓN APLICADA: Usar 'level' para obtener el nivel de la receta.
        return recipe ? recipe.level : 0; 
    }
    return 0; 
};

window.getPowerGenerators = () => {
    if (window.getGeneratorsArray) {
        // Asume que esta función viene de energy.js
        return window.getGeneratorsArray();
    }
    return [];
};


// --- Funciones de Saneamiento y Debugging ---

// ✅ NUEVA FUNCIÓN: Sanea el valor de Power a 0 si es NaN o Infinity.
window.sanitizePowerLevel = function(resourceName) {
    const value = gameData.power[resourceName];
    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
        console.warn(`[SANEAR:POWER] Nivel de poder para '${resourceName}' era ${value}. Reiniciando a 0 (o 1 si es cobre).`);
        gameData.power[resourceName] = (resourceName === 'cobre') ? 1 : 0;
        return true;
    }
    return false;
}

// ✅ NUEVA FUNCIÓN: Sanea el valor de Automining a 0 si es NaN o Infinity.
window.sanitizeAutominingRate = function(resourceName) {
    const value = gameData.automining[resourceName];
    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
        console.warn(`[SANEAR:AUTOMINING] Tasa de auto-minado para '${resourceName}' era ${value}. Reiniciando a 0.`);
        gameData.automining[resourceName] = 0;
        return true;
    }
    return false;
}

// ✅ Sanea el valor de un recurso a 0 si es NaN o Infinity.
window.sanitizeResource = function(resourceName) {
    const value = gameResources[resourceName];
    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
        console.warn(`[SANEAR:RESOURCE] Recurso '${resourceName}' era ${value}. Reiniciando a 0.`);
        gameResources[resourceName] = 0;
        return true;
    }
    return false;
}


// --- Funciones de Modificación de Recursos ---

window.addResources = function (resources) {
    let changed = false;
    for (const res in resources) {
        if (gameResources.hasOwnProperty(res)) {
            // Asegura que solo se añadan valores positivos
            gameResources[res] += Math.max(0, resources[res]); 
            
            // Saneamiento después de la suma
            if (window.sanitizeResource(res)) {
                // Si se saneó, significa que estaba bugeado
            }

            changed = true;
        }
    }
    if (changed) {
        window.guiDirty = true;
        // CRÍTICO: Verificar desbloqueos cada vez que se añaden recursos
        window.checkResourceUnlocks();
    }
};

window.subtractResources = function (cost) {
    const currentResources = window.getGameResources(); 
    let success = true;
    
    // 1. Verificar si hay suficientes recursos
    for (const res in cost) {
        // CRÍTICO: Saneamiento preventivo al chequear el coste
        if (window.sanitizeResource(res)) {
            // Si el recurso se saneó a 0, fallar la verificación de coste
            success = false;
            break; 
        }

        // Se usa Math.floor para los recursos disponibles (entero) y Math.ceil para el coste (entero)
        // para garantizar que la verificación sea estricta para las compras.
        if (!gameResources.hasOwnProperty(res) || Math.floor(currentResources[res]) < Math.ceil(cost[res])) { 
            success = false;
            break;
        }
    }
    
    // 2. Si hay éxito, restar los recursos
    if (success) {
        for (const res in cost) {
            gameResources[res] = Math.max(0, gameResources[res] - cost[res]);
            
            // Saneamiento después de la resta
            window.sanitizeResource(res);
        }
        window.guiDirty = true;
    }

    return success;
};

// Función de Clic (mineResource)
function mineResource(event) {
    if (event.currentTarget.disabled) return;
    
    const resourceName = event.currentTarget.getAttribute('data-resource');
    // CORRECCIÓN: Usar getPowerLevel que ya sanea, y 1 como fallback
    const amount = window.getPowerLevel(resourceName) || 1; 
    
    window.addResources({ [resourceName]: amount });
}


// ✅ FUNCIÓN ACTUALIZADA: Chequea si algún recurso bloqueado debe ser desbloqueado.
window.checkResourceUnlocks = function() {
    
    // CRÍTICO: Asegurarse de que las funciones de items.js y upgrades.js estén disponibles
    // Se añade getUpgradeLevel y getCraftingLevel que usamos para verificar upgradeId y recipeId
    if (!window.getUnlockableResources || !window.getPowerLevel || !window.getUpgradeLevel || !window.getCraftingLevel || !window.unlockResource) {
        return; 
    }

    const unlockableResources = window.getUnlockableResources();
    let anyUnlocked = false;

    unlockableResources.forEach(resource => {
        // Si ya está desbloqueado internamente (en items.js), no lo chequeamos
        if (resource.unlocked) return; 

        if (!resource.unlockReq) return; 

        const req = resource.unlockReq;
        let shouldUnlock = false;

        // 1. Desbloqueo por Nivel de Mejora (Upgrade ID - CLAVE para Titanio)
        if (req.upgradeId && req.minLevel !== undefined) { 
            const currentUpgradeLevel = window.getUpgradeLevel(req.upgradeId);
            if (currentUpgradeLevel >= req.minLevel) {
                shouldUnlock = true;
            }
        }
        // 2. Desbloqueo por Nivel de Receta (Crafting ID)
        else if (req.recipeId && req.minLevel !== undefined) {
            if (window.getCraftingLevel(req.recipeId) >= req.minLevel) {
                shouldUnlock = true;
            }
        }
        // 3. Desbloqueo por Nivel de Poder de Minería (Power Level - Lead, Coal, Thorium)
        else if (req.resource && req.minPower !== undefined) {
            const currentPower = window.getPowerLevel(req.resource);
            if (currentPower >= req.minPower) {
                shouldUnlock = true;
            }
        } 
        
        // Si el requisito se cumple, desbloquear
        if (shouldUnlock) {
            // Llama a la función de items.js para marcarlo como desbloqueado
            window.unlockResource(resource.id); 
            anyUnlocked = true;
        }
    });
    
    if (anyUnlocked) {
        window.guiDirty = true;
    }
};

// NUEVA FUNCIÓN: Maneja la actualización del DOM después del desbloqueo interno (llamado desde items.js)
window.handleResourceUnlockDOM = function(resourceId) {
    const panel = document.getElementById(`${resourceId}-panel`);
    const button = document.querySelector(`#${resourceId}-panel .resource-mine-btn`); 

    if (panel) {
        // Inicializar poder de clic al valor inicial del recurso si no existe o es 0
        if (!gameData.power.hasOwnProperty(resourceId) || gameData.power[resourceId] === 0) {
            // Solo intentar obtener resourceData si la función existe, sino usa 1
            const resourceData = window.getResourceData ? window.getResourceData(resourceId) : null;
            gameData.power[resourceId] = resourceData ? resourceData.clickPower : 1; 
        }

        panel.classList.remove('locked');
        
        const overlay = panel.querySelector('.unlock-overlay');
        if (overlay) {
            overlay.style.display = 'none'; 
        }
        
        if (button) {
            button.disabled = false; // HABILITAR EL BOTÓN DE CLIC
        }
        
        window.guiDirty = true;
        // Notificar a otros módulos que un recurso se ha desbloqueado, lo que puede afectar mejoras.
        document.dispatchEvent(new CustomEvent('checkUpgrades')); 
    }
}


// Función de Mejora de Poder de Clic (Llamada desde upgrades.js)
window.upgradePower = function(resourceName, amount) {
    // Usar Sanitize para asegurar que el valor inicial es numérico
    window.sanitizePowerLevel(resourceName);
    gameData.power[resourceName] = (gameData.power[resourceName] || 0) + amount;

    window.guiDirty = true; 
    document.dispatchEvent(new CustomEvent('checkUpgrades')); 
};

// Función de Mejora de Minería Automática (Llamada desde upgrades.js)
window.upgradeAutomining = function(resourceName, amount) {
    // Usar Sanitize para asegurar que el valor inicial es numérico
    window.sanitizeAutominingRate(resourceName);
    gameData.automining[resourceName] = (gameData.automining[resourceName] || 0) + amount;
    
    window.guiDirty = true; 
};


// --- LÓGICA AUTOMÁTICA (Procesamiento del Tickeo) ---

// 1. Minería Pasiva (Implementación Corregida)
window.processMiningTick = function(deltaTime) {
    const timeFactor = deltaTime / 1000;

    for (const res in gameData.automining) {
        
        // Saneamiento de la tasa de automining antes de usarla
        window.sanitizeAutominingRate(res); 

        if (gameData.automining[res] > 0) {
            // Saneamiento del recurso (ya no es necesario sanear 'fractions' explícitamente, ya que se resetea si el recurso está bugeado)
            if (window.sanitizeResource(res)) {
                // Si el recurso estaba bugeado, las fracciones también pueden estarlo
                gameData.fractions[res] = 0;
            }

            // Asegurar que la fracción inicial sea 0 o un valor numérico
            gameData.fractions[res] = (gameData.fractions[res] || 0) + gameData.automining[res] * timeFactor;
            
            const wholeAmount = Math.floor(gameData.fractions[res]);
            
            if (wholeAmount >= 1) {
                // window.addResources llama a window.checkResourceUnlocks
                window.addResources({ [res]: wholeAmount }); 
                gameData.fractions[res] -= wholeAmount;
            }
        }
    }
};


// --- LÓGICA DE ACTUALIZACIÓN DE LA GUI ---

window.updateItemsPanel = function() {
    const resourcesToUpdate = ['cobre', 'lead', 'titanium', 'coal', 'sand', 'silicio', 'graphite', 'thorium', 'plastanium', 'surge-alloy']; 
    
    resourcesToUpdate.forEach(res => {
        const textElement = document.getElementById(`${res}-text`);
        const panel = document.getElementById(`${res}-panel`);
        
        
        if (textElement) {
            // Usar getXLevel() para obtener los valores saneados
            const currentPower = window.getPowerLevel(res);
            const currentAutomining = window.getAutominingRate(res);
            
            // Si el panel está bloqueado, no mostrar datos de minería
            if (panel && panel.classList.contains('locked')) {
                textElement.textContent = `Extraction (+?) /s: ?`; // Cambiado para no mostrar valores sin sentido
            } else {
                // Saneamiento preventivo del recurso para el label de cantidad
                window.sanitizeResource(res);
                const currentResourceAmount = gameResources[res] || 0;
                
                const formattedResource = currentResourceAmount.toLocaleString(undefined, { maximumFractionDigits: 0 });
                const formattedAutomining = currentAutomining.toLocaleString(undefined, { maximumFractionDigits: 2 });
                
                // Actualizar la etiqueta de cantidad de recurso en el encabezado
                const labelElement = document.getElementById(`item-${res}-label`);
                if (labelElement) {
                    labelElement.textContent = `${formattedResource}`;
                }
                
                // Actualizar el texto en el panel
                textElement.textContent = `Extraction (+${currentPower}) /s: ${formattedAutomining}`;
            }
        }
        
        
        const labelElement = document.getElementById(`item-${res}-label`);
        
        // LÓGICA DE OCULTACIÓN DEL PANEL DE RECURSOS DEL ENCABEZADO
        if (labelElement && panel) {
            const headerItem = document.getElementById(`item-${res}`);
            if (headerItem) {
                // Si está bloqueado Y no tengo recursos (solo al inicio), lo oculto. Si tengo recursos, lo mantengo.
                if (panel.classList.contains('locked') && (gameResources[res] || 0) === 0) {
                    headerItem.style.display = 'none'; 
                } else {
                    headerItem.style.display = 'flex'; // Mostrar si está desbloqueado o ya tiene recursos
                }
            }
        }
        
    });

    // Notificar a otros módulos que los recursos han cambiado (necesario para la GUI de Costes)
    document.dispatchEvent(new CustomEvent('resourcesUpdated'));
    window.guiDirty = false;
}


// --- EL BUCLE DEL JUEGO ---

function gameLoop(currentTime) {
    
    // ✅ CORRECCIÓN PRINCIPAL: Saneamiento Preventivo de todos los estados críticos.
    for (const res in gameResources) {
        window.sanitizeResource(res);
    }
    for (const res in gameData.power) {
        window.sanitizePowerLevel(res);
    }
    for (const res in gameData.automining) {
        window.sanitizeAutominingRate(res);
    }
    
    // Saneamiento adicional para asegurar que las fracciones son numéricas
    for (const res in gameData.fractions) {
        const value = gameData.fractions[res];
        if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
             gameData.fractions[res] = 0;
        }
    }
    
    const deltaTime = currentTime - gameData.lastTime;
    gameData.lastTime = currentTime;

    // 1. Minería Pasiva 
    if (window.processMiningTick) {
        window.processMiningTick(deltaTime);
    }
    
    // 2. Consumo de recursos de Generadores (de energy.js)
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

    // 5. Chequear desbloqueos de recursos
    // Solo llamar si existen las funciones críticas (getUnlockableResources de items.js)
    if (window.getUnlockableResources && window.unlockResource) {
        window.checkResourceUnlocks();
    }
    
    // 6. Actualizar GUI
    if (window.guiDirty) {
        // Asume que estas funciones existen en sus respectivos módulos
        if (window.updateItemsPanel) window.updateItemsPanel();
        if (window.updateEnergyPanel) window.updateEnergyPanel();
        if (window.updateUpgradesPanel) window.updateUpgradesPanel();
        if (window.updateCraftingPanel) window.updateCraftingPanel();

        window.guiDirty = false;
    }

    requestAnimationFrame(gameLoop);
}


// --- Inicialización ---

document.addEventListener('DOMContentLoaded', () => {
    const mineButtons = document.querySelectorAll('.resource-mine-btn');
    mineButtons.forEach(button => {
        button.addEventListener('click', mineResource);
        
        // CRÍTICO: Inhabilitar botones de recursos bloqueados al inicio.
        const resourceName = button.getAttribute('data-resource');
        
        // Asume que todos los recursos en resourcesToPotentiallyUnlock están bloqueados en el DOM al inicio.
        if (resourcesToPotentiallyUnlock.includes(resourceName)) {
            button.disabled = true;
            // Asumiendo que el panel HTML tiene la clase 'locked'
            const panel = document.getElementById(`${resourceName}-panel`);
            if(panel && !panel.classList.contains('locked')) {
                panel.classList.add('locked');
                // Mostrar el overlay si existe
                const overlay = panel.querySelector('.unlock-overlay');
                if (overlay) overlay.style.display = 'block'; 
            }
        }
    });

    // Iniciar el bucle de juego
    requestAnimationFrame(gameLoop);
    
    window.guiDirty = true;
    
    // CRÍTICO: Chequea los desbloqueos iniciales al cargar el juego.
    // Solo llamar si existen las funciones críticas (getUnlockableResources de items.js)
    // El chequeo se hace dos veces (aquí y en gameLoop) para asegurar que el DOM se inicializa correctamente antes de la primera actualización de la GUI.
    if (window.getUnlockableResources && window.unlockResource) {
        window.checkResourceUnlocks();
    }
});