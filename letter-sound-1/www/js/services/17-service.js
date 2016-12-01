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
      getSequenceOptions: getSequenceOptions,
      getFillinData: getFillinData,
      getMinLevel: getMinLevel,
      getSuccessAudio: getSuccessAudio,
      getFailureAudio: getFailureAudio
    };

    function getConfig(level) {
      var src = 'data/17-config.json';
      if (level >= 1){
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            return {
              numberOfOptions: data.numberOfOptions,
              instructions: data.instructions,
              ending: data.endingAudio,
              level: data.levels[level-1]
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

    function getSequenceOptions(numberFrom, numberTo, step){
      if (numberFrom < numberTo){
        var number = numberFrom + step;
        var seq = [];
        while (number <= numberTo){
          seq.push(number);
          number += step;
        }

        return _.shuffle(seq);
      }
      else {
        $log.error("Invalid number range");
        return;
      }
    }

    function getFillinData(step, length){
      var digits = Math.pow(10, _.random(1,2));

      var base = Math.random() * digits;
      var pattern = [Math.floor(base)];

      for (var i = 1; i < length; i++)
        pattern.push(pattern[i-1] + step);

      var positionToFill = _.random(0, length -1);

      var patternOptions = [pattern[positionToFill]];
      var number;

      for (i = 1; i < data.numberOfOptions; i++){
        number = Math.floor(Math.random() * digits);
        while (_.indexOf(patternOptions, number) != -1)
          number = Math.floor(Math.random() * digits);
        patternOptions.push(number);
      }

      _.shuffle(patternOptions);

      return {
        pattern: pattern,
        positionToFill: positionToFill,
        patternOptions: patternOptions
      };
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
