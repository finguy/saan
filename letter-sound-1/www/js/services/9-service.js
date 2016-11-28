angular.module('saan.services')
.factory('RandomWordsNine', function($http, LevelsNine, Util) {
  var data;
  return {
    words: function(level, playedWords) {
      var src = LevelsNine.getSrcData(level);
      return $http.get(src).then(
        function success(response) {

          data = response.data;
          var json = data.info;
          var wordsNotPlayed = [];
          if (playedWords.length === 0 ){
            wordsNotPlayed = json;
          } else {
            var playedWordsStr = playedWords.toString();
            for (var i in json) { //FIXME: try to use underscore
              if (json[i]) {

                var ER = new RegExp(json[i].id, "i");
                if (!ER.test(playedWordsStr) && json[i].words) {
                  wordsNotPlayed.push(json[i]);
                }
              }
            }
          }

          var index = Util.getRandomNumber(wordsNotPlayed.length);

          return {
            words: wordsNotPlayed[index],
            instructions : data.instructions,
            instructionsPath: data.instructionsPath,  
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            scoreSetUp: data.scoreSetUp,
            totalLevels : data.info.length,
            finalizationLevel : data.finalizationLevel,
            limit: data.limit
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
  .factory('LevelsNine', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/9-words.json';
            break;
          default:
            src = 'data/9-words.json';
        }
        return src;
      },
    };
  });
