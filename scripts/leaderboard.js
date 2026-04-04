// scripts/leaderboard.js
// -- Seguro: todos los datos de usuarios se insertan con textContent, nunca con innerHTML --

function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
}

function makeRankIcon(rank) {
    const icons = {
        1: { src: 'assets/sprites/liquids/liquid-neoplasm.png', title: 'World Top 1' },
        2: { src: 'assets/sprites/liquids/liquid-slag.png', title: 'World Top 2' },
        3: { src: 'assets/sprites/liquids/liquid-arkycite.png', title: 'World Top 3' },
    };
    if (icons[rank]) {
        const img = document.createElement('img');
        img.src = icons[rank].src;
        img.title = icons[rank].title;
        img.style.cssText = 'width:24px; height:24px; display:block;';
        return img;
    }
    const span = document.createElement('span');
    span.style.cssText = 'color:#8e9297; font-weight:bold; font-size:18px;';
    span.textContent = `#${rank}`;
    return span;
}

function makeAvatar(avatarUrl) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:28px; height:28px; border-radius:50%; overflow:hidden; border:1px solid #202225; flex-shrink:0;';
    const isSafeUrl = avatarUrl && avatarUrl.length > 5 &&
        (avatarUrl.startsWith('https://cdn.discordapp.com/') ||
            avatarUrl.startsWith('assets/') ||
            avatarUrl.startsWith('https://cdn.discord.com/'));
    if (isSafeUrl) {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.style.cssText = 'width:100%; height:100%; object-fit:cover;';
        img.onerror = () => { img.src = 'assets/sprites/blocks/conveyors/router.png'; };
        wrapper.appendChild(img);
    } else {
        wrapper.style.cssText += '; background:#5865F2; display:flex; align-items:center; justify-content:center;';
        const img = document.createElement('img');
        img.src = 'assets/sprites/blocks/conveyors/router.png';
        img.style.cssText = 'width:18px; filter:grayscale(100%);';
        wrapper.appendChild(img);
    }
    return wrapper;
}

// ── Two-view state ──────────────────────────────────────────────────────────
let currentLbView = 'score';

function updateLbTabUI() {
    const label = document.getElementById('lb-tab-label');
    if (!label) return;
    if (currentLbView === 'score') {
        label.innerHTML = `<img src="assets/sprites/icons/status-boss.png" style="width:16px;height:16px;"> Score Ranking <img src="assets/sprites/icons/status-boss.png" style="width:16px;height:16px;">`;
    } else {
        label.innerHTML = `<img src="assets/sprites/icons/status-fast.png" style="width:16px;height:16px;"> Prestige Ranking <img src="assets/sprites/icons/status-fast.png" style="width:16px;height:16px;">`;
    }
}

async function loadCurrentLbView() {
    const listDiv = document.getElementById('leaderboard-list');
    const statsDiv = document.getElementById('leaderboard-my-stats');
    if (!listDiv) return;
    listDiv.innerHTML = '<div style="text-align:center; color:#888; margin-top:20px; font-style:italic;">Fetching rankings...</div>';
    if (statsDiv) statsDiv.style.display = 'none';

    if (currentLbView === 'score') {
        await renderScoreView(listDiv, statsDiv);
    } else {
        await renderPrestigeView(listDiv);
    }
}

window.lbPrevView = function () {
    const views = ['score', 'prestige'];
    const idx = views.indexOf(currentLbView);
    currentLbView = views[(idx - 1 + views.length) % views.length];
    updateLbTabUI();
    loadCurrentLbView();
};

window.lbNextView = function () {
    const views = ['score', 'prestige'];
    const idx = views.indexOf(currentLbView);
    currentLbView = views[(idx + 1) % views.length];
    updateLbTabUI();
    loadCurrentLbView();
};

