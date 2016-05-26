angular.module('saan.controllers')

.controller('1Ctrl', function($scope, RandomWord, RandomLetters, TTSService) {
	$scope.activityId = '1'; // Activity Id
	$scope.word = ""; // Word to play in level
	$scope.letters = []; // Word letters
	$scope.dashBoard = []; // Dashboard letters
	$scope.selectedLetters = []; // Collects letters the user selects
	$scope.playedWords = []; // Collects words the user played
	$scope.level = $scope.level || 1; // Indicates activity level

	/**
	 * Shows Activity Dashboard
	 */
	$scope.showDashboard = function() {
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

				//wait for UI to load
				setTimeout(function(){
				$scope.speak($scope.word);
			}, 1000);

			},
			function error(error){
				console.log(error);
			}
		);
	};

	/**
	 * Reproduces sound using TTSService
	 */
	$scope.speak = TTSService.speak;
	
	/**
	 * Verifies selected letters and returns true if they match the word
	 */
	$scope.checkWord = function() {
				var builtWord = $scope.selectedLetters.join("");
				if (builtWord.toLowerCase() === $scope.word.toLowerCase()){
					$scope.playedWords.push(builtWord.toLowerCase());
					return true;
				} else{
					return false;
				}
	};
	/**
	 * Advance one level
	 */
	$scope.levelUp = function() {
		$scope.level++;
		$scope.letters = [];
		$scope.dashBoard = [];
		$scope.selectedLetters = [];
	};
	/**
	 * Goes back one level
	 */
	$scope.levelDown = function() {
		$scope.level = (level > 1) ? (level - 1) : 1;
		$scope.letters = [];
		$scope.dashBoard = [];
		$scope.selectedLetters = [];
	};

	//*************** ACTIONS **************************/
	//Show Dashboard
	$scope.showDashboard();

});
