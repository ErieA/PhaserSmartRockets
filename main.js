var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 200
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

const gameState = {};
class Rocket {
    constructor(genes, x, y) {
        this.genes = genes;
        this.x = x;
        this.y = y;
        this.curve = new Phaser.Curves.CubicBezier(genes, genes[30], genes[60], genes[99]);
        this.points = this.curve.getPoints(100);
    }
}
function createGenes() {
    let genes = [];
    genes.push(new Phaser.Math.Vector2(400, 600));
    for (let i = 1; i<100; i++) {
        genes.push(new Phaser.Math.Vector2(Math.random() * 800, Math.random() * 600));
    }
    return genes;
}
function createRockets() {
    let rockets = [];
    for (let i = 0; i<100; i++) {
        rockets.push(new Rocket(createGenes(),400,600));
    }
    return rockets;
}
function preload () {
    this.load.image('rocket', 'cohete_off.png');
}

function create () {
    gameState.rocketVectors = createRockets();
    gameState.rockets = [];
    for (let i = 0; i < 100; i++) {
        gameState.rockets.push(this.physics.add.sprite(400, 600, 'rocket').setScale(.2));
        gameState.rockets[i].setCollideWorldBounds(true);
    }
}
let p = 0;
function update() {
    for (let i = 0; i < 100; i++) {
        let points = gameState.rocketVectors[i].points[p];
        gameState.rockets[i].x = points.x;
        gameState.rockets[i].y = points.y;
    }
    p++;
}