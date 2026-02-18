// scenes/ManualScene.js
export default class ManualScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ManualScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#2d3561');
        
        // Background
        this.add.rectangle(640, 360, 1200, 680, 0x000000, 0.95);
        
        // Título (fixo)
        this.add.text(640, 50, '📖 MANUAL DO JOGO', {
            fontSize: '44px',
            fill: '#ffe66d',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Container para conteúdo com scroll
        this.contentContainer = this.add.container(0, 0);
        
        // Área de conteúdo (2 colunas)
        const leftCol = 140;
        const rightCol = 680;
        let leftY = 120;
        let rightY = 120;

        // === COLUNA ESQUERDA ===
        
        // COMO JOGAR
        leftY = this.addSectionCompact(this.contentContainer, leftCol, leftY, '🎮 COMO JOGAR', [
            'Clica para soltar o bloco',
            'Alinha blocos perfeitamente',
            'Acertos perfeitos = sem cortes',
            'Erros = bloco fica menor',
            'Erro total = Game Over*',
            '(*exceto modo Zen)'
        ]);

        // MODOS
        leftY = this.addSectionCompact(this.contentContainer, leftCol, leftY, '🎯 MODOS', [
            '📦 NORMAL',
            'Velocidade aumenta com níveis',
            '',
            '⏱️ CONTRA O TEMPO',
            '60 segundos para pontuar',
            '',
            '😌 ZEN',
            'Sem pressão, só empilha'
        ]);

        // PONTUAÇÃO
        leftY = this.addSectionCompact(this.contentContainer, leftCol, leftY, '🏆 PONTUAÇÃO', [
            'Perfeito: 10pts + combo',
            'Combo x2: +12pts',
            'Combo x3: +16pts',
            'Combo x5: +20pts',
            'Parcial: pontos variáveis'
        ]);

        // === COLUNA DIREITA ===
        
        // POWER-UPS
        rightY = this.addSectionCompact(this.contentContainer, rightCol, rightY, '⚡ POWER-UPS', [
            '🐌 Slow-Mo',
            'Velocidade -50% (5 seg)',
            '',
            '📏 Bloco Largo',
            'Largura +50% (5 seg)',
            '',
            '🎯 Guia',
            'Linha de alinhamento (5 seg)',
            '',
            '⏰ Congelar',
            'Para cronómetro (5 seg)',
            '',
            '💡 Aparecem a cada 5 blocos',
            '💡 Toca neles ao passar!'
        ]);

        // NÍVEIS
        rightY = this.addSectionCompact(this.contentContainer, rightCol, rightY, '📈 NÍVEIS (1-99)', [
            '+1 nível a cada 5 blocos',
            'Velocidade = 150+(nível×8)',
            'Nível 99 = velocidade máxima',
            'Flash dourado a cada 10 níveis'
        ]);

        // DICAS
        rightY = this.addSectionCompact(this.contentContainer, rightCol, rightY, '💡 DICAS', [
            '🎯 Foca em perfeitos',
            '⚡ Power-ups não valem blocos',
            '🔥 Mantém combos para +pontos',
            '📊 Zen = treino de timing',
            '🏅 Nível conta nos highscores'
        ]);

        // CONTROLOS
        rightY = this.addSectionCompact(this.contentContainer, rightCol, rightY, '🎮 CONTROLOS', [
            '🖱️ Clique - Soltar bloco',
            '🏠 Botão Menu - Sair'
        ]);

        // Calcular altura total do conteúdo
        const maxY = Math.max(leftY, rightY);
        this.contentHeight = maxY + 50;
        this.scrollPosition = 0;
        this.maxScroll = Math.max(0, this.contentHeight - 520); // 520 = área visível

        // Máscara para esconder conteúdo fora da área
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(80, 110, 1120, 520);
        const mask = maskShape.createGeometryMask();
        this.contentContainer.setMask(mask);

        // Indicador de scroll (se necessário)
        if (this.maxScroll > 0) {
            this.scrollIndicator = this.add.text(640, 640, '⬇️ Usa a roda do rato para ver mais ⬇️', {
                fontSize: '16px',
                fill: '#ffe66d',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Scroll com roda do rato
            this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
                this.scrollPosition += deltaY * 0.5;
                this.scrollPosition = Phaser.Math.Clamp(this.scrollPosition, 0, this.maxScroll);
                this.contentContainer.y = -this.scrollPosition + 110;

                // Atualizar indicador
                if (this.scrollPosition >= this.maxScroll - 10) {
                    this.scrollIndicator.setText('⬆️ Fim do manual ⬆️');
                } else {
                    this.scrollIndicator.setText('⬇️ Usa a roda do rato para ver mais ⬇️');
                }
            });
        }

        // Botão Voltar (fixo)
        const backBtn = this.add.text(640, 680, '← Voltar ao Menu', {
            fontSize: '24px',
            fill: '#4ecdc4',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        backBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#ffe66d' }));
        backBtn.on('pointerout', () => backBtn.setStyle({ fill: '#4ecdc4' }));
    }

    addSectionCompact(container, x, startY, title, items) {
        // Título da secção
        const titleText = this.add.text(x, startY, title, {
            fontSize: '20px',
            fill: '#ffe66d',
            fontStyle: 'bold'
        });
        container.add(titleText);

        let currentY = startY + 28;

        // Items da secção
        items.forEach(item => {
            if (item === '') {
                currentY += 8; // Espaço extra
            } else {
                const itemText = this.add.text(x + 10, currentY, item, {
                    fontSize: '15px',
                    fill: '#fff',
                    wordWrap: { width: 480 }
                });
                container.add(itemText);
                currentY += 22;
            }
        });

        return currentY + 25; // Espaço entre secções
    }
}
