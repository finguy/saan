(function() {
  'use strict';
  angular.module('saan.services')
  .factory('LearningNumber', LearningNumber);

  LearningNumber.$inject = ['$http', '$log'];

  function LearningNumber($http, $log) {
    var data;

    return {
      getConfig: getConfig,
      getMaxLevel: getMaxLevel,
      getMinLevel: getMinLevel,
      getSuccessAudio: getSuccessAudio,
      getFailureAudio: getFailureAudio
    };

    function getConfig(level) {
      var src = 'data/13-config.json';
      if (level >= 1){
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            return {
              instructions: data.instructions,
              ending: data.endingAudio,
              level: data.levels[level-1]
            };
          },
          function error() {
            //TODO: handle errors for real
            console.log("error");
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
