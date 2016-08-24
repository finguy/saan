(function() {
  'use strict';
	angular.module('saan.controllers')
	.controller('7Ctrl', ['$scope', 'DeckBuilder', 'Util', function($scope, DeckBuilder, Util) {
		$scope.activityId = '7';
		$scope.deck = [];
		$scope.map = [];
		$scope.size = 0;

		var config = '';

		function getConfiguration(level){
			DeckBuilder.getConfig(level).then(function(data){
				config = data;
				$scope.size = parseInt(data.level.numberOfCards);
				$scope.buildDeck();
			});
		}

		$scope.buildDeck = function(){
			var cards = [];
			var auxCards = [];

			for (var i = 0; i < $scope.size / 2; i++){
				var number = Util.getRandomNumber(parseInt(config.level.numberRange));

				while (_.indexOf(auxCards, number) != -1)
					number = Math.floor(Math.random() * 10);

				auxCards.push(number);
				cards.push({key: number, value: number});
				cards.push({key: number, value: Util.numberToWords(number)});
			}

			cards = _.shuffle(cards);

			var deck = [];
			var deckMap = [];
			var start = 0;
			var deckDimension = Math.sqrt($scope.size);

			for (var j = 0; j < deckDimension; j++){
				deck.push(cards.splice(start, deckDimension));
				deckMap.push(_.map(deck[j], function(num){ return 0; }));
			}

			$scope.map = deckMap;
			$scope.deck = deck;
		};

		//TODO: Get current level in order to get the proper configuration
		getConfiguration(1);
	}]);
})();
