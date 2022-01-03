///<reference path = PhysicsEngine.js />
///<reference path = SpriteManager.js />
//Base Block
var createBall = function (spec, my) {
    var that;
    var entityDef = null;
    my = my || {};

    my.physBody = null;
    
    var glued = true;

    var speed = 2;
    var dir = {
        x:0.7071,
        y: 0.7071
    };

    that = createEntity(spec, my);

    var superInit = that.superior('init');
    var superUpdate = that.superior('update');
    var superDraw = that.superior('draw');
    var superKill = that.superior('kill');

    my.currSprite = "ball";
    my.radius = 3;

    if (spec) {
        my.currSprite = spec.sprite || my.currSprite;
        my.radius = spec.radius || my.radius;
        glued = spec.glued || glued;

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

    that.getRadius = function () {
        return my.radius;
    };

    that.setGlued = function (val) {
        if(val == true || val == false)
            glued = val;
    };

    that.getGlued = function () {
        return glued;
    };

    that.getPhysBody = function () {
        return my.physBody;
    };

    that.init = function (args) {
        superInit(args);
        if (args) {
            my.radius = args.radius || my.radius;
            glued = args.glued || glued;

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
                    type:'ball'
                }
            };
            
//            my.physBody = gPhysicsEngine.addBody(entityDef);
        }
    };

    that.onTouch = function (otherEntity) {
        
    };

    that.move = function (dir) {
        if (glued) {
            my.last.x = my.pos.x;
            my.last.y = my.pos.y;

            my.pos.x += dir.x;
            my.pos.y += dir.y;
        }
    };

    that.update = function () {
        // console.log("update ball");
        superUpdate();
        if (!glued) {
            var physPos = null;
            my.last.x = my.pos.x;
            my.last.y = my.pos.y;

            var hlfSize = {
                x: my.size.x * 0.5,
                y: my.size.y * 0.5
            };

            console.log("before my.pos += dir * speed");
            console.log("pos.x=" + my.pos.x + ", pos.y=" + my.pos.y + ",dir.x=" + dir.x + ", dir.y=" + dir.y + ", speed=" + speed);

            my.pos.x += dir.x * speed;
            my.pos.y += dir.y * speed;

            console.log("after my.pos += dir * speed");
            console.log("pos.x=" + my.pos.x + ", pos.y=" + my.pos.y + ",dir.x=" + dir.x + ", dir.y=" + dir.y + ", speed=" + speed);

            var levelSize = gGameEngine.commonLevelConfig.levelSize;

            console.log("before resolve collision");
            console.log("pos.x=" + my.pos.x + ", pos.y=" + my.pos.y + ",dir.x=" + dir.x + ", dir.y=" + dir.y);
            resolveCollision();

            console.log("after resolve collision");
            console.log("pos.x=" + my.pos.x + ", pos.y=" + my.pos.y + ",dir.x=" + dir.x + ", dir.y=" + dir.y);

            if (my.pos.x + hlfSize.x >= levelSize.right) {
                my.pos.x = levelSize.right - hlfSize.x;
                dir.x *= -1;
            } else if (my.pos.x - hlfSize.x <= levelSize.left) {
                my.pos.x = levelSize.left + hlfSize.x;
                dir.x *= -1;
            }

            if (my.pos.y + hlfSize.y >= levelSize.bottom) {
                my.pos.y = levelSize.bottom - hlfSize.y;
                dir.y *= -1;
            } else if (my.pos.y - hlfSize.y <= levelSize.top) {
                my.pos.y = levelSize.top + hlfSize.y;
                dir.y *= -1;
            }
        }
    };

    var resolveCollision = function () {
        var i = 0;
        var ent = null;
        var circle = null;
        var rect = null;
        var collisionEntities = [];
        var collisionPoint = {};

        //debug
//        gSpriteManager.drawCircle({ x: my.pos.x, y: my.pos.y, radius:that.radius});

        for (i = 0; i < gGameEngine.entities.length; i++) {
            ent = gGameEngine.entities[i];

            //if the entity isn't this ball
            if (ent != that) {
                if (ent.getTypeForCollision() == "Block" || ent.getTypeForCollision() == "DestroyableBlock" || ent.getTypeForCollision() == "Player") {

                    //debug
//                    gSpriteManager.drawRect({ x: ent.getPos().x, y: ent.getPos().y, width: ent.getSize().x, height: ent.getSize().y });

                    if (ballBlockCollision(that, ent))
                        collisionEntities.push(ent);
                }
            }
        }

        if (collisionEntities.length > 0) {
            //Go back in order to try to get a more precise collision point.
            //Then set new ball's direction
            var steps = 0;
            var length = collisionEntities.length;
            var previousCollisionEntities = [];

            //while there are elements with which the ball is colliding
            while (collisionEntities.length) {
                previousCollisionEntities = [];
                steps++;
                my.pos.x -= dir.x;
                my.pos.y -= dir.y;

                for (i = 0; i < collisionEntities.length; i++) {
                    previousCollisionEntities.push(collisionEntities[i]);
                }

                //for each colliding entity, it is removes from the array and,
                //if it is still colliding after moving back the ball, it is pushed back to the array
                //The array is treated as a queue
                for (i = 0; i < length; i++) {
                    ent = collisionEntities.shift();
                    if (ballBlockCollision(that, ent)) {
                        collisionEntities.push(ent);
                    }
                }

                length = collisionEntities.length;
            }

            my.pos.x += dir.x;
            my.pos.y += dir.y;
            steps--;

            var newDirection = {
                x: 0,
                y:0
            };
            circle = {
                x: my.pos.x,
                y: my.pos.y,
                radius: my.radius
            };
            for (i = 0; i < previousCollisionEntities.length; i++) {
                ent = previousCollisionEntities[i];

                rect = {
                    x: ent.getPos().x - ent.getSize().x * 0.5 * ent.getScale().x,
                    y: ent.getPos().y - ent.getSize().y * 0.5 * ent.getScale().y,
                    width: ent.getSize().x * ent.getScale().x,
                    height: ent.getSize().y * ent.getScale().y
                };

//                console.log("circle.x=" + circle.x + ", circle.y=" + circle.y + ", circle.radius=" + circle.radius);
//                console.log("rect.left=" + rect.x + ", rect.top=" + rect.y + ", rect.right=" + (rect.x + rect.width) + ", rect.bottom=" + (rect.y + rect.height));

                if (circleTopBottomRectangleCollision(circle, rect)) {
                    newDirection.x += dir.x;
                    newDirection.y -= dir.y;
                } else if (circleLeftRightRectangleCollision(circle, rect)) {
                    newDirection.x -= dir.x;
                    newDirection.y += dir.y;
                } else if (circleRectangleCornersCollision(circle, rect, collisionPoint)) {
                    var xDir = circle.x - collisionPoint.x;
                    var yDir = circle.y - collisionPoint.y;

                    newDirection.x += xDir;
                    newDirection.y += yDir;
                } else {
                    newDirection.x += dir.x;
                    newDirection.y += dir.y;
                }

                ent.onTouch(that);
            }
            console.log("previousCollisionEntities.length=" + previousCollisionEntities.length);
            console.log("newDirection.x=" + newDirection.x + ", newDirection.y=" + newDirection.y);
            console.log("pos.x=" + my.pos.x + ", pos.y=" + my.pos.y + ",dir.x=" + dir.x + ", dir.y=" + dir.y);

            dir.x = newDirection.x / previousCollisionEntities.length;
            dir.y = newDirection.y / previousCollisionEntities.length;

            //Normalize dir
            var dirLength = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
            dir.x = dir.x / dirLength;
            dir.y = dir.y / dirLength;

            my.pos.x += dir.x * steps;
            my.pos.y += dir.y * steps;
        }
    };

    var ballBlockCollision = function (ball, block) {
        var circle = {
            x: ball.getPos().x,
            y: ball.getPos().y,
            radius: ball.getRadius()
        };
        var rect = {
            x: block.getPos().x - block.getSize().x * 0.5 * block.getScale().x,
            y: block.getPos().y - block.getSize().y * 0.5 * block.getScale().y,
            width: block.getSize().x * block.getScale().x,
            height: block.getSize().y * block.getScale().y,
        };

        return circleRectangleCollision(circle, rect);
    };

    var circleInsideRectangle = function (circle, rect) {
        return circle.x >= rect.x && circle.x <= rect.x + rect.width &&
               circle.y >= rect.y && circle.y <= rect.y + rect.height;
    };

    var circleTopBottomRectangleCollision = function (circle, rect) {
        return (circle.x >= rect.x && circle.x <= rect.x + rect.width) &&
               (circle.y + circle.radius >= rect.y && circle.y - circle.radius <= rect.y + rect.height);
    };

    var circleLeftRightRectangleCollision = function (circle, rect) {
        return (circle.y >= rect.y && circle.y <= rect.y + rect.height) &&
               (circle.x + circle.radius >= rect.x && circle.x - circle.radius <= rect.x + rect.width);
    };

    var circleRectangleCornersCollision = function (circle, rect, collisionPoint) {
        var radiusSqr = circle.radius*circle.radius;
        var xDist = circle.x - rect.x;
        var yDist = circle.y - rect.y;
        var distanceSqr = xDist * xDist + yDist * yDist;
        if (distanceSqr <= radiusSqr) {
            collisionPoint.x = rect.x;
            collisionPoint.y = rect.y;

            return true;
        }else {
            yDist = circle.y - (rect.y + rect.height);
            distanceSqr = xDist * xDist + yDist * yDist;
            if (distanceSqr <= radiusSqr) {
                collisionPoint.x = rect.x;
                collisionPoint.y = rect.y+rect.height;
                return true;
            }else {
                xDist = circle.x - (rect.x + rect.width);
                distanceSqr = xDist * xDist + yDist * yDist;
                if (distanceSqr <= radiusSqr) {
                    collisionPoint.x = rect.x + rect.width;
                    collisionPoint.y = rect.y + rect.height;
                    return true;
                } else {
                    yDist = circle.y - rect.y;
                    distanceSqr = xDist * xDist + yDist * yDist;
                    if (distanceSqr <= radiusSqr) {
                        collisionPoint.x = rect.x + rect.width;
                        collisionPoint.y = rect.y;
                        return true;
                    } else {
                        collisionPoint = null;
                        return false;
                    }
                }
            }
        }
    };

    var circleRectangleCollision = function (circle, rect) {
        var collisionPoint = {};
        return circleInsideRectangle(circle, rect) ||
               circleTopBottomRectangleCollision(circle, rect) ||
               circleLeftRightRectangleCollision(circle, rect) ||
               circleRectangleCornersCollision(circle, rect, collisionPoint);
    };


    that.draw = function () {
       // console.log("draw ball");
        superDraw();
    };

    that.kill = function () {
        superKill();
    };

    return that;
};

gGameEngine.factory["ball"] = createBall;