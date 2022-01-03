var gTypesOfFileToLoad = {
    "scripts": function (script, callback) {
        var fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.addEventListener('onload', function (e) {
            console.log("script loaded.");
            callback();
        }, false);
        fileref.setAttribute("src", script);
        document.getElementsByTagName('head')[0].appendChild(fileref);
    },
    "sprites": function (sprite, callback) {
        gFilesManager.readFile(sprite, function (responceText) {
            gFilesManager.spritesJSONs.push(responceText);
            console.log(gFilesManager.spritesJSONs[gFilesManager.spritesJSONs.length - 1] + ' pushed.');
            callback();
        });
    },
    "sounds": function (sound, callback) {
        callback();
    },
    "levelsCommon":function(common, callback){
        gFilesManager.readFile(common, function (responceText) {
            gFilesManager.levelsConfigJSON = responceText;
            console.log("Levels Config (levelsCommon) : " + gFilesManager.levelsConfigJSON + " loaded.");
            callback();
        });
    },
    "inputs": function (inputs, callback) {
        gFilesManager.readFile(inputs, function (responceText) {
            gFilesManager.inputJSON = responceText;
            callback();
        });
    },
    "levels": function (level, callback) {
        gFilesManager.readFile(level, function (responceText) {
            gFilesManager.levelsJSONs.push({
                path: level,
                json: responceText
            });
            console.log(gFilesManager.levelsJSONs[gFilesManager.levelsJSONs.length - 1] + ' pushed.');
            callback();
        });
    }
}

//gFileManager
var gFilesManager =
    {
        spritesJSONs: [],
        soundsJSONs: [],
        inputJSON: null,
        levelsConfigJSON:null,
        levelsJSONs: [],
        init: function () {
            this.spritesJSONs = [];
            this.soundsJSONs = [];
        },
        readFile:function(fileName, callback, responceType){
            var xhr = new XMLHttpRequest();
            xhr.open("GET", fileName, true);
            if(responceType)
                xhr.responseType = responceType;
            xhr.onload = function () {
                callback(this.responseText);
            }
            /*xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        callback(xhr.responseText);
                        alert("status = 200 or 0");
                    }
                    alert("readystate = 4");
                }
            }*/
            xhr.send(null);
        },
        loadConfigurationFile: function (fileName, callback) {
            this.readFile(fileName, function (responseText) {
                var parsed = JSON.parse(responseText);
                var loadBatch = {
                    total:0,
                    count:0,
                    cb:callback
                };
                console.log("filename = " + fileName);
                console.log("responseText = " + responseText);
                console.log("parsed = " + parsed);
                for (var elem in parsed) {
                    if (parsed.hasOwnProperty(elem)) {
                        loadBatch.total++;
                        console.log("elem = " + elem);
                    }
                }

                for (var e in parsed) {
                    if (parsed.hasOwnProperty(e)) {
                        var foo = function (element) {
                            console.log('Loading ' + parsed[element] + ', type ' + e);
                            gFilesManager.loadAssets(parsed[element], element, function () {
                                gFilesManager.onLoadedCallback(element, loadBatch);
                            });
                        }(e);
                    }
                }
            });
        },
        loadAssets:function(assetList, typeOfData, callback){
            var batch = {
                total: assetList.length,
                count: 0,
                cb: callback
            };

            for (var i = 0; i < assetList.length; i++) {
                console.log('Loading ' + assetList[i]);
                var func =function (j) {
                    gTypesOfFileToLoad[typeOfData](assetList[i], function () {
                        gFilesManager.onLoadedCallback(assetList[j], batch);
                    });
                }(i);
            }
                
            

            
        },
        onLoadedCallback:function(asset, batch)
        {
            batch.count++;
            console.log("Asset '" + asset + "' loaded.");
            console.log("batch.count = " + batch.count + ", batch.total = "+batch.total);
            if (batch.count >= batch.total)
                batch.cb();
        }
    };