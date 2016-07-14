angular.module('saan.directives', [])
  .directive('objectDashboard', function() {
    return {
      restrict: "E",
      templateUrl: "templates/directives/objectDashboard.html",
      scope: 'true',
      link: function(scope) {
        scope.selectNumber = function(id, name) {
          scope.selectedObject= name;
          //scope.speak(name);
          setTimeout(function (){
              scope.checkNumber(name, id);
          }, 500);
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
  });
