angular.module('saan.services')
.factory('RandomNumber', function($http, LevelsFour, Util) {
  var data;
  return {
    number: function(level, playedNumbers) {
      var src = LevelsFour.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
          data = response.data;
          var numbersNotPlayed = [];
          console.log(data);
          if (playedNumbers.length === 0 ){
            numbersNotPlayed = data.numbers;
          } else {
            for (var i in data.numbers) { //FIXME: try to use underscore
              if (data.numbers[i]) {
                  var index = _.indexOf(playedNumbers,data.numbers[i].number);
                if (index === -1) {
                  numbersNotPlayed.push(data.numbers[i]);
                }
              }
            }
          }

          var position = Util.getRandomNumber(numbersNotPlayed.length);
          return {
            number : numbersNotPlayed[position],
            instructions : data.instructions,
            instructionsPath: data.instructionsPath,  
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            scoreSetUp : data.scoreSetUp,
            assets : data.assets,
            finalizationLevel : data.finalizationLevel,
            totalLevels : data.numbers.length
          };
        },
        function error() {
          //TODO: handle errors for real
          console.log("error");
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
    }
  };
})
.factory('LevelsFour', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/4-numbers.json';
            break;
          default:
            src = 'data/4-numbers.json';
        }
        return src;
      },
    };
});
