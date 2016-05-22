angular.module('saan.controllers')

.controller('1Ctrl', function($scope, RandomWord, RandomLetters, TTSService) {
	$scope.activityId = '1';
	$scope.word = "";
	$scope.letters = [];
	$scope.dashBoard = [];
	$scope.selectedLetters = [];
	$scope.level = $scope.level || '1';
	RandomWord.word($scope.level).then(
		function success(word){
			$scope.word = word;
			var letters = word.split("");
			var src = [];
			_.each(letters, function(letter, key){
				var l  = RandomLetters.letters(letters.length, letter);
				l.push(letter);
				src.push(_.shuffle(l));
			});
			$scope.dashBoard = src;
		},
		function error(error){
			console.log(error);
		}
	);

	$scope.speak = function(text) {
			 $scope.word += " invocando speak(" + text +") ...";
		   TTSService.speak(text).then(function success() {
				   $scope.word += " hablando";
			 },
		 	function error(){
				$sope.word += " error";
			});
	};
	$scope.checkWord = function(){
		var builtWord = $scope.selectedLetters.join("");
		if (builtWord.toLowerCase() === $scope.word.toLowerCase()){
			console.log("success!!!");
		}
		else{
			console.log("nooope");
		}
	};
});
