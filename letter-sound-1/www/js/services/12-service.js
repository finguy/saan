angular.module('saan.services')
.factory('RandomText', function($http, LevelsTwelve, Util) {
  return {
    text: function(level, playedTexts) {
      var src = LevelsTwelve.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
          var data = response.data;
          var json = data.readings;
          var textsNotPlayed = [];
          if (playedTexts.length === 0 ){
            textsNotPlayed = json;
          } else {
            var playedTextsStr = playedTexts.toString();
            for (var i in json) { //FIXME: try to use underscore
              if (json[i].id) {
                var ER = new RegExp(json[i].id, "i");
                if (!ER.test(playedTextsStr) && json[i].id) {
                  textsNotPlayed.push(json[i]);
                }
              }
            }
          }
          var index = Util.getRandomNumber(textsNotPlayed.length);

          return {
            textJson: textsNotPlayed[index],
            instructions : data.instructions,
            instructionsPath: data.instructionsPath,  
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            scoreSetUp: data.scoreSetUp,
            finalizationLevel : data.finalizationLevel,
            totalLevels : data.readings.length,
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
.factory('LevelsTwelve', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/12-reading.json';
            break;
          default:
            src = 'data/12-reading.json';
        }
        return src;
      },
    };
});
