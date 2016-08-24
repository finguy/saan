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
      var rows = $scope.deck.length;
      var selectedCard = {row: "", col: ""};
      var flipEnabled = true;
      var matchedCards = 0;

      var CARD_BACK = 0;
      var CARD_FRONT = 1;
      var CARD_MATCHED = 2;

      this.isCardFlipped = function(row, col){
        return $scope.map[row][col] == 1;
      };

      this.flipCard = function(row, col){
        if (flipEnabled && $scope.map[row][col] === CARD_BACK){
          $scope.map[row][col] = CARD_FRONT;
          if (selectedCard.row === ""){
            selectedCard.row = row;
            selectedCard.col = col;
          }else{
            flipEnabled = false;
            setTimeout(function(){
              $scope.$apply(function(){
                if ($scope.deck[row][col].key == $scope.deck[selectedCard.row][selectedCard.col].key){
                  matchCard(row, col);
                  matchCard(selectedCard.row, selectedCard.col);
                }
                else{
                  $scope.map[row][col] = CARD_BACK;
                  $scope.map[selectedCard.row][selectedCard.col] = CARD_BACK;
                }
                selectedCard.row = "";
                selectedCard.col = "";
                flipEnabled = true;
              });
            }, 1000);
          }
        }
      };

      var matchCard = function(row, col){
        $scope.map[row][col] = CARD_MATCHED;
        matchedCards++;
        if (matchedCards == $scope.size * 4){
          $scope.build();
        }
      };

      this.isCardMatched = function(row, col){
        return $scope.map[row][col] == CARD_MATCHED;
      };
    }]
  };
});
