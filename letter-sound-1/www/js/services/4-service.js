angular.module('saan.services')
.factory('RandomNumber', function($http, LevelsFour, Util) {
  return {
    number: function(level, playedNumbers) {
      var src = LevelsFour.getSrcData(level);
      return $http.get(src).then(
        function success(response) {
          var data = response.data;
          var numbersNotPlayed = [];
          console.log(data);
          if (playedNumbers.length === 0 ){
            numbersNotPlayed = data.numbers;
          } else {
            for (var i in data.numbers) { //FIXME: try to use underscore
              if (data.numbers[i]) {
                  var index = _.indexOf(playedNumbers,data.numbers[i].number);
                if (index === -1) {
                  numbersNotPlayed.push(data.numbers[i]);
                }
              }
            }
          }

          var position = Util.getRandomNumber(numbersNotPlayed.length);
          return {
            number: numbersNotPlayed[position],
            instructions : data.instructions,
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            assets: data.assets
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
.factory('LevelsFour', function() {
    return {
      getSrcData: function(level) {
        var src = '';
        switch (level) {
          case "1":
            src = 'data/numbers.json';
            break;
          default:
            src = 'data/numbers.json';
        }
        return src;
      },
    };
});
