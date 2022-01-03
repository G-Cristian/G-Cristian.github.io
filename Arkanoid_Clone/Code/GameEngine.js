///<reference path = PhysicsEngine.js />
///<reference path = InputEngine.js />
///<reference path="LevelManager.js"/>

//gGameEngine
var gGameEngine =
    {
        _debug:true,
        commonLevelConfig: null,
        canvas:null,
        ctx: null,
        currLevel:null,
        factory: {},
        entities: [],
        _deferredKill: [],
        player:null,

        spawnEntity: function (type, spec) {
          //  console.log("spawn type " + type + " spec " + spec);
            var entity = this.factory[type](spec);
            this.entities.push(entity);
         //   console.log("entity " + entity);
            return entity;

        },
        removeEntity: function (ent) {
//            var physBody = null;
            this.entities.erase(ent);
//            if (ent.getPhysBody) {
//                physBody = ent.getPhysBody();
//                if (physBody) {
//                    gPhysicsEngine.removeBody(physBody);
//                }
//            }
        },
        setup: function () {
            var body = document.getElementById("body");
            var canvas = document.createElement("canvas");
            gFilesManager.init();
            //gFilesManager.readFile("http://localhost/arkanoid-clone/JSON/CanvasConfig.json", function (responceText) {
            gFilesManager.readFile("../JSON/CanvasConfig.json", function (responceText) {
                var parsed = JSON.parse(responceText);
                canvas.id = "canvas";
                canvas.width = parsed.width;
                canvas.height = parsed.height;
                canvas.style.border = parsed.border || "";
                console.log(parsed.border);
                console.log('canvas.style.border = parsed.border || "";');
                body.appendChild(canvas);
                console.log("body.appendChild(canvas);");
                gGameEngine.ctx = canvas.getContext('2d');
                console.log("gGameEngine.ctx = canvas.getContext('2d');");
                gGameEngine.canvas = canvas;
                gGameEngine.loadFiles();
                console.log("gGameEngine.loadFiles();");
            });
            /*console.log('var canvas = document.createElement("canvas");');
            var parsed = JSON.parse(CanvasConfig);
            console.log('var parsed = JSON.parse(CanvasConfig);');
            canvas.width = parsed.width;
            console.log('canvas.width = parsed.width;');
            canvas.height = parsed.height;
            body.appendChild(canvas);
            gGameEngine.loadFiles();
            */
        },
        loadFiles:function()
        {
            gFilesManager.loadConfigurationFile("../JSON/FilesToLoad.json", function () {
                var i = 0;
                console.log('gSpriteManager = ' + gSpriteManager);
                gSpriteManager.init();
                console.log('gSpriteManager.init();');
                for (i = 0; i < gFilesManager.spritesJSONs.length; i++) {
                    gSpriteManager.loadSprites(gFilesManager.spritesJSONs[i]);
                    console.log(gFilesManager.spritesJSONs[i]);
                }
 //               gPhysicsEngine.create();

                //debug
//                if (gGameEngine._debug)
//                    gPhysicsEngine.setDebug();
/*
                gPhysicsEngine.addContactListener({
                    PostSolve: function (bodyA, bodyB, impulse) {
                        var uA = bodyA ? bodyA.GetUserData() : null;
                        var uB = bodyB ? bodyB.GetUserData() : null;

                        if (uA !== null) {
                            if(uA.ent !== null && uA.ent.onTouch)
                                uA.ent.onTouch(bodyB, null, impulse);
                        }
                        if (uB !== null) {
                            if (uB.ent !== null && uB.ent.onTouch)
                                uB.ent.onTouch(bodyA, null, impulse);
                        }
                    }
                });
*/
                gInputEngine.init("body", gFilesManager.inputJSON);
                gGameEngine.commonLevelConfig = JSON.parse(gFilesManager.levelsConfigJSON);
                var level = gFilesManager.levelsJSONs[0].json;
                console.log("level " + level);
                gGameEngine.currLevel = gLevelManager.loadLevel(level);
                gGameEngine.start();
            });
            
        },
        start: function () {
            var ball = gGameEngine.initializeBall();
            gGameEngine.player = gGameEngine.initializePlayer(ball);
            

            setInterval(function () {
                gGameEngine.gameLoop();
            }, 33);
            
        },
        gameLoop: function () {
            gGameEngine.processInput();
            gGameEngine.update();
            gGameEngine.draw();
        },
        initializeBall:function(){
            var common = JSON.parse(gFilesManager.levelsConfigJSON);
            var entitySpec = {};
            entitySpec.pos = common.ball.pos;
            entitySpec.radius = common.ball.radius;
            var ball = gGameEngine.spawnEntity(common.ball.type, entitySpec);

            ball.setGlued(true);

            return ball;
        },
        initializePlayer:function(ball){
            var common = JSON.parse(gFilesManager.levelsConfigJSON);
            var entitySpec = {};
            entitySpec.pos = common.player.pos;
            entitySpec.size = common.player.size;
            var player = gGameEngine.spawnEntity(common.player.type, entitySpec);

            player.addGluedBall(ball);
            return player;
        },
        processInput: function () {
            if (gInputEngine.actions["MoveLeft"]) {
                gGameEngine.player.move(-3);
            }

            if (gInputEngine.actions["MoveRight"]) {
                gGameEngine.player.move(3);
            }

            if (gInputEngine.actions["Shoot"]) {
                gGameEngine.player.shoot();
            }
        },
        update: function () {
            var i = 0;
            var ent;
            for (i = 0; i < this.entities.length; i++) {
                ent = this.entities[i];
                if (!ent.killed()) {
                    ent.update();
                }
                else {
                    this._deferredKill.push(ent);
                }
            }

            for (i = 0; i < this._deferredKill.length; i++) {
                ent = this._deferredKill[i];
                gGameEngine.removeEntity(ent);
            }

            this._deferredKill = [];

 //           gPhysicsEngine.update();
        },
        draw: function () {
            gGameEngine.ctx.clearRect(0, 0, gGameEngine.canvas.width, gGameEngine.canvas.height);

            var ent = null;
            for (var i = 0; i < this.entities.length; i++) {
                ent = this.entities[i];
                if (!ent.killed()) {
                    //console.log("drawing " + ent + " in pos " + ent.getPos());
                    ent.draw();
                }
            }

 //           if (gGameEngine._debug) {
 //               console.log("draw physics debug");
               // gPhysicsEngine.drawDebug();
 //           }
        }
    };