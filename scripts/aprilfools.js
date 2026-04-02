// scripts/aprilfools.js
document.addEventListener('DOMContentLoaded', () => {
    let popupsEnabled = true;
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
    toggleBtn.title = "Activar/Desactivar Bromas Aleatorias";
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
    routerTex.src = 'assets/sprites/router.png';
    routerTex.style.maxWidth = '38px';
    routerTex.style.maxHeight = '38px';
    routerLeaderboard.appendChild(routerTex);
    document.body.appendChild(routerLeaderboard);
    
    routerLeaderboard.onmouseover = () => { routerLeaderboard.style.transform = 'scale(1.1)'; routerLeaderboard.style.background = '#555'; };
    routerLeaderboard.onmouseout = () => { routerLeaderboard.style.transform = 'scale(1)'; routerLeaderboard.style.background = '#333'; };
    toggleBtn.onmouseover = () => { toggleBtn.style.transform = 'scale(1.1)'; toggleBtn.style.background = '#555'; };
    toggleBtn.onmouseout = () => { toggleBtn.style.transform = 'scale(1)'; toggleBtn.style.background = '#333'; };

    routerLeaderboard.onclick = async () => {
        document.getElementById('leaderboard-modal').style.display='flex';
        if(window.getGlobalLeaderboard) {
            const listDiv = document.getElementById('leaderboard-list');
            listDiv.innerHTML = '<div style="text-align: center; color: #888; margin-top: 20px; font-style: italic;">Descargando ranking mundial...</div>';
            const data = await window.getGlobalLeaderboard();
            listDiv.innerHTML = '';
            if(data.length === 0) listDiv.innerHTML = '<div style="text-align: center; color: #888; margin-top: 20px;">Nadie ha subido puntajes aún.</div>';
            
            data.forEach((p, i) => {
                const row = document.createElement('div');
                row.style.padding = "8px 12px";
                row.style.margin = "4px 0";
                row.style.borderRadius = "6px";
                row.style.background = i % 2 === 0 ? "#292b2f" : "transparent";
                row.style.display = "flex";
                const rank = i+1;
                let color = "#8e9297";
                let rankStr = `#${rank}`;
                
                if(rank === 1) { color = "transparent"; rankStr = `<img src="assets/sprites/liquid-neoplasm.png" style="width:24px; height:24px; display:block;" title="Top 1 Mundial">`; }
                else if(rank === 2) { color = "transparent"; rankStr = `<img src="assets/sprites/liquid-slag.png" style="width:24px; height:24px; display:block;" title="Top 2 Mundial">`; }
                else if(rank === 3) { color = "transparent"; rankStr = `<img src="assets/sprites/liquid-arkycite.png" style="width:24px; height:24px; display:block;" title="Top 3 Mundial">`; }

                let cu = 0, si = 0, srge = 0, slg = 0;
                if(p.payload) {
                    if(p.payload.resources) {
                        cu = p.payload.resources.copper || 0;
                        si = p.payload.resources.silicio || 0;
                        srge = p.payload.resources['surge-alloy'] || 0;
                    }
                    if(p.payload.fluidsState && p.payload.fluidsState.slag) {
                        slg = p.payload.fluidsState.slag.current || 0;
                    }
                }

                let avatarHTML = '';
                if (p.avatar && p.avatar.length > 5) {
                    avatarHTML = `<img src="${p.avatar}" style="width:28px; height:28px; border-radius:50%; border: 1px solid #202225;">`;
                } else {
                    avatarHTML = `<div style="width:28px; height:28px; border-radius:50%; background:#5865F2; display:flex; align-items:center; justify-content:center; border: 1px solid #202225;"><img src="assets/sprites/router.png" style="width:18px; filter: grayscale(100%);"></div>`;
                }

                row.style.flexDirection = "column";
                row.style.alignItems = "flex-start";
                row.innerHTML = `
                    <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 4px; width: 100%;">
                        <div style="width: 24px; text-align: center; font-size: 18px; font-weight: bold; color: ${color};">${rankStr}</div>
                        ${avatarHTML}
                        <div style="color: #fff; font-weight: 600; font-size: 15px; flex-grow: 1;">${p.username}</div>
                        <div style="color: #f2a65a; font-weight: bold; font-size: 12px; background: rgba(242,166,90,0.15); padding: 2px 6px; border-radius: 4px;">
                            ${Math.floor(p.score).toLocaleString()} RP
                        </div>
                    </div>
                    <div style="display:flex; gap: 12px; padding-left: 77px; padding-right: 10px; width: 100%; box-sizing: border-box; flex-wrap: wrap;">
                        <span style="display:flex; align-items:center; gap:4px; font-size:12px; color:#aaa;"><img src="assets/sprites/item-copper.png" width="14"> ${Math.floor(cu).toLocaleString()}</span>
                        <span style="display:flex; align-items:center; gap:4px; font-size:12px; color:#aaa;"><img src="assets/sprites/item-silicon.png" width="14"> ${Math.floor(si).toLocaleString()}</span>
                        <span style="display:flex; align-items:center; gap:4px; font-size:12px; color:#aaa;"><img src="assets/sprites/liquid-slag.png" width="14"> ${Math.floor(slg).toLocaleString()}</span>
                        <span style="display:flex; align-items:center; gap:4px; font-size:12px; color:#aaa;"><img src="assets/sprites/item-surge-alloy.png" width="14"> ${Math.floor(srge).toLocaleString()}</span>
                    </div>
                `;
                listDiv.appendChild(row);
            });
            
            // Cargar barra de percentil personal
            const statsDiv = document.getElementById('leaderboard-my-stats');
            if (statsDiv && window.getUserRankStats) {
                statsDiv.style.display = 'block';
                statsDiv.innerHTML = '<div style="text-align:center; color:#888; font-style:italic;">Calculando tu Percentil de Nivel...</div>';
                
                const res = window.getGameResources();
                const fluids = window.getFluidsState ? window.getFluidsState() : {};
                const slagCount = (fluids['slag'] && fluids['slag'].current) ? fluids['slag'].current : 0;
                const myScore = (res.copper || 0) + (res.silicio || 0) + (res['surge-alloy'] || 0) + slagCount;
                
                const stats = await window.getUserRankStats(myScore);
                if (stats) {
                    const avatarUrl = window.lastAvatar || "assets/sprites/router.png";
                    const usrName = window.lastUsername || "Comandante Anónimo";
                    
                    statsDiv.innerHTML = `
                        <div style="font-size:11px; color:#888; margin-bottom: 8px; text-transform:uppercase; font-weight:bold; letter-spacing:1px;">Tu Rango Militar Global</div>
                        <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 2px;">
                            <div style="text-align: center; font-size: 14px; font-weight: bold; color: #fee75c; background:rgba(254,231,92,0.1); padding:4px 8px; border-radius:4px; border: 1px solid rgba(254,231,92,0.3);">
                                Top ${stats.percentile}%
                            </div>
                            <img src="${avatarUrl}" style="width:30px; height:30px; border-radius:50%; border: 2px solid #5865F2;">
                            <div style="color: #fff; font-weight: 600; font-size: 15px; flex-grow: 1;">${usrName} <br><span style="font-size:12px; color:#aaa; font-weight:normal;">(Top #${stats.rank} de ${stats.total} cmdts)</span></div>
                            <div style="color: #f2a65a; font-weight: bold; font-size: 13px; background: rgba(242,166,90,0.15); padding: 4px 8px; border-radius: 4px;">
                                ${Math.floor(myScore).toLocaleString()} RP
                            </div>
                        </div>
                    `;
                } else {
                    statsDiv.innerHTML = '<div style="text-align:center; color:#888;">Error calculando percentil.</div>';
                }
            }
        }
    };
    const trollImages = [
        'assets/sprites/router.png',
        'assets/sprites/item-copper.png',
        'assets/sprites/item-lead.png',
        'assets/sprites/item-coal.png',
        'assets/sprites/item-sand.png',
        'assets/sprites/item-titanium.png',
        'assets/sprites/item-thorium.png',
        'assets/sprites/item-graphite.png',
        'assets/sprites/item-silicon.png',
        'assets/sprites/item-metaglass.png',
        'assets/sprites/item-plastanium.png',
        'assets/sprites/item-phase-fabric.png',
        'assets/sprites/item-surge-alloy.png',
        'assets/sprites/item-spore-pod.png',
        'assets/sprites/item-pyratite.png',
        'assets/sprites/item-blast-compound.png',
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
