(function () {
    'use strict';
	var UserLanguageSingleton = function (options) {
		this.userLanguageType = '';
		this.langData = null;
		this.options = options;
	};

	UserLanguageSingleton.prototype.getUserLanguageType = function (callback) {
		var options = this.options;
		var self = this;
		if(options.url) {
			$.get(options.url, function(result) {
				this.userLanguageType = result && (result['code'] == 200) && result['data'] && result.data['userLanguageType'] ? result.data['userLanguageType'].toLowerCase() : '';
				action();
			})
		} else {
			this.userLanguageType = $.cookie && $.cookie('userLanguageType') ? $.cookie('userLanguageType').toLowerCase() : '' ;
			action();
		}
		function action() {
			self.userLanguageType  =  self.userLanguageType ? self.userLanguageType : (navigator && navigator.userLanguage || navigator.language || "zh-cn").toLowerCase();
			callback && callback(self.userLanguageType);
		}
	}

	UserLanguageSingleton.prototype.getUserLanguageData = function(callback) {
		var options = this.options;
		if(this.langData) {
			callback && callback(this.langData);
		}
		var self = this;
		this.getUserLanguageType(function(userLanguageType) {
			if(options.path && (!window.BSi18n || (window.BSi18n && !window.BSi18n[userLanguageType]))) {
				loadJS(options.path + 'BSi18n-' + userLanguageType + '.js', getDataBack);
			} else {
				getDataBack();
			}
			function getDataBack() {
				self.langData = window.BSi18n && window.BSi18n[userLanguageType] ? window.BSi18n[userLanguageType] : null;
				callback && callback(self.langData);
			}
		});	
	}

	UserLanguageSingleton.prototype.setUserLanguageType = function (data, callback) {
		var options = this.options;
		var param = "userLanguageType=" + data;
		if(options.url) {
			$.post(options.url, param, function(result) {
				if(result && result.code && result.code == 200) {
					callback && callback({result : true});
				} else {
					callback && callback({result : false});
				}
			});
		} else {
			$.cookie('userLanguageType', data, { expires: 100, path: '/' });
			callback && callback({result : true});			
		}
	}


	function loadJS(url, success) {
		var domScript = document.createElement('script');
		domScript.src = url;
		success = success || function(){};
		domScript.onload = domScript.onreadystatechange = function() {
			if (!this.readyState || 'loaded' === this.readyState || 'complete' === this.readyState) {
				success();
				this.onload = this.onreadystatechange = null;
				this.parentNode.removeChild(this);
			}
		}
		document.getElementsByTagName('head')[0].appendChild(domScript);
	}

	function UserLanguage(options) {
        if(!UserLanguageSingleton.instance){
          UserLanguageSingleton.instance = new UserLanguageSingleton(options);
        }
        return UserLanguageSingleton.instance;
    }

	 // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return UserLanguage; });
    // CommonJS and Node.js module support.
    } else if (typeof exports !== 'undefined') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module != 'undefined' && module.exports) {
            exports = module.exports = UserLanguage;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.UserLanguage = UserLanguage;
    } else {
        window.UserLanguage = UserLanguage;
    }

})();

