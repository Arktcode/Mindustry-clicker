// scripts/blocks.js

// Datos de Bloques
const productionBlocks = [
    {
        id: 'graphite-press',
        name: 'Graphite Press',
        sprite: 'assets/sprites/graphite-press.png',
        description: 'Smelts Coal into Graphite.',
        category: 'production',
        level: 0, maxLevel: 15, unlocked: false,
        crafting_rate: 1,
        input_rate: { coal: 2 },
        output_resource: 'graphite',
        cost: { copper: 75, lead: 30 },
        cost_multiplier: 1.5,
        consumption: 0,
        unlockReq: { upgradeId: "auto-sand", minLevel: 10 },
    },
    {
        id: 'multi-press',
        name: 'Multi Press',
        sprite: 'assets/sprites/multi-press.png',
        description: 'Smelts Coal into Graphite.',
        category: 'production',
        level: 0, maxLevel: 20, unlocked: false,
        crafting_rate: 5,
        input_rate: { coal: 4 },
        fluid_input_resource: 'water',
        fluid_input_rate: 6,
        output_resource: 'graphite',
        output_rate: 2,
        cost: { graphite: 50, lead: 100, titanium: 100, silicio: 50 },
        cost_multiplier: 1.5,
        consumption: 0,
        unlockReq: { blockId: 'graphite-press', minLevel: 15 },
    },
    {
        id: 'silicon-smelter',
        name: 'Silicon Smelter',
        sprite: 'assets/sprites/silicon-smelter.png',
        description: 'Smelts Sand and Coal into Silicon.',
        category: 'production',
        level: 0, maxLevel: 15, unlocked: false,
        crafting_rate: 2,
        input_rate: { sand: 4, coal: 2 },
        output_resource: 'silicio',
        cost: { copper: 300, lead: 200, graphite: 50 },
        cost_multiplier: 1.5,
        consumption: 10,
        unlockReq: { resource: 'sand', minAmount: 1000 },
    },
    {
        id: 'silicon-crucible',
        name: 'Silicon Crucible',
        sprite: 'assets/sprites/silicon-crucible.png',
        description: 'Refines silicon from sand and coal, using pyratite as an additional heat source.',
        category: 'production',
        level: 0, maxLevel: 20, unlocked: false,
        crafting_rate: 2,
        input_rate: { sand: 4, coal: 2 },
        output_resource: 'silicio',
        cost: { copper: 300, lead: 200, graphite: 50 },
        cost_multiplier: 1.5,
        consumption: 10,
        unlockReq: { blockId: 'silicon-smelter', minLevel: 15 },
    },
    {
        id: 'kiln',
        name: 'Kiln',
        sprite: 'assets/sprites/kiln.png',
        description: 'Smelts Sand and Lead into Metaglass.',
        category: 'production',
        level: 0, maxLevel: 20, unlocked: false,
        crafting_rate: 1,
        input_rate: { sand: 2, lead: 2 },
        output_resource: 'metaglass',
        cost: { copper: 60, lead: 30 },
        cost_multiplier: 1.5,
        consumption: 20,
        unlockReq: { blockId: 'silicon-smelter', minLevel: 3 },
    },
    {
        id: 'plastanium-compressor',
        name: 'Plastanium Compressor',
        sprite: 'assets/sprites/plastanium-compressor.png',
        description: 'Compresses Titanium, Coal and Oil into Plastanium.',
        category: 'production',
        level: 0, maxLevel: 15, unlocked: false,
        crafting_rate: 1,
        input_rate: { titanium: 2, coal: 2 },
        fluid_input_resource: 'oil',
        fluid_input_rate: 15,
        output_resource: 'plastanium',
        cost: { titanium: 80, copper: 60, lead: 40, silicio: 30 },
        cost_multiplier: 1.5,
        consumption: 60,
        unlockReq: { blockId: 'spore-press', minLevel: 5 },
    },
    {
        id: 'phase-weaver',
        name: 'Phase Weaver',
        sprite: 'assets/sprites/phase-weaver.png',
        description: 'Weaves Thorium and Sand into Phase Fabric.',
        category: 'production',
        level: 0, maxLevel: 15, unlocked: false,
        crafting_rate: 1,
        input_rate: { thorium: 4, sand: 10 },
        output_resource: 'phase-fabric',
        cost: { titanium: 100, silicio: 80, lead: 50 },
        cost_multiplier: 1.5,
        consumption: 100,
        unlockReq: { blockId: 'plastanium-compressor', minLevel: 3 },
    },
    {
        id: 'surge-smelter',
        name: 'Surge Smelter',
        sprite: 'assets/sprites/surge-smelter.png',
        description: 'Alloys Copper, Lead, Titanium and Silicon into Surge Alloy.',
        category: 'production',
        level: 0, maxLevel: 15, unlocked: false,
        crafting_rate: 1,
        input_rate: { copper: 2, lead: 2, titanium: 1, silicio: 1 },
        output_resource: 'surge-alloy',
        cost: { copper: 200, lead: 180, titanium: 70, silicio: 60 },
        cost_multiplier: 1.5,
        consumption: 120,
        unlockReq: { blockId: 'phase-weaver', minLevel: 1 },
    },
    {
        id: 'separator',
        name: 'Separator',
        sprite: 'assets/sprites/separator.png',
        description: 'Separates Slag into Copper, Lead, Graphite and Titanium.',
        category: 'production',
        level: 0, maxLevel: 15, unlocked: false,
        fluid_input_resource: 'slag',
        fluid_input_rate: 30,
        output_resources: { copper: 3, lead: 2, graphite: 1, titanium: 1 },
        cost: { copper: 50, titanium: 40, graphite: 30 },
        cost_multiplier: 1.6,
        consumption: 60,
        unlockReq: { blockId: 'slag-extractor', minLevel: 1 },
    },
    {
        id: 'interplanetary-accelerator',
        name: 'Interplanetary Accelerator',
        sprite: 'assets/sprites/interplanetary-accelerator.png', // Fallback to surge-alloy or similar icon
        description: 'The ultimate endgame construct to leave this planet. All Items Multiplier x20',
        category: 'production',
        level: 0, maxLevel: 1, unlocked: false,
        cost: {
            copper: 1000000,
            lead: 1000000,
            sand: 2000000,
            coal: 2000000,
            titanium: 600000,
            thorium: 600000,
            graphite: 100000,
            metaglass: 100000,
            silicio: 50000,
            plastanium: 50000,
            'phase-fabric': 50000,
            'surge-alloy': 50000,
            'spore-pod': 50000,
            pyratite: 50000,
            'blast-compound': 50000
        },
        cost_multiplier: 1,
        consumption: 100000, // Consume muchísima energía
        unlockReq: { blockId: 'surge-smelter', minLevel: 15 },
    },
];

