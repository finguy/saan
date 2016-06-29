angular.module('saan.controllers')
.controller('2Ctrl', function($scope, RandomPattern, TTSService) {
	$scope.activityId = '2';
	$scope.pattern = [];
	$scope.repetitions = 2;
	$scope.patternLength = 4;
	$scope.availableFields = [{color: "red"}, {color: "purple"}, {color: "blue"},
														{color: "green"}, {color: "yellow"}, {color: "orange"},
														{color: "brown"}];

	$scope.generatePattern = function(readInstructions){
		RandomPattern.pattern($scope.patternLength).then(function(data){
			$scope.activityData = data;
			$scope.pattern = data.pattern;

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
		TTSService.speak(_.sample($scope.activityData.successMessages));
	};

	$scope.errorMessage = function(){
		TTSService.speak($scope.activityData.errorMessages[0]);
	};
});