angular.module('saan.services')
.factory('RandomWordsSixteen', function($http, LevelsSixteen, Util) {
  return {
    letters: function(level, playedLetters) {
      var src = LevelsSixteen.getSrcData(level);
      return $http.get(src).then(
        function success(response) {

          var data = response.data;
          var json = data.info;
          var lettersNotPlayed = [];
          if (playedLetters.length === 0 ){
            lettersNotPlayed = json;
          } else {
            var playedLettersStr = playedLetters.toString();
            for (var i in json) { //FIXME: try to use underscore
              if (json[i]) {
                var ER = new RegExp(json[i].id, "i");
                if (!ER.test(playedLettersStr) && json[i].letters) {
                  lettersNotPlayed.push(json[i]);
                }
              }
            }
          }

          var index = Util.getRandomNumber(lettersNotPlayed.length);

          return {
            info: lettersNotPlayed[index],
            instructions : data.instructions,
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            scoreSetUp: data.scoreSetUp,
            totalLevels : data.info.length,
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
