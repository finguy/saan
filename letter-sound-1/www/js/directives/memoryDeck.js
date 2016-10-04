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
        build: '&',
        size: '='
      },
      controller: ['$scope', function deckController($scope){
        var CARD_BACK = 0;
        var CARD_FRONT = 1;
        var CARD_MATCHED = 2;
        var CARD_CHECK_DELAY = 1000;

        var rows = $scope.deck.length;
        var selectedCard = {row: "", col: ""};
        var flipEnabled = true;
        var matchedCards = 0;
        var selectedCards = [];

        this.isCardFlipped = function(row, col){
          return $scope.map[row][col] == 1;
        };

        this.flipCard = function(row, col){
          if (flipEnabled){
            if (selectedCards.length == 2){
              unflipCard();
            }

            if ($scope.map[row][col] === CARD_BACK){
              $scope.map[row][col] = CARD_FRONT;
              if (selectedCard.row === ""){
                selectedCard.row = row;
                selectedCard.col = col;
                selectedCards.push({"row": row, "col": col});
              }else{
                if ($scope.deck[row][col].key == $scope.deck[selectedCard.row][selectedCard.col].key){
                  selectedCards.push({"row": row, "col": col});
                  matchCard();
                }
                else{
                  selectedCards.push({"row": row, "col": col});
                  $scope.map[row][col] = CARD_FRONT;
                  $scope.map[selectedCard.row][selectedCard.col] = CARD_FRONT;
                }
                selectedCard.row = "";
                selectedCard.col = "";
              }
            }
          }
        };

        this.isCardMatched = function(row, col){
          return $scope.map[row][col] == CARD_MATCHED;
        };

        var matchCard = function(row, col){
          flipEnabled = false;
          setTimeout(function(){
            $scope.$apply(function () {
              for (var i=0; i<selectedCards.length; i++){
                $scope.map[selectedCards[i].row][selectedCards[i].col] = CARD_MATCHED;
              }
              selectedCards= [];
              matchedCards = matchedCards + 2;
              if (matchedCards == $scope.size){
                $scope.build();
              }
              flipEnabled = true;
            });
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
