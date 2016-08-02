angular.module('saan.directives', [])
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
      }
    }
    };
  })

  .directive('patternDashboard', function(){
    return {
      restrict: "E",
      templateUrl: "templates/directives/patternDashboard.html",
      scope: 'true',
      link: function(scope){
        var index = 0;
        scope.sortableOptions = {
          containment: '.pattern-dashboard',
          allowDuplicates: true,
          accept: function(sourceItemHandleScope, destSortableScope){
            return check(sourceItemHandleScope, destSortableScope);
          }
        };

        scope.sortableCloneOptions = {
          containment: '.pattern-dashboard',
          clone: true,
          itemMoved: function (eventObj) {
            index++;
            if (scope.checkLevel(index)) {
              index = 0;
            }
          }
        };

        var check = function(sourceItemHandleScope, destSortableScope) {
          if (sourceItemHandleScope.modelValue === destSortableScope.modelValue[index]) {
            return true;
          }
          else {
            return false;
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
 .directive('objectDashboardFour', function() {
     return {
       restrict: "E",
       templateUrl: "templates/directives/objectDashboardFour.html",
       scope: 'true',
       link: function(scope) {
         scope.selectNumber = function(id, name) {
           scope.selectedObject= name;
          // scope.speak(name);
          // setTimeout(function (){
               scope.checkNumber(name, id);
          // }, 500);
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
  });
