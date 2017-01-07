angular.module('saan.services')


.factory('RandomLetterThree', function($http, $log, LevelsThree, Util) {
    var data;
    return {
      letter: function(level, playedLetters) {
        var src = LevelsThree.getSrcData(level);
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            //One level per letter
            var levels = []
            for (var i = 0;  i < 26; i++) {
              levels[i] = data.info;
            }

            var index;
            if (level <= levels.length && level > 0) {
              index = level - 1;
            } else {
              index = 0; //Start all over
            }

            //Pick word from level that hasn't been played in current session
            var key = 0;
            var iterLetter = levels[index][key];

            if ( _.size(playedLetters) > 0 ) {
              while (key < levels[index].length && playedLetters[iterLetter]) {
                  key++;
                  iterLetter = levels[index][key];
              }
            } else {
             key = Util.getRandomNumber(levels[index].length);
             iterLetter = levels[index][key];
            }
            return {
              letter: iterLetter,
              instructionsPath: data.instructionsPath,
              scoreSetUp: data.scoreSetUp,
              finalizationLevel: data.finalizationLevel,
              totalLevels: data.info.length
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
  .factory('LevelsThree', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/3-config.json';
            break;
          default:
            src = 'data/3-config.json';
        }
        return src;
      },
    };
  });
