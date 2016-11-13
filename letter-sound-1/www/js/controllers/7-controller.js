(function() {
  'use strict';
  angular.module('saan.controllers')
  .controller('7Ctrl', ['$scope', '$log', '$state', 'DeckBuilder', 'Util', 'ActividadesFinalizadasService',
  function($scope, $log, $state, DeckBuilder, Util, ActividadesFinalizadasService) {
    $scope.activityId = '7';
    $scope.deck = [];
    $scope.map = [];

    var config = '';
    var level;
    var Ctrl7 = Ctrl7 || {} ;

    $scope.$on('$ionicView.beforeEnter', function() {
      //TODO: Get current level in order to get the proper configuration
      level = 1;
      Ctrl7.getConfiguration(level);
    });

    Ctrl7.getConfiguration = function(level){
      DeckBuilder.getConfig(level).then(function(data){
        config = data;
        $scope.size = config.level.numberOfCards;
        $scope.buildDeck();
      });
    };

    $scope.buildDeck = function(){
      $scope.map = [];
      $scope.deck = [];
      var cards = [];
      var auxCards = [];

      for (var i = 0; i < $scope.size / 2; i++){
        var number = _.random(config.level.numberFrom, config.level.numberTo);
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

    $scope.deckCompleted = function(){
      if (level > DeckBuilder.getMaxLevel){
        ActividadesFinalizadasService.add($scope.activityId);
        $state.go('lobby');
      }
      else{
        Ctrl7.getConfiguration(++level);
      }
    };

  }]);
})();
