angular.module('saan.services')

.factory('RandomWord', function($http, Levels) {
  return {
    word: function(level, playedWords) {
      var src = Levels.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
          var data = response.data;
          var wordsNotPlayed = _.difference(data.words,playedWords);
          var position = Math.floor((Math.random() * wordsNotPlayed.length));
          return { word: wordsNotPlayed[position], instructions : data.instructions}
        },
        function error() {
          //TODO: handle errors for real
          console.log("error");
        }
      );
    }
  };
})

.factory('RandomLetters', function($http) {
    return {
      letters: function(cant, word) {
        var differentLetters = [];
        var cantLetters = 24;
        if (word) {
          differentLetters = word.split("");
        }
        if (cant > 0) {
          cantLetters = cant;
        }
        var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        return _.chain(alphabet)
          .difference(differentLetters) // Remove from alphabet letters in word
          .sample(cantLetters)
          .value();
      },
    };
  })
  .factory('Levels', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/words.json';
            break;
          default:
            src = 'data/words.json';
        }
        return src;
      },
    };
  });
