angular.module('saan.services')

.factory('RandomPattern', function($http, Levels, Util) {
  return {
    pattern: function(level, playedWords, length) {
      var src = 'data/colors.json';
      return $http.get(src).then(
        function success(response) {
          var data = response.data;
          var pattern = [];
          var length = data.colors.length;
          for(var i = 0; i < 4; i++ ){
            pattern.push(data.colors[Util.getRandomNumber(length)]);
          }
          return {
            pattern: pattern,
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
});
