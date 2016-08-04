angular.module('saan.services')

.service('Util', function($http, Levels) {
  return {
    getRandomNumber: function(top){
      return Math.floor((Math.random() * top));
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
    },
    score: function(points, currentScore, addition) {
        if (addition) {
          return Math.abs(currentScore + points);
        } else if (currentScore > 0){
          return Math.abs(currentScore - points);
        }
        return 0;
    },
    isActivityFinished: function(jsonScore, currentScore) {
      return jsonScore.minScore <= currentScore;
    }
  };
});
