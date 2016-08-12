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
        }
      }
      return status;
    },
    getLevel: function(idActivity) {
      var key = "Activity"+idActivity+"-level";
      if (typeof(Storage) !== "undefined") {
        return parseInt(localStorage.getItem(key),10);
      }
      return false;
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
      if (typeof(Storage) !== "undefined") {
        return parseInt(localStorage.getItem(key),10);
      }
      return false;
    },
    saveScore: function(idActivity, score) {
        var key = "Activity"+idActivity+"-score";
        if (typeof(Storage) !== "undefined" && idActivity && score) {
            return localStorage.setItem(key, score);
        }
        return null;
    },
  };
});
