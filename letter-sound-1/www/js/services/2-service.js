angular.module('saan.services')

.factory('RandomPattern', function($http, Levels, Util) {
  return {
    pattern: function(level, playedWords, length) {
      var src = 'data/pattern_colors.json';
      return $http.get(src).then(
        function success(response) {
          var data = response.data;
          var pattern = [];
          var length = data.colors.length;
          for(var i = 0; i < data.numberOfOptions; i++){
            pattern.push(data.colors[Util.getRandomNumber(length)]);
          }
          return {
            seq: pattern,
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

.factory('RandomNumericalSeq', function(Util, $q, $http){
  return {
    sequence: function(digits, step, length){
      var src = 'data/pattern_numbers.json';
      return $http.get(src).then(
        function success(response){
          var defer = $q.defer();
          var data = response.data;

          digits = Math.pow(10, digits);
          var base = Math.random() * digits;
          var seq = [Math.floor(base)];

          for (i = 1; i < length; i++)
            seq.push(seq[i-1] + step);

          var positionToFill = Util.getRandomNumber(length);

          var options = [seq[positionToFill]];
          for (i = 1; i < data.numberOfOptions; i++){
            var number = Math.floor(Math.random() * digits);
            while (_.indexOf(options, number) != -1)
              number = Math.floor(Math.random() * digits);
            options.push(number);
          }

          _.shuffle(options);

          defer.resolve({
            seq: seq,
            instructions : data.instructions,
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            positionToFill: positionToFill,
            availableFields: options
          });
          return defer.promise;
        }
      );
    }
  };
});
