angular.module('starter.directives', [])
.directive('dashboardLettersOne', function() {
    return {
        restrict: "E",
        templateUrl: "templates/dashboardLettersOne.html",
        scope: 'true',
        link: function(scope){
          scope.selectLetter = function(position, letter){
            scope.selectedLetters.splice(position, 1, letter);
          };
        }
      };
});
