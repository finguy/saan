angular.module('saan.controllers')
.controller('7Ctrl', ['$scope', 'DeckBuilder', 'Util', function($scope, DeckBuilder, Util) {
	$scope.activityId = '7';
	$scope.config = '';
	$scope.deck = [];

	function getConfiguration(level){
		DeckBuilder.getConfig(level).then(function(data){
			$scope.config = data;
			buildDeck(data.level.numberOfCards);
		});
	}

	function buildDeck(numberOfCards){
		var cards = [];
		for (var i = 0; i < numberOfCards; i++){
			var number = Util.getRandomNumber(20);
			while (_.indexOf(cards, number) != -1)
				number = Math.floor(Math.random() * 10);
			cards.push(number);
		}
		var deck = [];
		deck.push(cards);

		for (i = 1; i < numberOfCards; i++){
			deck.push(_.shuffle(cards));
		}

		$scope.deck = deck;
		console.log(deck);

	}

	getConfiguration(1);

}]);