// ── Score view ──────────────────────────────────────────────────────────────
async function renderScoreView(listDiv, statsDiv) {
    if (!window.getGlobalLeaderboard) return;

    const data = await window.getGlobalLeaderboard();
    listDiv.innerHTML = '';

    if (data.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'text-align:center; color:#888; margin-top:20px;';
        empty.textContent = 'No scores have been uploaded yet.';
        listDiv.appendChild(empty);
        return;
    }

    data.forEach((p, i) => {
        const rank = i + 1;
        let cu = 0, si = 0, srge = 0, slg = 0;
        if (p.payload) {
            if (p.payload.resources) {
                cu = p.payload.resources.copper || 0;
                si = p.payload.resources.silicon || 0;
                srge = p.payload.resources['surge-alloy'] || 0;
            }
            if (p.payload.fluidsState?.slag) slg = p.payload.fluidsState.slag.current || 0;
        }

        const row = document.createElement('div');
        row.style.cssText = `padding:8px 12px; margin:4px 0; border-radius:6px; background:${i % 2 === 0 ? '#292b2f' : 'transparent'}; display:flex; flex-direction:column; align-items:flex-start;`;

        const topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex; align-items:center; gap:12px; margin-bottom:4px; width:100%;';

        const rankCell = document.createElement('div');
        rankCell.style.cssText = 'width:24px; text-align:center; flex-shrink:0;';
        rankCell.appendChild(makeRankIcon(rank));

        const nameDiv = document.createElement('div');
        nameDiv.style.cssText = 'color:#fff; font-weight:600; font-size:15px; flex-grow:1;';
        nameDiv.textContent = p.username;

        const scoreDiv = document.createElement('div');
        scoreDiv.style.cssText = 'color:#f2a65a; font-weight:bold; font-size:12px; background:rgba(242,166,90,0.15); padding:2px 6px; border-radius:4px; flex-shrink:0;';
        scoreDiv.textContent = `${window.formatNumber(p.score, true)} RP`;

        topRow.appendChild(rankCell);
        topRow.appendChild(makeAvatar(p.avatar));
        topRow.appendChild(nameDiv);
        topRow.appendChild(scoreDiv);

        const statsRow = document.createElement('div');
        statsRow.style.cssText = 'display:flex; gap:12px; padding-left:77px; padding-right:10px; width:100%; box-sizing:border-box; flex-wrap:wrap;';
        const statItems = [
            { sprite: 'assets/sprites/items/item-copper.png', val: cu },
            { sprite: 'assets/sprites/items/item-silicon.png', val: si },
            { sprite: 'assets/sprites/liquids/liquid-slag.png', val: slg },
            { sprite: 'assets/sprites/items/item-surge-alloy.png', val: srge },
        ];
        statItems.forEach(({ sprite, val }) => {
            const span = document.createElement('span');
            span.style.cssText = 'display:flex; align-items:center; gap:4px; font-size:12px; color:#aaa;';
            const img = document.createElement('img');
            img.src = sprite; img.width = 14;
            const txt = document.createTextNode(` ${window.formatNumber(val, true)}`);
            span.appendChild(img); span.appendChild(txt);
            statsRow.appendChild(span);
        });

        row.appendChild(topRow);
        row.appendChild(statsRow);
        listDiv.appendChild(row);
    });

    // Personal rank stats
    if (statsDiv && window.getUserRankStats) {
        statsDiv.style.display = 'block';
        statsDiv.innerHTML = '<div style="text-align:center; color:#888; font-style:italic;">Calculating your rank...</div>';
        const res = window.getGameResources();
        const fluids = window.getFluidsState ? window.getFluidsState() : {};
        const slagCount = fluids['slag']?.current || 0;
        const myScore = (res.copper || 0) + (res.silicon || 0) + (res['surge-alloy'] || 0) + slagCount;
        const stats = await window.getUserRankStats(myScore);
        statsDiv.innerHTML = '';
        if (stats) {
            const avatarUrl = window.lastAvatar || 'assets/sprites/blocks/conveyors/router.png';
            const usrName = window.lastUsername || 'Anonymous Commander';
            const topLabel = document.createElement('div');
            topLabel.style.cssText = 'font-size:11px; color:#888; margin-bottom:8px; text-transform:uppercase; font-weight:bold; letter-spacing:1px;';
            topLabel.textContent = 'Your Global Rank';
            const infoRow = document.createElement('div');
            infoRow.style.cssText = 'display:flex; align-items:center; gap:12px; margin-bottom:2px;';
            const pctDiv = document.createElement('div');
            pctDiv.style.cssText = 'text-align:center; font-size:14px; font-weight:bold; color:#fed17b; background:rgba(254,209,123,0.1); padding:4px 8px; border-radius:4px; border:1px solid #fed17b;';
            pctDiv.textContent = `Top ${stats.percentile}%`;
            const avatarEl = makeAvatar(avatarUrl);
            avatarEl.style.cssText += ' border:2px solid #5865F2;';
            const nameCol = document.createElement('div');
            nameCol.style.cssText = 'color:#fff; font-weight:600; font-size:15px; flex-grow:1;';
            nameCol.textContent = usrName;
            const rankInfo = document.createElement('span');
            rankInfo.style.cssText = 'font-size:12px; color:#aaa; font-weight:normal; display:block;';
            rankInfo.textContent = `(Rank #${stats.rank} of ${stats.total} players)`;
            nameCol.appendChild(rankInfo);
            const scoreEl = document.createElement('div');
            scoreEl.style.cssText = 'color:#f2a65a; font-weight:bold; font-size:13px; background:rgba(242,166,90,0.15); padding:4px 8px; border-radius:4px;';
            scoreEl.textContent = `${window.formatNumber(myScore, true)} RP`;
            infoRow.appendChild(pctDiv); infoRow.appendChild(avatarEl);
            infoRow.appendChild(nameCol); infoRow.appendChild(scoreEl);
            statsDiv.appendChild(topLabel); statsDiv.appendChild(infoRow);
        } else {
            statsDiv.textContent = 'Failed to calculate percentile.';
        }
    }
}

