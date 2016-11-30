(function() {
  'use strict';
  angular.module('saan.services')
  .factory('ColorPattern', ColorPattern);

  ColorPattern.$inject = ['$http', '$log'];

  function ColorPattern($http, $log){
    var data;

    return {
      getConfig: getConfig,
      getMaxLevel: getMaxLevel,
      getSequencePattern: getSequencePattern,
      getFillinPattern: getFillinPattern,
      getMinLevel: getMinLevel,
      getSuccessAudio: getSuccessAudio,
      getFailureAudio: getFailureAudio,
      getEndAudio: getEndAudio
    };

    function getConfig(level) {
      var src = 'data/2-config.json';
      if (level >= 1){
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            return {
              colors: data.colors,
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
        return [];
      }
    }

    function getMinLevel(){
      return data.minLevel;
    }

    function getMaxLevel(){
      return data.levels.length;
    }

    function getSequencePattern(length, numberOfColors){
      if (numberOfColors >= 1){
        var colors = _.sample(data.colors, numberOfColors);
        var pattern = colors;

        for (var i = numberOfColors; i < length/2; i++){
          var index = _.random(0, numberOfColors-1);
          pattern.push(colors[index]);
        }
        pattern = _.shuffle(pattern);
        return pattern.concat(pattern);
      }
      else {
        $log.error("Invalid color value");
      }
    }

    function getFillinPattern(length, numberOfColors){
      var pattern = getSequencePattern(length, numberOfColors);
      pattern = pattern.concat(pattern);

      return {
        pattern: pattern,
        positionToFill: _.random(0, length * 2 - 1)
      };
    }

    function getSuccessAudio() {
      var index = _.random(0, data.successFeedback.length - 1);
      return data.successFeedback[index];
    }

    function getFailureAudio() {
      var index = _.random(0, data.failureFeedback.length - 1);
      return data.failureFeedback[index];
    }

    function getEndAudio(mode) {
      if (mode >= 1){
        return data.endingAudio[mode-1];
      }
      else {
        $log.error("invalid mode value");
      }
    }
  }
})();
