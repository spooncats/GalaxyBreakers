var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
                    player: null,
                    healthpoints: null,
                    reticle: null,
                    moveKeys: null,
                    playerBullets: null,
                    enemyBullets: null,
                    time: 0,
                }
    }
};

var game = new Phaser.Game(config);

var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    // Bullet Constructor
    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.setSize(12, 12, true);
    },

    // Fires a bullet from the player to the reticle
    fire: function (shooter, target)
    {
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan( (target.x-this.x) / (target.y-this.y));

        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (target.y >= this.y)
        {
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        }
        else
        {
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
    },

    // Updates the position of the bullet each cycle
    update: function (time, delta)
    {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});

function preload ()
{
    // Load in images and sprites
    this.load.spritesheet('player_handgun', 'Assets/Sprites/wipGunner.png',
        { frameWidth: 66, frameHeight: 60 }
    ); // Made by tokkatrain: https://tokkatrain.itch.io/top-down-basic-set
    this.load.image('bullet', 'Assets/Sprites/bullet.png');
    this.load.image('target', 'Assets/Sprites/reticle.png');
    this.load.image('background', 'Assets/Sprites/spaceBG.jpg');
    this.load.image('heart', 'Assets/Sprites/heart.png');
    this.load.image('loss', 'Assets/Sprites/loss.png');
    
    this.load.audio('shoot', 'Assets/Sound/Shoot.wav')
    this.load.audio('hit', 'Assets/Sound/Hit.wav')
    this.load.audio('death', 'Assets/Sound/Death.wav')
    
    this.load.image('tutorial', 'Assets/Sprites/tutorialBlock.png')
}

var maxEnemies;
var currentEnemies;
var activeEnemies;
var enemies = [];
var start = false;

function create ()
{
    // Set world bounds
    this.physics.world.setBounds(0, 0, 3000, 2000);

    // Add 2 groups for Bullet objects
    playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

    // Add background player, enemy, reticle, healthpoint sprites
    var background = this.add.image(1500, 1000, 'background');
    player = this.physics.add.sprite(800, 600, 'player_handgun');
    //enemy = this.physics.add.sprite(300, 600, 'player_handgun');
    //enemy2 = this.physics.add.sprite(1400, 800, 'player_handgun');
    reticle = this.physics.add.sprite(800, 700, 'target');
    hp1 = this.add.image(-350, -250, 'heart').setScrollFactor(0, 0);
    hp2 = this.add.image(-300, -250, 'heart').setScrollFactor(0, 0);
    hp3 = this.add.image(-250, -250, 'heart').setScrollFactor(0, 0);

    // Set image/sprite properties
    background.setOrigin(0.5, 0.5).setDisplaySize(3000, 2000);
    player.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true).setDrag(500, 500);
    //var enemies = [];
    maxEnemies = 5;
    currentEnemies = 0;
    activeEnemies = 0;
    //create list of a certain amount of enemies, assign health/position/etc values
    for(var i = 0; i<maxEnemies; i++){
        newEnemy = this.physics.add.sprite(Phaser.Math.Between(100, 2900),Phaser.Math.Between(100, 1900),'player_handgun');
        newEnemy.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true);
        newEnemy.fireRate = Phaser.Math.Between(3000, 6000);
        newEnemy.lastFired = 0;
        newEnemy.health = 1;
        this.physics.add.collider(player, newEnemy);
        enemies.push(newEnemy);
        currentEnemies++;
        activeEnemies++;
    }
    //enemy.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true);
    //enemy2.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true);
    reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);
    
    hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    
    //set colliders
    //this.physics.add.collider(player, enemy);
    //this.physics.add.collider(player, enemy2);

    // Set sprite variables
    player.health = 3;
    //enemy.health = 3;
    //enemy.lastFired = 0;
    //enemy2.health = 3;
    //enemy2.lastFired = 0;

    // Set camera properties
    this.cameras.main.zoom = 0.5;
    this.cameras.main.startFollow(player);
    //this.camera.deadzone = new Phaser.Rectangle(300, 300, 400, 300);
    
    // Set SFX
    shootSFX = this.sound.add("shoot", {loop: false});
    hitSFX = this.sound.add("hit", {loop: false});
    deathSFX = this.sound.add("death", {loop: false});
    
    //NEW MOVEMENT -------------------------------------
    player.setFrictionX(100);
    player.setFrictionY(100);
    this.cursors = this.input.keyboard.addKeys(
        {up:Phaser.Input.Keyboard.KeyCodes.W,
         down:Phaser.Input.Keyboard.KeyCodes.S,
         left:Phaser.Input.Keyboard.KeyCodes.A,
         right:Phaser.Input.Keyboard.KeyCodes.D});
    

    // Fires bullet from player on left click of mouse
    this.input.on('pointerdown', function (pointer, time, lastFired) {
        if (player.active === false)
            return;

        // Get bullet from bullets group
        var bullet = playerBullets.get().setActive(true).setVisible(true);

        if (bullet)
        {
            bullet.fire(player, reticle);
            for(var i = 0; i<currentEnemies; i++){    
                this.physics.add.collider(enemies[i], bullet, enemyHitCallback);
            }
        }
    }, this);

    // Pointer lock will only work after mousedown
    game.canvas.addEventListener('mousedown', function () {
        game.input.mouse.requestPointerLock();
        shootSFX.play();
    });

    // Exit pointer lock when Q or escape (by default) is pressed.
    this.input.keyboard.on('keydown_Q', function (event) {
        if (game.input.mouse.locked)
            game.input.mouse.releasePointerLock();
    }, 0, this);

    // Move reticle upon locked pointer move
    this.input.on('pointermove', function (pointer) {
        if (this.input.mouse.locked)
        {
            reticle.x += pointer.movementX;
            reticle.y += pointer.movementY;
        }
    }, this);
    
    // tutorial screen functionality WILL REQUIRE SCENE CHANGE. RECONFIG CODE TO SCENES BEFORE IMPLEMENTATION
    //var tutorial = this.add.image(800, 600, 'tutorial');
    
    //game ui
    
    
}

