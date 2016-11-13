(function() {
  'use strict';
  angular.module('saan.services')
  .factory('WordBuilding', WordBuilding);

  WordBuilding.$inject = ['$http', '$log'];

  function WordBuilding($http, $log) {
    var data;

    return {
      getConfig: getConfig,
      getMaxLevel: getMaxLevel,
      getRandomLetters: getRandomLetters
    };

    function getConfig(level) {
      var src = 'data/1-config.json';
      if (level >= 1){
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            return data.levels[level-1];
          },
          function error() {
            //TODO: handle errors for real
            $log.error("error");
          }
        );
      }
      else {
        $log.error("Invalid level value");
      }
    }

    function getMaxLevel(){
      return data.levels.length;
    }

    function getRandomLetters(cant, word) {
      var differentLetters = [];
      var cantLetters = 24;
      if (word) {
        differentLetters = word.split("");
      }
      if (cant > 0) {
        cantLetters = cant;
      }
      var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
      return _.chain(alphabet)
        .difference(differentLetters) // Remove from alphabet letters in word
        .sample(cantLetters)
        .value();
    }
  }
})();
