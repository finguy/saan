angular.module('saan.controllers')
.controller('2Ctrl', function($scope, RandomPattern) {
	$scope.activityId = '2';
	$scope.pattern = [];
	$scope.repetitions = 2;
	$scope.patternLength = 4;

	$scope.generatePattern = function(){
		RandomPattern.pattern(4).then(function(data){
			$scope.activityData = data;
			$scope.pattern = data.pattern;

			var readWordTimeout = 2000;
			//wait for UI to load
			setTimeout(function() {
				if (readInstructions){
					$scope.speak(data.instructions);
				}
			}, readWordTimeout);

		});
	};

	$scope.generatePattern(true);

	$scope.checkLevel = function(completions){
		if (completions == $scope.patternLength * $scope.repetitions){
			$scope.generatePattern(false);
			$scope.selectedComponents = [];
			return true;
		}
		else {
			return false;
		}
	};

	$scope.successMessage = function(){
		$scope.speak(_.sample(activityData.successMessages));
	};

	$scope.errorMessage = function(){
		$scope.speak(activityData.errorMessages[0]);
	};
});
