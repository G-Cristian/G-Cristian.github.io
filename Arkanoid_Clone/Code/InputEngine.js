//gInputEngine
var gInputEngine =
    {
        //dictionary where the key is a string value representing an action 
        //and the value is a boolean indicating whether it is currently being performed
        actions: {},
        //maps keycode values to string values representing actions
        bindings: {},

        mouse: {
            x: 0,
            y: 0
        },

        init: function (domElement, inputJSON) {
            var parsed = null;
            var key = null;
            gInputEngine.actions = {};
            gInputEngine.bindings = {};
            gInputEngine.mouse = {
                x: 0,
                y: 0
            };

            var element = document.getElementById(domElement);
            element.addEventListener('mousemove', gInputEngine.onMouseMove);
            element.addEventListener('keyup', gInputEngine.onKeyUp);
            element.addEventListener('keydown', gInputEngine.onKeyDown);

            if (inputJSON) {
                parsed = JSON.parse(inputJSON);
                for (var action in parsed) {
                    if (parsed.hasOwnProperty(action)) {
                        for (var i = 0; i < parsed[action].length; ++i) {
                            key = parsed[action][i];
                            gInputEngine.bind(key, action);
                            console.log("Action: " + gInputEngine.bindings[key] + ". Key: " + key);
                        }
                    }
                }
            }
        },

        bind: function (key, action) {
            gInputEngine.bindings[key] = action;
        },
        onMouseMove: function (event) {
            gInputEngine.mouse.x = event.clientX;
            gInputEngine.mouse.y = event.clientY;
        },
        onKeyUp: function (event) {
            var code = event.keyCode || event.which;
            var action = gInputEngine.bindings[code];

            if (action) {
                gInputEngine.actions[action] = false;
            }
        },
        onKeyDown: function (event) {
            var code = event.keyCode || event.which;;
            var action = gInputEngine.bindings[code];

            if (action) {
                gInputEngine.actions[action] = true;
            }
        }
    };