angular.module('saan.services')
.factory('RandomLetter', function($http, $log, LevelsFive, Util) {
  return {
    letter: function(level, playedLetters) {
      var src = LevelsFive.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
          var data = response.data;
          var lettersNotPlayed = [];
          if (playedLetters.length === 0 ){
            lettersNotPlayed = data.letters;
          } else {
            for (var i in data.letters) { //FIXME: try to use underscore
              if (data.letters[i]) {
                var ER = new RegExp(data.letters[i].letter, "i");
                if (!ER.test(playedLetters.toString())) {
                  lettersNotPlayed.push(data.letters[i]);
                }
              }
            }
          }
          var position = Util.getRandomNumber(lettersNotPlayed .length);
          return {
            letter: lettersNotPlayed[position],
            instructions : data.instructions,
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            scoreSetUp: data.scoreSetUp,
            totalLevels: data.letters.length,
            finalizationLevel: data.finalizationLevel
          };
        },
        function error() {
          //TODO: handle errors for real
          $log.error("error");
        }
      );
    }
  };
})
  .factory('LevelsFive', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/5-letters.json';
            break;
          default:
            src = 'data/5-letters.json';
        }
        return src;
      },
    };
  });
