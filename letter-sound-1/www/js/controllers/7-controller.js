angular.module('saan.controllers')
.controller('7Ctrl', ['$scope', 'DeckBuilder', 'Util', function($scope, DeckBuilder, Util) {
	$scope.activityId = '7';
	$scope.config = '';
	$scope.deck = [];
	$scope.map = [];

	function getConfiguration(level){
		DeckBuilder.getConfig(level).then(function(data){
			$scope.config = data;
			buildDeck(parseInt(data.level.numberOfCards));
		});
	}

	function buildDeck(size){
		var cards = [];
		var auxCards = [];

		for (var i = 0; i < size * 2; i++){
			var number = Util.getRandomNumber(20);
			while (_.indexOf(auxCards, number) != -1)
				number = Math.floor(Math.random() * 10);
			auxCards.push(number);
			cards.push({key: number, value: number});
			cards.push({key: number, value: Util.numberToWords(number)});
		}

		cards = _.shuffle(cards);
		console.log(cards);
		var deck = [];
		var deckMap = [];
		var start = 0;
		var top = size;
		for (var j = 0; j < size; j++){
			deck.push(cards.splice(start, size));
			deckMap.push(_.map(deck[j], function(num){ return 0; }));
		}
		$scope.map = deckMap;
		$scope.deck = deck;
		console.log($scope.deck);
	}

	getConfiguration(1);

}]);
