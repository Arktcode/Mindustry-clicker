// scripts/energy.js

// --- 1. DEFINICIÓN DE GENERADORES DE ENERGÍA ---

const powerGenerators = [
    {
        id: 'combustion-generator',
        name: 'Combustion Generator',
        sprite: 'assets/sprites/combustion-generator.png',
        description: 'Generates 30 energy/s by consuming 1 Coal/s.',
        cost: { cobre: 300, lead: 200, graphite: 50 },
        output_per_level: 30, 
        input_resource: 'coal', 
        input_per_level: 1, 
        level: 0,
        maxLevel: 20,
        unlocked: false,
        unlockReq: { resource: 'coal', minAmount: 500 }
    },

    
];

// --- 2. ESTADO Y FUNCIONES DE UTILIDAD DE ENERGÍA ---

let energyState = {
    currentEnergy: 0,
    maxEnergy: 500, 
    powerOutput: 0, // Potencia nominal total
    powerConsumption: 0, 
};

let activePowerOutput = 0; // Potencia que realmente se genera (descontando combustible)

// ✅ NUEVA FUNCIÓN: Sanea todos los valores numéricos del estado de energía.
window.sanitizeEnergyState = function() {
    let changed = false;
    for (const key in energyState) {
        const value = energyState[key];
        // Sanea solo las propiedades numéricas
        if (typeof value === 'number' && (Number.isNaN(value) || !Number.isFinite(value))) {
            console.warn(`[SANEAR ENERGÍA] energyState.${key} era ${value}. Reiniciando a 0.`);
            energyState[key] = 0;
            changed = true;
        }
    }
    // Sanea también el output activo global
    if (typeof activePowerOutput !== 'number' || Number.isNaN(activePowerOutput) || !Number.isFinite(activePowerOutput)) {
        console.warn(`[SANEAR ENERGÍA] activePowerOutput era ${activePowerOutput}. Reiniciando a 0.`);
        activePowerOutput = 0;
        changed = true;
    }
    if (changed) {
        window.guiDirty = true;
    }
};

// 💥 EXPORTACIONES GLOBALES
window.getCurrentEnergy = () => energyState.currentEnergy;
window.getEnergyState = () => energyState; 
window.subtractEnergy = (amount) => { 
    // ✅ CORRECCIÓN: Sanear antes de restar
    window.sanitizeEnergyState(); 
    energyState.currentEnergy = Math.max(0, energyState.currentEnergy - amount);
    window.guiDirty = true;
};

// Se añade window.getGeneratorsArray para la compatibilidad con script.js
window.getGeneratorsArray = () => powerGenerators;
window.getPowerGenerators = () => powerGenerators; 

window.getActivePowerOutput = () => activePowerOutput; 


/**
 * Añade energía al almacenamiento, respetando la capacidad máxima.
 */
window.addEnergy = function(amount) {
    // ✅ CORRECCIÓN: Sanear antes de sumar (Si currentEnergy es NaN, la suma falla)
    window.sanitizeEnergyState(); 
    
    // ✅ CORRECCIÓN: Sanear el 'amount' de entrada por si un cálculo externo lo bugea
    const safeAmount = (typeof amount === 'number' && Number.isFinite(amount)) ? amount : 0;

    energyState.currentEnergy += safeAmount;
    
    if (energyState.currentEnergy > energyState.maxEnergy) {
        energyState.currentEnergy = energyState.maxEnergy;
    } 
    if (energyState.currentEnergy < 0) {
        energyState.currentEnergy = 0;
    }
    
    // ✅ CORRECCIÓN: Sanear el valor final (Doble comprobación)
    if (Number.isNaN(energyState.currentEnergy) || !Number.isFinite(energyState.currentEnergy)) {
        console.error("Critical: currentEnergy became NaN after add. Resetting.");
        energyState.currentEnergy = 0;
    }


    window.guiDirty = true;
};

// --- Funciones de Modificación de Flujo ---

/**
 * Recalcula la producción TOTAL de energía sin considerar el combustible (Potencia Nominal).
 */
