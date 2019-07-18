import phaser from 'phaser'

const gameState = {};

function preload() {
    this.load('rocket','cohete_off.pmg');
}
function create() {
    gameState.rocket = this.add.sprite(250,250,rocket);
    gameState.cursors = this.input.keyboard.createCursorKeys();
}
function update() {
    if (gameState.cursors.down.isDown) {
        gameState.rocket.y += 1;
    }
    if (gameState.cursors.up.isDown) {
        gameState.rocket.y -= 1;
    }
    if (gameState.cursors.left.isDown) {
        gameState.rocket.x -= 1;
    }
    if (gameState.cursors.right.isDown) {
        gameState.rocket.x += 1;
    }
}
const config = {
    width : 500,
    height : 500,
    parent : 'content',
    scene : [
        preload,
        create,
        update
    ]
};

const game = new phaser.Game(config);