// ── Prestige view ───────────────────────────────────────────────────────────
async function renderPrestigeView(listDiv) {
    if (!window.getPrestigeLeaderboard) {
        listDiv.innerHTML = '<div style="text-align:center; color:#888; margin-top:20px;">Prestige data unavailable.</div>';
        return;
    }
    const data = await window.getPrestigeLeaderboard();
    listDiv.innerHTML = '';

    if (data.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'text-align:center; color:#888; margin-top:40px; font-style:italic;';
        empty.textContent = 'No prestige players yet. Be the first!';
        listDiv.appendChild(empty);
        return;
    }

    data.forEach((p, i) => {
        const rank = i + 1;
        const row = document.createElement('div');
        row.style.cssText = `padding:10px 12px; margin:4px 0; border-radius:6px; background:${i % 2 === 0 ? '#292b2f' : 'transparent'}; display:flex; align-items:center; gap:12px;`;

        const rankCell = document.createElement('div');
        rankCell.style.cssText = 'width:24px; text-align:center; flex-shrink:0;';
        rankCell.appendChild(makeRankIcon(rank));

        const nameDiv = document.createElement('div');
        nameDiv.style.cssText = 'color:#fff; font-weight:600; font-size:15px; flex-grow:1;';
        nameDiv.textContent = p.username;

        const prestigeDiv = document.createElement('div');
        prestigeDiv.style.cssText = 'color:#fed17b; font-weight:900; font-size:16px; background:rgba(254,209,123,0.12); padding:3px 10px; border-radius:4px; border:1px solid #fed17b; letter-spacing:1px; flex-shrink:0; display:flex; align-items:center; gap:6px;';
        prestigeDiv.innerHTML = `<img src="assets/sprites/icons/status-fast.png" style="width:14px; height:14px;"> ${window.toRoman ? window.toRoman(p.prestige) : p.prestige}`;

        row.appendChild(rankCell);
        row.appendChild(makeAvatar(p.avatar));
        row.appendChild(nameDiv);
        row.appendChild(prestigeDiv);
        listDiv.appendChild(row);
    });

    // Show current user prestige
    const statsDiv = document.getElementById('leaderboard-my-stats');
    if (statsDiv && window.prestigeData && window.prestigeData.level > 0) {
        statsDiv.style.display = 'block';
        statsDiv.innerHTML = '';
        const myRow = document.createElement('div');
        myRow.style.cssText = 'display:flex; align-items:center; gap:12px;';
        const myLabel = document.createElement('div');
        myLabel.style.cssText = 'font-size:11px; color:#888; text-transform:uppercase; font-weight:bold; letter-spacing:1px; margin-right:auto;';
        myLabel.textContent = 'Your Prestige';
        const myBadge = document.createElement('div');
        myBadge.style.cssText = 'color:#fed17b; font-weight:900; font-size:18px; background:rgba(254,209,123,0.12); padding:4px 14px; border-radius:4px; border:1px solid #fed17b; letter-spacing:2px; display:flex; align-items:center; gap:8px;';
        myBadge.innerHTML = `<img src="assets/sprites/icons/status-fast.png" style="width:18px; height:18px;"> ${window.toRoman ? window.toRoman(window.prestigeData.level) : window.prestigeData.level}`;
        myRow.appendChild(myLabel);
        myRow.appendChild(myBadge);
        statsDiv.appendChild(myRow);
    }
}

// ── Open leaderboard ────────────────────────────────────────────────────────
window.openLeaderboard = async () => {
    document.getElementById('leaderboard-modal').style.display = 'flex';
    if (window.spawnPrestigeParticles) window.spawnPrestigeParticles();
    updateLbTabUI();
    await loadCurrentLbView();
};
