angular.module('saan.directives', [])
.directive('dashboardLettersOne', function() {
    return {
        restrict: "E",
        templateUrl: "templates/directives/dashboardLettersOne.html",
        scope: 'true',
        link: function(scope){
          scope.selectLetter = function(position, letter){
            scope.selectedLetters.splice(position, 0, letter);
          };
        }
      };
});