function recalculateNominalPowerOutput() {
    let totalGeneration = 0;
    powerGenerators.forEach(gen => {
        // ✅ CORRECCIÓN: Asegurar que los niveles y output_per_level sean numéricos (fallback a 0)
        const level = gen.level || 0;
        const output = gen.output_per_level || 0;
        
        totalGeneration += level * output;
    });
    energyState.powerOutput = totalGeneration; // Potencia nominal total
}

/**
 * Registra o ajusta el consumo de energía de las fábricas.
 */
window.setTotalFactoryConsumption = function(totalConsumption) {
    // ✅ CORRECCIÓN: Sanear el consumo de entrada
    const safeConsumption = (typeof totalConsumption === 'number' && Number.isFinite(totalConsumption)) ? totalConsumption : 0;

    energyState.powerConsumption = safeConsumption;
    window.guiDirty = true;
};

/**
 * Calcula el flujo neto (producción ACTIVA - consumo).
 */
window.getNetPowerFlow = function() {
    // ✅ CORRECCIÓN: Sanear los valores antes de la resta para evitar que el flujo neto sea NaN
    window.sanitizeEnergyState(); 
    return activePowerOutput - energyState.powerConsumption; // Usa la salida activa
};


// Lógica de Consumo de Recursos de Generadores y Cálculo de Potencia Activa
window.consumeGeneratorResources = function(deltaTime) {
    // ✅ CRÍTICO: Sanear el estado de energía antes de cualquier cálculo.
    window.sanitizeEnergyState(); 
    
    const timeFactor = deltaTime / 1000;
    let anyResourceConsumed = false;
    let totalActiveGeneration = 0; 
    
    recalculateNominalPowerOutput(); 

    powerGenerators.forEach(gen => {
        if (gen.level > 0 && gen.input_resource && gen.input_per_level) {
            // ✅ CORRECCIÓN: Asegurar que los valores de cálculo sean numéricos
            const level = gen.level || 0;
            const inputPerLevel = gen.input_per_level || 0;
            const outputPerLevel = gen.output_per_level || 0;
            
            const requiredPerSecond = level * inputPerLevel;
            const requiredForTick = requiredPerSecond * timeFactor;
            
            const resources = window.getGameResources();
            // ✅ CORRECCIÓN: Usar 0 como fallback para el recurso
            const currentResource = resources[gen.input_resource] || 0;
            
            if (currentResource >= requiredForTick) {
                // CONSUMIR el recurso
                window.subtractResources({ [gen.input_resource]: requiredForTick });
                anyResourceConsumed = true;
                
                // AÑADIR a la producción activa
                totalActiveGeneration += level * outputPerLevel;
            } 
        } else {
            // Generadores sin combustible
            // ✅ CORRECCIÓN: Asegurar que los valores de cálculo sean numéricos
            const level = gen.level || 0;
            const outputPerLevel = gen.output_per_level || 0;
            totalActiveGeneration += level * outputPerLevel;
        }
    });
    
    // Actualizar el estado global de la producción activa
    activePowerOutput = totalActiveGeneration;

    if (anyResourceConsumed || activePowerOutput !== energyState.powerOutput) {
        window.guiDirty = true; 
    }
};


// --- 3. FUNCIONES DE COMPRA Y GUI ---

function checkCanAffordForUpgrade(generator) {
    // ✅ CORRECCIÓN: Sanear los recursos antes de la comprobación (si un recurso es NaN, la compra debe fallar)
    window.sanitizeEnergyState(); 
    
    const resources = window.getGameResources(); 
    for (const res in generator.cost) {
        // Usar 0 como fallback para el recurso
        if (Math.floor(resources[res] || 0) < generator.cost[res]) { 
            return false;
        }
    }
    return true;
}

function isUnlockRequirementMet(generator) {
    if (!generator.unlockReq) return true; 

    const req = generator.unlockReq;
    // ✅ CORRECCIÓN: Usar 0 como fallback para el recurso
    const currentResourceAmount = window.getGameResources()[req.resource] || 0; 
    
    return currentResourceAmount >= req.minAmount;
}


