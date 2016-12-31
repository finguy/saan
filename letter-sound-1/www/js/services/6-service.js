angular.module('saan.services')
.factory('RandomWordSix', function($http, LevelsSix, Util) {
  var data;
  return {
    word: function(level) {
      var src = LevelsSix.getSrcData(level);
      return $http.get(src).then(
        function success(response) {

          data = response.data;
          var json = data.words;
          var index;
          if (level <= json.length) {
            index = level - 1;
          } else {
            index = 0; //Start all over
          }

          return {
            word : json[index],
            instructions : data.instructions,
            instructionsPath: data.instructionsPath,
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            scoreSetUp : data.scoreSetUp,
            finalizationLevel : data.finalizationLevel,
            totalLevels : data.words.length
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
    },
    getEndingAudio: function(index) {
      return data.endingFeedback[index];
    }
  };
})
  .factory('LevelsSix', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/6-config.json';
            break;
          default:
            src = 'data/6-config.json';
        }
        return src;
      },
    };
  });