const energyBlocks = [
    {
        id: 'battery',
        name: 'Battery',
        sprite: 'assets/sprites/battery.png',
        description: 'Increases energy storage by +200 per level.',
        category: 'energy',
        level: 0, maxLevel: 15, unlocked: false,
        storage_per_level: 200,
        cost: { copper: 50, lead: 20 },
        cost_multiplier: 1.5,
        unlockReq: { resource: 'lead', minAmount: 200 },
    },
    {
        id: 'large-battery',
        name: 'Large Battery',
        sprite: 'assets/sprites/battery-large.png',
        description: 'Increases energy storage by +1,000 per level.',
        category: 'energy',
        level: 0, maxLevel: 20, unlocked: false,
        storage_per_level: 1000,
        cost: { lead: 100, silicio: 50, titanium: 20 },
        cost_multiplier: 1.6,
        unlockReq: { blockId: 'battery', minLevel: 10 },
    },
    {
        id: 'combustion-generator',
        name: 'Combustion Generator',
        sprite: 'assets/sprites/combustion-generator.png',
        description: 'Burns Coal to generate 15 E/s per level.',
        category: 'energy',
        level: 0, maxLevel: 25, unlocked: false,
        output_per_level: 15,
        input_resource: 'coal',
        input_per_level: 1,
        cost: { copper: 300, lead: 200, graphite: 50 },
        cost_multiplier: 1.5,
        unlockReq: { blockId: "battery", minLevel: 1 },
    },
    {
        id: 'rtg-generator',
        name: 'RTG Generator',
        sprite: 'assets/sprites/rtg-generator.png',
        description: 'Slowly decays Thorium for stable 70 E/s per level.',
        category: 'energy',
        level: 0, maxLevel: 10, unlocked: false,
        output_per_level: 70,
        input_resource: 'thorium',
        input_per_level: 2,
        cost: { lead: 100, copper: 50, thorium: 30 },
        cost_multiplier: 1.5,
        unlockReq: { resource: 'thorium', minAmount: 100 },
    },
    {
        id: 'thorium-reactor',
        name: 'Thorium Reactor',
        sprite: 'assets/sprites/thorium-reactor.png',
        description: 'Fissions Thorium safely with Cryofluid to generate 900 E/s per level.',
        category: 'energy',
        level: 0, maxLevel: 15, unlocked: false,
        output_per_level: 900,
        input_resource: 'thorium',
        input_per_level: 10,
        fluid_input_resource: 'cryo',
        fluid_input_rate: 30,
        cost: { lead: 300, silicio: 200, graphite: 150, thorium: 150 },
        cost_multiplier: 1.8,
        unlockReq: { blockId: 'cryofluid-mixer', minLevel: 1 },
    },
    {
        id: 'impact-reactor',
        name: 'Impact Reactor',
        sprite: 'assets/sprites/impact-reactor.png',
        description: 'Fuses Surge Alloy and Thorium for 3000 E/s per level.',
        category: 'energy',
        level: 0, maxLevel: 5, unlocked: false,
        output_per_level: 3000,
        input_resources: { 'surge-alloy': 0.3, thorium: 0.2 },
        cost: { copper: 500, lead: 600, silicio: 300, 'surge-alloy': 250, thorium: 200 },
        cost_multiplier: 2.0,
        unlockReq: { blockId: 'thorium-reactor', minLevel: 3 },
    },
];

