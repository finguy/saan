angular.module('saan.directives')
.directive('flipableCard', function(){
  return {
    require: '^^memoryDeck',
    restrict: "E",
    templateUrl: "templates/directives/flipableCard.html",
    scope: {
      value: '=',
      row: '=',
      col: '='
    },
    link: function(scope, element, attrs, deckCtrl){
      scope.flipCard = function(){
        if (!deckCtrl.isCardFlipped(scope.row, scope.col)){
          deckCtrl.flipCard(scope.row, scope.col);
        }
      };

      scope.isCardFlipped = function(){
        return deckCtrl.isCardFlipped(scope.row, scope.col);
      };
    }
  };
});
