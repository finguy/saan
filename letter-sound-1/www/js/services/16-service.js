angular.module('saan.services')
  .factory('RandomWordsSixteen', function($http, $log, LevelsSixteen, Util) {
    var data;
    return {
      letters: function(level) {
        var src = LevelsSixteen.getSrcData(level);
        return $http.get(src).then(
          function success(response) {            
            data = response.data;
            var json = data.info;
            var index;
            if (level <= json.length && level > 0) {
              index = level - 1;
            } else {
              index = 0; //Start all over
            }

            return {
              info: json[index],
              instructionsPath: data.instructionsPath,
              errorMessages: data.errorMessages,
              successMessages: data.successMessages,
              scoreSetUp: data.scoreSetUp,
              totalLevels: data.info.length,
              finalizationLevel: data.finalizationLevel
            };
          },
          function error() {
            //TODO: handle errors for real
            $log.error("error");
          }
        );
      },
      getEndingAudio: function(level, totalLevels) {
        var index = (level < totalLevels) ? 0 : 1; // Si se llego al final reproduce el segundo
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
