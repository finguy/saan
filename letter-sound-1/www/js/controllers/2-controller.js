(function() {
  'use strict';
  angular.module('saan.controllers')
  .controller('2Ctrl', ['$scope', 'RandomPattern', 'TTSService', 'Util', 'RandomNumericalSeq',
  function ($scope, RandomPattern, TTSService, Util, RandomNumericalSeq) {
    var MODE_SEQUENCE = 1;
    var MODE_FILLIN = 2;

    var ITEM_COLORS = 1;
    var ITEM_NUMBERS = 2;

    $scope.ITEM_COLORS = 1;
    $scope.ITEM_NUMBERS = 2;

    $scope.mode = MODE_SEQUENCE;
    $scope.itemType = ITEM_COLORS;
    $scope.dropzone = [];
    $scope.repetitions = 2;
    $scope.positionToFill = 0;

    var pattern = [];
    var patternLength = 4;
    var completions = 0;
    var readWordTimeout = 1000;

    function generatePattern(){
      if ($scope.itemType == ITEM_COLORS){
        return RandomPattern.pattern(patternLength);
      }else if ($scope.itemType == ITEM_NUMBERS){
        //TODO definir metodo para seleccionar patrones numericos acordes al nivel
        return RandomNumericalSeq.sequence(2, 10, patternLength);
      }
    }

    $scope.startActivity = function(readInstructions){
      generatePattern().then(function(data){
        $scope.activityData = data;
        $scope.availableFields = data.availableFields;
        pattern = data.seq;
        populatePattern();

        //wait for UI to load
        setTimeout(function() {
          if (readInstructions){
            TTSService.speak(data.instructions);
          }
        }, readWordTimeout);
      });
    };

    function populatePattern(){

      if ($scope.itemType == ITEM_COLORS){
        if ($scope.mode == MODE_SEQUENCE){
          $scope.patternLeft = pattern;
          $scope.positionToFill = 0;
        }else if ($scope.mode == MODE_FILLIN){
          $scope.positionToFill = _.random(0, patternLength * 2 - 1);
          pattern = pattern.concat(pattern);

          $scope.patternLeft = pattern.slice(0, $scope.positionToFill);
          $scope.patternRight = pattern.slice($scope.positionToFill + 1);
        }
      }else if ($scope.itemType == ITEM_NUMBERS){
        // elegir posicion para completar
        $scope.positionToFill = $scope.activityData.positionToFill;
        $scope.patternLeft = pattern.slice(0, $scope.positionToFill);
        $scope.patternRight = pattern.slice($scope.positionToFill + 1);
      }
    }


    $scope.startActivity(true);

    $scope.checkColor = function(selectedColor){
      return (pattern[$scope.positionToFill] == selectedColor);
    };

    $scope.checkLevel = function(){
      if ($scope.mode == MODE_SEQUENCE){
        completions++;
        $scope.positionToFill = ++$scope.positionToFill % patternLength;
        if (completions == patternLength * $scope.repetitions){
          $scope.startActivity(false);
          $scope.selectedComponents = [];
          completions = 0;
        }
      }else if ($scope.mode == MODE_FILLIN){
        $scope.startActivity(false);
      }
    };

    $scope.successMessage = function(){
      TTSService.speak(_.sample($scope.activityData.successMessages));
    };

    $scope.errorMessage = function(){
      TTSService.speak($scope.activityData.errorMessages[0]);
    };

    $scope.getClass = function(item){

      if ($scope.itemType == ITEM_COLORS){
        return 'color color-' + item;
      }
      else{
        return 'item-number';
      }
    };
  }]);
})();
