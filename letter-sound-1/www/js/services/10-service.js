angular.module('saan.services')
.factory('RandomNumber', function($http, LevelsFour, Util) {
  return {
    number: function(level, playedNumbers) {
      var src = LevelsFour.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
          var data = response.data;
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
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            scoreSetUp: data.scoreSetUp,
            totalLevels : data.info.length
          };
        },
        function error() {
          //TODO: handle errors for real
          console.log("error");
        }
      );
    }
  };
})
.factory('LevelsTen', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/10-words.json';
            break;
          default:
            src = 'data/10-words.json';
        }
        return src;
      },
    };
});
