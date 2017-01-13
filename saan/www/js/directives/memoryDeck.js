(function() {
  'use strict';
  angular.module('saan.directives')
  .directive('memoryDeck', function(){
    return {
      restrict: "E",
      templateUrl: "templates/directives/memoryDeck.html",
      scope: {
        deck: '=',
        map: '=',
        deckCompleted: '&',
        size: '=',
        feedback: '&',
        enabled: '&'
      },
      controller: ['$scope', '$timeout', function deckController($scope, $timeout){
        var CARD_BACK = 0;
        var CARD_FRONT = 1;
        var CARD_MATCHED = 2;
        var CARD_CHECK_DELAY = 1500;

        var flipEnabled = true;
        var matchedCards = 0;
        var selectedCards = [];

        this.isCardFlipped = function(row, col){
          return $scope.map[row][col] == 1;
        };

        this.flipCard = function(row, col){
          if (flipEnabled && $scope.enabled()){
            if (selectedCards.length == 2){
              unflipCard();
            }

            if ($scope.map[row][col] === CARD_BACK){
              $scope.map[row][col] = CARD_FRONT;
              selectedCards.push({"row": row, "col": col});
              if (selectedCards.length == 2 && $scope.deck[row][col].key == $scope.deck[selectedCards[0].row][selectedCards[0].col].key){
                matchCard();
              }
            }
          }
        };

        this.isCardMatched = function(row, col){
          return $scope.map[row][col] == CARD_MATCHED;
        };

        var matchCard = function(row, col){
          flipEnabled = false;
          $scope.feedback({success: true});
          $timeout(function(){
            for (var i=0; i<selectedCards.length; i++){
              $scope.map[selectedCards[i].row][selectedCards[i].col] = CARD_MATCHED;
            }
            selectedCards = [];
            matchedCards = matchedCards + 2;
            if (matchedCards == $scope.size){
              matchedCards = 0;
              $scope.deckCompleted();
            }
            flipEnabled = true;
          }, CARD_CHECK_DELAY);
        };

        var unflipCard = function(){
          for (var i=0; i<selectedCards.length; i++){
            $scope.map[selectedCards[i].row][selectedCards[i].col] = CARD_BACK;
          }
          selectedCards = [];
        };
      }]
    };
  });
})();
