///<reference path="GameEngine.js"/>

//gSpriteManager
var gSpriteManager =
    {
        //dictionary of sprite sheets. Key: sprite sheet name. Value: sprite sheet image.
        spriteSheets: {},
        //dictionary of sprites. Key: sprite name. Value: sprite.
        sprites: {},

        init: function () {
            this.spriteSheets = {};
            this.sprites = {};
        },

        //loads a sprite sheet. It mustn't be called outside gSpriteManager.
        //if a sprite sheet is needed the method getSpriteSheet must be called.
        __loadSpriteSheetInternal: function (imgSrc, onload, onerror) {
            var img = null;
            if (!this.spriteSheets[imgSrc]) {
                img = new Image();
                img.onload = function () {
                    gSpriteManager.spriteSheets[imgSrc] = img;
                    onload(img);
                };
                img.onerror = function () {
                    onerror();
                };
                img.src = imgSrc;
            }
            else {
                console.log("Image '" + imgSrc + "' is already loaded.");
            }

            return null;
        },

        //returns a sprite sheet image. If the sprite sheet doesn't exist it is loaded.
        getSpriteSheet: function (imgSrc, onload, onerror) {
            var img = this.spriteSheets[imgSrc];
            if (!img) {
                this.__loadSpriteSheetInternal(imgSrc, function (image) {
                    img = image;
                    console.log("Image '" + imgSrc + "' loaded.");
                    onload(img);
                }, function () {
                    console.log("Image '" + imgSrc + "' couldn't be loaded.");
                    onerror();
                });
            }
            else {
                onload(img);
            }

            return img;
        },
        //loads sprites. It receives a json file which describes each sprite.
        /*format of JSON is:
        spriteName:{
                       spriteSheet:name of the spriteSheet file,
                       x: x position in sprite sheet,
                       y: y position in sprite sheet,
                       w: width in sprite sheet,
                       h: height in sprite sheet
                    },
        ...
        */
        loadSprites: function (spriteJSON) {
            var parsed = JSON.parse(spriteJSON);
            for (var key in parsed) {
                if (parsed.hasOwnProperty(key)) {
                    var func = function (spriteName) {
                        console.log("sprite = " + spriteName);
                        var sprite = parsed[spriteName];
                        gSpriteManager.getSpriteSheet(sprite.spriteSheet, function (image) {
                            var spriteSheet = image;
                            if (spriteSheet) {
                                var spt = {
                                    name: spriteName,
                                    img: spriteSheet,
                                    x: sprite.x,
                                    y: sprite.y,
                                    w: sprite.w,
                                    h: sprite.h,
                                    cx: -sprite.w * 0.5,
                                    cy: -sprite.h * 0.5,
                                };

                                if (!gSpriteManager.sprites[spriteName]) {
                                    gSpriteManager.sprites[spriteName] = spt;
                                }
                                else {
                                    console.log("Sprite '" + spriteName + "' already exists.");
                                }
                            } else {
                                console.log("Spritesheet '" + sprite.spriteSheet + "' not loaded yet.");
                            }
                        }, function () {
                            console.log("Spritesheet '" + sprite.spriteSheet + "' not loaded.");
                        });
                    }(key);
                }
            }
        },
        drawSprite: function (sprite, posX, posY, angle, scale) {
            var img = null;
            var spt = null;
            if (typeof (sprite) == 'object') {
                spt = sprite;
                img = sprite.img;
            }
            else if (typeof (sprite) == 'string') {
                spt = this.sprites[sprite];
                if (!spt) {
                    console.log("There isn't a sprite named '" + sprite + "'.");
                    return;
                }
                img = spt.img;
            }
            else {
                console.log("sprite parameter must be a sprite object or a string representing the sprite name.");
                return;
            }

            var hlf = {
                x: spt.cx,
                y: spt.cy
            };

            scale = scale || {
                x: 1.0,
                y: 1.0
            };

            var worldSize = gGameEngine.commonLevelConfig["worldSize"];
            
            // 'worldSize' world units (wu) = 'canvasSize' canvas units (cu)
            // '1' wu = 'canvasSize' / 'worldSize' cu

            var worldCanvasRatio = {
                x: gGameEngine.canvas.width / worldSize.x,
                y: gGameEngine.canvas.height / worldSize.y,
            };
           // console.log("worldCanvasRatio.x = " + worldCanvasRatio.x + " worldCanvasRatio.y = " + worldCanvasRatio.y);

            if (angle && angle != 0) {
                gGameEngine.ctx.save();
                gGameEngine.ctx.translate(posX * worldCanvasRatio.x, posY * worldCanvasRatio.y);
                gGameEngine.ctx.rotate(angle * Math.PI / 180);
                gGameEngine.ctx.drawImage(  img, spt.x, spt.y, spt.w, spt.h,
                                            hlf.x * worldCanvasRatio.x * scale.x, hlf.y * worldCanvasRatio.y * scale.y,
                                            spt.w * worldCanvasRatio.x * scale.x, spt.h * worldCanvasRatio.y * scale.y);
                gGameEngine.ctx.restore();
            }
            else {
                gGameEngine.ctx.drawImage(  img, spt.x, spt.y, spt.w, spt.h,
                                            (posX + hlf.x) * worldCanvasRatio.x * scale.x, (posY + hlf.y) * worldCanvasRatio.y * scale.y,
                                            spt.w * worldCanvasRatio.x * scale.x, spt.h * worldCanvasRatio.y * scale.y);
            }
        },
        drawRect: function (rect) {
            gGameEngine.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        },
        drawCircle: function (circ) {
            gGameEngine.ctx.beginPath();
            gGameEngine.ctx.arc(circ.x, cir.y, circ.radius, 0, 2 * Math.PI);
            gGameEngine.ctx.stroke();
        }
    };