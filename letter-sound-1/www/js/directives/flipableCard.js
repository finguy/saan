(function() {
  'use strict';
  angular.module('saan.directives')
  .directive('flipableCard', function(AssetsPath){
    return {
      require: '^^memoryDeck',
      restrict: "E",
      templateUrl: "templates/directives/flipableCard.html",
      scope: {
        card: '=',
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

        scope.range = function(){
          if (Number.isInteger(scope.card.value)){
            return 1;
          }
          else {
            return _.range(scope.card.key);
          }
        };

        scope.imagePath = AssetsPath.getImgs(7);
      }
    };
  });
})();
