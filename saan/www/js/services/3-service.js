angular.module('saan.services')


.factory('RandomLetterThree', function($http, $log, LevelsThree, Util) {
    var data;
    return {
      letter: function(level, playedLetters) {
        var src = LevelsThree.getSrcData(level);
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            var init;
            var tope;
            if (level < data.finalizationLevel) {
              init = 0;
              tope = data.finalizationLevel - 1;
            } else {
              init = data.finalizationLevel - 1;
              tope = 26;
            }
            //Build levels, one level per letter
            var levels = []
            var totalLetters = [];
            for (var i = 0; i < 26; i++) {
              levels[i] = [];
              for (var k = init; k < tope; k++) {
                levels[i].push(data.info[k]);
                if (i === 0) {
                  totalLetters.push(data.info[k].letter.toLowerCase());
                }
              }
            }

            var index;
            if (level <= levels.length && level > 0) {
              index = level - 1;
            } else {
              index = 0; //Start all over
            }

            //Pick word from level that hasn't been played in current session, starting in level position as it is one level per number
            if (_.size(playedLetters) > 0 && _.size(playedLetters) < levels.length) {
              var lettersToPlay = _.difference(totalLetters, playedLetters);
              var letter = Util.getRandomElemFromArray(lettersToPlay);
              for (var iter = 0; iter < levels[index].length; iter++) {
                iterLetter = levels[index][iter];
                if (iterLetter.letter.toLowerCase() === letter.toLowerCase()) {
                  break;
                }
              }
            } else {
              var key = Util.getRandomNumber(levels[index].length);
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
