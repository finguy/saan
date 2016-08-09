angular.module('saan.services')

.service('Util', function($http, Levels) {
  return {
    getRandomNumber: function(top){
      return Math.floor((Math.random() * top));
    },
    getRandomElemFromArray : function(arrayArg) {
        if (!arrayArg) {
          return null;
        }

        var top = arrayArg.length;
        var bottom = 0;
        var index = Math.floor( Math.random() * ( 1 + top - bottom ) ) + bottom;
        if (index > 0 && index < arrayArg.length) {
          return arrayArg[index];
        }
        return arrayArg[0];
    },
    saveStatus: function(params) {
        if (typeof(Storage) !== "undefined" && params && params.key && params.value) {
            return localStorage.setItem(params.key, params.value);
        }
        return null;
    },
    getStatus: function(params) {
      if (typeof(Storage) !== "undefined") {
        return localStorage.getItem(params);
      }
      return false;
    }
  };
});
