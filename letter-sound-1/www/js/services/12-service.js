angular.module('saan.services')
.factory('RandomText', function($http, LevelsTwelve, Util) {
  var data;
  return {
    text: function(level, playedTexts) {
      var src = LevelsTwelve.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
         console.log(response);
          data = response.data;
          var json = data.readings;
          var index;
          if (level <= json.length) {
            index = level - 1;
          } else {
            index = 0; //Start all over
          }

          return {
            textJson: json[index],
            instructions : data.instructions,
            instructionsPath: data.instructionsPath,
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            scoreSetUp: data.scoreSetUp,
            finalizationLevel : data.finalizationLevel,
            totalLevels : data.readings.length,
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
      return data.endFeedback[index];
    }
  };
})
.factory('LevelsTwelve', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/12-config.json';
            break;
          default:
            src = 'data/12-config.json';
        }
        return src;
      },
    };
});
