angular.module('saan.services')
.factory('RandomLetter', function($http, $log, LevelsFive, Util) {
  var data;
  return {
    letter: function(level, playedLetters) {
      var src = LevelsFive.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
          data = response.data;
          var json = data.letters;
          var index;
          if (level <= json.length) {
            index = level - 1;
          } else {
            index = 0; //Start all over
          }

          return {
            letter: json[index],
            instructions : data.instructions,
            instructionsPath: data.instructionsPath,
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            scoreSetUp: data.scoreSetUp,
            totalLevels: data.letters.length,
            finalizationLevel: data.finalizationLevel
          };
        },
        function error() {
          //TODO: handle errors for real
          $log.error("error");
        }
      );
    },
    getSuccessAudio: function() {
      var index = _.random(0, data.successFeedback.length - 1);
      return data.successFeedback[index];
    },
    getFailureAudio: function() {
      var index = _.random(0, data.failureFeedback.length - 1);
      return data.failureFeedback[index];
    },
    getEndingAudio: function(index) {
      return data.endFeedback[index];
    }
  };
})
  .factory('LevelsFive', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/5-config.json';
            break;
          default:
            src = 'data/5-config.json';
        }
        return src;
      },
    };
  });
