angular.module('saan.services')

.service('Util', function($http) {
  return {
    getRandomNumber: function(top){
      return Math.floor((Math.random() * top));
    },
    getRandomElemFromArray : function(arrayArg) {
        if (!arrayArg) {
          return null;
        }

        var index = this.getRandomNumber(arrayArg.length);
        if (index > 0 && index < arrayArg.length) {
          return arrayArg[index];
        }
        return arrayArg[0];
    },
    saveStatus: function(idActivity, status) {
        var key = "Activity"+idActivity+"-finished";
        if (typeof(Storage) !== "undefined" && idActivity && (status === false || status === true)) {
            return localStorage.setItem(key, status);
        }
        return null;
    },
    getStatus: function(idActivity) {
      var key = "Activity"+idActivity+"-finished";
      var status = false;
      if (typeof(Storage) !== "undefined") {
        status = localStorage.getItem(key);
        if (status === "false" ){
          status = false;
        } else if (status === "true") {
          status = true;
        } else {
          status = false;
        }
      }
      return status;
    },
    getLevel: function(idActivity) {
      var key = "Activity"+idActivity+"-level";
      var level;
      if (typeof(Storage) !== "undefined") {
        level = localStorage.getItem(key);
        if (level) {
          return parseInt(level,10);
        }
      }
      return 1;
    },
    saveLevel: function(idActivity, level) {
      var key = "Activity"+idActivity+"-level";
        if (typeof(Storage) !== "undefined" && idActivity && level) {
            return localStorage.setItem(key, level);
        }
        return null;
    },
    getScore: function(idActivity) {
      var key = "Activity"+idActivity+"-score";
      var score;
      if (typeof(Storage) !== "undefined") {
        score = localStorage.getItem(key);
        if (score) {
          return parseInt(score,10);
        }
      }
      return 0;
    },
    saveScore: function(idActivity, score) {
        var key = "Activity"+idActivity+"-score";
        if (typeof(Storage) !== "undefined" && idActivity && score) {
            return localStorage.setItem(key, score);
        }
        return null;
    },
    range: function(top) {
      var elems = [];
      for (var i = 0; i < top*1; i++) {
        elems.push(i);
      }
      return elems;
    },
    numberToWords: function(n){
      if (n === 0) return 'zero';
      var a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      var b = ['', '', 'twenty', 'thirty', 'fourty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
      var g = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion'];
      var grp = function grp(n) {
        return ('000' + n).substr(-3);
      };
      var rem = function rem(n) {
        return n.substr(0, n.length - 3);
      };
      var fmt = function fmt(_ref) {
        var h = _ref[0];
        var t = _ref[1];
        var o = _ref[2];

        return [Number(h) === 0 ? '' : a[h] + ' hundred ', Number(o) === 0 ? b[t] : b[t] && b[t] + '-' || '', a[t + o] || a[o]].join('');
      };
      var cons = function cons(xs) {
        return function (x) {
          return function (g) {
            return x ? [x, g && ' ' + g || '', ' ', xs].join('') : xs;
          };
        };
      };
      var iter = function iter(str) {
        return function (i) {
          return function (x) {
            return function (r) {
              if (x === '000' && r.length === 0) return str;
              return iter(cons(str)(fmt(x))(g[i]))(i + 1)(grp(r))(rem(r));
            };
          };
        };
      };
      return iter('')(0)(grp(String(n)))(rem(String(n)));
    }
  };
});
