// scripts/leaderboard.js

window.openLeaderboard = async () => {
    document.getElementById('leaderboard-modal').style.display = 'flex';
    if (window.getGlobalLeaderboard) {
        const listDiv = document.getElementById('leaderboard-list');
        listDiv.innerHTML = '<div style="text-align: center; color: #888; margin-top: 20px; font-style: italic;">Fetching global ranking...</div>';
        const data = await window.getGlobalLeaderboard();
        listDiv.innerHTML = '';
        if (data.length === 0) listDiv.innerHTML = '<div style="text-align: center; color: #888; margin-top: 20px;">No scores have been uploaded yet.</div>';

        data.forEach((p, i) => {
            const row = document.createElement('div');
            row.style.padding = "8px 12px";
            row.style.margin = "4px 0";
            row.style.borderRadius = "6px";
            row.style.background = i % 2 === 0 ? "#292b2f" : "transparent";
            row.style.display = "flex";
            const rank = i + 1;
            let color = "#8e9297";
            let rankStr = `#${rank}`;

            if (rank === 1) { color = "transparent"; rankStr = `<img src="assets/sprites/liquid-neoplasm.png" style="width:24px; height:24px; display:block;" title="World Top 1">`; }
            else if (rank === 2) { color = "transparent"; rankStr = `<img src="assets/sprites/liquid-slag.png" style="width:24px; height:24px; display:block;" title="World Top 2">`; }
            else if (rank === 3) { color = "transparent"; rankStr = `<img src="assets/sprites/liquid-arkycite.png" style="width:24px; height:24px; display:block;" title="World Top 3">`; }

            let cu = 0, si = 0, srge = 0, slg = 0;
            if (p.payload) {
                if (p.payload.resources) {
                    cu = p.payload.resources.copper || 0;
                    si = p.payload.resources.silicio || 0;
                    srge = p.payload.resources['surge-alloy'] || 0;
                }
                if (p.payload.fluidsState && p.payload.fluidsState.slag) {
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
            statsDiv.innerHTML = '<div style="text-align:center; color:#888; font-style:italic;">Calculating your rank percentile...</div>';

            const res = window.getGameResources();
            const fluids = window.getFluidsState ? window.getFluidsState() : {};
            const slagCount = (fluids['slag'] && fluids['slag'].current) ? fluids['slag'].current : 0;
            const myScore = (res.copper || 0) + (res.silicio || 0) + (res['surge-alloy'] || 0) + slagCount;

            const stats = await window.getUserRankStats(myScore);
            if (stats) {
                const avatarUrl = window.lastAvatar || "assets/sprites/router.png";
                const usrName = window.lastUsername || "Anonymous Commander";

                statsDiv.innerHTML = `
                    <div style="font-size:11px; color:#888; margin-bottom: 8px; text-transform:uppercase; font-weight:bold; letter-spacing:1px;">Your Global Rank</div>
                    <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 2px;">
                        <div style="text-align: center; font-size: 14px; font-weight: bold; color: #fee75c; background:rgba(254,231,92,0.1); padding:4px 8px; border-radius:4px; border: 1px solid rgba(254,231,92,0.3);">
                            Top ${stats.percentile}%
                        </div>
                        <img src="${avatarUrl}" style="width:30px; height:30px; border-radius:50%; border: 2px solid #5865F2;">
                        <div style="color: #fff; font-weight: 600; font-size: 15px; flex-grow: 1;">${usrName} <br><span style="font-size:12px; color:#aaa; font-weight:normal;">(Rank #${stats.rank} of ${stats.total} players)</span></div>
                        <div style="color: #f2a65a; font-weight: bold; font-size: 13px; background: rgba(242,166,90,0.15); padding: 4px 8px; border-radius: 4px;">
                            ${Math.floor(myScore).toLocaleString()} RP
                        </div>
                    </div>
                `;
            } else {
                statsDiv.innerHTML = '<div style="text-align:center; color:#888;">Failed to calculate percentile.</div>';
            }
        }
    }
};
