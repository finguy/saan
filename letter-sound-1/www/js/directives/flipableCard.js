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
        deckCtrl.flipCard(scope.row, scope.col);
      };

      scope.isCardFlipped = function(){
        return deckCtrl.isCardFlipped(scope.row, scope.col);
      };

      scope.isCardMatched = function(){
        return deckCtrl.isCardMatched(scope.row, scope.col);
      };
    }
  };
});