function enemyHitCallback(enemyHit, bulletHit)
{
    // Reduce health of enemy
    if (bulletHit.active === true && enemyHit.active === true)
    {
        enemyHit.health = enemyHit.health - 1;
        console.log("Enemy hp: ", enemyHit.health);
        hitSFX.play();

        // Kill enemy if health <= 0
        if (enemyHit.health <= 0)
        {
            //currentEnemies--;
            activeEnemies--;
            console.log(activeEnemies);
            enemyHit.setActive(false).setVisible(false);
            deathSFX.play();
            //enemies.splice(enemies.indexOf(enemyHit));
            
        }

        // Destroy bullet
        bulletHit.setActive(false).setVisible(false);
    }
}

function playerHitCallback(playerHit, bulletHit)
{
    // Reduce health of player
    if (bulletHit.active === true && playerHit.active === true)
    {
        playerHit.health = playerHit.health - 1;
        console.log("Player hp: ", playerHit.health);
        hitSFX.play();

        // Kill hp sprites and kill player if health <= 0
        if (playerHit.health == 2)
        {
            hp3.destroy();
        }
        else if (playerHit.health == 1)
        {
            hp2.destroy();
        }
        else
        {
            hp1.destroy();
            // Game over state should execute here
        }

        // Destroy bullet
        bulletHit.setActive(false).setVisible(false);
    }
}

function enemyFire(enemy, player, time, gameObject)
{
    if (enemy.active === false)
    {
        return;
    }

    if ((time - enemy.lastFired) > enemy.fireRate)
    {
        enemy.lastFired = time;

        // Get bullet from bullets group
        var bullet = enemyBullets.get().setActive(true).setVisible(true);

        if (bullet)
        {
            bullet.fire(enemy, player);
            // Add collider between bullet and player
            gameObject.physics.add.collider(player, bullet, playerHitCallback);
            shootSFX.play()
        }
    }
}

// Ensures sprite speed doesnt exceed maxVelocity while update is called
function constrainVelocity(sprite, maxVelocity)
{
    if (!sprite || !sprite.body)
      return;

    var angle, currVelocitySqr, vx, vy;
    vx = sprite.body.velocity.x;
    vy = sprite.body.velocity.y;
    currVelocitySqr = vx * vx + vy * vy;

    if (currVelocitySqr > maxVelocity * maxVelocity)
    {
        angle = Math.atan2(vy, vx);
        vx = Math.cos(angle) * maxVelocity;
        vy = Math.sin(angle) * maxVelocity;
        sprite.body.velocity.x = vx;
        sprite.body.velocity.y = vy;
    }
}

// Ensures reticle does not move offscreen
function constrainReticle(reticle)
{
    var distX = reticle.x-player.x; // X distance between player & reticle
    var distY = reticle.y-player.y; // Y distance between player & reticle

    // Ensures reticle cannot be moved offscreen (player follow)
    if (distX > 800)
        reticle.x = player.x+800;
    else if (distX < -800)
        reticle.x = player.x-800;

    if (distY > 600)
        reticle.y = player.y+600;
    else if (distY < -600)
        reticle.y = player.y-600;
}

function update (time, delta)
{
    
    // Rotates player to face towards reticle
    player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

    // Rotates enemy to face towards player
    for(var i = 0; i<currentEnemies; i++){    
        //console.log(currentEnemies);
        //if(enemies[i].active == true){
            enemies[i].rotation = Phaser.Math.Angle.Between(enemies[i].x, enemies[i].y, player.x, player.y);
            enemyFire(enemies[i],player,time,this);
        //}
    }
    //enemy2.rotation = Phaser.Math.Angle.Between(enemy2.x, enemy2.y, player.x, player.y);
    
    //spawns new enemies as enemies are killed
    if(activeEnemies < maxEnemies){
            //console.log(currentEnemies);
            newEnemy = this.physics.add.sprite(Phaser.Math.Between(100, 2900),Phaser.Math.Between(100, 1900),'player_handgun');
            newEnemy.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true);
            newEnemy.fireRate = Phaser.Math.Between(3000, 6000);
            newEnemy.lastFired = 0;
            newEnemy.health = 1;
            this.physics.add.collider(player, newEnemy);
            enemies.push(newEnemy);
            currentEnemies++;
            activeEnemies++;
    }
    //Make reticle move with player
    reticle.body.velocity.x = player.body.velocity.x;
    reticle.body.velocity.y = player.body.velocity.y;

    // Constrain velocity of player
    constrainVelocity(player, 500);

    // Constrain position of constrainReticle
    constrainReticle(reticle);

    // Make enemy fire
    //enemyFire(enemy, player, time, this);
    //enemyFire(enemy2, player, time, this);
    
    //NEW MOVEMENT -------------------------------------
    if(this.cursors.up.isDown){
        player.setAccelerationY(-800)
    }
    if(this.cursors.down.isDown){
        player.setAccelerationY(800)
    }
    if(this.cursors.up.isUp && this.cursors.down.isUp){
        player.setAccelerationY(0)
    }
    if(this.cursors.left.isDown){
        player.setAccelerationX(-800)
    }
    if(this.cursors.right.isDown){
        player.setAccelerationX(800)
    }
    if(this.cursors.right.isUp && this.cursors.left.isUp){
        player.setAccelerationX(0)
    }
    
    if(player.health <= 0){
        loss = this.add.image(400, 300, 'loss').setScrollFactor(0, 0);
        game.scene.pause("default");
    }
}