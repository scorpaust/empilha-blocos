// scenes/MenuScene.js
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Carregar música do menu
        this.load.audio('musica_menu', 'assets/musica_menu.mp3');
    }

    create() {
        this.cameras.main.setBackgroundColor('#2d3561');
        
        // Música de fundo
        try {
            if (this.sound.get('musica_menu')) {
                this.sound.stopAll();
            }
            this.musicaMenu = this.sound.add('musica_menu', { loop: true, volume: 0.3 });
            this.musicaMenu.play();
        } catch (e) {
            console.warn('Música não carregada:', e);
        }
        
        this.add.text(640, 80, 'EMPILHA BLOCOS', {
            fontSize: '48px', fill: '#ffe66d', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(640, 140, 'Escolhe o modo:', {
            fontSize: '20px', fill: '#fff'
        }).setOrigin(0.5);

        this.createButton(640, 210, 'NORMAL', '📦 Clássico', () => {
            if (this.musicaMenu) this.musicaMenu.stop();
            this.scene.start('GameScene', { mode: 'normal' });
        });

        this.createButton(640, 310, 'CONTRA O TEMPO', '⏱️ 60 segundos', () => {
            if (this.musicaMenu) this.musicaMenu.stop();
            this.scene.start('GameScene', { mode: 'timed' });
        });

        this.createButton(640, 410, 'ZEN', '😌 Relaxa', () => {
            if (this.musicaMenu) this.musicaMenu.stop();
            this.scene.start('GameScene', { mode: 'zen' });
        });

        // Botões inferiores - lado a lado
        const btnY = 530;
        
        // Botão Highscores (esquerda)
        const hsBtn = this.add.text(420, btnY, '🏆 Highscores', {
            fontSize: '22px', fill: '#4ecdc4', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        hsBtn.on('pointerdown', () => {
            if (this.musicaMenu) this.musicaMenu.stop();
            this.scene.start('HighscoresScene');
        });
        hsBtn.on('pointerover', () => hsBtn.setStyle({ fill: '#ffe66d' }));
        hsBtn.on('pointerout', () => hsBtn.setStyle({ fill: '#4ecdc4' }));

        // Botão Manual (direita) - NOVO
        const manualBtn = this.add.text(860, btnY, '📖 Manual', {
            fontSize: '22px', fill: '#4ecdc4', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        manualBtn.on('pointerdown', () => {
            if (this.musicaMenu) this.musicaMenu.stop();
            this.scene.start('ManualScene');
        });
        manualBtn.on('pointerover', () => manualBtn.setStyle({ fill: '#ffe66d' }));
        manualBtn.on('pointerout', () => manualBtn.setStyle({ fill: '#4ecdc4' }));

        // Versão
        this.add.text(640, 650, 'v1.0', {
            fontSize: '14px', fill: '#666'
        }).setOrigin(0.5);

        this.createPrivacyNotice();
    }

    createPrivacyNotice() {
        // Linha 1: frase simples
        this.add.text(640, 680, 'Ao jogar estás a aceitar os nossos:', {
            fontSize: '11px', fill: '#666666', align: 'center'
        }).setOrigin(0.5).setDepth(1000);

        // Linha 2: dois botões lado a lado com separador
        const termsBtn = this.add.text(560, 695, 'Termos de Serviço', {
            fontSize: '11px', fill: '#4ecdc4'
        }).setOrigin(1, 0.5).setDepth(1001).setInteractive();

        this.add.text(640, 695, '|', {
            fontSize: '11px', fill: '#444444'
        }).setOrigin(0.5).setDepth(1000);

        const privacyBtn = this.add.text(720, 695, 'Política de Privacidade', {
            fontSize: '11px', fill: '#4ecdc4'
        }).setOrigin(0, 0.5).setDepth(1001).setInteractive();

        termsBtn.on('pointerover', () => termsBtn.setStyle({ fill: '#ffe66d' }));
        termsBtn.on('pointerout',  () => termsBtn.setStyle({ fill: '#4ecdc4' }));
        termsBtn.on('pointerdown', () => {
            window.open('https://www.crazygames.com/terms-and-conditions', '_blank');
        });

        privacyBtn.on('pointerover', () => privacyBtn.setStyle({ fill: '#ffe66d' }));
        privacyBtn.on('pointerout',  () => privacyBtn.setStyle({ fill: '#4ecdc4' }));
        privacyBtn.on('pointerdown', () => {
            window.open('https://www.crazygames.com/privacy-policy', '_blank');
        });
    }    

    createButton(x, y, text, desc, callback) {
        const btn = this.add.rectangle(x, y, 600, 80, 0x667eea).setInteractive();
        const txt = this.add.text(x, y - 12, text, {
            fontSize: '24px', fill: '#fff', fontStyle: 'bold'
        }).setOrigin(0.5);
        const dsc = this.add.text(x, y + 18, desc, {
            fontSize: '16px', fill: '#ddd'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x764ba2));
        btn.on('pointerout', () => btn.setFillStyle(0x667eea));
        btn.on('pointerdown', callback);
    }
}