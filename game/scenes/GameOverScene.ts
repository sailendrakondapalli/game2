import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  init(data: any) {
    this.data = data;
  }

  create() {
    const { winner } = this.data.values;

    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8).setOrigin(0);

    this.add.text(this.scale.width / 2, this.scale.height / 2,
      winner ? `Winner: ${winner.username}` : 'Game Over',
      { color: '#fff', fontSize: '32px' }
    ).setOrigin(0.5);
  }
}
