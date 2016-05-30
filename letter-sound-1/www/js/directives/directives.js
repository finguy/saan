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
                  //wait for speak success message
                  setTimeout(function() {
                  var messages = scope.successMessages;
                  var position = Math.floor((Math.random() * messages.length));
                  var successMessage =   messages[position];
                  scope.speak(successMessage);
                        //wait for speak
                        setTimeout(function(){
                        scope.levelUp(); //Advance level
                        scope.showDashboard(); //Reload dashboard
                      }, 1000);
                  }, 1000);
              }, 1000);


          } else if (readyToCheckWord){
            //Reproduce letter
            scope.speak(letter);
            setTimeout(function(){
              var messages = scope.errorMessages;
              var position = Math.floor((Math.random() * messages.length));
              var errorMessage = messages[position];
              scope.speak(errorMessage);
            }, 1000);
          } else {
            //Reproduce letter
            scope.speak(letter);
          }
        };
      }
    };
  });
