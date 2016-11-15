(function() {
  'use strict';
  angular.module('saan.services')
  .factory('NumberPattern', NumberPattern);

  NumberPattern.$inject = ['$http', '$log'];

  function NumberPattern($http, $log) {
    var data;

    return {
      getConfig: getConfig,
      getMaxLevel: getMaxLevel,
      getSequenceOptions: getSequenceOptions
    };

    function getConfig(level) {
      var src = 'data/17-config.json';
      if (level >= 1){
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            return {
              "numberOfOptions": data.numberOfOptions,
              "instructionsPath": data.instructionsPath,
              "instructionsText": data.instructionsText,
              "level": data.levels[level-1]
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

    function getSequenceOptions(numberFrom, numberTo, step){
      var number = numberFrom + step;
      var seq = [];
      while (number <= numberTo){
        seq.push(number);
        number += step;
      }

      return seq;
    }

    function getMaxLevel(){
      return data.levels.length;
    }


  }
})();
