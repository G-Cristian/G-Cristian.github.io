///<reference path=Box2d.min.js />
///<reference path=GameEngine.js />

//gPhysicsEngine
var gPhysicsEngine =
    {
        dbgDraw:null,
        world: null,
        create: function () {
            
            this.world = new Box2D.Dynamics.b2World(
                new Box2D.Common.Math.b2Vec2(0, 0),
                false);
        },
        setDebug:function(){
            gPhysicsEngine.dbgDraw = new Box2D.Dynamics.b2DebugDraw();
            gPhysicsEngine.dbgDraw.SetSprite(gGameEngine.ctx);
            gPhysicsEngine.dbgDraw.m_drawFlags = Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit;
            gPhysicsEngine.world.SetDebugDraw(gPhysicsEngine.dbgDraw);

            console.log("dbgDraw = " + gPhysicsEngine.dbgDraw);
        },
        addContactListener: function (callbacks) {
            var listener = new Box2D.Dynamics.b2ContactListener();

            if (callbacks.PostSolve) listener.PostSolve = function (contact, impulse) {
                callbacks.PostSolve(contact.GetFixtureA().GetBody(),
                                    contact.GetFixtureB().GetBody(),
                                    impulse.normalImpulses[0]);
            };

            gPhysicsEngine.world.SetContactListener(listener);
        },
        registerBody:function(bodyDef){
            var body = gPhysicsEngine.world.CreateBody(bodyDef);

            return body;
        },
        addBody:function(entityDef)
        {
            var bodyDef = new Box2D.Dynamics.b2BodyDef();

            if (entityDef.type == 'static') {
                bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
            }
            else {
                bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            }
            bodyDef.position.x = entityDef.x;
            bodyDef.position.y = entityDef.y;
            bodyDef.angle = entityDef.angle * Box2D.Common.b2Settings.b2_pi / 180;

            if (entityDef.userData) {
                bodyDef.userDate = entityDef.userData;
            }

            var body = this.registerBody(bodyDef);
            var fixtureDefinition = new Box2D.Dynamics.b2FixtureDef();

            if (entityDef.useBouncyFixture) {
                fixtureDefinition.density = 1.0;
                fixtureDefinition.friction = 0;
                fixtureDefinition.restitution = 1.0;
            }

            if (entityDef.shape == 'circle') {
                fixtureDefinition.shape = new Box2D.Collision.Shapes.b2CircleShape(entityDef.radius);
            }
            else {
                fixtureDefinition.shape = new Box2D.Collision.Shapes.b2PolygonShape();
                fixtureDefinition.shape.SetAsBox(entityDef.halfWidth, entityDef.halfHeight);
            }
            body.CreateFixture(fixtureDefinition);

            return body;
        },
        removeBody:function(obj){
            gPhysicsEngine.world.DestroyBody(obj);
        },
        update: function () {
            var start = Date.now();
            gPhysicsEngine.world.Step(
                1/30,
                10,
                10
                );
            gPhysicsEngine.world.ClearForces();

            return Date.now() - start;
        },
        drawDebug: function () {
          //  console.log("drawDebug");
          //  console.log("dbgDraw = " + gPhysicsEngine.dbgDraw);
            if (gPhysicsEngine.dbgDraw) {
                gPhysicsEngine.world.DrawDebugData();
         //       console.log("gPhysicsEngine.world.DrawDebugData();");
            }
        }
    };