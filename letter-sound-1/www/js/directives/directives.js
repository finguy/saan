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
      }
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
   .directive('objectDashboardFive', function() {
    return {
      restrict: "E",
      templateUrl: "templates/directives/objectDashboardFive.html",
      scope: 'true',
      link: function(scope) {
        scope.selectLetter = function(name) {
          scope.selectedObject= name;
          scope.speak(name);
          setTimeout(function (){
              scope.checkLetter(name);
          }, 500);
        };
      }
    };
  })
  .directive('objectDashboardTen', function() {
      return {
        restrict: "E",
        templateUrl: "templates/directives/objectDashboardTen.html",
        scope: 'true',
        link: function(scope) {
          //Drag
          scope.sortableOptions = {
            containment: '.dashboard',
            allowDuplicates: true,
            clone:true,
            accept: function(sourceItemHandleScope, destSortableScope){
              console.log("word:");
              console.log( sourceItemHandleScope.modelValue.word);
              scope.word = sourceItemHandleScope.modelValue.word;
              return true;
            },
            dragEnd: function(eventObj) {
              if (scope.selectedItem && scope.word) {
                var ER = new RegExp(scope.word,"i");
                var result = ER.test(scope.selectedItem);
                if (result) {
                  scope.draggedImgs.push(scope.selectedItem);
                  scope.selectedItem = null;
                  scope.word = null;
                  scope.handleProgress(true);
                } else {
                  //eventObj.dest.sortableScope.removeItem(eventObj.dest.index);
                  scope.handleProgress(false);
                }
              } else {// Buggy drag and drop
                if (!scope.word) {
                  scope.speak("Drag the word again!");
                } else if (!scope.selectedItem) {
                  scope.speak("Select the image!");
                }
              }
            }
          };

          //Drop
          scope.sortableCloneOptions = {
            containment: '.dashboard',
          };

          scope.isDragged = function(item) {
            var found = false;
            var ER = new RegExp(item,"i");
            for (var i in scope.draggedImgs) {
              if (scope.draggedImgs[i]){
                found = found || ER.test(scope.draggedImgs[i]);
              }
            }
            return found;
          };

          scope.selectItem = function(item) {
            scope.selectedItem = item;
            var itemName = item.substr(item.lastIndexOf('/') +1);
            itemName = itemName.replace(/[0-9]*.png|[0-9]*.jpg/,"");
            scope.speak(itemName);
          };

          scope.isSelected = function(item) {
            return scope.selectedItem == item;
          };
        }
      };
    });
