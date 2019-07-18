var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 100
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
        this.curve = new Phaser.Curves.CubicBezier(genes, genes[50], genes[100], genes[149]);
        this.points = this.curve.getPoints(150);
        this.fitness = 0;
        this.crashed = false;
    }
}
function createGenes() {
    let genes = [];
    genes.push(new Phaser.Math.Vector2(400, 600));
    for (let i = 1; i<150; i++) {
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
    this.add.circle(400, 100, 10, 0x6666ff);
    var graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(200, 200, 400, 50);
    for (let i = 0; i < 100; i++) {
        gameState.rockets.push(this.physics.add.sprite(400, 600, 'rocket').setScale(.1));
        gameState.rockets[i].setCollideWorldBounds(true);
    }
}
let p = 0;
function update() {
    p++;
    if (p < 150) {
        for (let i = 0; i < 100; i++) {
            let points = gameState.rocketVectors[i].points[p];
            gameState.rockets[i].x = points.x;
            gameState.rockets[i].y = points.y;
            if (insideBox(gameState.rockets[i])) {
                gameState.rockets[i].visible = false;
                gameState.rockets[i].fitness = fitness(gameState.rockets[i]);
                gameState.rockets[i].fitness = gameState.rockets[i].fitness/10;
                gameState.rockets[i].crashed = true;
            }
        }
    } else {
        let max = 0;
        for (let i = 0; i < 100; i++) {
            if (!gameState.rockets[i].crashed) {
                gameState.rockets[i].fitness = fitness(gameState.rockets[i]);
                if (gameState.rockets[i].fitness > max) {
                    max = gameState.rockets[i].fitness;
                }
            }
        }
        for (var i = 0; i < 100 ; i++) {
            gameState.rockets[i].fitness /= max;
        }
        let matingPool = [];
        for (let i = 0; i < 100; i++) {
            let n = gameState.rockets[i].fitness* 100;
            for (let j = 0; j < n; j++) {
                matingPool.push(gameState.rockets[i]);
            }
        }
        console.log(matingPool[4].genes);
        let newRockets = [];
        for (let i = 0; i < 100; i++) {
            let r1 = matingPool[Math.random() * matingPool.length - 1];
            let r2 = matingPool[Math.random() * matingPool.length - 1];
            newRockets.push(mate(r1, r2));
        }
        gameState.rockets = newRockets;
        p = 0;
    }
}
function mate(rocket1, rocket2) {
    let pos = Math.random() * 149;
    let genes = rocket1.genes.slice(0,pos).concat(rocket2.genes.slice(pos, 150));
    return new Rocket(genes,400,600);
}
function fitness(rocket) {
    return Math.sqrt((Math.pow(rocket.x - 400, 2)) + Math.pow(rocket.y - 100, 2));
}
function insideBox(rocket) {
    let x = rocket.x;
    let y = rocket.y;
    return x >= 200 && x <= 600 && y >= 200 && y <= 250;
}