angular.module('saan.services')
.factory('RandomWordSix', function($http, LevelsSix, Util) {
  var data;
  return {
    word: function(level, playedWords) {
      var src = LevelsSix.getSrcData(level);
      return $http.get(src).then(
        function success(response) {

          data = response.data;
          var json = data.words;
          var index;
          if (level <= json.length && level > 1) {
            index = level - 1;
          } else {
            index = 0; //Start all over
          }

          //Pick word from level that hasn't been played in current session
          var key = 0;
          var iterWord = json[index].word[key];
          var imgWord = json[index].imgs[key];

          if ( _.size(playedWords) > 0 ) {
            while (key < json[index].word.length && playedWords[iterWord]) {
                key++;
                iterWord = json[index].word[key];
                imgWord = json[index].imgs[key];
            }
          } else {
           key = Util.getRandomNumber(json[index].word.length);
           iterWord = json[index].word[key];
           imgWord = json[index].imgs[key];
          }

          console.log("playedWords:");
          console.log(playedWords);
          console.log("playedWords.length:");
          console.log(_.size(playedWords));
          console.log("nextWord:");
          console.log(iterWord);
          console.log(playedWords[iterWord]);
          return {
            word : iterWord,
            img: imgWord,
            instructions : data.instructions,
            instructionsPath: data.instructionsPath,
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
    },
    getSuccessAudio: function() {
      var index = _.random(0, data.successFeedback.length - 1);
      return data.successFeedback[index];
    },
    getFailureAudio: function() {
      var index = _.random(0, data.failureFeedback.length - 1);
      return data.failureFeedback[index];
    },
    getEndingAudio: function(index) {
      return data.endingFeedback[index];
    }
  };
})
  .factory('LevelsSix', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/6-config.json';
            break;
          default:
            src = 'data/6-config.json';
        }
        return src;
      },
    };
  });
