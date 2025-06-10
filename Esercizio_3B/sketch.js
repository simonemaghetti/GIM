document.addEventListener('DOMContentLoaded', function() {
    const spinner = document.getElementById('spinner');
    const toggleButton = document.getElementById('toggle-button');
    
    const clock1 = document.getElementById('clock1');
    const clock2 = document.getElementById('clock2');
    const clock3 = document.getElementById('clock3');
    
    let rotation = 0;
    let speed = 0;
    let isDragging = false;
    let startX, startY;
    let lastMouseX, lastMouseY;
    let lastRotation = 0;
    let animationId;
    let isSpinning = false;
    
    // Funzione per aggiornare gli orologi
    function updateClocks() {
        // Ottieni l'orario attuale in UTC
        const now = new Date();
        
        // New York (UTC-4 o UTC-5 a seconda dell'ora legale)
        const nyOffset = -4; // Modifica in base all'ora legale se necessario
        const nyTime = new Date(now.getTime() + (nyOffset * 60 + now.getTimezoneOffset()) * 60000);
        const nyHours = nyTime.getHours().toString().padStart(2, '0');
        const nyMinutes = nyTime.getMinutes().toString().padStart(2, '0');
        const nySeconds = nyTime.getSeconds().toString().padStart(2, '0');
        const nyTimeString = `${nyHours}:${nyMinutes}:${nySeconds}`;
        
        // Mendrisio (UTC+2 o UTC+1 a seconda dell'ora legale - Svizzera)
        const mendrisioOffset = 2; // Modifica in base all'ora legale se necessario
        const mendrisioTime = new Date(now.getTime() + (mendrisioOffset * 60 + now.getTimezoneOffset()) * 60000);
        const mendrisioHours = mendrisioTime.getHours().toString().padStart(2, '0');
        const mendrisioMinutes = mendrisioTime.getMinutes().toString().padStart(2, '0');
        const mendrisioSeconds = mendrisioTime.getSeconds().toString().padStart(2, '0');
        const mendrisioTimeString = `${mendrisioHours}:${mendrisioMinutes}:${mendrisioSeconds}`;
        
        // Tokyo (UTC+9)
        const tokyoOffset = 9;
        const tokyoTime = new Date(now.getTime() + (tokyoOffset * 60 + now.getTimezoneOffset()) * 60000);
        const tokyoHours = tokyoTime.getHours().toString().padStart(2, '0');
        const tokyoMinutes = tokyoTime.getMinutes().toString().padStart(2, '0');
        const tokyoSeconds = tokyoTime.getSeconds().toString().padStart(2, '0');
        const tokyoTimeString = `${tokyoHours}:${tokyoMinutes}:${tokyoSeconds}`;
        
        // Aggiorna i display degli orologi
        clock1.textContent = nyTimeString;
        clock2.textContent = mendrisioTimeString;
        clock3.textContent = tokyoTimeString;
    }
    
    // Aggiorna gli orologi ogni secondo
    setInterval(updateClocks, 1000);
    
    // Funzione per aggiornare la rotazione dello spinner
    function updateSpinner() {
        rotation += speed;
        spinner.style.transform = `rotate(${rotation}deg)`;
        
        if (speed > 0) {
            // Decelera gradualmente lo spinner (attrito)
            speed = Math.max(0, speed - 0.1);
            
            if (speed === 0) {
                stopSpinner();
            }
        }
        
        animationId = requestAnimationFrame(updateSpinner);
    }
    
    // Funzione per avviare lo spinner con una velocità casuale
    function startSpinner() {
        speed = Math.random() * 15 + 10; // Velocità casuale tra 10 e 25
        isSpinning = true;
        toggleButton.textContent = "FERMA";
        
        if (!animationId) {
            animationId = requestAnimationFrame(updateSpinner);
        }
    }
    
    // Funzione per fermare lo spinner
    function stopSpinner() {
        speed = 0;
        isSpinning = false;
        toggleButton.textContent = "GIRA";
        
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    
    // Event listener per il pulsante toggle
    toggleButton.addEventListener('click', function() {
        if (isSpinning) {
            stopSpinner();
        } else {
            startSpinner();
        }
    });
    
    // Event listeners per il trascinamento
    spinner.addEventListener('mousedown', function(e) {
        isDragging = true;
        spinner.style.cursor = 'grabbing';
        
        const rect = spinner.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        startX = e.clientX - centerX;
        startY = e.clientY - centerY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        // Calcola l'angolo iniziale
        lastRotation = Math.atan2(startY, startX) * (180 / Math.PI);
        
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const rect = spinner.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        // Calcola il nuovo angolo
        const currentRotation = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
        
        // Calcola la differenza tra gli angoli
        let rotationDiff = currentRotation - lastRotation;
        
        // Gestisci il salto da 180 a -180 gradi
        if (rotationDiff > 180) rotationDiff -= 360;
        if (rotationDiff < -180) rotationDiff += 360;
        
        // Aggiorna la rotazione e la velocità
        rotation += rotationDiff;
        speed = rotationDiff * 2; // Moltiplica per un fattore per rendere la rotazione più reattiva
        
        spinner.style.transform = `rotate(${rotation}deg)`;
        
        // Aggiorna lo stato del pulsante
        if (Math.abs(speed) > 1) {
            isSpinning = true;
            toggleButton.textContent = "FERMA";
        }
        
        lastRotation = currentRotation;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        if (!animationId) {
            animationId = requestAnimationFrame(updateSpinner);
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            spinner.style.cursor = 'grab';
        }
    });
    
    // Avvia l'animazione e gli orologi
    updateClocks();
});