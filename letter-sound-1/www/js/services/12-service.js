angular.module('saan.services')
.factory('RandomText', function($http, LevelsTwelve, Util) {
  var data;
  return {
    text: function(level, playedTexts) {
      var src = LevelsTwelve.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
          data = response.data;
          var json = data.readings;
          var textsNotPlayed = [];
          if (playedTexts.length === 0 ){
            textsNotPlayed = json;
          } else {
            var playedTextsStr = playedTexts.toString();
            for (var i in json) { //FIXME: try to use underscore
              if (json[i].id) {
                var ER = new RegExp(json[i].id, "i");
                if (!ER.test(playedTextsStr) && json[i].id) {
                  textsNotPlayed.push(json[i]);
                }
              }
            }
          }
          var index = Util.getRandomNumber(textsNotPlayed.length);

          return {
            textJson: textsNotPlayed[index],
            instructions : data.instructions,
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
    }
  };
})
.factory('LevelsTwelve', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/12-reading.json';
            break;
          default:
            src = 'data/12-reading.json';
        }
        return src;
      },
    };
});
