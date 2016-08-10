angular.module('saan.controllers')
.controller('2Ctrl', function ($scope, RandomPattern, TTSService, Util, RandomNumericalSeq) {
  var MODE_SEQUENCE = 1;
  var MODE_FILLIN = 2;

  var ITEM_COLORS = 1;
  var ITEM_NUMBERS = 2;

  $scope.ITEM_NUMBERS = 2;
  $scope.ITEM_COLORS = 1;
  $scope.mode = MODE_FILLIN;
  $scope.itemType = ITEM_NUMBERS;
  $scope.dropzone = [];
  $scope.patternLeft = [];
  $scope.patternRight = [];
  $scope.repetitions = 2;
  $scope.positionToFill = 0;

  var pattern = [];
  var patternLength = 4;
  var patternA = [];
  var patternB = [];
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
    patternA = [];
    patternB = [];

    if ($scope.itemType == ITEM_COLORS){
      if ($scope.mode == MODE_SEQUENCE){
          $scope.patternLeft = pattern;
          $scope.positionToFill = 0;
      }else if ($scope.mode == MODE_FILLIN){
        $scope.positionToFill = Util.getRandomNumber(patternLength);

        if ($scope.positionToFill % 2 === 0){
          patternA = patternA.concat(pattern.slice(0, $scope.positionToFill));
          patternB = pattern.slice($scope.positionToFill+1);
          patternB = patternB.concat(pattern);
        }else{
          patternA = pattern;
          patternA = patternA.concat(pattern.slice(0, $scope.positionToFill));
          patternB = pattern.slice($scope.positionToFill+1);
        }
      }
    }else if ($scope.itemType == ITEM_NUMBERS){
      // elegir posicion para completar
      $scope.positionToFill = $scope.activityData.positionToFill;
      patternA = patternA.concat(pattern.slice(0, $scope.positionToFill));
      patternB = pattern.slice($scope.positionToFill+1);
    }

    $scope.patternLeft = patternA;
    $scope.patternRight = patternB;
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

});
