/**
 * 添加动画变换功能
 */
function Animation(opts) {
    var defaultOptions = {
        duration: 1000,  // 动画时长, 单位毫秒
        fps: 30,         // 每秒帧数
        delay: 0,        // 延迟执行时间，单位毫秒,如果delay为infinite则表示手动执行
        transition: Transitions.linear,
        onStop: function () {} // 调用stop停止时的回调函数
    };

    if (opts) {
        for (var i in opts) {
            defaultOptions[i] = opts[i];
        }
    }
    this._opts = defaultOptions;

    if (!isNaN(defaultOptions.delay)) {
        var me = this;
        setTimeout(function() {
            me.start();
        }, defaultOptions.delay);
    } 
    else if (defaultOptions.delay != Animation.INFINITE) {
        this.start();
    }
}
Animation.prototype.isFunction = function(func) {
    return typeof func === 'function';
}
/**
 * 常量，表示动画无限循环
 */
Animation.INFINITE = "INFINITE";
/**
 * 启动动画方法
 */
Animation.prototype.start = function() {
    if (window.requestAnimationFrame) {
        var me = this;
        me._timer = window.requestAnimationFrame(function(now){
            me._loop(now);
        });
    } else {
        this._beginTime = (new Date()).getTime();
        this._endTime = this._beginTime + this._opts.duration;
        this._loop();
    }
}

/**
 * 动画循环
 */
Animation.prototype._loop = function() {
    var me = this;
    var now = (new Date()).getTime();
    if (!this._beginTime) {
        this._beginTime = now;
        this._endTime = this._beginTime + this._opts.duration;
    }
    
    if (now >= me._endTime) {        
        if (me.isFunction(me._opts.render)) me._opts.render(me._opts.transition(1));
        // finish()接口，时间线结束时对应的操作
        if (me.isFunction(me._opts.finish)) me._opts.finish();
        return;
    }

    me.schedule = me._opts.transition((now - me._beginTime) / me._opts.duration);
    // render()接口，用来实现每个脉冲所要实现的效果
    if (me.isFunction(me._opts.render)) {
        me._opts.render(me.schedule);
    }
    // 执行下一个动作
    if (!me.terminative) {
        if (window.requestAnimationFrame) {
            me._timer = requestAnimationFrame(function (now) {
                me._loop(now);
            });
        } else {
            me._timer = setTimeout(function () {
                me._loop()
            }, 1000 / me._opts.fps);
        }
    }
};


/**
 * 停止当前动画
 * @type {Boolean 是否停止到动画的终止时刻}
 */
Animation.prototype.stop = function(gotoEnd) {
    this.terminative = true;
    if (this._timer) {
        if (window.cancelAnimationFrame) {
            cancelAnimationFrame(this._timer);
        } else {
            clearTimeout(this._timer);
        }
        this._timer = null;
    }
    this._opts.onStop(this.schedule);
    if (gotoEnd) {
        this._endTime = this._beginTime;
        this._loop();
    }
};

/**
 * 变换效果函数库
 */
var Transitions = {
    linear: function (t) {
        return t;
    },
    reverse: function (t) {
        return 1 - t;
    },
    easeInQuad: function (t) {
        return t * t;
    },
    easeInCubic: function (t) {
        return Math.pow(t, 3);
    },
    easeOutQuad: function (t) {
        return -(t * (t - 2));
    },
    easeOutCubic: function (t) {
        return Math.pow((t - 1), 3) + 1;
    },
    easeInOutQuad: function (t) {
        if (t < 0.5) {
            return t * t * 2;
        } else {
            return -2 * (t - 2) * t - 1;
        }
        return;
    },
    easeInOutCubic: function (t) {
        if (t < 0.5) {
            return Math.pow(t, 3) * 4;
        } else {
            return Math.pow(t - 1, 3) * 4 + 1;
        }
    },
    easeInOutSine: function (t) {
        return (1 - Math.cos(Math.PI * t)) / 2;
    }
};
Transitions['ease-in'] = Transitions.easeInQuad;
Transitions['ease-out'] = Transitions.easeOutQuad;