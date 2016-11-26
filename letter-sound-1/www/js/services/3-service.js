angular.module('saan.services')

.factory('RandomLetterThree', function($http,$log, LevelsThree, Util) {
  var data;
  return {
    letter: function(level, playedLetters) {
      var src = LevelsThree.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
          data = response.data;
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
          var position = Util.getRandomNumber(lettersNotPlayed.length);
          console.log(data);
          return {
            letter: lettersNotPlayed[position],
            instructions : data.instructions,
            instructionsPath: data.instructionsPath,            
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            scoreSetUp : data.scoreSetUp,
            nextLetterImgSrc : data.nextLetterImgSrc,
            previousLetterImgSrc : data.previousLetterImgSrc,
            srcAlphabetLetters : data.srcAlphabetLetters,
            finalizationLevel : data.finalizationLevel,
            totalLevels : data.letters.length
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
.factory('LevelsThree', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/3-letters.json';
            break;
          default:
            src = 'data/3-letters.json';
        }
        return src;
      },
    };
  });
