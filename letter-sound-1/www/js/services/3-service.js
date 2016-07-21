angular.module('saan.services')

.factory('RandomLetterThree', function($http, LevelsThree, Util) {
  return {
    letter: function(level, playedLetters) {
      var src = LevelsThree.getSrcData(level);
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
            successMessages: data.successMessages
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
.factory('StatusThree', function() {
  return {
    save: function(params) {
        if (typeof(Storage) !== "undefined" && params && params.key && params.value) {
            return localStorage.setItem(params.key, params.value);
        }
        return null;
    },
    get: function(params) {
      if (typeof(Storage) !== "undefined") {
        localStorage.getItem(params);
        return true;
      }
      return false;
    }
  }
})
  .factory('LevelsThree', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/letters.json';
            break;
          default:
            src = 'data/letters.json';
        }
        return src;
      },
    };
  });
