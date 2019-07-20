var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    physics: {
        default: 'arcade'
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
let numPoints = 15;
var game = new Phaser.Game(config);
const numRockets = 100;
const gameState = {};
class Rocket {
    constructor(genes) {
        this.genes = genes;
        this.curve = new Phaser.Curves.CubicBezier(genes[0], genes[1], genes[2], genes[3]);
        this.points = this.curve.getPoints(numPoints);
        this.fitness = 0;
        this.crashed = false;
        this.inEarth = false;
    }
}
function createGenes() {
    let genes = [];
    genes.push(new Phaser.Math.Vector2(400, 600));
    for (let i = 1; i < 4; i++) {
        genes.push(new Phaser.Math.Vector2(Math.random() * 800, Math.random() * 600));
    }
    return genes;
}
function createRockets() {
    let rockets = [];
    for (let i = 0; i<numRockets; i++) {
        rockets.push(new Rocket(createGenes()));
    }
    return rockets;
}
function preload () {
    this.load.image('rocket', 'cohete_off.png');
    this.load.image('background', "background.jpg");
    this.load.image('boulder', 'boulder.png');
    this.load.image('earth', 'earth.png');
    this.load.atlas('flares', 'flares.png', 'flares.json');
}

function create () {
    this.add.image(400, 400, 'background').setScale(2);
    gameState.rocketVectors = createRockets();
    gameState.rockets = [];
    gameState.particles = [];
    for (let x = 0; x < 7; x++) {
        this.add.image(230 + (60 * x), 230, 'boulder');
    }
    this.add.image(410, 100, 'earth').setScale(.4);
    for (let i = 0; i < numRockets; i++) {
        gameState.rockets.push(this.physics.add.sprite(400, 600, 'rocket').setScale(.1));
        gameState.particles[i] = this.add.particles('flares');
        gameState.particles[i].createEmitter({
            frame: 'blue',
            x: 0,
            y: 0,
            lifespan: 100,
            speed: {min: 400, max: 600},
            angle: 90,
            gravityY: 300,
            scale: {start: 0.1, end: 0},
            quantity: 1,
            blendMode: 'ADD'
        });
        gameState.rockets[i].setCollideWorldBounds(true);

    }

}
function getAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
}
let p = 0;
function update() {
    p++;
    if (p === 1) {
        graphics = this.add.graphics();
        for (let i = 0; i < numRockets; i++) {
            graphics.lineStyle(1, 0xffffff, 1);
            gameState.rocketVectors[i].curve.draw(graphics, numPoints);
        }
    }
    if (p===numPoints) {
        graphics.destroy();
    }
    if (p < numPoints) {
        for (let i = 0; i < numRockets; i++) {
            if (!gameState.rocketVectors[i].crashed) {
                let points = gameState.rocketVectors[i].points[p];
                gameState.rockets[i].x = points.x;
                gameState.rockets[i].y = points.y;
                let tempVec = new Phaser.Math.Vector2();
                let t = gameState.rocketVectors[i].curve.getUtoTmapping(p / numPoints);
                let tangent = gameState.rocketVectors[i].curve.getTangent(t);
                tempVec.copy(tangent).scale(32).add(points);
                gameState.rockets[i].angle = getAngle(tempVec.x, tempVec.y, points.x, points.y) - 90;
                gameState.particles[i].x = points.x;
                gameState.particles[i].y = points.y;
                gameState.particles[i].angle = getAngle(tempVec.x, tempVec.y, points.x, points.y) - 90;


            }
            if (!gameState.rocketVectors[i].crashed && insideBox(gameState.rockets[i])) {
                gameState.rocketVectors[i].fitness = fitness(gameState.rockets[i]);
                gameState.rocketVectors[i].fitness = 0;
                    // gameState.rocketVectors[i].fitness/30;
                gameState.rocketVectors[i].crashed = true;
            }
            if (!gameState.rocketVectors[i].crashed && !insideBox(gameState.rockets[i])
                && !gameState.rocketVectors[i].inEarth && inEarth(gameState.rockets[i])) {
                gameState.rocketVectors[i].fitness = fitness(gameState.rockets[i]);
                gameState.rocketVectors[i].fitness = gameState.rocketVectors[i].fitness * 30;
                gameState.rocketVectors[i].inEarth = true;
                gameState.rocketVectors[i].crashed = true;
            }
        }
    } else {
        let max = 0;
        for (let i = 0; i < numRockets; i++) {
            if (!gameState.rocketVectors[i].crashed) {
                gameState.rocketVectors[i].fitness = fitness(gameState.rockets[i]);
                if (gameState.rocketVectors[i].fitness > max) {
                    max = gameState.rocketVectors[i].fitness;
                }
            }
        }
        for (let i = 0; i < numRockets ; i++) {
            gameState.rocketVectors[i].fitness /= max;
        }
        let matingPool = [];
        for (let i = 0; i < numRockets; i++) {
            let n = gameState.rocketVectors[i].fitness * 100;
            for (let j = 0; j < n; j++) {
                matingPool.push(gameState.rocketVectors[i]);
            }
        }
        let newRockets = [];
        for (let i = 0; i < numRockets; i++) {
            let r1 = matingPool[Math.floor(Math.random() * matingPool.length - 1)];
            let r2 = matingPool[Math.floor(Math.random() * matingPool.length - 1)];
            if (r1 === undefined || r2 === undefined) {
                newRockets.push(matingPool[0]);
            } else {
                newRockets.push(mate(r1, r2));
            }
        }
        gameState.rocketVectors = newRockets;
        p = 0;
        for (let i = 0; i < numRockets; i++) {
            gameState.rockets[i].x = 400;
            gameState.rockets[i].y = 600;
        }
    }
}
function mutate(rocket) {
    let genes = rocket.genes;
    let rand = Math.floor(Math.random() * (genes.length - 1 ));
    let rand2 = Math.floor(Math.random() * (genes.length - 1 ) * 2);
    let p1;
    for (let i = 1; i < genes.length; i++) {
        if (i === rand) {
            rand = Math.floor(Math.random() * (genes.length - 1 ));
            p1 = new Phaser.Math.Vector2(Math.random() * 800, Math.random() * 600);
            genes[i] = p1;
        }
    }
    for (let i = 1; i < genes.length * 2; i++) {
        if (i === rand2) {
            let distToEarth = Math.floor(Math.sqrt((Math.pow(genes[3].x - 410, 2)) + Math.pow(genes[3].y - 100, 2)));
            let newX;
            let newY;
            if (genes[3].x < 410) {
                newX = genes[3].x + distToEarth/3;
            } else {
                newX = genes[3] - distToEarth/3;
            }
            if (genes[3].y < 100) {
                newY = genes[3].y + distToEarth/3;
            } else {
                newY = genes[3].y - distToEarth/3;
            }
            genes[3] = new Phaser.Math.Vector2(newX, newY);
        }
    }
    rocket.genes = genes;
    rocket.curve = new Phaser.Curves.CubicBezier(genes[0], genes[1], genes[2], genes[3]);
    return rocket;
}
let rateOfMutation = 1;
function mate(rocket1, rocket2) {
    if (rocket1 === undefined || rocket2 === undefined) {
        return undefined;
    }
    let pos = Math.floor(Math.random() * 3);
    let genes;
    genes = rocket1.genes.slice(0,pos).concat(rocket2.genes.slice(pos, 4));
    let rocket = new Rocket(genes);
    if ((Math.random() * 100) < rateOfMutation) {
        // console.log(rocket);
        rocket = mutate(rocket);
        // console.log(rocket);
    }
    return rocket;
}
function fitness(rocket) {
    let fitness = 806 - Math.floor(Math.sqrt((Math.pow(rocket.x - 410, 2)) + Math.pow(rocket.y - 100, 2)));
    if (rocket.y < 250) {
        fitness += 50;
    }
    if (rocket.y < 200) {
        fitness += 1.2 * fitness;
    }

    return fitness;
}
function inEarth(rocket) {
    return 30 >= Math.floor(Math.sqrt((Math.pow(rocket.x - 410, 2)) + Math.pow(rocket.y - 100, 2)));
}
function insideBox(rocket) {
    let x = rocket.x;
    let y = rocket.y;
    return (x >= 200 && x <= 620 && y >= 200 && y <= 260)
        || (x < 0 && y < 0)
        || (x < 0 && y > 800)
        || (x > 800 && y < 0)
        || (x > 800 && y > 800);
}