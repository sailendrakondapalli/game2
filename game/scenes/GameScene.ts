import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import { GAME_CONFIG } from '../config';

export class GameScene extends Phaser.Scene {
  private socket!: Socket;
  private playerId!: string;
  private players = new Map<string, Phaser.GameObjects.Arc>();
  private safeZoneGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { socket: Socket; playerId: string }) {
    this.socket = data.socket;
    this.playerId = data.playerId;
  }

  create() {
    console.log('🎮 GameScene created');

    this.cameras.main.setBackgroundColor(GAME_CONFIG.COLORS.MAP_BACKGROUND);
    this.cameras.main.setBounds(0, 0, GAME_CONFIG.MAP_SIZE, GAME_CONFIG.MAP_SIZE);

    this.safeZoneGraphics = this.add.graphics();

    this.setupInput();
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.off('gameState');
    this.socket.off('matchEnd');

    this.socket.on('gameState', (state: any) => {
      console.log('🟢 gameState received');
      this.updatePlayers(state.players);
      this.updateSafeZone(state.safeZone);
    });

    this.socket.on('matchEnd', () => {
      this.scene.start('GameOverScene');
    });
  }

  setupInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.players.has(this.playerId)) return;

      const player = this.players.get(this.playerId)!;
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const angle = Phaser.Math.Angle.Between(player.x, player.y, world.x, world.y);

      this.socket.emit('playerShoot', { angle });
    });
  }

  updatePlayers(players: any[]) {
    const currentIds = new Set(players.map(p => p.id));

    for (const [id, obj] of this.players) {
      if (!currentIds.has(id)) {
        obj.destroy();
        this.players.delete(id);
      }
    }

    players.forEach(p => {
      if (!this.players.has(p.id)) {
        const color = p.id === this.playerId ? 0x00ff00 : 0xff0000;
        const circle = this.add.circle(p.x, p.y, 12, color);
        this.players.set(p.id, circle);

        if (p.id === this.playerId) {
          this.cameras.main.startFollow(circle, true, 0.1, 0.1);
        }
      } else {
        this.players.get(p.id)!.setPosition(p.x, p.y);
      }
    });
  }

  updateSafeZone(zone: any) {
    this.safeZoneGraphics.clear();
    if (!zone) return;

    this.safeZoneGraphics.lineStyle(4, 0x00ffff, 0.8);
    this.safeZoneGraphics.strokeCircle(zone.x, zone.y, zone.radius);
  }
}
