angular.module('saan.directives')
  .directive('objectDashboardThree', function() {
  return {
    restrict: "E",
    templateUrl: "templates/directives/objectDashboardThree.html",
    scope: 'true',
    link: function(scope, $element) {
      scope.selectLetter = function(name, objectNameSrc) {
        scope.selectedObject= name;
        var object = objectNameSrc.split("/");
        var objectName = object[object.length -1].replace(".png","");
        scope.speak(name + " in "+objectName);
        setTimeout(function (){
            scope.checkLetter(name);
        }, 1000);
      };
      scope.restoreImage = function(){
          scope.nextLetterImgSrc = scope.nextLetterImgSrc.replace("-pressed.png", ".png");
          scope.previousLetterImgSrc = scope.previousLetterImgSrc.replace("-pressed.png", ".png");
      };
      scope.nextLetter = function(letter) {

        var nextIndex = (scope.alphabet.search(letter) + 1 ) % (scope.alphabet.length);
        scope.letterTutorial = scope.aplhabetLetters[nextIndex];
        scope.lowerCaseImgSrc = scope.srcAlphabetLetters+scope.letterTutorial+"-lowercase.png";
        scope.upperCaseImgSrc = scope.srcAlphabetLetters+scope.letterTutorial+"-uppercase.png";
        scope.nextLetterImgSrc = scope.nextLetterImgSrc.replace(".png", "-pressed.png");
      };
      scope.previousLetter = function(letter) {
        var currentIndex = scope.alphabet.search(letter);
        var nextIndex = 0;
        if (currentIndex == 0) {
          nextIndex = scope.alphabet.length - 1;
        } else {
          nextIndex = (currentIndex - 1 ) % (scope.alphabet.length );
        }
        scope.letterTutorial = scope.aplhabetLetters[nextIndex];
        scope.lowerCaseImgSrc = scope.srcAlphabetLetters+scope.letterTutorial+"-lowercase.png";
        scope.upperCaseImgSrc = scope.srcAlphabetLetters+scope.letterTutorial+"-uppercase.png";
        scope.previousLetterImgSrc = scope.previousLetterImgSrc.replace(".png", "-pressed.png");
      };

      scope.animateImage = function(id) {
                var imgs = $element.find('img');
                for (var i in imgs) {
                  if (imgs[i] && imgs[i].id == id) {
                    angular.element(imgs[i]).addClass('activity3-image-morph-click');
                      break;
                  }
                }
                setTimeout(function() {
                    for (var i in imgs) {
                      angular.element(imgs[i]).removeClass('activity3-image-morph-click');
                    }
                },1000);
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
   .directive('backButton', function($ionicHistory) {
     return {
       restrict: "E",
       templateUrl: "templates/directives/backButton.html",
       scope: 'true',
        link: function(scope) {
          scope.goLobby =  function() {
            $ionicHistory.goBack();
          };          
      }
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
         };
        }
      };
    });
