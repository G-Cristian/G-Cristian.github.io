///<reference path="FilesManager.js"/>

//createLevel
var createLevel = function (spec) {
    var name = "",
        previousLevel = null,
        nextLevel = null,
        destroyableBlocksCount = 0;
    var that = {};

    if (spec) {
        name = name || spec.name;
        previousLevel = previousLevel || spec.previousLevel;
        nextLevel = nextLevel || spec.nextLevel;
        destroyableBlocksCount = destroyableBlocksCount || spec.destroyableBlocksCount;
    }

    that.getName = function () {
        return name;
    };
    that.getPreviousLevel = function () {
        return previousLevel;
    };
    that.getNextLevel = function () {
        return nextLevel;
    };
    that.getDestroyableBlocksCount = function () {
        return destroyableBlocksCount;
    };
    that.destroyBlock = function () {
        destroyableBlocksCount--;
        return destroyableBlocksCount;
    };

    return that;
};
var gLevelManager = {
    loadLevel: function (levelJSON) {
        var common = JSON.parse(gFilesManager.levelsConfigJSON);
        var parsed = JSON.parse(levelJSON);
        var borders = null;
        var border = null;
        var blocks = null;
        var block = null;
        var i = 0;
        var level = null;
        var entitySpec = null;
        var levelSpec = {
            name: "",
            previousLevel: null,
            nextLevel: null,
            destroyableBlocksCount: 0,
        };
        levelSpec.name = parsed.name;
        levelSpec.previousLevel = parsed.previousLevel || null;
        levelSpec.nextLevel = parsed.nextLevel || null;

        borders = common.borders;
        for (i = 0; i < borders.length; i++) {
            border = borders[i];
            entitySpec = {};
            entitySpec.pos = border.pos;
            entitySpec.size = border.size;
            entitySpec.side = border.side;
            entitySpec.rotation = border.rotation;
            gGameEngine.spawnEntity(border.type, entitySpec);
        }

        blocks = parsed.blocks;
        for (i = 0; i < blocks.length; i++) {
            block = blocks[i];
            entitySpec = {};
            entitySpec.pos = block.pos;
            entitySpec.size = block.size;
            gGameEngine.spawnEntity(block.type, entitySpec);
            if(block.isDestroyable)
                levelSpec.destroyableBlocksCount++;
        }
                
        level = createLevel(levelSpec);
    },
    loadNextLevel: function (currLevel, onload, onerror) {
        var level = null;
        var nextLevel = null;
        var levels = null;
        var nextLevelJSON = null;
        var i = 0;
        if (typeof (currLevel) == 'object')
            level = currLevel;
        else {
            console.log("currLevel must be an object");
            onerror();
            return;
        }

        if (level) {
            if (level.nextLevel) {
                levels = gFilesManager.levelsJSONs;
                for (i = 0; i < levels.length; i++) {
                    if (levels[i].path === level.nextLevel) {
                        nextLevelJSON = levels[i].json;
                        break;
                    }
                }

                //if I didn't find the next level json file in the levelsJSONs array
                //I have to load the json file.
                if (!nextLevelJSON) {
                    gFilesManager.readFile(level.nextLevel, function (responceText) {
                        nextLevelJSON = responceText;
                        nextLevel = this.loadLevel(nextLevelJSON);
                        onload(nextLevel);
                    });
                } else {
                    //if I found it.
                    nextLevel = this.loadLevel(nextLevelJSON);
                    onload(nextLevel);
                }
            }
            else {
                console.log("there isn't another level.");
                onload(null);
            }
        } else {
            console.log("currLevel is not defined.");
            onerror();
            return;
        }
    }
};