(function () {
    'use strict';
    var nav = window.navigator;
    var EnvDetectSingleton = function (options, navStandard) {
        var defaults = {
            "cookieEnabled": { "normalValue": true, "testText": "", "match": "", "normalText": "" },
            "navigatorLanguage": { "normalValue": "zh-cn, en-us", "testText": "", "match": "", "normalText": "" },
            "navigatorTypeAndVersion": { "normalValue": "", "testText": "", "match": "", "normalText": "" },
            "flashVersion": { "normalValue": "10.2", "testText": "", "match": "", "normalText": "" },
            "screenResolution": { "normalValue": { "width": 1440, "height": 900 }, "testText": "", "match": "", "normalText": "" },
            "navigatorScale": { "normalValue": 1, "testText": "", "match": "", "normalText": "" },
            "netWorkSpeed": { "normalValue": "300", "testText": "", "match": "", "normalText": "" }
        }
        this.options = $.extend(defaults, options);
        this.data = {
            cookieEnabled: typeof this.cookieEnabled === 'undefined' ? this.getCookieEnabled() : this.cookieEnabled,
            navigatorLanguage: typeof this.navigatorLanguage === 'undefined' ? this.getNavigatorLanguage() : this.navigatorLanguage,
            navigatorTypeAndVersion: typeof this.navigatorTypeAndVersion === 'undefined' ? this.getNavigatorTypeAndVersion() : this.navigatorTypeAndVersion,
            flashVersion: typeof this.flashVersion === 'undefined' ? this.getFlashVersion() : this.flashVersion,
            screenResolution: typeof this.screenResolution === 'undefined' ? this.getScreenResolution() : this.screenResolution,
            netWorkSpeed: typeof this.netWorkSpeed === 'undefined' ? this.getNetworkSpeed() : this.netWorkSpeed,
            navigatorScale: typeof this.navigatorScale === 'undefined' ? this.getNavigatorScale() : this.navigatorScale
        };
    }

    /*
	--------------
	sync property function
	--------------
	*/
    EnvDetectSingleton.prototype.getNavigatorTypeAndVersion = function () {
        var matched = uaMatch();
        var browser = {};

        if (matched.browser) {
            browser.type = matched.browser;
            browser.version = matched.version;
        }

        // Chrome is Webkit, but Webkit is also Safari.
        if (browser.chrome) {
            browser.type = webkit;
        } else if (browser.webkit) {
            browser.type = safari;
        }
        return this.navigatorTypeAndVersion = browser;
    }


    EnvDetectSingleton.prototype.getNavigatorLanguage = function () {
        var browserLanguage = (nav.userLanguage || nav.language || nav.browserLanguage).toLowerCase();
        return this.browserLanguage = browserLanguage;
    }

    EnvDetectSingleton.prototype.getCookieEnabled = function () {
        var cookie = document.cookie;
        var cookieEnabled = nav['cookieEnabled'];

        if (typeof cookieEnabled == 'undefined') {
            var expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + 1000);//Expired after 1 second
            var time = expireDate * 1;
            var regExp = new RegExp(time + '=' + time);
            document.cookie = time + '=' + time + ';expires=' + expireDate.toGMTString();

            if (regExp.test(document.cookie))
                cookieEnabled = true;
            else
                cookieEnabled = false;
        }
        return this.cookieEnabled = cookieEnabled;
    }

    EnvDetectSingleton.prototype.getFlashVersion = function () {
        var f = "";
        var ii = 0;
        if (nav.plugins && nav.plugins.length && !window.ActiveXObject) {
            for (ii; ii < nav.plugins.length; ii++) {
                if (nav.plugins[ii].name.indexOf('Shockwave Flash') != -1) {
                    f = nav.plugins[ii].description.split('Shockwave Flash ')[1];
                    f = f.split(' ')[0];
                    break;
                }
            }
            if (ii == nav.plugins.length) {
                f = '-1';

            }
        } else if (window.ActiveXObject) {
            try {
                var swf = new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                if (swf) {
                    var VSwf = swf.GetVariable("$version");
                    //flashVersion=parseInt(VSwf.split(" ")[1].split(",")[0]);
                    f = VSwf.toLowerCase().split('win').join('').split(',').join('.');
                }

            } catch (e) {
                f = '-1';
            }
        } else {
            f = '-1';
        }
        return this.flashVersion = f;
    }

    EnvDetectSingleton.prototype.getScreenResolution = function () {
        return this.screenResolution = {
            width: screen.width,
            height: screen.height
        }
    }

    EnvDetectSingleton.prototype.getMediaPlayerVersion = function () {

    }

    /*
	--------------
	async property function
	--------------
	*/

    EnvDetectSingleton.prototype.getNetworkSpeed = function () {
        var deferred = $.Deferred();
        detectNetSpeedWithImage(function (res) {
            //失败
            if (res.length < 1) {
                deferred.resolve(0);
            }
                //成功
            else {
                var time = 0;
                for (var i = 0, l = res.length; i < l; i++) {
                    time += res[i] / (l * 1000);
                }
                //计算速度
                var speed = 125 * 5 / time;
                speed = speed.toFixed(2);
            }
            deferred.resolve(speed);
        });
        return this.netWorkSpeed = deferred.promise();
    }



    EnvDetectSingleton.prototype.getNavigatorScale = function () {
        var self = this;
        if (this.flashVersion && this.flashVersion === '-1') {
            return this.navigatorScale = '-1';
        }
        var deferred = new $.Deferred();
        window['zoomDetectJSCallback'] = function (o) {
            deferred.resolve(o.scale);
        }
        $('body').append(makeSwf({
            "src": '../flash/zoom.swf',
            "width": "10",
            "height": "10",
            "allowScriptAccess": "always",
            "id": "accessory_zoom_detect",
            "name": "zoom_detect",
            "wmode": "transparent",
            "scale": "noScale"
        }));
        return this.navigatorScale = deferred.promise();
    }

    EnvDetectSingleton.prototype.getTestResult = function (messages) {
        var result, testValue, data = this.data, self = this, navStandard = this.navStandard;
        //同步方法，可以直接处理得到match
        $.each(data, function (key, value) {
            var normalValue = self.options[key].normalValue;
            switch (key) {
                case 'cookieEnabled':
                    self.options['cookieEnabled'].normalText = normalValue === true ? messages['yes'] : messages['no'];
                    self.options['cookieEnabled'].testText = value === true ? messages['yes'] : messages['no'];
                    self.options['cookieEnabled'].match = normalValue === value;
                    break;
                case 'navigatorTypeAndVersion':
                    var normalText = '', normalVersion = normalValue[value['type']];
                    self.options[key].match = normalVersion !== undefined ? (parseFloat(value['version']) - parseFloat(normalVersion) >= 0 ? true : false) : false;
                    self.options[key].testText = normalVersion !== undefined ? value['type'] + " " + value['version'] : '-1';
                    self.options[key].normalText = normalVersion !== undefined ? value['type'] + " " + normalValue[value['type']] : normalText += $.map(normalValue, function (value, key) { return key });
                    break;
                case 'navigatorLanguage':
                    self.options[key].normalText = normalValue;
                    self.options[key].testText = value;
                    self.options[key].match = normalValue.indexOf(value) !== -1;
                    break;
                case 'flashVersion':
                    self.options[key].normalText = normalValue;
                    self.options[key].match = parseFloat(value) - parseFloat(normalValue) >= 0;
                    self.options[key].testText = value;
                    break;
                case 'screenResolution':
                    self.options[key].normalText = normalValue["width"] + "*" + normalValue["height"];
                    self.options[key].testText = value["width"] + "*" + value["height"];
                    self.options[key].match = value["width"] >= normalValue["width"] && value["height"] >= normalValue["height"];
                    break;
                default:
                    self.options[key].normalText = normalValue;
                    self.options[key].testText = self.options[key].match = value;
                    break;
            }
            self.options[key].treatment = self.options[key].testText && self.options[key].testText === '-1' ? '_uninstall' : '_tips';
        })
        /*	
			异步检测： netWorkSpeed(网速)
		*/
        self.options['netWorkSpeed'].testText.done(function (result) {
            self.options['netWorkSpeed'].testText = result + 'kB/s';
            self.options['netWorkSpeed'].match = parseFloat(result) - parseFloat(self.options['netWorkSpeed'].normalValue) >= 0;
            self.options['netWorkSpeed'].normalText = self.options['netWorkSpeed'].normalValue + 'kB/s';
            self.options['netWorkSpeed'].treatment = '_tips';
            $('body').trigger('envDetect:change');
        });
        /*	
			异步检测： navigatorScale(浏览器放大缩小)  注：当用户未安装flashPlayer时，不能检测该项
		*/
        if (self.options['flashVersion'].testText && self.options['flashVersion'].testText !== '-1') {
            self.options['navigatorScale'].testText.done(function (result) {
                self.options['navigatorScale'].normalText = messages['no'];
                self.options['navigatorScale'].testText = result === self.options['navigatorScale'].normalValue ? messages['no'] : messages['yes'];
                self.options['navigatorScale'].match = parseFloat(result) - parseFloat(self.options['navigatorScale'].normalValue) === 0;
                self.options['navigatorScale'].treatment = '_tips';
                $('body').trigger('envDetect:change');
            });
        } else {
            self.options['navigatorScale'].normalText = messages['no'];
            self.options['navigatorScale'].testText = '-1';
            self.options['navigatorScale'].match = false;
            self.options['navigatorScale'].treatment = '_uninstall';
        }
    }



    /*
	--------------
	private function
	--------------
	*/

    function detectNetSpeedWithImage(callback) {
        var times = 5, completedImg = 0, res = [], timer = null, done = false;
        for (var i = 0; i < times; i++) {
            (function (index) {
                var img = new Image();
                //开关，在某些浏览器（如IE）会响应两次onreadystatechange
                var loaded = false;
                //请求开始时间
                var tStart = new Date();
                img.onload = img.onreadystatechange = function () {
                    if (loaded) return;
                    //请求结束时间
                    var tEnd = new Date();
                    res.push(tEnd - tStart);
                    //已完成请求加1
                    completedImg++;
                    loaded = true;
                    //全部请求完成后调用callback
                    if (completedImg == times && callback) {
                        callback && callback(res);
                        if (timer) clearTimeout(timer);
                    }
                }
                img.onerror = function () {
                    if (done) return;
                    callback([]);
                    done = true;
                    clearTimeout(timer);
                }
                img.src = 'Images/all_img.png' + '?t=' + Math.random();
            })(i);
        }
        //超时操作
        var timer = setTimeout(function () {
            if (completedImg != times && !done) {
                callback([]);
            }
        }, 10000);
    }

    function uaMatch() {

        var ua = nav.userAgent.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
			/(webkit)[ \/]([\w.]+)/.exec(ua) ||
			/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
			/(msie) ([\w.]+)/.exec(ua) ||
			ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
			[];

        return {
            browser: match[1] || "",
            version: match[2] || "0"
        };

    }

    function makeSwf(args) {
        var args = args || {};
        var attrs = [], params = [], isIe = nav.userAgent.indexOf('MSIE') !== -1;
        for (var k in args) {
            switch (k) {
                case "noSrc":
                case "movie":
                    continue;
                    break;
                case "id":
                case "name":
                case "width":
                case "height":
                case "style":
                    if (typeof (args[k]) != 'undefined') {
                        attrs.push(' ', k, '="', args[k], '"');
                    }
                    break;
                case "src":
                    if (isIe) {
                        params.push('<param name="movie" value="', (args.noSrc ? "" : args[k]), '"/>');
                    } else {
                        attrs.push(' data="', (args.noSrc ? "" : args[k]), '"');
                    }
                    break;
                default:
                    params.push('<param name="', k, '" value="', args[k], '" />');
            }
        }
        if (isIe) {
            attrs.push(' classid="clsid:', 'D27CDB6E-AE6D-11cf-96B8-444553540000', '"');
        } else {
            attrs.push(' type="application/x-shockwave-flash"');
        }
        return "<object" + attrs.join("") + ">" + params.join("") + "</object>";
    }

    /*
	--------------
	make object to be a Singleton
	--------------
	*/
    function EnvDetect(options) {
        if (!EnvDetectSingleton.instance) {
            EnvDetectSingleton.instance = new EnvDetectSingleton(options);
        }
        return EnvDetectSingleton.instance;
    }

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return EnvDetect; });
        // CommonJS and Node.js module support.
    } else if (typeof exports !== 'undefined') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module != 'undefined' && module.exports) {
            exports = module.exports = EnvDetect;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.EnvDetect = EnvDetect;
    } else {
        window.EnvDetect = EnvDetect;
    }

})();

