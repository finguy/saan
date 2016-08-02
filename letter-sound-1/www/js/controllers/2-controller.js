angular.module('saan.controllers')
.controller('2Ctrl', function ($scope, RandomPattern, TTSService, Util) {
  $scope.availableFields = ["red", "purple", "blue",
                            "green", "yellow", "orange",
                            "brown"];
  $scope.dropzone = [];

  $scope.patternLeft = [];
  $scope.patternRight = [];
  $scope.repetitions = 2;
  patternLength = 4;

  $scope.mode = 1;
  $scope.positionToFill;
  $scope.pattern;

  var pattern = [];
  var patternA = [];
  var patternB = [];

  var completions = 0;

  $scope.generatePattern = function(readInstructions){
  	RandomPattern.pattern($scope.patternLength).then(function(data){
	    $scope.activityData = data;
      $scope.pattern = data.pattern;

      if ($scope.mode == 2){
        // need to select color to remove
        $scope.positionToFill = Util.getRandomNumber(patternLength);
        patternA = data.pattern.slice(0, $scope.positionToFill);
        patternB = data.pattern.slice($scope.positionToFill+1, patternLength);
        patternB = patternB.concat(data.pattern);

        if ($scope.positionToFill % 2 === 0){
          $scope.patternLeft = patternA;
          $scope.patternRight = patternB;
        }else{
          $scope.patternLeft = patternB;
          $scope.patternRight = patternA;
        }
      }
      else{
        $scope.patternLeft = $scope.pattern;
        $scope.positionToFill = patternLength - 1;
      }

  		var readWordTimeout = 1000;
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
    return ($scope.pattern[$scope.positionToFill] == selectedColor);
  };

  $scope.checkLevel = function(){

    if ($scope.mode == 1){
      completions++;
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
