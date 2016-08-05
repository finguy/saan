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
            successMessages: data.successMessages,
            availableFields: data.colors
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

.factory('RandomNumericalSeq', function(Util){
  return {
    sequence: function(digits, step, length){
      var base = Math.random();
      for (var i = 1; i <= digits; i++)
        base = base * 10;

      var seq = [Math.floor(base)];

      for (i = 1; i <= length; i++){
        seq.push(seq[i-1] + step);
      }

      return seq;
    }
  };
});