const liquidBlocks = [
    {
        id: 'liquid-tank',
        name: 'Liquid Tank',
        sprite: 'assets/sprites/liquid-tank.png',
        description: 'Adds +1,000 capacity to all liquids.',
        category: 'liquids',
        level: 0, maxLevel: 25, unlocked: false,
        storage_per_level: 1000,
        cost: { titanium: 40, metaglass: 30 },
        cost_multiplier: 1.5,
        consumption: 0,
        unlockReq: { blockId: 'water-extractor', minLevel: 1 },
    },
    {
        id: 'water-extractor',
        name: 'Water Extractor',
        sprite: 'assets/sprites/water-extractor.png',
        description: 'Extracts groundwater.',
        category: 'liquids',
        level: 0, maxLevel: 15, unlocked: false,
        fluid_output_resource: 'water',
        fluid_output_rate: 50,
        cost: { copper: 30, lead: 30, graphite: 15, metaglass: 20 },
        cost_multiplier: 1.5,
        consumption: 5,
        unlockReq: { blockId: 'graphite-press', minLevel: 3 },
    },
    {
        id: 'water-pump',
        name: 'Water Pump',
        sprite: 'assets/sprites/rotary-pump.png',
        description: 'Extracts water.',
        category: 'liquids',
        level: 0, maxLevel: 20, unlocked: false,
        fluid_output_resource: 'water',
        fluid_output_rate: 70,
        cost: { copper: 70, silicio: 20, graphite: 35, metaglass: 50 },
        cost_multiplier: 1.5,
        consumption: 10,
        unlockReq: { blockId: 'water-extractor', minLevel: 15 },
    },
    {
        id: 'slag-extractor',
        name: 'Slag Extractor',
        sprite: 'assets/sprites/mechanical-pump-slag.png',
        description: 'Extracts molten slag from the core.',
        category: 'liquids',
        level: 0, maxLevel: 15, unlocked: false,
        fluid_output_resource: 'slag',
        fluid_output_rate: 45,
        cost: { metaglass: 50, graphite: 40, titanium: 20 },
        cost_multiplier: 1.6,
        consumption: 40,
        unlockReq: { blockId: 'water-extractor', minLevel: 5 },
    },
    {
        id: 'cultivator',
        name: 'Cultivator',
        sprite: 'assets/sprites/cultivator.png',
        description: 'Grows Spore Pods using Water.',
        category: 'liquids',
        level: 0, maxLevel: 20, unlocked: false,
        crafting_rate: 1,
        input_rate: {},
        fluid_input_resource: 'water',
        fluid_input_rate: 30,
        output_resource: 'spore-pod',
        cost: { copper: 25, lead: 25, silicio: 10 },
        cost_multiplier: 1.5,
        consumption: 20,
        unlockReq: { blockId: 'water-extractor', minLevel: 1 },
    },
    {
        id: 'spore-press',
        name: 'Spore Press',
        sprite: 'assets/sprites/spore-press.png',
        description: 'Squishes Spore Pods into Oil.',
        category: 'liquids',
        level: 0, maxLevel: 20, unlocked: false,
        input_rate: { 'spore-pod': 4 },
        fluid_output_resource: 'oil',
        fluid_output_rate: 25,
        cost: { copper: 60, lead: 40, silicio: 20 },
        cost_multiplier: 1.5,
        consumption: 30,
        unlockReq: { blockId: 'cultivator', minLevel: 3 },
    },
    {
        id: 'cryofluid-mixer',
        name: 'Cryofluid Mixer',
        sprite: 'assets/sprites/cryofluid-mixer.png',
        description: 'Mixes Water and Titanium into Cryofluid.',
        category: 'liquids',
        level: 0, maxLevel: 15, unlocked: false,
        input_rate: { titanium: 1 },
        fluid_input_resource: 'water',
        fluid_input_rate: 40,
        fluid_output_resource: 'cryo',
        fluid_output_rate: 30,
        cost: { silicio: 60, lead: 40, titanium: 30 },
        cost_multiplier: 1.5,
        consumption: 40,
        unlockReq: { blockId: 'water-extractor', minLevel: 5 },
    },
    {
        id: 'pyratite-mixer',
        name: 'Pyratite Mixer',
        sprite: 'assets/sprites/pyratite-mixer.png',
        description: 'Mixes Coal, Lead and Sand into Pyratite.',
        category: 'liquids',
        level: 0, maxLevel: 20, unlocked: false,
        crafting_rate: 1,
        input_rate: { coal: 2, lead: 1, sand: 1 },
        output_resource: 'pyratite',
        cost: { copper: 50, lead: 40, graphite: 36 },
        cost_multiplier: 1.5,
        consumption: 15,
        unlockReq: { blockId: 'kiln', minLevel: 3 },
    },
    {
        id: 'blast-mixer',
        name: 'Blast Mixer',
        sprite: 'assets/sprites/blast-mixer.png',
        description: 'Combines Pyratite and Spore Pods into Blast Compound.',
        category: 'liquids',
        level: 0, maxLevel: 15, unlocked: false,
        crafting_rate: 1,
        input_rate: { pyratite: 1, 'spore-pod': 1 },
        output_resource: 'blast-compound',
        cost: { silicio: 60, lead: 40, titanium: 30 },
        cost_multiplier: 1.5,
        consumption: 20,
        unlockReq: { blockId: 'pyratite-mixer', minLevel: 3 },
    },
];

