(function() {
  'use strict';
  angular.module('saan.services')
  .factory('Listening', Listening);

  Listening.$inject = ['$http', '$log'];

  function Listening($http, $log) {
    var data;

    return {
      getConfig: getConfig,
      getMaxLevel: getMaxLevel
    };

    function getConfig(level) {
      var src = 'data/11-config.json';
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

    function getMinLevel(){
      return data.minLevel;
    }
    
    function getMaxLevel(){
      return data.levels.length;
    }
  }
})();
