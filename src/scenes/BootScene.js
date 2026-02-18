import { crazyGamesAds } from '../CrazyGamesAds.js'

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    async create() {

        // ← É AQUI que o SDK é inicializado, antes de tudo o resto
        await crazyGamesAds.init();
        
        // Inicializa o SDK (obrigatório antes de qualquer chamada)
        try {
            await window.CrazyGames.SDK.init();

            // Só usa o SDK em ambientes válidos (local ou crazygames)
            // Em 'disabled' (outros domínios) o SDK lança erros em tudo
            const env = window.CrazyGames.SDK.environment;
            console.log('[CrazyGames] ambiente:', env);

            if (env === 'local' || env === 'crazygames') {
                // SDK disponível — migra dados antigos
                this.migrateHighscores();
            }
            // Se env === 'disabled', simplesmente ignoramos o SDK

        } catch (e) {
            // SDK não carregou (ex: adblock, rede) — continua sem ele
            console.warn('[CrazyGames] SDK não inicializou:', e);
        }

        this.scene.start('MenuScene');
    }

    migrateHighscores() {
        try {
            const existing = localStorage.getItem('blockStackHighscores');
            const migrated = window.CrazyGames?.SDK?.data?.getItem('blockStackMigrated');
            if (existing && !migrated) {
                window.CrazyGames.SDK.data.setItem('blockStackHighscores', existing);
                window.CrazyGames.SDK.data.setItem('blockStackMigrated', '1');
                localStorage.removeItem('blockStackHighscores');
            }
        } catch (e) {}
    }
}