const logicBlocks = [
    {
        id: 'micro-processor',
        name: 'Logic Processor',
        sprite: 'assets/sprites/message.png',
        description: 'Enables quick +/- level controls for all factory blocks.',
        category: 'logic',
        level: 0, maxLevel: 1, unlocked: false,
        cost: { copper: 2000, lead: 2000, graphite: 500, silicio: 300 },
        cost_multiplier: 1,
        consumption: 0,
        unlockReq: { blockId: 'silicon-smelter', minLevel: 10 },
    },
];

// Estado y Meltdown
[...productionBlocks, ...energyBlocks, ...liquidBlocks, ...logicBlocks].forEach(block => {
    block.base_cost = JSON.parse(JSON.stringify(block.cost));
});

function recalculateBlockCost(block) {
    block.cost = JSON.parse(JSON.stringify(block.base_cost));
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

// Energía y Líquidos Globales
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

// API de Bloques
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
window.isLogicUnlocked = () => logicBlocks.find(b => b.id === 'logic-processor')?.level > 0;

// Desbloqueo
function isUnlockRequirementMet(block) {
    if (!block.unlockReq) return true;
    const req = block.unlockReq;
    if (req.resource && req.minAmount !== undefined) {
        return (window.getGameResources ? window.getGameResources()[req.resource] : 0) >= req.minAmount;
    }
    if (req.blockId && req.minLevel !== undefined) return getBlockLevelInternal(req.blockId) >= req.minLevel;
    if (req.upgradeId && req.minLevel !== undefined) return window.getUpgradeLevel ? window.getUpgradeLevel(req.upgradeId) >= req.minLevel : false;
    return true;
}

// Tick Loops
function recalculateTotalBlockConsumption() {
    let total = 0;
    [...productionBlocks, ...liquidBlocks].forEach(b => total += b.level * (b.consumption || 0));
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

    blocksArray.forEach(block => {
        if (block.level <= 0 || !block.unlocked) return;

        // Multiplicador de eficiencia: 1 si no pide energía, 'multiplier' si pide.
        const eff = (block.consumption || 0) > 0 ? multiplier : 1;
        if (eff <= 0 && (block.consumption || 0) > 0) return;
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
            if (block.output_resource) {
                window.addResources({ [block.output_resource]: block.level * block.crafting_rate * tf * eff * accMult });
            }
            if (block.output_resources) {
                const addObj = {};
                for (const or in block.output_resources) {
                    addObj[or] = block.level * block.output_resources[or] * tf * eff * accMult;
                }
                window.addResources(addObj);
            }
            if (block.fluid_output_resource) {
                const outF = block.level * block.fluid_output_rate * tf * eff * accMult;
                window.addFluid(block.fluid_output_resource, outF);
                fluidsState[block.fluid_output_resource].netFlow += block.level * block.fluid_output_rate * eff * accMult;
            }
        }
    });
}

