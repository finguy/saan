angular.module('saan.directives')
.directive('memoryDeck', function(){
  return {
    restrict: "E",
    templateUrl: "templates/directives/memoryDeck.html",
    scope: {
      deck: '=',
      map: '='
    },
    controller: ['$scope', function deckController($scope){
      var rows = $scope.deck.length;
      var selectedCard = {row: "", col: ""};
      var flipEnabled = true;

      this.CARD_BACK = 0;
      this.CARD_FRONT = 1;
      this.CARD_SOLVED = 2;

      this.isCardFlipped = function(row, col){
        return $scope.map[row][col] == 1;
      };

      this.flipCard = function(row, col){
        if (flipEnabled && $scope.map[row][col] === 0){
          $scope.map[row][col] = 1;
          if (selectedCard.row === ""){
            selectedCard.row = row;
            selectedCard.col = col;
          }else{
            flipEnabled = false;
            setTimeout(function(){
              $scope.$apply(function(){
                var value = $scope.deck[row][col] != $scope.deck[selectedCard.row][selectedCard.col] ? 0 : 2;
                $scope.map[row][col] = value;
                $scope.map[selectedCard.row][selectedCard.col] = value;
                selectedCard.row = "";
                selectedCard.col = "";
                flipEnabled = true;
              });
            }, 1000);
          }
        }
      };

      this.matchCard = function(row, col){
        $scope.map[row][col] = 2;
      };

      this.isCardMatched = function(row, col){
        return $scope.map[row][col] == 2;
      };      
    }]
  };
});
