angular.module('saan.services')

.service('Util', function($http, Levels) {
  return {
    getRandomNumber: function(top){
      return Math.floor((Math.random() * top));
    }
  };
});
