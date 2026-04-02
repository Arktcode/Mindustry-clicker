import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, getCountFromServer, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBqSpyAzIMq3Fc6J70H18K67t58H9T1Nbc",
    authDomain: "mindustry-clicker.firebaseapp.com",
    projectId: "mindustry-clicker",
    storageBucket: "mindustry-clicker.firebasestorage.app",
    messagingSenderId: "369757871561",
    appId: "1:369757871561:web:bb1b3b40d01e4a9bca5c18",
    measurementId: "G-RKFHWCNEZ7"
};

let app, db;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase inicializado correctamente.");
} catch (e) {
    console.error("Firebase no se pudo inicializar (revisa tus credenciales):", e);
}

function getOrSetUserId() {
    let discordId = localStorage.getItem('mindustryClickerDiscordID');
    if (discordId) return discordId;

    let uid = localStorage.getItem('mindustryClickerCloudID');
    if (!uid) {
        uid = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
        localStorage.setItem('mindustryClickerCloudID', uid);
    }
    return uid;
}

window.generateIntegrityHash = function(score, resources) {
    const secretSalt = "mindustry_clicker_anti_cheat_v1_2026";
    const cu = Math.floor(resources?.copper || 0);
    const si = Math.floor(resources?.silicon || 0);
    const sr = Math.floor(resources?.['surge-alloy'] || 0);
    const s = Math.floor(score || 0);
    const rawStr = `${s}_${cu}_${si}_${sr}_${secretSalt}`;
    
    let hash = 0;
    for (let i = 0; i < rawStr.length; i++) {
        const char = rawStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; 
    }
    return hash.toString(16);
};

window.saveToCloud = async function (username, saveDataObj, score, avatarUrl) {
    if (!db) return false;

    // Bloqueo: Solo usuarios verificados con Discord pueden subir al Leaderboard
    const cloudUser = localStorage.getItem('mindustryClickerCloudUser');
    if (!cloudUser) {
        console.log("Guardado en nube omitido: usuario no autenticado.");
        return false;
    }

    const uid = getOrSetUserId();

    const docRef = doc(db, "jugadores", uid);
    const payload = {
        username: username || "Crux",
        avatar: avatarUrl || "",
        score: score || 0,
        data: saveDataObj,
        hash: window.generateIntegrityHash(score, saveDataObj?.resources || {}),
        lastOnline: new Date().getTime()
    };

    try {
        await setDoc(docRef, payload);
        console.log("¡Partida subida a la nube exitosamente!");
        return true;
    } catch (e) {
        console.error("Error al subir a la nube: ", e);
        return false;
    }
};

window.loadFromCloud = async function () {
    if (!db) return null;
    const uid = getOrSetUserId();
    const docRef = doc(db, "jugadores", uid);

    try {
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            console.log("Partida descargada de la nube exitosamente");
            return snapshot.data().data;
        } else {
            console.log("Partida en la nube no encontrada para tu sesion actual.");
            return null;
        }
    } catch (e) {
        console.error("Error bajando datos de la nube: ", e);
        return null;
    }
};

window.getGlobalLeaderboard = async function () {
    if (!db) return [];

    try {
        const ref = collection(db, "jugadores");
        // Buscamos 200 porque luego filtraremos falsificados y duplicados localmente
        const q = query(ref, orderBy("score", "desc"), limit(200));
        const snapshots = await getDocs(q);

        const uniqueUsers = new Map();

        snapshots.forEach((doc) => {
            const data = doc.data();
            
            // 1. Anti-Cheat: Verificar Hash
            const expectedHash = window.generateIntegrityHash(data.score, data.data?.resources || {});
            if (!data.hash || data.hash !== expectedHash) {
                // Falla el chequeo de integridad o es puntaje antiguo. Ignorar.
                return; 
            }

            // 2. Desduplicar: Solo nos quedamos con el puntaje más alto por usuario
            const uname = data.username || "Unknown";
            if (!uniqueUsers.has(uname)) {
                uniqueUsers.set(uname, {
                    username: data.username,
                    avatar: data.avatar,
                    score: data.score,
                    payload: data.data 
                });
            } else {
                if (data.score > uniqueUsers.get(uname).score) {
                    uniqueUsers.set(uname, {
                        username: data.username,
                        avatar: data.avatar,
                        score: data.score,
                        payload: data.data 
                    });
                }
            }
        });

        // Convertir a Array, reordenar y tomar los mejores 50
        const topPlayers = Array.from(uniqueUsers.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);

        return topPlayers;
    } catch (e) {
        console.error("Error leyendo Leaderboard: ", e);
        return [];
    }
};

window.getUserRankStats = async function (userScore) {
    if (!db) return null;
    try {
        const ref = collection(db, "jugadores");

        // Conteo total de jugadores
        const totalSnap = await getCountFromServer(ref);
        const total = totalSnap.data().count;

        // Conteo de jugadores con más puntaje que yo
        const qHigher = query(ref, where("score", ">", userScore));
        const higherSnap = await getCountFromServer(qHigher);
        const higherCount = higherSnap.data().count;

        const rank = higherCount + 1;
        let topPercent = Math.max(1, Math.round((rank / total) * 100));
        if (topPercent > 99) topPercent = 99; // Para mantenerlo estético

        return {
            rank: rank,
            total: total,
            percentile: topPercent,
            score: userScore
        };
    } catch (e) {
        console.error("Error pidiendo estadisticas porcentuales: ", e);
        return null;
    }
};
