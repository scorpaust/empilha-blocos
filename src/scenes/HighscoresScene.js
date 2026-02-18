export default class HighscoresScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HighscoresScene' });
    }

    create() {
        console.log('HighscoresScene.create() executou!'); // ← ADICIONE ISTO
        this.cameras.main.setBackgroundColor('#2d3561');
        
        const highscores = JSON.parse(localStorage.getItem('blockStackHighscores') || '[]');

        this.add.rectangle(640, 360, 1100, 650, 0x000000, 0.95);
        
        this.add.text(640, 80, '🏆 TOP 10 HIGHSCORES', {
            fontSize: '40px',
            fill: '#ffe66d',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Headers
        this.add.text(200, 140, '#', { fontSize: '16px', fill: '#999' });
        this.add.text(280, 140, 'Nome', { fontSize: '16px', fill: '#999' });
        this.add.text(600, 140, 'Pontos', { fontSize: '16px', fill: '#999' });
        this.add.text(750, 140, 'Nível', { fontSize: '16px', fill: '#999' });
        this.add.text(870, 140, 'Modo', { fontSize: '16px', fill: '#999' });
        this.add.text(970, 140, 'Data', { fontSize: '16px', fill: '#999' });

        highscores.forEach((hs, i) => {
            const y = 180 + i * 40;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            const modeIcon = hs.mode === 'timed' ? '⏱️' : hs.mode === 'zen' ? '😌' : '📦';
            
            this.add.text(200, y, medal, {
                fontSize: '20px',
                fill: '#fff'
            });

            this.add.text(280, y, `${hs.name}`, {
                fontSize: '18px',
                fill: '#fff'
            });

            this.add.text(600, y, `${hs.score}`, {
                fontSize: '18px',
                fill: '#4ecdc4',
                fontStyle: 'bold'
            });

            // NÍVEL ADICIONADO
            this.add.text(750, y, `Nv ${hs.level || 1}`, {
                fontSize: '16px',
                fill: '#95e1d3'
            });

            this.add.text(870, y, modeIcon, {
                fontSize: '18px'
            });

            this.add.text(970, y, hs.date || 'N/A', {
                fontSize: '14px',
                fill: '#999'
            });
        });

        if (highscores.length === 0) {
            this.add.text(640, 360, 'Ainda sem pontuações!', {
                fontSize: '24px',
                fill: '#999'
            }).setOrigin(0.5);
        }

        const backBtn = this.add.text(640, 640, '← Voltar ao Menu', {
            fontSize: '24px',
            fill: '#4ecdc4'
        }).setOrigin(0.5).setInteractive();

        backBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#ffe66d' }));
        backBtn.on('pointerout', () => backBtn.setStyle({ fill: '#4ecdc4' }));
    }
}