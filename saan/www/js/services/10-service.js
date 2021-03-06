angular.module('saan.services')
  .factory('RandomWordTen', function($http, LevelsTen, Util) {
    var data;
    return {
      word: function(level) {
        var src = LevelsTen.getSrcData(level);
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            var json = data.info;
            var index;
            if (level <= json.length) {
              index = level - 1;
            } else {
              index = 0; //Start all over
            }


            return {
              wordJson: json[index],
              instructions: data.instructions,
              instructionsPath: data.instructionsPath,
              errorMessages: data.errorMessages,
              successMessages: data.successMessages,
              scoreSetUp: data.scoreSetUp,
              totalLevels: data.info.length,
              finalizationLevel: data.finalizationLevel,
              allWords: _.shuffle(data.allWords)
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
  .factory('LevelsTen', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/10-config.json';
            break;
          default:
            src = 'data/10-config.json';
        }
        return src;
      },
    };
  });
