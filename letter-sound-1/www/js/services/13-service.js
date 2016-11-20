(function() {
  'use strict';
  angular.module('saan.services')
  .factory('LearningNumber', LearningNumber);

  LearningNumber.$inject = ['$http', '$log'];

  function LearningNumber($http, $log) {
    var data;

    return {
      getConfig: getConfig,
      getMaxLevel: getMaxLevel
    };

    function getConfig(level) {
      var src = 'data/13-config.json';
      if (level >= 1){
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            return {
              instructions : data.instructions,
              errorMessages : data.errorMessages,
              successMessages: data.successMessages,
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

    function getMaxLevel(){
      return data.levels.length;
    }
  }
})();
