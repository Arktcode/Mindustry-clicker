const resources = [
    { 
        id: 'cobre', 
        name: 'Copper', 
        sprite: 'assets/sprites/copper.png', 
        unlocked: true,
        clickPower: 5,
        unlockReq: null 
    },
    { 
        id: 'lead', 
        name: 'Lead', 
        sprite: 'assets/sprites/lead.png', 
        unlocked: false,
        clickPower: 1,
        unlockReq: { resource: 'cobre', minPower: 50 } 
    },
    { 
        id: 'coal', 
        name: 'Coal', 
        sprite: 'assets/sprites/coal.png', 
        unlocked: false,
        clickPower: 1, 
        unlockReq: { resource: 'lead', minPower: 50 } 
    },
    { 
        id: 'sand', 
        name: 'Sand', 
        sprite: 'assets/sprites/sand.png', 
        unlocked: false,
        clickPower: 1, 
         unlockReq: { recipeId: 'graphite-press', minLevel: 1 } 
    },
    { 
        id: 'graphite', 
        name: 'Graphite', 
        sprite: 'assets/sprites/graphite.png', 
        unlocked: false,
        clickPower: 1, 
        unlockReq: { recipeId: 'graphite-press', minLevel: 1 } 
    },
    { 
        id: 'silicio', 
        name: 'Silicon', 
        sprite: 'assets/sprites/silicon.png', 
        unlocked: false,
        clickPower: 1, 
        unlockReq: { recipeId: 'silicon-smelter', minLevel: 1 } 
    },
    { 
        id: 'titanium', 
        name: 'Titanium', 
        sprite: 'assets/sprites/titanium.png', 
        unlocked: false,
        clickPower: 1, 
        unlockReq: { upgradeId: 'titanium-drill', minLevel: 1 } 
    },
    { 
        id: 'thorium', 
        name: 'Thorium', 
        sprite: 'assets/sprites/thorium.png', 
        unlocked: false,
        clickPower: 1, 
        unlockReq: { upgradeId: 'laser-drill-thorium', minLevel: 1 } 
    },
    { 
        id: 'plastanium', 
        name: 'Plastanium', 
        sprite: 'assets/sprites/plastanium.png', 
        unlocked: false,
        clickPower: 1, 
        unlockReq: { recipeId: 'plastanium-compressor', minLevel: 1 } 
    },
    { 
        id: 'surge-alloy', 
        name: 'Surge Alloy', 
        sprite: 'assets/sprites/surge-alloy.png', 
        unlocked: false,
        clickPower: 1, 
        unlockReq: { recipeId: 'surge-smelter', minLevel: 1 } 
    },
];

window.getResourceData = (resourceId) => resources.find(r => r.id === resourceId);
window.getUnlockableResources = () => resources.filter(r => !r.unlocked);

window.unlockResource = function(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    if (resource && !resource.unlocked) {
        resource.unlocked = true;
        window.guiDirty = true;
        
        if (window.handleResourceUnlockDOM) {
            window.handleResourceUnlockDOM(resourceId);
        }
    }
};

function updateItemPanel() {
    if (!window.getGameResources) return;
    
    const currentResources = window.getGameResources();
    
    const resourceList = [
        'cobre', 'lead', 'titanium', 'thorium', 'plastanium', 'surge-alloy', 
        'graphite', 'coal', 'sand', 'silicio'
    ]; 

    resourceList.forEach(res => {
        const label = document.getElementById(`item-${res}-label`); 
        if (label) {
            if (currentResources.hasOwnProperty(res)) {
                label.textContent = Math.floor(currentResources[res]).toLocaleString(); 
            } else {
                label.textContent = '0';
            }
        }
    });
}

document.addEventListener('resourcesUpdated', updateItemPanel);
document.addEventListener('DOMContentLoaded', updateItemPanel);
