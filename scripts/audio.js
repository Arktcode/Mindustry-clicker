// audio.js

document.addEventListener('DOMContentLoaded', () => {
    const music = document.getElementById('background-music');
    
    // Aplica la clase de fondo al <body> para activar el CSS de fondo.
    document.body.classList.add('custom-background');
    
    let musicStarted = false;

    // Función que intenta iniciar la música
    function tryStartMusic() {
        if (!musicStarted && music) {
            music.volume = 0.5; // Ajusta el volumen a tu gusto (0.0 a 1.0)
            
            // Intenta reproducir.
            music.play().then(() => {
                musicStarted = true;
                console.log("Música de fondo iniciada.");
                
                // Limpia los listeners una vez que la música ha comenzado
                document.removeEventListener('click', tryStartMusic, true);
                document.removeEventListener('keydown', tryStartMusic, true);
            }).catch(error => {
                console.log("La reproducción de audio fue bloqueada. Esperando interacción:", error.message);
            });
        }
    }

    // Usamos el 'capture phase' (tercer argumento 'true') para atrapar el evento antes que otros handlers
    document.addEventListener('click', tryStartMusic, true);
    document.addEventListener('keydown', tryStartMusic, true);
});