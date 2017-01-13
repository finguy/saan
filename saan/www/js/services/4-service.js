angular.module('saan.services')
  .factory('RandomNumber', function($http, LevelsFour, Util) {
    var data;
    return {
      number: function(level, playedNumbers) {
        var src = LevelsFour.getSrcData(level);
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            //Build levels, one level per number
            var totalNumbers = [];
            var levels = []
            var i = 0;
            for (var elem in data.numbers) {
              if (data.numbers[elem]) {
                levels[i] = [];
                for (var k = 0; k < 9; k++) {
                  levels[i].push(data.numbers[k]);
                }
                totalNumbers.push(data.numbers[i].number);
                i++;
              }

            }

            var index;
            if (level <= levels.length && level > 0) {
              index = level - 1;
            } else {
              index = 0; //Start all over
            }

            //Pick word from level that hasn't been played in current session, starting in level position as it is one level per number
            if (_.size(playedNumbers) > 0 && _.size(playedNumbers) < levels.length) {
              var numbersToPlay = _.difference(totalNumbers, playedNumbers);
              var number = Util.getRandomElemFromArray(numbersToPlay);
              for (var iter = 0; iter < levels[index].length; iter++) {
                iterNumber = levels[index][iter];
                if (iterNumber.number === number) {
                  break;
                }
              }
            } else {
              var key = Util.getRandomNumber(levels[index].length);
              iterNumber = levels[index][key];
            }
            return {
              number: iterNumber,
              instructions: data.instructions,
              instructionsPath: data.instructionsPath,
              errorMessages: data.errorMessages,
              successMessages: data.successMessages,
              scoreSetUp: data.scoreSetUp,
              assets: data.assets,
              finalizationLevel: data.finalizationLevel,
              totalLevels: data.numbers.length
            };
          },
          function error() {
            //TODO: handle errors for real
            console.log("error");
          }
        );
      },
      getEndingAudio: function(index) {
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
  .factory('LevelsFour', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/4-config.json';
            break;
          default:
            src = 'data/4-config.json';
        }
        return src;
      },
    };
  });
