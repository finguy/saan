(function() {
  'use strict';
  angular.module('saan.services')
  .factory('MathOralProblems', MathOralProblems);

  MathOralProblems.$inject = ['$http', '$log'];

  function MathOralProblems($http, $log) {
    var data;

    return {
      getConfig: getConfig,
      getMaxLevel: getMaxLevel
    };

    function getConfig(level) {
      var src = 'data/15-config.json';
      if (level >= 1){
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            return data.levels[level-1];
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