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

// Reconocimiento Pasivo (ID Único Falso de Hardware)
function getOrSetUserId() {
    let uid = localStorage.getItem('mindustryClickerCloudID');
    if (!uid) {
        uid = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
        localStorage.setItem('mindustryClickerCloudID', uid);
    }
    return uid;
}

window.saveToCloud = async function (username, saveDataObj, score, avatarUrl) {
    if (!db) return false;

    // 🔒 Bloqueo: Solo usuarios verificados con Discord pueden subir al Leaderboard
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
        // Filtrar a los mejores 50, de mayor a menor cobre
        const q = query(ref, orderBy("score", "desc"), limit(50));
        const snapshots = await getDocs(q);

        const topPlayers = [];
        snapshots.forEach((doc) => {
            const data = doc.data();
            topPlayers.push({
                username: data.username,
                avatar: data.avatar,
                score: data.score,
                payload: data.data // Exportamos todo el estado de la partida para desglosarlo
            });
        });
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
