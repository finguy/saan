angular.module('saan.services')
.factory('RandomWordsNine', function($http, LevelsNine, Util) {
  return {
    words: function(level, playedWords) {
      var src = LevelsNine.getSrcData(level);
      return $http.get(src).then(
        function success(response) {

          var data = response.data;
          var json = data.info;
          var wordsNotPlayed = [];
        /*  if (playedWords.length === 0 ){
            wordsNotPlayed = json.data;
          } else {
            var playedWordsStr = playedWords.toString();
            for (var i in data.words) { //FIXME: try to use underscore
              if (data.words[i]) {
                var ER = new RegExp(data.words[i].word, "i");
                if (!ER.test(playedWordsStr)) {
                  wordsNotPlayed.push(data.words[i]);
                }
              }
            }
          } */

          wordsNotPlayed = json;
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
