Function.prototype.method = function (name, func) {
    if (!this.prototype[name])
        this.prototype[name] = func;
    return this;
};

Number.method('integer', function () {
    return this < 0.0 ? Math.ceil(this) : Math.floor(this);
});

Object.method('superior', function (methodName) {
    var that = this;
    var method = that[methodName];
    return function () {
        return method.apply(that, arguments);
    };
});

Array.method('erase', function (item) {
    var i = 0;
    for (i = this.length-1; i >= 0; i--) {
        if (this[i] === item)
            this.splice(i, 1);
    }

    return this;
});