window.processProductionTick = (dt) => processBlockCategoryTick(productionBlocks, dt);
window.processLiquidsTick = (dt) => processBlockCategoryTick(liquidBlocks, dt);

function recalculateNominalStats() {
    energyState.powerOutput = energyBlocks.reduce((sum, g) => sum + (g.level || 0) * (g.output_per_level || 0), 0);
    const addedStorage = energyBlocks.reduce((sum, b) => sum + (b.level || 0) * (b.storage_per_level || 0), 0);
    energyState.maxEnergy = Number.isFinite(addedStorage) ? addedStorage : 0;
    // Clamp currentEnergy to not exceed new max
    if (energyState.currentEnergy > energyState.maxEnergy) {
        energyState.currentEnergy = energyState.maxEnergy;
    }

    // Fluid max capacity from tanks
    const fluidStorage = liquidBlocks.reduce((sum, b) => sum + (b.level || 0) * (b.storage_per_level || 0), 0);
    for (const f in fluidsState) {
        fluidsState[f].max = fluidStorage;
    }
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
            const hasT = (res[gen.input_resource] || 0) >= (gen.level * gen.input_per_level * tf);
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

// GUI
function checkCanAffordBlock(block) {
    const res = window.getGameResources ? window.getGameResources() : {};
    for (const r in block.cost) if (Math.floor(res[r] || 0) < block.cost[r]) return false;
    return true;
}

function attemptBuyBlock(block) {
    if (block.level >= block.maxLevel || !checkCanAffordBlock(block)) return false;
    // Don't restrict buying unpowered blocks. Let them place it and run empty.
    if (!window.subtractResources(block.cost)) return false;
    block.level++;
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

function formatRes(res) { return res.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '); }

function createBlockButton(block, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const btn = document.createElement('button');
    btn.id = `block-btn-${block.id}`;
    btn.className = 'upgrade-btn';
    const unlockHtml = block.unlockReq ? `<div id="block-unlock-req-${block.id}" class="unlock-req-text"></div>` : '';
    btn.innerHTML = `
        <div class="upgrade-info">
            <span id="block-name-${block.id}" class="upgrade-name">${block.name}</span>
            <span id="block-effect-${block.id}" class="upgrade-effect"></span>
            ${block.category !== 'energy' ? `<span id="block-consumption-${block.id}" class="upgrade-auto-rate"></span>` : ''}
            <div id="block-buy-container-${block.id}" style="margin-top:5px">
                <button id="block-buy-btn-${block.id}" class="buy-sub-btn" style="padding:3px 8px">${block.category === 'energy' ? 'Buy Generator' : 'Buy Block'}</button>
            </div>
            ${unlockHtml}
        </div>
        <img src="${block.sprite}" alt="${block.name}" class="upgrade-sprite">
    `;
    btn.addEventListener('click', (e) => {
        // Only trigger buy if click is on outer button, not on child buy-sub-btn
        if (e.target.closest('.buy-sub-btn') || e.target.closest('.logic-quick-btn')) return;
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
        if (reqEl) {
            const req = block.unlockReq;
            let reqText = "Requires: ";
            if (req.resource) reqText += `${req.minAmount} ${formatRes(req.resource)}`;
            else if (req.blockId) reqText += `${formatRes(req.blockId)} Lvl ${req.minLevel}`;
            else if (req.recipeId) reqText += `${formatRes(req.recipeId)} Lvl ${req.minLevel}`;
            else if (req.upgradeId) {
                // Si es una mejora, intentamos buscar su nombre en el array global 'upgrades' si existe
                const upgName = (window.getUpgradeData ? window.getUpgradeData(req.upgradeId)?.name : null) || formatRes(req.upgradeId);
                reqText += `${upgName} Lvl ${req.minLevel}`;
            }
            reqEl.textContent = reqText;
        }
        return;
    }
    block.element.style.display = 'flex';
    block.element.classList.remove('locked');
    block.element.disabled = false; // RE-HABILITAR CLICS
    if (reqEl) reqEl.textContent = '';
    const isMax = block.level >= block.maxLevel;
    nameEl.textContent = block.name + (block.level > 0 || isMax ? ` (Lvl ${block.level}/${block.maxLevel})` : '');

    if (block.category === 'energy') {
        const res = window.getGameResources();
        if (block.storage_per_level) {
            effectEl.innerHTML = `Capacity: <b>+${(block.level * block.storage_per_level).toLocaleString()} E</b> (+${block.storage_per_level.toLocaleString()} /lvl)`;
        } else {
            const fuel = block.input_resources ? Object.entries(block.input_resources).map(([r, v]) => `${v}/s ${formatRes(r)}`).join(' + ') : (block.input_resource ? `${block.input_per_level} ${formatRes(block.input_resource)}/s` : 'None');
            effectEl.innerHTML = `Generates <b>${block.output_per_level} E/s</b> · Consumes ${fuel}`;
        }
    } else {
        let inArr = [];
        if (block.input_rate) Object.entries(block.input_rate).forEach(([r, v]) => inArr.push(`${v} ${formatRes(r)}/s`));
        if (block.fluid_input_resource) inArr.push(`${block.fluid_input_rate} ${formatRes(block.fluid_input_resource)}/s`);

        let outStr = '';
        if (block.output_resource) outStr = formatRes(block.output_resource);
        else if (block.output_resources) {
            outStr = Object.entries(block.output_resources).map(([r, v]) => `${v} ${formatRes(r)}/s`).join(' + ');
        }

        if (block.fluid_output_resource) outStr += (outStr ? ' + ' : '') + formatRes(block.fluid_output_resource);

        if (block.id === 'mono') {
            effectEl.innerHTML = `Bonus: <b>+${(block.level * 5)}%</b> Automining (Copper/Lead)`;
        } else if (block.storage_per_level) {
            effectEl.innerHTML = `Capacity: <b>+${(block.level * block.storage_per_level).toLocaleString()} L</b> (+${block.storage_per_level.toLocaleString()} /lvl)`;
        } else {
            effectEl.textContent = `${inArr.join(' + ') || 'None'} → ${outStr || 'Nothing'}`;
        }

        if (consEl) { consEl.textContent = block.consumption > 0 ? `⚡ ${block.consumption} E/s` : '⚡ No power needed'; consEl.style.color = block.consumption > 0 ? '#F3E979' : '#90EE90'; }
    }

    if (block.id === 'thorium-reactor' && (block.meltdownTimer || 0) > 0) {
        buyBtn.innerHTML = `<span style="color:#ff4444; font-weight:bold; animation: blink 0.5s infinite">⚠️ MELTDOWN: ${Math.max(0, 10 - Math.floor(block.meltdownTimer / 1000))}s</span>`;
    } else if (isMax) {
        buyBtn.textContent = 'MAX LEVEL';
        buyBtn.disabled = true;
        buyBtn.classList.remove('can-buy');
    } else {
        const canAfford = checkCanAffordBlock(block);
        const canBuy = canAfford;
        buyBtn.disabled = !canBuy;
        buyBtn.classList.toggle('can-buy', canBuy);
        buyBtn.textContent = (block.level === 0 ? 'Buy' : 'Upgrade') + ` (${Object.entries(block.cost).map(([r, v]) => `${v.toLocaleString()} ${formatRes(r)}`).join(', ')})`;
    }
}

window.updateProductionPanel = () => productionBlocks.forEach(updateBlockButton);
window.updateLiquidsPanel = () => liquidBlocks.forEach(updateBlockButton);
window.updateLogicPanel = () => logicBlocks.forEach(updateBlockButton);
window.updateEnergyPanel = () => {
    const cur = Math.floor(energyState.currentEnergy), max = energyState.maxEnergy, net = window.getNetPowerFlow();
    const lbl = document.getElementById('energy-label'), fill = document.getElementById('energy-bar-fill');
    if (lbl) {
        const netStr = Number.isFinite(net) ? `${net > 0 ? '+' : ''}${net.toFixed(1)}` : '0.0';
        lbl.textContent = `Energy: ${(cur || 0).toLocaleString()}/${(max || 0).toLocaleString()} (${netStr}/s)`;
    }
    if (fill) fill.style.width = `${Math.min(100, max > 0 ? (cur / max) * 100 : 0)}%`;
    energyBlocks.forEach(updateBlockButton);
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    productionBlocks.forEach(b => createBlockButton(b, 'production-buttons-container'));
    energyBlocks.forEach(b => createBlockButton(b, 'energy-buttons-container'));
    liquidBlocks.forEach(b => createBlockButton(b, 'liquids-buttons-container'));
    logicBlocks.forEach(b => createBlockButton(b, 'logic-buttons-container'));
    document.addEventListener('resourcesUpdated', () => { window.updateProductionPanel(); window.updateEnergyPanel(); window.updateLiquidsPanel(); window.updateLogicPanel(); });
    document.addEventListener('checkUpgrades', () => { window.updateProductionPanel(); window.updateEnergyPanel(); window.updateLiquidsPanel(); window.updateLogicPanel(); });
    window.updateEnergyPanel(); window.updateProductionPanel(); window.updateLiquidsPanel(); window.updateLogicPanel();
});
