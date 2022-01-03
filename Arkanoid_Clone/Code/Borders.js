///<reference path = PhysicsEngine.js />
//Border
var createBorder = function (spec, my) {
    var that;
    var entityDef = null;
    my = my || {};

    my.physBody = null;

    side = null;

    that = createEntity(spec, my);

    var superInit = that.superior('init');
    var superUpdate = that.superior('update');
    var superDraw = that.superior('draw');
    var superKill = that.superior('kill');

    my.currSprite = 'wall';

    if (spec) {
        my.currSprite = spec.sprite || my.currSprite;
        my.angle = spec.rotation || my.angle;
        side = spec.side || 'bottom';
        entityDef = {
            x: spec.pos.x,
            y: spec.pos.y,
            angle: spec.rotation,
            halfWidth: spec.size.x * 0.5,
            halfHeight: spec.size.y * 0.5,
            type: 'static',
            userData: {
                ent: that,
                type:'border'
            }
        };

 //       my.physBody = gPhysicsEngine.addBody(entityDef);
    }

    that.init = function (args) {
        superInit(args);
        if (args) {
            var entityDef = {
                x: args.pos.x,
                y: args.pos.y,
                angle: spec.rotation,
                halfWidth: args.size.x * 0.5,
                halfHeight: args.size.y * 0.5,
                type: 'static',
                userData: {
                    ent: that
                }
            };

            my.currSprite = args.sprite || my.currSprite;
            my.angle = args.rotation || my.angle;

 //           my.physBody = gPhysicsEngine.addBody(entityDef);            
        }
    };

    that.draw = function () {
       // console.log("draw border");
        superDraw();
    };

    that.onTouch = function (otherBody, point, impulse) {

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

gGameEngine.factory["border"] = createBorder;