function attemptBuyGenerator(generator) {
    const cost = generator.cost;

    if (generator.level >= generator.maxLevel) return false;
    if (!checkCanAffordForUpgrade(generator)) return false;

    if (!window.subtractResources(cost)) {
        return false;
    }
    
    // ✅ CORRECCIÓN: Sanear el nivel antes de incrementarlo
    if (Number.isNaN(generator.level) || !Number.isFinite(generator.level)) {
        generator.level = 0;
    }
    
    generator.level++;
    
    recalculateNominalPowerOutput();

    if (generator.level < generator.maxLevel) {
        for (const res in generator.cost) {
            // ✅ CORRECCIÓN: Sanear el coste antes de multiplicarlo
            const currentCost = generator.cost[res] || 0;
            generator.cost[res] = Math.ceil(currentCost * 1.5); 
        }
    }
    
    window.guiDirty = true;
    document.dispatchEvent(new CustomEvent('checkUpgrades')); 
    return true;
}


function createGeneratorButton(generator) {
    const button = document.createElement('button');
    button.id = `generator-btn-${generator.id}`;
    button.className = 'upgrade-btn';

    button.addEventListener('click', (e) => {
        e.stopPropagation(); 
        attemptBuyGenerator(generator);
    });
    
    let unlockReqTextHTML = ''; 
    
    if (generator.unlockReq) {
        let initialReqText = '';
        if (!generator.unlocked) {
            const req = generator.unlockReq;
            initialReqText = `Requires: ${req.minAmount}x ${req.resource.charAt(0).toUpperCase() + req.resource.slice(1)}`;
        }
        unlockReqTextHTML = `<div id="generator-unlock-req-${generator.id}" class="unlock-req-text">${initialReqText}</div>`;
    }

    button.innerHTML = `
        <div class="upgrade-info">
            <span id="generator-name-${generator.id}" class="upgrade-name">${generator.name}</span>
            <span id="generator-effect-${generator.id}" class="upgrade-effect"></span>
            <div id="generator-buy-container-${generator.id}" style="margin-top: 5px;">
                <button id="generator-buy-btn-${generator.id}" class="buy-sub-btn" style="padding: 3px 8px;">
                    Buy Generator
                </button>
            </div>
            ${unlockReqTextHTML}
        </div>
        <img src="${generator.sprite}" alt="${generator.name}" class="upgrade-sprite">
    `;
    
    generator.element = button;
    const container = document.getElementById('power-buttons-container');
    if (container) {
        container.appendChild(button);
    }
}

