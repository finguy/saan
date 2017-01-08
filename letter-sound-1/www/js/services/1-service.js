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
      getRandomLetters: getRandomLetters,
      getMinLevel: getMinLevel,
      getSuccessAudio: getSuccessAudio,
      getFailureAudio: getFailureAudio
    };

    function getConfig(level) {
      var src = 'data/1-config.json';
      if (level >= 1){
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            return {
              instructions: data.instructions,
              ending: data.endingAudio,
              levelData: data.levels[level-1]
            };
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

    function getMinLevel(){
      return data.minLevel;
    }

    function getMaxLevel(){
      return data.levels.length;
    }

    function getRandomLetters(cant, word) {
      var differentLetters = [];
      var cantLetters = 26;
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

    function getSuccessAudio() {
      var index = _.random(0, data.successFeedback.length - 1);
      return data.successFeedback[index];
    }

    function getFailureAudio() {
      var index = _.random(0, data.failureFeedback.length - 1);
      return data.failureFeedback[index];
    }
  }
})();
