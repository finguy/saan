angular.module('saan.directives', [])
  .directive('letterDashboard', function() {
    return {
      restrict: "E",
      templateUrl: "templates/directives/letterDashboard.html",
      scope: 'true',
      link: function(scope) {
        scope.selectLetter = function(position, letter) {
          scope.selectedLetters[position] = letter;
          scope.speak(letter);
          setTimeout(function (){
            if (scope.selectedLetters.length === scope.word.split("").length)
              scope.checkWord();
          }, 500);
        };
      }
    };
  });
