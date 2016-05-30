angular.module('saan.directives', [])
  .directive('dashboardLettersOne', function() {
    return {
      restrict: "E",
      templateUrl: "templates/directives/dashboardLettersOne.html",
      scope: 'true',
      link: function(scope) {
        scope.selectLetter = function(position, letter) {          
          scope.selectedLetters[position] = letter;
          var readyToCheckWord = scope.selectedLetters.length === scope.word.split("").length;
          if (readyToCheckWord && scope.checkWord()) {
             //Reproduce letter and word
              scope.speak(letter);
              //wait for speak
              setTimeout(function(){
              scope.speak(scope.word);
            }, 1000);
              //wait for speak
              setTimeout(function(){
              scope.levelUp(); //Advance level
              scope.showDashboard(); //Reload dashboard
            }, 1000);
          } else if (readyToCheckWord) {
            //Reproduce letter and word
             scope.speak(letter);

             //wait for speak
             setTimeout(function(){
             scope.speak(scope.selectedLetters.join(""));
           }, 1000);
          } else {
            //Reproduce letter
            scope.speak(letter);
          }
        };
      }
    };
  });
