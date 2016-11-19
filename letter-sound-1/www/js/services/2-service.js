(function() {
  'use strict';
  angular.module('saan.services')
  .factory('ColorPattern', ColorPattern);

  ColorPattern.$inject = ['$http', '$log'];

  function ColorPattern($http, $log){
    var data;

    return {
      getConfig: getConfig,
      getMaxLevel: getMaxLevel,
      getSequencePattern: getSequencePattern,
      getFillinPattern: getFillinPattern
    };

    function getConfig(level) {
      var src = 'data/2-config.json';
      if (level >= 1){
        return $http.get(src).then(
          function success(response) {
            data = response.data;
            return {
              colors: data.colors,
              instructionsPath: data.instructionsPath,
              instructionsText: data.instructionsText,
              level: data.levels[level-1]
            };
          },
          function error() {
            //TODO: handle errors for real
            $log.error("error");
          }
        );
      }
      else {
        $log.error("Invalid level value");
      }
    }

    function getMaxLevel(){
      return data.levels.length;
    }

    function getSequencePattern(length, numberOfColors){
      var colors = _.sample(data.colors, numberOfColors);
      var pattern = [];
      for (var i = 0; i < length; i++){
        var index = _.random(0, numberOfColors-1);
        pattern.push(colors[index]);
      }

      return pattern;
    }

    function getFillinPattern(length, numberOfColors){
      var pattern = getSequencePattern(length, numberOfColors);
      pattern = pattern.concat(pattern);

      return {
        pattern: pattern,
        positionToFill: _.random(0, length * 2 - 1)
      };
    }
  }
})();


  // .factory('RandomPattern', function($http, Levels, Util) {
  //   return {
  //     pattern: function(level, playedWords, length) {
  //       var src = 'data/pattern_colors.json';
  //       return $http.get(src).then(
  //         function success(response) {
  //           var data = response.data;
  //           var pattern = [];
  //           var length = data.colors.length;
  //           for(var i = 0; i < data.numberOfOptions; i++){
  //             pattern.push(data.colors[Util.getRandomNumber(length)]);
  //           }
  //           return {
  //             seq: pattern,
  //             instructions : data.instructions,
  //             errorMessages : data.errorMessages,
  //             successMessages: data.successMessages,
  //             availableFields: data.colors
  //           };
  //         },
  //         function error() {
  //           //TODO: handle errors for real
  //           console.log("error");
  //         }
  //       );
  //     }
  //   };
  // })
  //
  // .factory('RandomNumericalSeq', function(Util, $q, $http){
  //   return {
  //     sequence: function(digits, step, length){
  //       var src = 'data/pattern_numbers.json';
  //       return $http.get(src).then(
  //         function success(response){
  //           var defer = $q.defer();
  //           var data = response.data;
  //
  //           digits = Math.pow(10, digits);
  //           var base = Math.random() * digits;
  //           var seq = [Math.floor(base)];
  //
  //           for (i = 1; i < length; i++)
  //             seq.push(seq[i-1] + step);
  //
  //           var positionToFill = Util.getRandomNumber(length);
  //
  //           var options = [seq[positionToFill]];
  //           for (i = 1; i < data.numberOfOptions; i++){
  //             var number = Math.floor(Math.random() * digits);
  //             while (_.indexOf(options, number) != -1)
  //               number = Math.floor(Math.random() * digits);
  //             options.push(number);
  //           }
  //
  //           _.shuffle(options);
  //
  //           defer.resolve({
  //             seq: seq,
  //             instructions : data.instructions,
  //             errorMessages : data.errorMessages,
  //             successMessages: data.successMessages,
  //             positionToFill: positionToFill,
  //             availableFields: options
  //           });
  //           return defer.promise;
  //         }
  //       );
  //     }
  //   };
  // });
