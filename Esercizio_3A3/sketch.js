window.onload = function() {
    // Canvas e contesto grafico
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    
    // Dimensioni del gioco
    const width = canvas.width;
    const height = canvas.height;
    
    // Variabili di gioco
    let gameStarted = false;
    let animationId;
    let gameOver = false;
    
    // Timer della partita (60 secondi)
    let timeRemaining = 60; // in secondi
    let timerInterval;
    
    // Punteggi
    let scoreLeft = 0;
    let scoreRight = 0;
    
    // Caratteri Matrix
    const matrixChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
    
    // Racchette
    const paddleWidth = 10;
    const paddleHeight = 80;
    const paddleSpeed = 8;
    
    // Racchetta sinistra (Giocatore 1)
    const leftPaddle = {
        x: 20,
        y: height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        dy: 0
    };
    
    // Racchetta destra (Giocatore 2)
    const rightPaddle = {
        x: width - 20 - paddleWidth,
        y: height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        dy: 0
    };
    
    // Pallina
    const ball = {
        x: width / 2,
        y: height / 2,
        radius: 8,
        speed: 8,
        dx: 0,
        dy: 0,
        trail: [], // Array per memorizzare tutte le posizioni della pallina (permanente)
        lastPos: {x: 0, y: 0} // Ultima posizione per registrazione trail
    };
    
    // Controlli da mouse e tastiera
    const mouse = {
        y: height / 2
    };
    
    // Traccia la posizione del mouse
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        mouse.y = e.clientY - rect.top;
    });
    
    // Evento click per iniziare il gioco se non è iniziato o ricominciare se è finito
    canvas.addEventListener('click', function() {
        if (!gameStarted && !gameOver) {
            startGame();
        } else if (gameOver) {
            // Reset del gioco
            scoreLeft = 0;
            scoreRight = 0;
            updateScore();
            startGame();
        }
    });
    
    // Spazio per iniziare il gioco
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && !gameStarted && !gameOver) {
            startGame();
        }
    });
    
    // Inizializza il gioco
    function startGame() {
        if (gameStarted) return;
        
        gameStarted = true;
        gameOver = false;
        resetBall();
        
        // Resetta e avvia il timer
        timeRemaining = 60;
        updateTimer();
        
        // Avvia il timer che diminuisce ogni secondo
        timerInterval = setInterval(function() {
            timeRemaining--;
            updateTimer();
            
            if (timeRemaining <= 0) {
                endGame();
            }
        }, 1000);
        
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        gameLoop();
    }
    
    // Termina il gioco
    function endGame() {
        gameStarted = false;
        gameOver = true;
        clearInterval(timerInterval);
        
        // La scia rimane visibile
        
        // Determina il vincitore
        const winner = scoreLeft > scoreRight ? "Giocatore" : scoreRight > scoreLeft ? "Computer" : "Pareggio";
        const resultText = scoreLeft === scoreRight ? "Pareggio!" : `${winner} vince!`;
        
        // Mostra il risultato
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(width/2 - 150, height/2 - 60, 300, 120);
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 255, 0, 1)';
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Partita Terminata!', width/2, height/2 - 20);
        ctx.fillText(resultText, width/2, height/2 + 20);
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.fillText('Clicca per ricominciare', width/2, height/2 + 50);
        ctx.shadowBlur = 0;
    }
    
    // Aggiorna il timer
    function updateTimer() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Effetto di lampeggio negli ultimi 10 secondi
        if (timeRemaining <= 10) {
            timerDisplay.style.color = timeRemaining % 2 === 0 ? '#ff0000' : '#00ff00';
        } else {
            timerDisplay.style.color = '#00ff00';
        }
    }
    
    // Reset della pallina
    function resetBall() {
        ball.x = width / 2;
        ball.y = height / 2;
        // NON resettiamo la scia per farla rimanere permanente
        
        // Direzione casuale ma equilibrata
        const angle = (Math.random() * Math.PI/4) + Math.PI/4; // Angolo tra 45° e 90°
        const direction = Math.random() < 0.5 ? 1 : -1; // Direzione casuale
        
        ball.dx = Math.cos(angle) * ball.speed * direction;
        ball.dy = Math.sin(angle) * ball.speed * (Math.random() < 0.5 ? 1 : -1);
        
        // Registra la posizione iniziale per la scia
        ball.lastPos = {x: ball.x, y: ball.y};
    }
    
    // Aggiorna il punteggio
    function updateScore() {
        scoreDisplay.innerText = `${scoreLeft} - ${scoreRight}`;
    }
    
    // Disegna una racchetta
    function drawPaddle(paddle) {
        ctx.fillStyle = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 255, 0, 0.7)';
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.shadowBlur = 0;
    }
    
    // Genera un carattere Matrix casuale
    function getRandomMatrixChar() {
        return matrixChars[Math.floor(Math.random() * matrixChars.length)];
    }
    
    // Disegna la scia permanente della pallina con effetto Matrix
    function drawBallTrail() {
        // Per evitare lag con troppe particelle, disegniamo al massimo le ultime 2000
        const displayLimit = 2000;
        const startIdx = Math.max(0, ball.trail.length - displayLimit);
        
        ctx.font = '14px "Courier New", monospace';
        
        for (let i = startIdx; i < ball.trail.length; i++) {
            const pos = ball.trail[i];
            // Colore leggermente variabile per creare un effetto Matrix
            const brightness = 50 + Math.floor(Math.random() * 50); // Varia da 50% a 100%
            const alpha = 0.2 + Math.random() * 0.5; // Varia da 0.2 a 0.7
            
            // Disegna un carattere Matrix invece di un punto
            ctx.fillStyle = `rgba(0, ${brightness + 100}, 0, ${alpha})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Usiamo un carattere casuale dalla lista
            const char = getRandomMatrixChar();
            
            // Applicare un leggero effetto glow ai caratteri
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
            
            ctx.fillText(char, pos.x, pos.y);
        }
        
        // Aggiungiamo un effetto glow più forte alle ultime 20 posizioni
        const glowLimit = Math.min(20, ball.trail.length);
        const glowStartIdx = Math.max(0, ball.trail.length - glowLimit);
        
        for (let i = glowStartIdx; i < ball.trail.length; i++) {
            const pos = ball.trail[i];
            const alpha = (i - glowStartIdx) / glowLimit; // Opacità basata sulla posizione
            const char = getRandomMatrixChar();
            
            ctx.font = '18px "Courier New", monospace';
            ctx.fillStyle = `rgba(0, 255, 0, ${alpha * 0.8})`;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(0, 255, 0, 0.9)';
            ctx.fillText(char, pos.x, pos.y);
        }
        
        // Resetta l'effetto shadow per il resto del rendering
        ctx.shadowBlur = 0;
    }
    
    // Disegna la pallina
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Effetto glow principale
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 255, 0, 1)';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    // Disegna la linea centrale
    function drawCenterLine() {
        ctx.beginPath();
        ctx.setLineDash([10, 10]);
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Aggiorna la posizione della pallina
    function updateBall() {
        // Aggiorna la posizione
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Aggiungiamo punti alla scia solo quando la pallina si è spostata abbastanza
        // per creare un pattern più distinto invece di una linea continua
        const distance = Math.sqrt(
            Math.pow(ball.x - ball.lastPos.x, 2) + 
            Math.pow(ball.y - ball.lastPos.y, 2)
        );
        
        if (distance > 5) { // Distanza minima per aggiungere un nuovo punto
            ball.trail.push({x: ball.x, y: ball.y});
            ball.lastPos = {x: ball.x, y: ball.y};
            
            // Limitiamo il numero totale di punti per evitare lag
            if (ball.trail.length > 8000) {
                // Rimuoviamo alcuni punti dal centro invece che tutti dall'inizio
                // per mantenere sia i pattern vecchi che quelli nuovi
                ball.trail = ball.trail.slice(0, 3000).concat(ball.trail.slice(5000));
            }
        }
        
        // Collisione con i bordi superiore e inferiore
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > height) {
            ball.dy = -ball.dy;
            // Correzione posizione per evitare "incollamento" ai bordi
            if (ball.y - ball.radius < 0) {
                ball.y = ball.radius;
            } else {
                ball.y = height - ball.radius;
            }
        }
        
        // Collisione con la racchetta sinistra
        if (ball.dx < 0 && 
            ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
            ball.x + ball.radius >= leftPaddle.x &&
            ball.y >= leftPaddle.y &&
            ball.y <= leftPaddle.y + leftPaddle.height) {
            
            // Calcola il punto di impatto (da -1 a 1, dove 0 è il centro della racchetta)
            const impact = (ball.y - (leftPaddle.y + leftPaddle.height/2)) / (leftPaddle.height/2);
            
            // Modifica angolo basato sul punto di impatto
            const maxAngle = Math.PI/3; // 60 gradi
            const angle = impact * maxAngle;
            
            // Aumenta più significativamente la velocità ad ogni rimbalzo
            ball.speed = Math.min(ball.speed + 0.4, 16);
            
            ball.dx = ball.speed * Math.cos(angle);
            ball.dy = ball.speed * Math.sin(angle);
        }
        
        // Collisione con la racchetta destra
        if (ball.dx > 0 && 
            ball.x + ball.radius >= rightPaddle.x &&
            ball.x - ball.radius <= rightPaddle.x + rightPaddle.width &&
            ball.y >= rightPaddle.y &&
            ball.y <= rightPaddle.y + rightPaddle.height) {
            
            // Calcola il punto di impatto (da -1 a 1, dove 0 è il centro della racchetta)
            const impact = (ball.y - (rightPaddle.y + rightPaddle.height/2)) / (rightPaddle.height/2);
            
            // Modifica angolo basato sul punto di impatto
            const maxAngle = Math.PI/3; // 60 gradi
            const angle = impact * maxAngle;
            
            // Aumenta più significativamente la velocità ad ogni rimbalzo
            ball.speed = Math.min(ball.speed + 0.4, 16);
            
            ball.dx = -ball.speed * Math.cos(angle);
            ball.dy = ball.speed * Math.sin(angle);
        }
        
        // Punteggio - pallina esce a sinistra
        if (ball.x - ball.radius < 0) {
            scoreRight++;
            updateScore();
            resetBall();
        }
        
        // Punteggio - pallina esce a destra
        if (ball.x + ball.radius > width) {
            scoreLeft++;
            updateScore();
            resetBall();
        }
    }
    
    // Aggiorna le racchette in base ai controlli
    function updatePaddles() {
        // Controllo racchetta sinistra con il mouse
        // Aggiungiamo un po' di interpolazione per un movimento più fluido
        const targetY = mouse.y - leftPaddle.height / 2;
        leftPaddle.y += (targetY - leftPaddle.y) * 0.2;
        
        // IA per la racchetta destra
        // L'IA cerca di predire dove sarà la palla
        if (ball.dx > 0) { // Se la palla si sta muovendo verso la racchetta destra
            // Calcola dove la palla colpirà il lato destro
            // Questo è un calcolo approssimativo per rendere l'IA non perfetta
            const distanceToRightPaddle = rightPaddle.x - ball.x;
            const timeToImpact = distanceToRightPaddle / ball.dx;
            const predictedY = ball.y + ball.dy * timeToImpact;
            
            // Target con un po' di errore per rendere l'IA imperfetta
            const errorFactor = Math.random() * 30 - 15; // Errore di +/- 15 pixel
            const targetY = predictedY - rightPaddle.height / 2 + errorFactor;
            
            // Muovi verso il target con velocità limitata per rendere l'IA più realistica
            if (rightPaddle.y + 5 < targetY) {
                rightPaddle.dy = paddleSpeed * 0.7;
            } else if (rightPaddle.y - 5 > targetY) {
                rightPaddle.dy = -paddleSpeed * 0.7;
            } else {
                rightPaddle.dy = 0;
            }
        } else {
            // Se la palla si allontana, torna lentamente al centro
            const targetY = height / 2 - rightPaddle.height / 2;
            if (rightPaddle.y + 5 < targetY) {
                rightPaddle.dy = paddleSpeed * 0.3;
            } else if (rightPaddle.y - 5 > targetY) {
                rightPaddle.dy = -paddleSpeed * 0.3;
            } else {
                rightPaddle.dy = 0;
            }
        }
        
        // Aggiorna posizione della racchetta destra
        rightPaddle.y += rightPaddle.dy;
        
        // Limita le racchette allo schermo
        if (leftPaddle.y < 0) leftPaddle.y = 0;
        if (leftPaddle.y + leftPaddle.height > height) leftPaddle.y = height - leftPaddle.height;
        
        if (rightPaddle.y < 0) rightPaddle.y = 0;
        if (rightPaddle.y + rightPaddle.height > height) rightPaddle.y = height - rightPaddle.height;
    }
    
    // Disegna lo stato iniziale
    function drawStartScreen() {
        ctx.clearRect(0, 0, width, height);
        
        // Disegna eventuali scie precedenti
        if (ball.trail.length > 0) {
            drawBallTrail();
        }
        
        drawCenterLine();
        drawPaddle(leftPaddle);
        drawPaddle(rightPaddle);
        
        // Effetto glow per il testo
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 255, 0, 1)';
        
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 22px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Clicca o premi SPAZIO per iniziare', width/2, height/2);
        
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.fillText('Controlla con il mouse', width/2, height/2 + 30);
        
        // Aggiungiamo alcuni caratteri Matrix casuali nello sfondo per dare l'atmosfera
        ctx.font = '18px "Courier New", monospace';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const char = getRandomMatrixChar();
            const opacity = Math.random() * 0.4 + 0.1;
            
            ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
            ctx.fillText(char, x, y);
        }
        
        // Resetta effetto glow
        ctx.shadowBlur = 0;
    }
    
    // Loop principale del gioco
    function gameLoop() {
        // Pulisci il canvas
        ctx.clearRect(0, 0, width, height);
        
        // Disegna la scia permanente (anche a gioco fermo)
        if (ball.trail.length > 0) {
            drawBallTrail();
        }
        
        // Aggiorna e disegna gli elementi
        drawCenterLine();
        
        if (gameStarted && !gameOver) {
            updatePaddles();
            updateBall();
        }
        
        drawPaddle(leftPaddle);
        drawPaddle(rightPaddle);
        
        if (gameStarted && !gameOver) {
            drawBall();
        }
        
        // Richiedi il prossimo frame se il gioco è in corso
        if (!gameOver) {
            animationId = requestAnimationFrame(gameLoop);
        }
    }
    
    // Inizializza il gioco
    updateScore();
    drawStartScreen();
};