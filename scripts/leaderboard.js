// scripts/leaderboard.js
// -- Seguro: todos los datos de usuarios se insertan con textContent, nunca con innerHTML --

function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
}

function makeRankIcon(rank) {
    const icons = {
        1: { src: 'assets/sprites/liquid-neoplasm.png', title: 'World Top 1' },
        2: { src: 'assets/sprites/liquid-slag.png',     title: 'World Top 2' },
        3: { src: 'assets/sprites/liquid-arkycite.png', title: 'World Top 3' },
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

    // Validar que la URL sea de Discord CDN o assets locales
    const isSafeUrl = avatarUrl && avatarUrl.length > 5 &&
        (avatarUrl.startsWith('https://cdn.discordapp.com/') ||
         avatarUrl.startsWith('assets/') ||
         avatarUrl.startsWith('https://cdn.discord.com/'));

    if (isSafeUrl) {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.style.cssText = 'width:100%; height:100%; object-fit:cover;';
        img.onerror = () => { img.src = 'assets/sprites/router.png'; };
        wrapper.appendChild(img);
    } else {
        wrapper.style.cssText += '; background:#5865F2; display:flex; align-items:center; justify-content:center;';
        const img = document.createElement('img');
        img.src = 'assets/sprites/router.png';
        img.style.cssText = 'width:18px; filter:grayscale(100%);';
        wrapper.appendChild(img);
    }
    return wrapper;
}

window.openLeaderboard = async () => {
    document.getElementById('leaderboard-modal').style.display = 'flex';
    if (!window.getGlobalLeaderboard) return;

    const listDiv = document.getElementById('leaderboard-list');
    listDiv.innerHTML = '<div style="text-align:center; color:#888; margin-top:20px; font-style:italic;">Fetching global ranking...</div>';

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
                cu   = p.payload.resources.copper || 0;
                si   = p.payload.resources.silicon || 0;
                srge = p.payload.resources['surge-alloy'] || 0;
            }
            if (p.payload.fluidsState?.slag) slg = p.payload.fluidsState.slag.current || 0;
        }

        const row = document.createElement('div');
        row.style.cssText = `padding:8px 12px; margin:4px 0; border-radius:6px; background:${i % 2 === 0 ? '#292b2f' : 'transparent'}; display:flex; flex-direction:column; align-items:flex-start;`;

        // Fila superior
        const topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex; align-items:center; gap:12px; margin-bottom:4px; width:100%;';

        const rankCell = document.createElement('div');
        rankCell.style.cssText = 'width:24px; text-align:center; flex-shrink:0;';
        rankCell.appendChild(makeRankIcon(rank));

        const nameDiv = document.createElement('div');
        nameDiv.style.cssText = 'color:#fff; font-weight:600; font-size:15px; flex-grow:1;';
        nameDiv.textContent = p.username; // ✅ textContent — no XSS

        const scoreDiv = document.createElement('div');
        scoreDiv.style.cssText = 'color:#f2a65a; font-weight:bold; font-size:12px; background:rgba(242,166,90,0.15); padding:2px 6px; border-radius:4px; flex-shrink:0;';
        scoreDiv.textContent = `${window.formatNumber(p.score, true)} RP`;

        topRow.appendChild(rankCell);
        topRow.appendChild(makeAvatar(p.avatar)); // ✅ URL validada
        topRow.appendChild(nameDiv);
        topRow.appendChild(scoreDiv);

        // Fila inferior (stats)
        const statsRow = document.createElement('div');
        statsRow.style.cssText = 'display:flex; gap:12px; padding-left:77px; padding-right:10px; width:100%; box-sizing:border-box; flex-wrap:wrap;';

        const statItems = [
            { sprite: 'assets/sprites/item-copper.png',    val: cu   },
            { sprite: 'assets/sprites/item-silicon.png',   val: si   },
            { sprite: 'assets/sprites/liquid-slag.png',    val: slg  },
            { sprite: 'assets/sprites/item-surge-alloy.png', val: srge },
        ];
        statItems.forEach(({ sprite, val }) => {
            const span = document.createElement('span');
            span.style.cssText = 'display:flex; align-items:center; gap:4px; font-size:12px; color:#aaa;';
            const img = document.createElement('img');
            img.src = sprite;
            img.width = 14;
            const txt = document.createTextNode(` ${window.formatNumber(val, true)}`);
            span.appendChild(img);
            span.appendChild(txt);
            statsRow.appendChild(span);
        });

        row.appendChild(topRow);
        row.appendChild(statsRow);
        listDiv.appendChild(row);
    });

    // Barra de percentil personal
    const statsDiv = document.getElementById('leaderboard-my-stats');
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
            const avatarUrl = window.lastAvatar || 'assets/sprites/router.png';
            const usrName = window.lastUsername || 'Anonymous Commander';

            const topLabel = document.createElement('div');
            topLabel.style.cssText = 'font-size:11px; color:#888; margin-bottom:8px; text-transform:uppercase; font-weight:bold; letter-spacing:1px;';
            topLabel.textContent = 'Your Global Rank';

            const infoRow = document.createElement('div');
            infoRow.style.cssText = 'display:flex; align-items:center; gap:12px; margin-bottom:2px;';

            const pctDiv = document.createElement('div');
            pctDiv.style.cssText = 'text-align:center; font-size:14px; font-weight:bold; color:#fee75c; background:rgba(254,231,92,0.1); padding:4px 8px; border-radius:4px; border:1px solid rgba(254,231,92,0.3);';
            pctDiv.textContent = `Top ${stats.percentile}%`;

            const avatarEl = makeAvatar(avatarUrl);
            avatarEl.style.cssText += ' border:2px solid #5865F2;';

            const nameCol = document.createElement('div');
            nameCol.style.cssText = 'color:#fff; font-weight:600; font-size:15px; flex-grow:1;';
            nameCol.textContent = usrName; // ✅ textContent

            const rankInfo = document.createElement('span');
            rankInfo.style.cssText = 'font-size:12px; color:#aaa; font-weight:normal; display:block;';
            rankInfo.textContent = `(Rank #${stats.rank} of ${stats.total} players)`;
            nameCol.appendChild(rankInfo);

            const scoreEl = document.createElement('div');
            scoreEl.style.cssText = 'color:#f2a65a; font-weight:bold; font-size:13px; background:rgba(242,166,90,0.15); padding:4px 8px; border-radius:4px;';
            scoreEl.textContent = `${window.formatNumber(myScore, true)} RP`;

            infoRow.appendChild(pctDiv);
            infoRow.appendChild(avatarEl);
            infoRow.appendChild(nameCol);
            infoRow.appendChild(scoreEl);

            statsDiv.appendChild(topLabel);
            statsDiv.appendChild(infoRow);
        } else {
            statsDiv.textContent = 'Failed to calculate percentile.';
        }
    }
};
