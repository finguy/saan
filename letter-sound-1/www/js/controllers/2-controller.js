angular.module('saan.controllers')
.controller('2Ctrl', function ($scope, RandomPattern, TTSService, Util) {
  $scope.availableFields = ["red", "purple", "blue",
                            "green", "yellow", "orange",
                            "brown"];
  $scope.dropzone = [];
  $scope.patternLeft = [];
  $scope.patternRight = [];
  $scope.repetitions = 2;
  $scope.positionToFill = 0;
  var pattern = [];

  var patternLength = 4;
  var patternA = [];
  var patternB = [];
  $scope.mode = 2;
  var completions = 0;

  var readWordTimeout = 1000;

  $scope.generatePattern = function(readInstructions){
  	RandomPattern.pattern($scope.patternLength).then(function(data){
	    $scope.activityData = data;
      pattern = data.pattern;

      if ($scope.mode == 1){
          $scope.patternLeft = pattern;
          $scope.positionToFill = 0;
      }else if ($scope.mode == 2){
        $scope.positionToFill = Util.getRandomNumber(patternLength);

        if ($scope.positionToFill % 2 === 0){
          patternA = patternA.concat(data.pattern.slice(0, $scope.positionToFill));
          patternB = data.pattern.slice($scope.positionToFill+1);
          patternB = patternB.concat(data.pattern);
        }else{
          patternA = data.pattern;
          patternA = patternA.concat(data.pattern.slice(0, $scope.positionToFill));
          patternB = data.pattern.slice($scope.positionToFill+1);
        }

        $scope.patternLeft = patternA;
        $scope.patternRight = patternB;
      }

  		//wait for UI to load
  		setTimeout(function() {
  			if (readInstructions){
  				TTSService.speak(data.instructions);
  			}
  		}, readWordTimeout);
  	});
  };

	$scope.generatePattern(true);

  $scope.checkColor = function(selectedColor){
    return (pattern[$scope.positionToFill] == selectedColor);
  };

  $scope.checkLevel = function(){

    if ($scope.mode == 1){
      completions++;
      $scope.positionToFill = ++$scope.positionToFill % patternLength;
      if (completions == patternLength * $scope.repetitions){
  			$scope.generatePattern(false);
  			$scope.selectedComponents = [];
        completions = 0;
  		}
    }else if ($scope.mode == 2){
      $scope.generatePattern(false);
    }
	};

  $scope.successMessage = function(){
		TTSService.speak(_.sample($scope.activityData.successMessages));
	};

	$scope.errorMessage = function(){
		TTSService.speak($scope.activityData.errorMessages[0]);
	};

});
