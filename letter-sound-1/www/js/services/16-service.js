angular.module('saan.services')
.factory('RandomWordsSixteen', function($http,$log, LevelsSixteen, Util) {
  var data;
  return {
    letters: function(level, playedLetters) {
      var src = LevelsSixteen.getSrcData(level);
      return $http.get(src).then(
        function success(response) {

          data = response.data;
          var json = data.info;
          var lettersNotPlayed = [];
          if (playedLetters.length === 0 ){
            lettersNotPlayed = json;
          } else {
            var playedLettersStr = playedLetters.toString();
            for (var i in json) { //FIXME: try to use underscore
              if (json[i]) {
                var ER = new RegExp(json[i].id, "i");
                if (!ER.test(playedLettersStr) && json[i].letters) {
                  lettersNotPlayed.push(json[i]);
                }
              }
            }
          }

          var index = Util.getRandomNumber(lettersNotPlayed.length);

          return {
            info: lettersNotPlayed[index],
            instructions : data.instructions,
            instructionsPath: data.instructionsPath,
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            scoreSetUp: data.scoreSetUp,
            totalLevels : data.info.length,
            finalizationLevel : data.finalizationLevel
          };
        },
        function error() {
          //TODO: handle errors for real
          $log.error("error");
        }
      );
    },
    getEndingAudio: function() {
      var index = _.random(0, data.endingFeedback.length - 1);
      return data.endingFeedback[index];
    },
    getSuccessAudio: function() {
      var index = _.random(0, data.successFeedback.length - 1);
      return data.successFeedback[index];
    },
    getFailureAudio: function() {
      var index = _.random(0, data.failureFeedback.length - 1);
      return data.failureFeedback[index];
    }
  };
})
  .factory('LevelsSixteen', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/16-letters.json';
            break;
          default:
            src = 'data/16-letters.json';
        }
        return src;
      },
    };
  });