window.updateEnergyPanel = function() {
    // ✅ CRÍTICO: Saneamiento antes de actualizar la GUI
    window.sanitizeEnergyState(); 
    
    const energyLabel = document.getElementById('energy-label');
    const energyBarFill = document.getElementById('energy-bar-fill');
    
    const current = Math.floor(energyState.currentEnergy); 
    const max = energyState.maxEnergy;
    const netFlow = window.getNetPowerFlow(); 
    
    // ✅ CORRECCIÓN: Comprobación de que maxEnergy no sea 0 para evitar Infinity/NaN
    const percentage = max > 0 ? (energyState.currentEnergy / max) * 100 : 0;

    if (energyLabel) {
        let flowIndicator = '';
        if (netFlow > 0) {
            flowIndicator = ` (+${netFlow.toLocaleString(undefined, { maximumFractionDigits: 1 })}/s)`;
        } else if (netFlow < 0) {
            flowIndicator = ` (${netFlow.toLocaleString(undefined, { maximumFractionDigits: 1 })}/s)`;
        }
        
        energyLabel.textContent = `Energy: ${current.toLocaleString()}/${max.toLocaleString()}${flowIndicator}`;
    }

    if (energyBarFill) {
        energyBarFill.style.width = `${Math.min(100, percentage)}%`;
    }
    
    // Actualizar botones de generadores
    powerGenerators.forEach(generator => {
        if (!generator.element) return;
        
        const reqTextElement = document.getElementById(`generator-unlock-req-${generator.id}`);
        
        // 1. Desbloqueo y Visibilidad
        const unlockMet = isUnlockRequirementMet(generator);
        
        // ✅ Desbloquear si se cumple el requisito
        if (!generator.unlocked && unlockMet) {
            generator.unlocked = true;
            window.guiDirty = true;
        }
        
        // Lógica de VISIBILIDAD: Muestra el elemento como 'locked' si AÚN no está unlocked, PERO tiene un requisito.
        if (!generator.unlocked && generator.unlockReq) {
            generator.element.style.display = 'flex';
            generator.element.classList.add('locked');
            
            if (reqTextElement) {
                const req = generator.unlockReq;
                reqTextElement.textContent = `Requires: ${req.minAmount}x ${req.resource.charAt(0).toUpperCase() + req.resource.slice(1)}`;
            }
            generator.element.disabled = true;
            return; // Detiene el procesamiento para este botón bloqueado.
        } else if (!generator.unlocked && !generator.unlockReq) {
            // Ocultar si está bloqueado y NO tiene un requisito visible (unlocked == false y unlockReq == undefined)
            generator.element.style.display = 'none';
            return;
        }
        
        // 🛑 Si llega aquí, está DESBLOQUEADO (generator.unlocked == true)
        
        // Limpiar el estado de bloqueo y hacerlo visible/activo.
        generator.element.style.display = 'flex';
        generator.element.classList.remove('locked');
        generator.element.disabled = false; // Asegura que esté habilitado para hacer click
        
        // Limpieza de requisito
        if (reqTextElement) {
            reqTextElement.textContent = ''; 
        }
        
        // 2. Info y Nivel
        const nameElement = document.getElementById(`generator-name-${generator.id}`);
        const effectElement = document.getElementById(`generator-effect-${generator.id}`);
        const buyBtn = document.getElementById(`generator-buy-btn-${generator.id}`);
        
        const isMaxLevel = generator.level >= generator.maxLevel;
        const levelText = generator.level > 0 || isMaxLevel ? ` (Lvl ${generator.level}/${generator.maxLevel})` : '';
        nameElement.textContent = `${generator.name}${levelText}`;
        
        let effectText = `Generates ${generator.output_per_level} E/s.`;
        if (generator.input_resource) {
            const resources = window.getGameResources();
            const requiredPerSecond = generator.input_per_level * generator.level;
            
            effectText += ` Consumes ${generator.input_per_level} ${generator.input_resource.charAt(0).toUpperCase() + generator.input_resource.slice(1)}/s.`;
            
            // Verifica el combustible solo si hay niveles comprados
            if (generator.level > 0 && (!resources[generator.input_resource] || resources[generator.input_resource] < requiredPerSecond * 0.1)) { 
                effectElement.innerHTML = `<span style="color: red;">FUEL EMPTY!</span> ${effectText}`;
            } else {
                effectElement.textContent = effectText;
            }
        } else {
            effectElement.textContent = effectText;
        }
        
        // 3. Botón de compra
        if (isMaxLevel) {
            buyBtn.textContent = 'MAX LEVEL';
            buyBtn.disabled = true;
            buyBtn.classList.remove('can-buy');
        } else {
            const canAfford = checkCanAffordForUpgrade(generator);
            buyBtn.disabled = !canAfford;
            
            if (canAfford) {
                buyBtn.classList.add('can-buy');
            } else {
                buyBtn.classList.remove('can-buy');
            }
            
            const costText = Object.entries(generator.cost)
                // ✅ CORRECCIÓN: Usar 0 como fallback para el coste
                .map(([res, amount]) => `${(amount || 0).toLocaleString()} ${res.charAt(0).toUpperCase() + res.slice(1)}`)
                .join(', ');
                
            buyBtn.textContent = `Buy (Cost: ${costText})`;
        }
    });
};

document.addEventListener('resourcesUpdated', window.updateEnergyPanel); 

// --- 4. INICIALIZACIÓN ---

document.addEventListener('DOMContentLoaded', () => {
    const powerButtonsContainer = document.getElementById('power-buttons-container');
    if (powerButtonsContainer) {
        powerGenerators.forEach(createGeneratorButton);
    }
    
    document.addEventListener('checkUpgrades', window.updateEnergyPanel); 
    
    // ✅ CRÍTICO: Sanear el estado inicial
    window.sanitizeEnergyState();
    
    window.updateEnergyPanel();
});