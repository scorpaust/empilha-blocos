import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import HighscoresScene from './scenes/HighscoresScene.js';
import ManualScene from './scenes/ManualScene.js'; 
import BootScene from './scenes/BootScene.js'
import { crazyGamesAds } from './CrazyGamesAds.js';



const config = {
            type: Phaser.AUTO,
            width: 1280,
            height: 720,
            title: 'Empilha Blocos',
            parent: 'game-container',
            backgroundColor: '#2d3561',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            scene: [BootScene, MenuScene, GameScene, HighscoresScene, ManualScene]
        };

        console.log('GameScene carregado:', GameScene); 

        console.log('MenuScene carregado:', MenuScene); 

        // ===== INICIAR =====
        (async function() {
            await crazyGamesAds.init();
            new Phaser.Game(config);
        })();