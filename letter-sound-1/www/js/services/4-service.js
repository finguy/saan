angular.module('saan.services')
.factory('RandomNumber', function($http, LevelsFour, Util) {
  var data;
  return {
    number: function(level, playedNumbers) {
      var src = LevelsFour.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
          data = response.data;
          var json = data.numbers;
          var index;
          if (level <= json.length) {
            index = level - 1;
          } else {
            index = 0; //Start all over
          }

          return {
            number : json[index],
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
