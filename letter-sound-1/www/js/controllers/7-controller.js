(function() {
  'use strict';
  angular.module('saan.controllers')
  .controller('7Ctrl', ['$scope', 'DeckBuilder', 'Util', function($scope, DeckBuilder, Util) {
    $scope.activityId = '7';
    $scope.deck = [];
    $scope.map = [];

    var config = '';
    var Ctrl7 = Ctrl7 || {} ;

    $scope.$on('$ionicView.beforeEnter', function() {
      //TODO: Get current level in order to get the proper configuration
      Ctrl7.getConfiguration(1);
    });

    Ctrl7.getConfiguration = function(level){
      DeckBuilder.getConfig(level).then(function(data){
        config = data;
        config.level.numberRange = parseInt(config.level.numberRange, 10);
        config.level.numberOfCards = parseInt(data.level.numberOfCards, 10);
        $scope.size = config.level.numberOfCards;
        $scope.buildDeck();
      });
    };

    $scope.buildDeck = function(){
      var cards = [];
      var auxCards = [];

      for (var i = 0; i < $scope.size / 2; i++){
        var number = Util.getRandomNumber(config.level.numberRange);

        while (_.indexOf(auxCards, number) != -1)
          number = Math.floor(Math.random() * 10);

        auxCards.push(number);
        cards.push({key: number, value: number});
        cards.push({key: number, value: Util.numberToWords(number)});
      }

      cards = _.shuffle(cards);

      var deck = [];
      var deckMap = [];
      var deckDimension = Math.sqrt($scope.size);

      for (var j = 0; j < deckDimension; j++){
        deck.push(cards.splice(0, deckDimension));
        deckMap.push(_.map(deck[j], function(num){ return 0; }));
      }

      $scope.map = deckMap;
      $scope.deck = deck;
    };

  }]);
})();
