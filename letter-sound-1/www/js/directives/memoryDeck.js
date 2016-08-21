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

      this.isCardFlipped = function(row, col){
        return $scope.map[row][col];
      };

      this.flipCard = function(row, col){
        $scope.map[row][col] = $scope.map[row][col] == 1 ? 0 : 1;
        if (selectedCard.row === ""){
          selectedCard.row = row;
          selectedCard.col = col;
        }else{
          if ($scope.deck[row][col] != $scope.deck[selectedCard.row][selectedCard.col]){
            setTimeout(function(){
                $scope.$apply(function(){
                $scope.map[row][col] = 0;
                $scope.map[selectedCard.row][selectedCard.col] = 0;
                selectedCard.row = "";
                selectedCard.col = "";
              });
            }, 500);
          }
          else{
            selectedCard.row = "";
            selectedCard.col = "";
          }
        }
      };
    }]
  };
});
