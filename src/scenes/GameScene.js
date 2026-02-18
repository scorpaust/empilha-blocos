import { crazyGamesAds } from "../CrazyGamesAds.js"

// ===== GAME SCENE =====
export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.gameMode = data?.mode || 'normal';
        this.blocks = [];
        this.currentBlock = null;
        this.blockWidth = 150;
        this.blockHeight = 40;
        this.baseSpeed = 150;
        this.speed = 150;
        this.score = 0;
        this.combo = 0;
        this.perfectCount = 0;
        this.gameOver = false;
        this.timeRemaining = 60;
        this.powerupSpawnCounter = 0;
        this.currentPowerup = null;
        this.level = 1;
        
        this.colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181];
        this.perfectThreshold = 5;
        
        this.activePowerups = {
            slowMo: false,
            wideBlock: false,
            perfectAssist: false,
            timeFreeze: false
        };

        this.ghostMode = false;  // ← E ISTO!
        
        this.ui = {};

        this.achievements = {
            firstPerfect: false,
            combo5: false,
            level10: false,
            score500: false
        };

        this.recordShown = false; // ← ADICIONA AQUI
    }

    preload() {
        crazyGamesAds.loadStart?.(); // ← se o teu wrapper suportar

        this.load.audio('musica_jogo', 'assets/musica_jogo.mp3');

        this.load.on('complete', () => {
            crazyGamesAds.loadStop?.(); // ← fim do carregamento de assets
        });
    }

    checkAchievement(key, condition, message) {
    
        if (!this.achievements[key] && condition) {
            this.achievements[key] = true;
            
            const badge = this.add.rectangle(1100, 100, 300, 80, 0x000000, 0.9).setDepth(9999);
            const text = this.add.text(1100, 100, message, {
                fontSize: '16px',
                fill: '#ffd700',
                align: 'center'
            }).setOrigin(0.5).setDepth(9999);
            
            this.tweens.add({
                targets: [badge, text],
                x: 1100,
                alpha: 0,
                duration: 3000,
                delay: 2000,
                onComplete: () => {
                    badge.destroy();
                    text.destroy();
                }
            });
            
            this.playSound(1200);
        }
    }

    create() {
        this.cameras.main.setBackgroundColor('#2d3561');
        this.setupAudio();
        this.createUI();
        this.createBaseBlock();
        this.spawnBlock();

        crazyGamesAds.gameplayStart();

        // ← ADICIONA ESTE BLOCO (estava no create() original, desapareceu no refactor)
        try {
            this.sound.stopAll();
            this.musicaJogo = this.sound.add('musica_jogo', { loop: true, volume: 0.3 });
            this.musicaJogo.play();
        } catch (e) {}

        this.input.on('pointerdown', this.handleClick, this);

        const instructions = this.add.text(640, 360, 'CLICA PARA SOLTAR', {
            fontSize: '28px', fill: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1000);

        this.time.delayedCall(2000, () => {
            if (instructions?.scene) instructions.destroy();
            crazyGamesAds.gameplayStart(); // ← agora sim: jogo pronto a jogar
        });

        this.events.once('shutdown', () => crazyGamesAds.gameplayStop());

        // Konami code: ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA
        this.konamiCode = [];
        this.input.keyboard.on('keydown', (event) => {
            const code = [38,38,40,40,37,39,37,39,66,65]; // arrow keys + B + A
            this.konamiCode.push(event.keyCode);
            if (this.konamiCode.length > 10) this.konamiCode.shift();
            
            if (JSON.stringify(this.konamiCode) === JSON.stringify(code)) {
                this.showComment('🎮 MODO DEUS ATIVADO! 🎮', '#ffd700');
                this.blockWidth = 250; // Blocos enormes!
                this.perfectThreshold = 50; // Tudo é perfect!
            }
        });
    }

    setupAudio() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.playSound = (freq) => {
                try {
                    if (ctx.state === 'suspended') ctx.resume();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.3, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.1);
                } catch (e) {}
            };
        } catch (e) {
            this.playSound = () => {};
        }
    }

    createUI() {
        const menuBtn = this.add.text(1240, 680, '🏠 Menu', {
            fontSize: '20px', fill: '#4ecdc4', fontStyle: 'bold'
        }).setOrigin(1).setDepth(1000).setInteractive();
        menuBtn.on('pointerover', () => menuBtn.setStyle({ fill: '#ffe66d' }));
        menuBtn.on('pointerout', () => menuBtn.setStyle({ fill: '#4ecdc4' }));
        menuBtn.on('pointerdown', () => {
            if (this.musicaJogo) this.musicaJogo.stop();
            crazyGamesAds.gameplayStop();
            this.scene.start('MenuScene');
        });

        this.ui.score = this.add.text(20, 20, 'Pontos: 0', {
            fontSize: '22px', fill: '#fff', fontStyle: 'bold'
        }).setDepth(1000);

        this.ui.combo = this.add.text(20, 50, '', {
            fontSize: '18px', fill: '#ffe66d', fontStyle: 'bold'
        }).setDepth(1000);

        this.ui.level = this.add.text(20, 80, 'Nível: 1', {
            fontSize: '18px', fill: '#95e1d3', fontStyle: 'bold'
        }).setDepth(1000);

        const modes = { normal: '📦 NORMAL', timed: '⏱️ TEMPO', zen: '😌 ZEN' };
        this.ui.mode = this.add.text(1260, 20, modes[this.gameMode] || '', {
            fontSize: '18px', fill: '#4ecdc4'
        }).setOrigin(1, 0).setDepth(1000);

        this.ui.powerup = this.add.text(640, 690, '', {
            fontSize: '16px', fill: '#95e1d3'
        }).setOrigin(0.5).setDepth(1000);

        if (this.gameMode === 'timed') {
            this.ui.timer = this.add.text(1260, 50, '60s', {
                fontSize: '22px', fill: '#ff6b6b', fontStyle: 'bold'
            }).setOrigin(1, 0).setDepth(1000);

            this.timerEvent = this.time.addEvent({
                delay: 1000,
                callback: () => {
                    if (this.gameOver || this.activePowerups.timeFreeze) return;
                    this.timeRemaining--;
                    if (this.ui.timer?.scene) {
                        this.ui.timer.setText(this.timeRemaining + 's');
                        if (this.timeRemaining <= 10) this.ui.timer.setStyle({ fill: '#ff6b6b' });
                    }
                    if (this.timeRemaining <= 0) this.endGame();
                },
                loop: true
            });
        }
    }

    createBaseBlock() {
        const base = this.add.rectangle(640, 650, this.blockWidth, this.blockHeight, 0x95e1d3);
        this.blocks.push({ sprite: base, x: 640, y: 650, width: this.blockWidth });
    }

    spawnBlock() {
        if (this.gameOver) return;

        if (this.currentPowerup?.sprite && this.powerupSpawnCounter >= 5) {
            this.currentPowerup.sprite.destroy();
            this.currentPowerup = null;
        }

        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        let width = this.blockWidth;
        if (this.activePowerups.wideBlock) width = Math.min(width * 1.5, 250);
        
        // CRIAR O BLOCO PRIMEIRO!
        this.currentBlock = {
            sprite: this.add.rectangle(100, 100, width, this.blockHeight, color),
            x: 100,
            y: 100,
            width: width,
            moving: true,
            direction: 1
        };

        // DEPOIS verificar se é mistério (1% de chance)
        if (Math.random() < 0.01 && this.blocks.length > 3) {
            this.currentBlock.mystery = true;
            this.currentBlock.sprite.setFillStyle(0x000000); // Preto
            
            const questionMark = this.add.text(100, 100, '???', {
                fontSize: '24px',
                fill: '#fff',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(600);
            
            this.currentBlock.questionMark = questionMark;
        }

        this.powerupSpawnCounter++;
        
        if (this.powerupSpawnCounter >= 5 && !this.currentPowerup && this.blocks.length > 0) {
            
        const icons = { slowMo: '🐌', wideBlock: '📏', perfectAssist: '🎯', ghost: '👻' };
        // Só adiciona timeFreeze no modo timed
        
        if (this.gameMode === 'timed') {
            icons.timeFreeze = '⏰';
        }
        const types = Object.keys(icons);

        const type = types[Math.floor(Math.random() * types.length)];
        
        const x = 200 + Math.random() * 880;
        const y = 100;
        
        this.currentPowerup = {
            sprite: this.add.text(x, y, icons[type], { fontSize: '36px' }).setDepth(500),
            type: type,
            x: x,
            y: y
        };
        
        this.tweens.add({
                targets: this.currentPowerup.sprite,
                y: y + 10,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
            
            this.powerupSpawnCounter = 0;
        }

        this.showAimGuides()
    }

    showAimGuides() {
        this.clearAimGuides();
        if (!this.activePowerups.perfectAssist) return;

        const last = this.blocks[this.blocks.length - 1];
        if (!last) return;

        const threshold = this.perfectThreshold * 3; // igual ao usado no checkLanding
        const left  = last.x - threshold;
        const right = last.x + threshold;
        const y     = last.y - this.blockHeight; // Y onde o bloco vai aterrar

        // Linha central (verde)
        this.aimCenter = this.add.rectangle(last.x, y - 4, 4, this.blockHeight + 8, 0x00ff88, 0.9)
            .setDepth(800);

        // Zona verde translúcida
        this.aimZone = this.add.rectangle(last.x, y, threshold * 2, this.blockHeight, 0x00ff88, 0.25)
            .setDepth(800);

        // Linhas verticais dos limites
        this.aimLeft  = this.add.rectangle(left,  y, 2, this.blockHeight, 0x00ff88, 0.8).setDepth(800);
        this.aimRight = this.add.rectangle(right, y, 2, this.blockHeight, 0x00ff88, 0.8).setDepth(800);

        // Piscar suave
        this.tweens.add({
            targets: [this.aimZone, this.aimLeft, this.aimRight, this.aimCenter],
            alpha: 0.1,
            duration: 400,
            yoyo: true,
            repeat: -1
        });
    }

    clearAimGuides() {
        [this.aimCenter, this.aimZone, this.aimLeft, this.aimRight].forEach(g => {
            if (g) { this.tweens.killTweensOf(g); g.destroy(); }
        });
        this.aimCenter = this.aimZone = this.aimLeft = this.aimRight = null;
    }

    handleClick() {
        if (this.gameOver || !this.currentBlock?.moving) return;
        
        this.playSound(300);
        this.currentBlock.moving = false;

        const last = this.blocks[this.blocks.length - 1];
        const targetY = last.y - this.blockHeight;
        
        this.tweens.add({
            targets: this.currentBlock.sprite,
            y: targetY,
            duration: 300,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                if (!this.gameOver) this.checkLanding(this.currentBlock, last, targetY);
            }
        });
    }

    // No checkLanding, adicione isto:
    showComment(text, color = '#ffe66d') {
        if (this.commentText) this.commentText.destroy();
        
        this.commentText = this.add.text(640, 250, text, {
            fontSize: '28px',
            fill: color,
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(999);
        
        this.tweens.add({
            targets: this.commentText,
            y: 200,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                if (this.commentText) this.commentText.destroy();
            }
        });
    }

    checkLanding(current, last, targetY) {
        if (!current?.sprite) return;

        const left1 = current.x - current.width / 2;
        const right1 = current.x + current.width / 2;
        const left2 = last.x - last.width / 2;
        const right2 = last.x + last.width / 2;
        
        const overlap = Math.min(right1, right2) - Math.max(left1, left2);
        
        if (overlap <= 0) {
            if (this.gameMode === 'zen') {
                this.combo = 0;                          // ← ADICIONADO
                this.updateUI();
                current.sprite.destroy();
                this.time.delayedCall(300, () => this.spawnBlock());
                return;
            }

            if (this.ghostMode) {
                this.ghostMode = false;
                this.combo = 0;                          // ← ADICIONADO
                this.updateUI();
                this.showComment('👻 FANTASMA USADO!', '#4ecdc4');
                current.sprite.destroy();
                this.time.delayedCall(300, () => this.spawnBlock());
                return;
            }

            this.playSound(150);
            this.endGame();
            return;
        }

        const newLeft = Math.max(left1, left2);
        const newRight = Math.min(right1, right2);
        const newWidth = newRight - newLeft;
        const newX = (newLeft + newRight) / 2;

        // ← ADICIONA ISTO MESMO A SEGUIR:
        const MIN_WIDTH = 2; // px mínimos para continuar
        if (newWidth < MIN_WIDTH) {
            if (this.gameMode === 'zen') {
                // No zen não perde, mas reseta o bloco
                this.combo = 0;
                this.updateUI();
                current.sprite.destroy();
                this.time.delayedCall(300, () => this.spawnBlock());
                return;
            }
            // Nos outros modos, perde
            this.playSound(150);
            current.sprite.destroy();
            this.endGame();
            return;
        }
        
        // Aumenta o threshold se perfectAssist estiver ativo
        const threshold = this.activePowerups.perfectAssist 
            ? this.perfectThreshold * 3  // 3x mais fácil
            : this.perfectThreshold;
            
        const isPerfect = Math.abs(current.x - last.x) < threshold;

        // No checkLanding, adicione efeitos aleatórios:
        if (current.mystery) {
            const effects = [
                () => { this.score += 100; this.showComment('💰 +100 PONTOS!'); },
                () => { this.blockWidth = Math.min(this.blockWidth * 1.5, 250); this.showComment('📏 BLOCO MAIOR!'); },
                () => { this.combo += 5; this.showComment('🔥 +5 COMBO!'); },
                () => { this.cameras.main.flash(500); this.showComment('⚡ FLASH!'); },
                () => { 
                    this.blocks.forEach(b => {
                        if (b?.sprite) b.sprite.setFillStyle(0xffd700);
                    });
                    this.showComment('✨ BLOCOS DOURADOS!');
                }
            ];
            
            const effect = effects[Math.floor(Math.random() * effects.length)];  // ← CORRETO
            effect();
            
            if (current.questionMark) current.questionMark.destroy();
        }
      

        // No checkLanding, depois de isPerfect:
        if (isPerfect) {
            this.combo++;
            this.score += 10 + this.combo * 5;          // ← bónus de combo mais visível
            this.playSound(600);
            this.cameras.main.flash(100, 255, 255, 255);

            const comments = ['PERFEITO! 🎯', 'UAU! 🌟', 'INCRÍVEL! ⚡', 'CONTINUA! 🔥'];
            this.showComment(comments[Math.floor(Math.random() * comments.length)]);
            
            // confetti (mantém o teu código existente aqui)
            const emojis = ['⭐', '✨', '💫', '🌟', '⚡'];
            for (let i = 0; i < 5; i++) {
                const emoji = this.add.text(
                    newX + (Math.random() - 0.5) * 100,
                    targetY,
                    emojis[Math.floor(Math.random() * emojis.length)],
                    { fontSize: '24px' }
                ).setDepth(999);
                this.tweens.add({
                    targets: emoji,
                    y: targetY - 100,
                    x: emoji.x + (Math.random() - 0.5) * 200,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => emoji.destroy()
                });
            }
        } else {
            this.combo = 0;
            this.score += 5;

            if (overlap < 30) {
                this.showComment('POR POUCO! 😅', '#ff6b6b'); // ← SEM .setPadding()
            }
        }

        this.updateUI();

        const color = this.combo >= 5 ? 0xffd700 : (this.combo >= 3 ? 0xff6b6b : current.sprite.fillColor);
        current.sprite.destroy();
        current.sprite = this.add.rectangle(newX, targetY, newWidth, this.blockHeight, color);
        current.x = newX;
        current.y = targetY;
        current.width = newWidth;

        // ← APENAS UM blocks.push — apaga a linha duplicada que estava a seguir!
        this.blocks.push(current);
        this.blockWidth = Math.max(newWidth, MIN_WIDTH);

        if (this.combo >= 10) {
            // Modo Arco-Íris!
            this.tweens.addCounter({
                from: 0,
                to: 360,
                duration: 2000,
                repeat: -1,
                onUpdate: (tween) => {
                    if (current?.sprite?.scene) {
                        const hue = Phaser.Display.Color.HSVToRGB(tween.getValue() / 360, 1, 1);
                        current.sprite.setFillStyle(Phaser.Display.Color.GetColor(hue.r, hue.g, hue.b));
                    }
                }
            });
        }

        // Use assim:
        this.checkAchievement('firstPerfect', isPerfect, '🏆 PRIMEIRA PERFEITA!');
        this.checkAchievement('combo5', this.combo >= 5, '🔥 COMBO x5!');
        this.checkAchievement('level10', this.level >= 10, '📈 NÍVEL 10!');

        const oldLevel = this.level;
        this.level = Math.min(99, Math.floor(this.blocks.length / 5) + 1);
        if (this.level !== oldLevel && this.ui.level?.scene) {
            this.ui.level.setText('Nível: ' + this.level);
        }

        const mult = this.activePowerups.slowMo ? 0.5 : 1;
        if (this.gameMode !== 'zen') {
            this.speed = (this.baseSpeed + this.level * 8) * mult;
        } else {
            this.speed = this.baseSpeed * mult; // Aplica slowMo mesmo no zen
        }

        if (this.blocks.length > 8 && targetY < 200) {
            this.blocks.forEach(b => {
                if (b?.sprite) {
                    b.y += this.blockHeight;
                    b.sprite.y += this.blockHeight;
                }
            });
        }

        this.time.delayedCall(300, () => this.spawnBlock());

        // No checkLanding:
        if (this.score % 50 === 0 && this.score > 0) {
            const chaos = [
                () => {
                    // Gravidade invertida temporária
                    this.cameras.main.setAngle(180);
                    this.time.delayedCall(2000, () => this.cameras.main.setAngle(0));
                    this.showComment('🙃 MUNDO INVERTIDO!');
                },
                () => {
                    // Tudo treme
                    this.cameras.main.shake(2000, 0.005);
                    this.showComment('🌪️ TERRAMOTO!');
                },
                () => {
                    // Zoom in/out
                    this.cameras.main.zoomTo(1.5, 500);
                    this.time.delayedCall(2000, () => this.cameras.main.zoomTo(1, 500));
                    this.showComment('🔍 ZOOM!');
                },
                () => {
                    // Rotação louca
                    this.cameras.main.rotateTo(0.5, true, 1000);
                    this.time.delayedCall(2000, () => this.cameras.main.rotateTo(0, true, 1000));
                    this.showComment('🌀 TONTURA!');
                }
            ];
            
            const event = chaos[Math.floor(Math.random() * chaos.length)];
            event();
        }

        // No checkLanding, toque notas musicais:
        const notes = [262, 294, 330, 349, 392, 440, 494, 523]; // Escala de Dó
        const noteIndex = this.blocks.length % notes.length;
        this.playSound(notes[noteIndex]);

        // Combo toca acorde!
        if (this.combo >= 3) {
            setTimeout(() => this.playSound(notes[noteIndex] * 1.25), 100);
            setTimeout(() => this.playSound(notes[noteIndex] * 1.5), 200);
        }
    }

    activatePowerup(type) {
        this.activePowerups[type] = true;

        if (type === 'ghost') {
            this.showComment('👻 Modo Fantasma!', '#95e1d3');
            // Próximo bloco que falhar não perde
            this.ghostMode = true;
        }

        if (type === 'perfectAssist') {
            this.showAimGuides(); // ← ADICIONA AQUI, mostra logo ao apanhar
        }
    
        // Sons diferentes por powerup
        const sounds = {
            slowMo: 200,
            wideBlock: 800,
            perfectAssist: 1200,
            timeFreeze: 400
        };
        this.playSound(sounds[type] || 1000);
        
        // Mensagem engraçada
        const msgs = {
            slowMo: '🐌 Modo câmara lenta!',
            wideBlock: '📏 THICC BLOCK!',
            perfectAssist: '🎯 Aim assist ON!',
            timeFreeze: '⏰ ZA WARUDO!'
        };

        this.showComment(msgs[type] || 'Powerup!', '#95e1d3');

         // Se for wideBlock, aumenta o bloco ATUAL imediatamente
        if (type === 'wideBlock' && this.currentBlock) {
            const newWidth = Math.min(this.currentBlock.width * 1.5, 250);
            this.currentBlock.width = newWidth;
            this.currentBlock.sprite.width = newWidth;
        }

        this.updatePowerupUI();
        
        this.time.delayedCall(5000, () => {
            if (!this.gameOver) {
                this.activePowerups[type] = false;
                this.updatePowerupUI();
            }
        });
    }

    updateUI() {
        if (this.ui.score?.scene) this.ui.score.setText('Pontos: ' + this.score);
        if (this.ui.level?.scene) this.ui.level.setText('Nível: ' + this.level);
        if (this.ui.combo?.scene) {
            this.ui.combo.setText(this.combo > 0 ? `🔥 Combo x${this.combo}!` : '');
        }
    }

    updatePowerupUI() {
        if (!this.ui.powerup?.scene) return;
        const active = [];
        if (this.activePowerups.slowMo) active.push('🐌');
        if (this.activePowerups.wideBlock) active.push('📏');
        if (this.activePowerups.perfectAssist) active.push('🎯');
        if (this.activePowerups.timeFreeze) active.push('⏰');
        this.ui.powerup.setText(active.join(' '));
    }

    endGame() {

        this.clearAimGuides();

        if (this.gameOver) return;
        this.gameOver = true;
        
        crazyGamesAds.gameplayStop();
        
        if (this.timerEvent) this.timerEvent.remove();
        if (this.currentPowerup?.sprite) this.currentPowerup.sprite.destroy();
        
        this.cameras.main.shake(500, 0.01);
        
        crazyGamesAds.showMidgameAd(this, () => this.showGameOverScreen());
    }

    showGameOverScreen() {
        if (this.musicaJogo) this.musicaJogo.stop();

        // ── Helper: lê highscores do CrazyGames Data Module ──
        const loadHighscores = () => {
            // 1. Tenta SDK (getItem pode ser síncrono ou assíncrono conforme versão)
            try {
                const sdkData = window.CrazyGames?.SDK?.data;
                if (sdkData?.getItem) {
                    const raw = sdkData.getItem('blockStackHighscores');
                    if (raw) return JSON.parse(raw);
                }
            } catch (e) {}

            // 2. Fallback: localStorage
            try {
                const raw = localStorage.getItem('blockStackHighscores');
                if (raw) return JSON.parse(raw);
            } catch (e) {}

            return [];
        };


        // ── Helper: grava highscores no CrazyGames Data Module ──
        const saveHighscores = (scores) => {
            const json = JSON.stringify(scores);

            // 1. Tenta SDK setItem — mas só se o método existir E o user estiver logged in
            try {
                const sdkData = window.CrazyGames?.SDK?.data;
                const user    = window.CrazyGames?.SDK?.user;

                // Alguns SDKs expõem isUserAccountAvailable ou o objeto user só existe se autenticado
                const isLoggedIn = user?.isUserAccountAvailable?.() 
                                ?? user?.systemInfo != null 
                                ?? false;

                if (sdkData?.setItem && isLoggedIn) {
                    sdkData.setItem('blockStackHighscores', json);
                    console.log('[Highscore] Gravado via CrazyGames SDK ✅');
                    return; // sucesso — não precisa de localStorage
                }
            } catch (e) {
                console.warn('[Highscore] SDK setItem falhou:', e);
            }

            // 2. Fallback sempre disponível: localStorage
            try {
                localStorage.setItem('blockStackHighscores', json);
                console.log('[Highscore] Gravado via localStorage (fallback) ✅');
            } catch (e) {
                console.error('[Highscore] Não foi possível gravar:', e);
            }
        };

        this.add.rectangle(640, 360, 700, 450, 0x000000, 0.9).setDepth(2000);

        const messages = [
            { min: 0,    max: 50,   msg: 'Oops! 😅' },
            { min: 51,   max: 150,  msg: 'Quase! ☕' },
            { min: 151,  max: 300,  msg: 'Nada mau! 🤓' },
            { min: 301,  max: 500,  msg: 'Excelente! 🏗️' },
            { min: 501,  max: 1000, msg: 'LENDA! 🏆' },
            { min: 1001, max: 9999, msg: 'IMPOSSÍVEL! 🤯' }
        ];
        const msg = messages.find(m => this.score >= m.min && this.score <= m.max)?.msg || 'Boa!';

        this.add.text(640, 200, 'FIM DE JOGO', {
            fontSize: '48px', fill: '#ff6b6b', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2000);

        this.add.text(640, 270, msg, {
            fontSize: '28px', fill: '#ffe66d', lineSpacing: 10
        }).setOrigin(0.5).setDepth(2000).setPadding(10, 10, 10, 10);

        this.add.text(640, 330, `Pontos: ${this.score}`, {
            fontSize: '32px', fill: '#fff'
        }).setOrigin(0.5).setDepth(2000);

        this.add.text(640, 380, `Nível: ${this.level}`, {
            fontSize: '24px', fill: '#95e1d3'
        }).setOrigin(0.5).setDepth(2000);

        // ── SLOT DA SORTE ────────────────────────────────────────
        const slotY = 480;
        this.add.text(640, slotY - 30, '🎰 SLOT DA SORTE 🎰', {
            fontSize: '20px', fill: '#ffe66d'
        }).setOrigin(0.5).setDepth(2000);

        const slot1 = this.add.text(560, slotY, '🍒', { fontSize: '36px' }).setOrigin(0.5).setDepth(2000).setPadding(20);
        const slot2 = this.add.text(640, slotY, '🍋', { fontSize: '36px' }).setOrigin(0.5).setDepth(2000).setPadding(20);
        const slot3 = this.add.text(720, slotY, '🍊', { fontSize: '36px' }).setOrigin(0.5).setDepth(2000).setPadding(20);

        const symbols = ['🍒', '🍋', '🍊', '⭐', '💎', '7️⃣'];
        let spinning = false;
        let slotDone = false; // ← controla se o slot já terminou

        // Texto de pontos atualizado em tempo real
        const scoreDisplay = this.add.text(640, 330, `Pontos: ${this.score}`, {
            fontSize: '32px', fill: '#fff'
        }).setOrigin(0.5).setDepth(2001); // depth maior para sobrepor o anterior

        const spinBtn = this.add.text(640, slotY + 50, '↻ RODAR', {
            fontSize: '18px', fill: '#4ecdc4'
        }).setOrigin(0.5).setDepth(2000).setInteractive();

        spinBtn.on('pointerdown', () => {
            if (spinning) return;
            spinning = true;

            let count = 0;
            this.time.addEvent({
                delay: 100,
                repeat: 20,
                callback: () => {
                    slot1.setText(symbols[Math.floor(Math.random() * symbols.length)]);
                    slot2.setText(symbols[Math.floor(Math.random() * symbols.length)]);
                    slot3.setText(symbols[Math.floor(Math.random() * symbols.length)]);
                    count++;

                    if (count === 20) {
                        const s1 = symbols[Math.floor(Math.random() * symbols.length)];
                        const s2 = symbols[Math.floor(Math.random() * symbols.length)];
                        const s3 = symbols[Math.floor(Math.random() * symbols.length)];
                        slot1.setText(s1); slot2.setText(s2); slot3.setText(s3);

                        if (s1 === s2 && s2 === s3) {
                            this.score += 500;
                            this.showComment('🎉 JACKPOT! +500 PONTOS!', '#ffd700');
                            this.cameras.main.flash(500, 255, 215, 0);
                        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
                            this.score += 50;
                            this.showComment('😊 2 iguais! +50 pontos', '#4ecdc4');
                        }

                        // Atualiza display de pontos com valor final (inclui slot)
                        scoreDisplay.setText(`Pontos: ${this.score}`);

                        spinning = false;
                        slotDone = true;
                        spinBtn.destroy();

                        // ← GRAVA HIGHSCORE AGORA, após slot, com pontuação final
                        saveHighscoreNow();
                    }
                }
            });
        });

        // ── HIGHSCORE — gravado após slot (ou imediatamente se saltar) ───────────
        const saveHighscoreNow = () => {
            const highscores = loadHighscores();
            const isNewRecord = highscores.length < 10 ||
                this.score > highscores[highscores.length - 1]?.score;

            if (isNewRecord) {
                // Mostra badge de recorde
                if (!this.recordShown) {
                    this.recordShown = true;
                    this.add.text(640, 430, '🏆 NOVO HIGHSCORE!', {
                        fontSize: '24px', fill: '#ffe66d', fontStyle: 'bold'
                    }).setOrigin(0.5).setDepth(2000);
                }

                const name = prompt('Introduz o teu nome:', 'Jogador');
                if (name) {
                    highscores.push({
                        name,
                        score: this.score,
                        level: this.level,
                        mode: this.gameMode,
                        date: new Date().toLocaleDateString('pt-PT')
                    });
                    highscores.sort((a, b) => b.score - a.score);
                    saveHighscores(highscores.slice(0, 10));
                }
            }
        };

        // ── BOTÃO MENU ────────────────────────────────────────────
        const menuBtn = this.add.text(640, 560, 'Voltar ao Menu', {
            fontSize: '20px', fill: '#95e1d3'
        }).setOrigin(0.5).setDepth(2000).setInteractive();

        menuBtn.on('pointerdown', () => {
            // Se saiu sem rodar o slot, grava highscore com pontuação atual
            if (!slotDone) saveHighscoreNow();
            this.scene.start('MenuScene');
        });
    }

    migrateLocalStorageToSDK() {
        try {
            const existing = localStorage.getItem('blockStackHighscores');
            const alreadyMigrated = window.CrazyGames?.SDK?.data?.getItem('blockStackMigrated');
            
            if (existing && !alreadyMigrated) {
                window.CrazyGames?.SDK?.data?.setItem('blockStackHighscores', existing);
                window.CrazyGames?.SDK?.data?.setItem('blockStackMigrated', '1');
                localStorage.removeItem('blockStackHighscores'); // limpa o antigo
            }
        } catch (e) {}
    }

    update(time, delta) {
        if (this.gameOver || !this.currentBlock?.moving || !this.currentBlock?.sprite) return;
        
        const mult = this.activePowerups.slowMo ? 0.5 : 1;
        this.currentBlock.x += this.speed * this.currentBlock.direction * (delta / 1000) * mult;
        this.currentBlock.sprite.x = this.currentBlock.x;

        if (this.currentPowerup?.sprite) {
            const distX = Math.abs(this.currentBlock.x - this.currentPowerup.x);
            const distY = Math.abs(this.currentBlock.y - this.currentPowerup.y);
            
            if (distY < 20 && distX < this.currentBlock.width / 2 + 30) {
                this.activatePowerup(this.currentPowerup.type);
                this.currentPowerup.sprite.destroy();
                this.currentPowerup = null;
            }
        }

        const min = this.currentBlock.width / 2 + 50;
        const max = 1230 - this.currentBlock.width / 2;
        
        if (this.currentBlock.x <= min) {
            this.currentBlock.x = min;
            this.currentBlock.direction = 1;
        } else if (this.currentBlock.x >= max) {
            this.currentBlock.x = max;
            this.currentBlock.direction = -1;
        }

        if (this.currentBlock.questionMark) {
            this.currentBlock.questionMark.x = this.currentBlock.x;
            this.currentBlock.questionMark.y = this.currentBlock.y;
        }       
    }
}