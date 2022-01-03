///<reference path = Core.js />
///<reference path = PhysicsEngine.js />
///<reference path = SpriteManager.js />
//Base Block
var createPlayer = function (spec, my) {
    var that;
    var entityDef = null;
    my = my || {};

    my.physBody = null;

    var speed = 3.0;
    var gluedBalls = [];

    spec.typeForCollision = spec.typeForCollision || "Player";

    that = createEntity(spec, my);

    var superInit = that.superior('init');
    var superUpdate = that.superior('update');
    var superDraw = that.superior('draw');
    var superKill = that.superior('kill');

    my.currSprite = "player";    

    if (spec) {
        my.currSprite = spec.sprite || my.currSprite;
        my.radius = spec.radius || my.radius;
        my.scale = spec.scale || my.scale;
        speed = spec.speed || speed;

        entityDef = {
            x: spec.pos.x,
            y: spec.pos.y,
            type: 'dynamic',
            shape:'circle',
            radius:spec.radius,
            userData: {
                ent:that
            }
        };

//        my.physBody = gPhysicsEngine.addBody(entityDef);
    }

    that.getPhysBody = function () {
        return my.physBody;
    };

    that.addGluedBall = function (ball) {
        ball.setGlued(true);
        gluedBalls.push(ball);
    };

    that.removeGluedBall = function (ball) {
        ball.setGlued(false);
        gluedBalls.erase(ball);
    };

    that.init = function (args) {
        superInit(args);
        if (args) {
            my.radius = args.radius || my.radius;
            my.scale = args.scale || my.scale;
            speed = args.speed || speed;

            var entityDef = {
                x: args.pos.x,
                y: args.pos.y,
                halfWidth: args.size.x * 0.5,
                halfHeight: args.size.y * 0.5,
                type: 'dynamic',
                shape: 'circle',
                useBouncyFixture: true,
                radius: spec.radius,
                userData: {
                    ent: that,
                    type:'player'
                }
            };
            
//            my.physBody = gPhysicsEngine.addBody(entityDef);
        }
    };

    that.move = function (xDir) {
        var i = 0;
        var ballDir = null;

        my.last.x = my.pos.x;
        my.last.y = my.pos.y;

        var hlfSize = {
            x: my.size.x * 0.5,
            y: my.size.y * 0.5
        };

        my.pos.x += xDir * speed;

        var levelSize = gGameEngine.commonLevelConfig.levelSize;

        if (my.pos.x + hlfSize.x * my.scale.x >= levelSize.right) {
            my.pos.x = levelSize.right - hlfSize.x * my.scale.x;
        } else if (my.pos.x - hlfSize.x * my.scale.x <= levelSize.left) {
            my.pos.x = levelSize.left + hlfSize.x * my.scale.x;
        }

        ballDir = {
            x: my.pos.x - my.last.x,
            y: 0,
        };

        for (i = 0; i < gluedBalls.length; ++i) {
            gluedBalls[i].move(ballDir);
        }
    };

    that.shoot = function () {
        for (var i = 0; i < gluedBalls.length; ++i) {
            that.removeGluedBall(gluedBalls[i]);
        }
    };

    that.update = function () {
        superUpdate();
    };

    that.onTouch = function (otherEntity) {

    };

    that.draw = function () {
        superDraw();
    };

    that.kill = function () {
        superKill();
    };

    return that;
};

gGameEngine.factory["player"] = createPlayer;