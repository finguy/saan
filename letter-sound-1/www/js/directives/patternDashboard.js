angular.module('saan.directives')
.directive('patternDashboard', function(){
  return {
    restrict: "E",
    templateUrl: "templates/directives/patternDashboard.html",
    scope: 'true',
    link: function(scope){
      scope.sortableOptions = {
        containment: '.pattern-dashboard',
        allowDuplicates: true,
        accept: function(sourceItemHandleScope, destSortableScope){
          return scope.checkColor(sourceItemHandleScope.modelValue);
        }
      };

      scope.sortableCloneOptions = {
        containment: '.pattern-dashboard',
        clone: true,
        itemMoved: function (eventObj) {
          scope.checkLevel();
        }
      };
    }
  };
});
