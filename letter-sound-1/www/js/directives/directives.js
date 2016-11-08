angular.module('saan.directives')
  .directive('letterDashboard', function() {
    return {
      restrict: "E",
      templateUrl: "templates/directives/letterDashboard.html",
      scope: 'true',
      link: function(scope) {
        scope.selectLetter = function(position, letter) {
            if (!scope.checkingLetter && !scope.checkingWord){
              scope.checkingLetter = true;
              scope.selectedLetters[position] = letter;
              scope.speak(letter);
              setTimeout(function (){
                 scope.checkingLetter = false;
                 if (scope.selectedLetters.length === scope.word.split("").length) {
                     scope.checkWord();
                 }
              }, 500);
            }
        };
      }
    };
  })
 .directive('objectDashboardFour', function() {
     return {
       restrict: "E",
       templateUrl: "templates/directives/objectDashboardFour.html",
       scope: 'true',
       link: function(scope) {
         scope.selectNumber = function(id, name) {
          if (!scope.checkingNumber){
           scope.selectedObject = name;
           scope.checkNumber(name, id);
         }
         };
       }
     };
   })
   .directive('activityStatus', function() {
     return {
       restrict: "E",
       templateUrl: "templates/directives/progress.html",
       scope: 'true'
     };
   })   
  .directive('objectDashboardTwelve', function() {
      return {
        restrict: "E",
        templateUrl: "templates/directives/objectDashboardTwelve.html",
        scope: 'true',
        link: function(scope, $element) {
          scope.selectAnswer = function(id, name) {
            if (!scope.checkingAnswer){
              scope.animateImage(id);
              scope.selectedObject = id;
              scope.handleProgress(id);
            }
          };

          scope.animateImage = function(id) {
              var imgs = $element.find('img');
              for (var i in imgs) {
                console.log(imgs[i].id +"=="+id);
                if (imgs[i] && imgs[i].id == id) {
                  angular.element(imgs[i]).addClass('options-image-morph-click');
                    break;
                }
              }
              setTimeout(function() {
                  for (var i in imgs) {
                    angular.element(imgs[i]).removeClass('options-image-morph-click');
                  }
              },1000);
         }
        }
      };
    });
