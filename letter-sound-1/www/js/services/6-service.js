angular.module('saan.services')
.factory('RandomWordSix', function($http, LevelsSix, Util) {
  return {
    word: function(level, playedWords) {
      var src = LevelsSix.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
          var data = response.data;
          var wordsNotPlayed = [];
          if (playedWords.length === 0 ){
            wordsNotPlayed = data.words;
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
          }
          var index = Util.getRandomNumber(wordsNotPlayed.length);
          return {
            word : wordsNotPlayed[index],
            instructions : data.instructions,
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
    }
  };
})
  .factory('LevelsSix', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/6-words.json';
            break;
          default:
            src = 'data/6-words.json';
        }
        return src;
      },
    };
  });
