angular.module('saan.controllers')

.controller('1Ctrl', function($scope, RandomWord, RandomLetters, TTSService) {
	$scope.activityId = '1'; // Activity Id
	$scope.word = ""; // Word to play in level
	$scope.letters = []; // Word letters
	$scope.dashBoard = []; // Dashboard letters
	$scope.selectedLetters = []; // Collects letters the user selects
	$scope.playedWords = []; // Collects words the user played
	$scope.level = $scope.level || 1; // Indicates activity level

	$scope.showDashboard = function() {
		console.log("level:" + $scope.level);
		console.log("word:" + $scope.word);
		RandomWord.word($scope.level, $scope.playedWords).then(
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
	};
	$scope.showDashboard();
	$scope.speak = function(text) {
		   TTSService.speak(text).then(function success() {				   
			 },
		 	function error(){
				$sope.word += " error";
			});
	};
	$scope.checkWord = function(){
		var builtWord = $scope.selectedLetters.join("");
		if (builtWord.toLowerCase() === $scope.word.toLowerCase()){
			console.log("success!!!");
			$scope.playedWords.push(builtWord.toLowerCase());
			$scope.level++;
			$scope.letters = [];
			$scope.dashBoard = [];
			$scope.selectedLetters = [];
			$scope.showDashboard();
		}
		else{
			console.log("nooope");
		}
	};
});
