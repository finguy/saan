(function() {
  'use strict';
  angular.module('saan.services')
  .factory('NumberOperations', NumberOperations);

  NumberOperations.$inject = ['$http', '$log'];

  function NumberOperations($http, $log) {
    var data;

    return {
      getConfig: getConfig,
      getMaxLevel: getMaxLevel,
      getMinLevel: getMinLevel
    };

    function getConfig(level) {
      var src = 'data/14-config.json';
      if (level >= 1){
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            return {
              instructions : data.instructions,
              errorMessages : data.errorMessages,
              successMessages: data.successMessages,
              numberRange : data.numberRange,
              options: data.options,
              optionsRange: data.optionsRange,
              mode: data.mode,
              levelConfig: data.levels[level-1]
            };
          },
          function error() {
            //TODO: handle errors for real
            $log.log("error");
          }
        );
      }
      else {
        $log.error("Invalid level value");
      }
    }

    function getMinLevel() {
      return data.minLevel;
    }
    function getMaxLevel(){
      return data.levels.length;
    }
  }
})();
