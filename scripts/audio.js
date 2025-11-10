// audio.js Aun sin implementar

document.addEventListener('DOMContentLoaded', () => {
    const music = document.getElementById('background-music');
    
    document.body.classList.add('custom-background');
    
    let musicStarted = false;

    function tryStartMusic() {
        if (!musicStarted && music) {
            music.volume = 0.5;
            
            music.play().then(() => {
                musicStarted = true;
                console.log("Música de fondo iniciada.");
                
                document.removeEventListener('click', tryStartMusic, true);
                document.removeEventListener('keydown', tryStartMusic, true);
            }).catch(error => {
                console.log("La reproducción de audio fue bloqueada. Esperando interacción:", error.message);
            });
        }
    }

    document.addEventListener('click', tryStartMusic, true);
    document.addEventListener('keydown', tryStartMusic, true);

});
