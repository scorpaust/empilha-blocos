class CrazyGamesAds {
            constructor() {
                this.sdk = null;
                this.initialized = false;
            }

            async init() {
                try {
                    if (window.CrazyGames && window.CrazyGames.SDK) {
                        this.sdk = window.CrazyGames.SDK;
                        await this.sdk.init();
                        this.initialized = true;
                        console.log('[CrazyGames] SDK inicializado');
                    } else {
                        console.warn('[Dev] SDK não disponível');
                    }
                } catch (error) {
                    console.warn('[Dev] Modo desenvolvimento');
                }
            }

            showMidgameAd(scene, onComplete) {
                if (!this.initialized) {
                    if (onComplete) onComplete();
                    return;
                }
                
                this.sdk.ad.requestAd('midgame', {
                    adStarted: () => this.pauseGame(scene),
                    adFinished: () => { this.resumeGame(scene); if (onComplete) onComplete(); },
                    adError: () => { this.resumeGame(scene); if (onComplete) onComplete(); }
                });
            }

            showRewardedAd(scene, onRewarded, onFailed) {
                if (!this.initialized) {
                    if (onFailed) onFailed();
                    return;
                }
                
                this.sdk.ad.requestAd('rewarded', {
                    adStarted: () => this.pauseGame(scene),
                    adFinished: () => { this.resumeGame(scene); if (onRewarded) onRewarded(); },
                    adError: () => { this.resumeGame(scene); if (onFailed) onFailed(); }
                });
            }

            pauseGame(scene) {
                if (scene.musicaJogo?.isPlaying) scene.musicaJogo.pause();
                if (scene.musicaMenu?.isPlaying) scene.musicaMenu.pause();
                scene.tweens.pauseAll();
                scene.time.paused = true;
            }

            resumeGame(scene) {
                if (scene.musicaJogo?.isPaused) scene.musicaJogo.resume();
                if (scene.musicaMenu?.isPaused) scene.musicaMenu.resume();
                scene.tweens.resumeAll();
                scene.time.paused = false;
            }

            gameplayStart() { if (this.initialized) this.sdk.game.gameplayStart(); }
            gameplayStop() { if (this.initialized) this.sdk.game.gameplayStop(); }
        }

        export const crazyGamesAds = new CrazyGamesAds();