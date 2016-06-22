angular.module('saan.directives', [])
  .directive('objectDashboard', function() {
    return {
      restrict: "E",
      templateUrl: "templates/directives/objectDashboard.html",
      scope: 'true',
      link: function(scope) {
        scope.selectNumber = function(name) {
          scope.selectedObject= name;
          scope.speak(name);
          setTimeout(function (){
              scope.checkNumber(name);
          }, 500);
        };
      }
    };
  });
