///<reference path = PhysicsEngine.js />
//Base Block
var createBlock = function (spec, my) {
    var that;
    var entityDef = null;
    my = my || {};

    my.physBody = null;

    spec.typeForCollision = spec.typeForCollision || "Block";
    that = createEntity(spec, my);

    var superInit = that.superior('init');
    var superUpdate = that.superior('update');
    var superDraw = that.superior('draw');
    var superKill = that.superior('kill');

    my.currSprite = null;

    if (spec) {
        my.currSprite = spec.sprite || null;

        entityDef = {
            x: spec.pos.x,
            y: spec.pos.y,
            halfWidth: spec.size.x * 0.5,
            halfHeight: spec.size.y * 0.5,
            type:'static',
            userData: {
                ent:that
            }
        };

//        my.physBody = gPhysicsEngine.addBody(entityDef);
    }

    that.init = function (args) {
        superInit(args);
        if (args) {
            var entityDef = {
                x: args.pos.x,
                y: args.pos.y,
                halfWidth: args.size.x * 0.5,
                halfHeight: args.size.y * 0.5,
                type: 'static',
                userData: {
                    ent: that
                }
            };
            
//            my.physBody = gPhysicsEngine.addBody(entityDef);
            //TODO replace for animation instead of sprite
           // my.currSprite = args.sprite || my.currSprite;
        }
    };

    that.draw = function () {
      //  console.log("draw block");
        superDraw();
    };

    that.onTouch = function (otherEntity) {

    };

    that.update = function () {
        superUpdate();
        //TODO
        //update animation and set currSprite to the current sprite in the animation
    };

    that.kill = function () {
        superKill();
    };

    return that;
};

//destroyableBlock
var createDestroyableBlock = function (spec, my) {
    var that;
    var entityDef = null;
    my = my || {};

    my.physBody = null;

    spec.typeForCollision = spec.typeForCollision || "DestroyableBlock";
    that = createBlock(spec, my);

    var superInit = that.superior('init');
    var superUpdate = that.superior('update');
    var superDraw = that.superior('draw');
    var superKill = that.superior('kill');

    my.currSprite = null;
    my.lives = 1;

    if (spec) {
        my.currSprite = spec.sprite || null;
        my.lives = spec.lives || my.lives;

        entityDef = {
            x: spec.pos.x,
            y: spec.pos.y,
            halfWidth: spec.size.x * 0.5,
            halfHeight: spec.size.y * 0.5,
            type:'static',
            userData: {
                ent:that
            }
        };
    }


    that.init = function (args) {
        superInit(args);
        if (args) {
            var entityDef = {
                x: args.pos.x,
                y: args.pos.y,
                halfWidth: args.size.x * 0.5,
                halfHeight: args.size.y * 0.5,
                type: 'static',
                userData: {
                    ent: that
                }
            };
            my.lives = args.lives || my.lives;
            //            my.physBody = gPhysicsEngine.addBody(entityDef);
            //TODO replace for animation instead of sprite
            // my.currSprite = args.sprite || my.currSprite;
        }
    };

    that.draw = function () {
      //  console.log("draw block");
        superDraw();
    };

    that.onTouch = function (otherEntity) {
        my.lives--;
        if (my.lives <= 0) {
            that.kill();
        }
    };

    that.update = function () {
        superUpdate();
    };

    that.kill = function () {
        superKill();
    };

    return that;
};

//redBlock
var createRedBlock = function (spec, my) {
    var that;
    my = my || {};
    spec = spec || {};

    spec.sprite = 'redblock_1';
    spec.lives = 1;
    that = createDestroyableBlock(spec, my);

    var superInit = that.superior('init');
    var superUpdate = that.superior('update');
    var superKill = that.superior('kill');

    that.init = function (args) {
        args = args || {};
        args.sprite = args.sprite || 'redblock_1';
        args.lives = args.lives || 1;
        superInit(args);
    };

    return that;
};

//greenBlock
var createGreenBlock = function (spec, my) {
    var that;
    my = my || {};
    spec = spec || {};

    spec.sprite = 'greenblock_1';
    spec.lives = 1;
    that = createDestroyableBlock(spec, my);

    var superInit = that.superior('init');
    var superUpdate = that.superior('update');
    var superKill = that.superior('kill');

    that.init = function (args) {
        args = args || {};
        args.sprite = args.sprite || 'greenblock_1';
        args.lives = args.lives || 1;
        superInit(args);
    };

    return that;
};

//blueBlock
var createBlueBlock = function (spec, my) {
    var that;
    my = my || {};
    spec = spec || {};

    spec.sprite = 'blueblock_1';
    spec.lives = 1;
    that = createDestroyableBlock(spec, my);

    var superInit = that.superior('init');
    var superUpdate = that.superior('update');
    var superKill = that.superior('kill');

    that.init = function (args) {
        args = args || {};
        args.sprite = args.sprite || 'blueblock_1';
        args.lives = args.lives || 1;
        superInit(args);
    };

    return that;
};

gGameEngine.factory["redBlock"] = createRedBlock;
gGameEngine.factory["greenBlock"] = createGreenBlock;
gGameEngine.factory["blueBlock"] = createBlueBlock;