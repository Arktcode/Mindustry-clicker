// scripts/aprilfools.js
document.addEventListener('DOMContentLoaded', () => {
    let popupsEnabled = false;
    const style = document.createElement('style');
    style.innerHTML = `
        .april-popup {
            position: fixed;
            z-index: 9999;
            background: #222;
            border: 2px solid #5a5a5a;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: popIn 0.2s ease-out;
        }
        @keyframes popIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .april-popup img {
            max-width: 250px;
            max-height: 250px;
            border-radius: 4px;
        }
        .april-close, .april-clone {
            margin-top: 10px;
            padding: 5px 15px;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            width: 100%;
        }
        .april-close { background: #ff4444; }
        .april-close:hover { background: #ff6666; }
        .april-clone { background: #44aa44; margin-top: 5px; }
        .april-clone:hover { background: #66cc66; }

        /* Estilos del Toggle Button */
        #april-toggle-btn {
            position: fixed;
            bottom: 20px;
            left: 20px; /* Abajo a la izquierda para que no estorbe los paneles nativos */
            width: 50px;
            height: 50px;
            border-radius: 8px;
            background: #333;
            border: 2px solid #5a5a5a;
            cursor: pointer;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        #april-toggle-btn:hover { background: #555; transform: scale(1.1); }
        #april-toggle-btn.disabled { filter: grayscale(100%) opacity(50%); border-color: #ff4444; }
    `;
    document.head.appendChild(style);
    // Botón Anuken (Toggle April Fools Original)
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'anuken-toggle-btn';
    toggleBtn.title = "Enable/Disable Random Pranks";
    toggleBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px; 
        width: 50px;
        height: 50px;
        border-radius: 8px;
        background: #333;
        border: 2px solid #5a5a5a;
        cursor: pointer;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    `;
    const btnTex = document.createElement('img');
    btnTex.src = 'assets/sprites/Anuken.png';
    btnTex.style.maxWidth = '38px';
    btnTex.style.maxHeight = '38px';
    toggleBtn.appendChild(btnTex);
    document.body.appendChild(toggleBtn);

    // Estado visual inicial: desactivado
    toggleBtn.style.filter = "grayscale(100%) opacity(50%)";
    toggleBtn.style.borderColor = "#ff4444";

    toggleBtn.onclick = () => {
        popupsEnabled = !popupsEnabled;
        toggleBtn.style.filter = popupsEnabled ? "none" : "grayscale(100%) opacity(50%)";
        toggleBtn.style.borderColor = popupsEnabled ? "#5a5a5a" : "#ff4444";
        if (!popupsEnabled) {
            document.querySelectorAll('.april-popup').forEach(p => p.remove());
        }
    };

    // Router Leaderboard (Al lado del botón de Anuken)
    const routerLeaderboard = document.createElement('button');
    routerLeaderboard.id = 'april-toggle-btn';
    routerLeaderboard.title = "Mindustry Global Leaderboard";
    routerLeaderboard.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 80px; 
        width: 50px;
        height: 50px;
        border-radius: 8px;
        background: #333;
        border: 2px solid #5a5a5a;
        cursor: pointer;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    `;

    const routerTex = document.createElement('img');
    routerTex.src = 'assets/sprites/blocks/conveyors/router.png';
    routerTex.style.maxWidth = '38px';
    routerTex.style.maxHeight = '38px';
    routerLeaderboard.appendChild(routerTex);
    document.body.appendChild(routerLeaderboard);

    routerLeaderboard.onmouseover = () => { routerLeaderboard.style.transform = 'scale(1.1)'; routerLeaderboard.style.background = '#555'; };
    routerLeaderboard.onmouseout = () => { routerLeaderboard.style.transform = 'scale(1)'; routerLeaderboard.style.background = '#333'; };
    toggleBtn.onmouseover = () => { toggleBtn.style.transform = 'scale(1.1)'; toggleBtn.style.background = '#555'; };
    toggleBtn.onmouseout = () => { toggleBtn.style.transform = 'scale(1)'; toggleBtn.style.background = '#333'; };

    routerLeaderboard.onclick = () => {
        if (window.openLeaderboard) window.openLeaderboard();
    };
    const trollImages = [
        'assets/sprites/blocks/conveyors/router.png',
        'assets/sprites/items/item-copper.png',
        'assets/sprites/items/item-lead.png',
        'assets/sprites/items/item-coal.png',
        'assets/sprites/items/item-sand.png',
        'assets/sprites/items/item-scrap.png',
        'assets/sprites/items/item-titanium.png',
        'assets/sprites/items/item-thorium.png',
        'assets/sprites/items/item-graphite.png',
        'assets/sprites/items/item-silicon.png',
        'assets/sprites/items/item-metaglass.png',
        'assets/sprites/items/item-plastanium.png',
        'assets/sprites/items/item-phase-fabric.png',
        'assets/sprites/items/item-surge-alloy.png',
        'assets/sprites/items/item-spore-pod.png',
        'assets/sprites/items/item-pyratite.png',
        'assets/sprites/items/item-blast-compound.png',
    ];

    // Frases random:
    const trollPhrases = [
        "Hey! Look at this!",
        "April Fools!",
        "Router requires sacrifice.",
        "Free Thorium inside!",
        "Did you forget to build defense?",
        "Not enough Power!",
        "Mindustry.exe stopped working.",
        "Please Anuken fix the Renale",
        "I want to play mindustry 2",
        "Router is the best unit",
        "Please more Silicon",
        "Will Anuken try this game?",
        "xStabuuX Please Update Omaloon",
        "In Mindustry there's a talking pyrotite, they call me crazy sometimes but it's true... Jane please free the children they are my children too"
    ];
    function showPopup(isClone = false) {
        if (!popupsEnabled) return;
        if (document.querySelectorAll('.april-popup').length > 30) return;

        const popup = document.createElement('div');
        popup.className = 'april-popup';

        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const top = Math.max(20, Math.floor(Math.random() * (winH - 300)));
        const left = Math.max(20, Math.floor(Math.random() * (winW - 250)));

        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;

        const img = document.createElement('img');
        img.src = trollImages[Math.floor(Math.random() * trollImages.length)];

        const title = document.createElement('h3');
        title.style.color = '#fff';
        title.style.margin = '0 0 10px 0';
        title.textContent = trollPhrases[Math.floor(Math.random() * trollPhrases.length)];

        const btnClose = document.createElement('button');
        btnClose.className = 'april-close';
        btnClose.textContent = 'Close window';
        btnClose.onclick = () => {
            popup.remove();
            if (popupsEnabled && Math.random() < 0.3) {
                showPopup(true);
                showPopup(true);
            }
        };

        const btnClone = document.createElement('button');
        btnClone.className = 'april-clone';
        btnClone.textContent = 'Free resources?';
        btnClone.onclick = () => {
            if (!popupsEnabled) return;
            const spawnCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < spawnCount; i++) showPopup(true);
        };

        popup.appendChild(title);
        popup.appendChild(img);
        popup.appendChild(btnClone);
        popup.appendChild(btnClose);

        document.body.appendChild(popup);
    }

    setTimeout(showPopup, 5000);
    setInterval(showPopup, 20000);
});
