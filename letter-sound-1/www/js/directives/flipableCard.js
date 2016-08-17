angular.module('saan.directives')
.directive('flipableCard', function(){
  return {
    restrict: "E",
    templateUrl: "templates/directives/flipableCard.html",
    scope: {
      value: '='
    },
    link: function(scope){
      scope.flip = false;
      scope.flipCard = function(){
        scope.flip = !scope.flip;
      };
    }
  };
});
