(function() {
  'use strict';
  angular.module('saan.directives')
  .directive('numberGroup', function(){
    return {
      restrict: "E",
      scope: {
        list: '=',
        target: '@',
        itemClass: '@'
      },
      templateUrl: "templates/directives/coso.html",
      link: function(scope, element, attrs){

        scope.$watch('list', function(newValue, oldValue) {
            if (newValue && newValue.length == scope.target){
              // console.log(scope.target);
              if (scope.target == 4){
                scope.row1 = newValue.slice(0,2);
                scope.row3 = newValue.slice(2);
                scope.list = [];
              }else if (scope.target == 5){
                scope.row1 = newValue.slice(0,2);
                scope.row2 = newValue.slice(2,3);
                scope.row3 = newValue.slice(3);
                scope.list = [];
              }
            }
          }, true);
      }
    };
  });
})();
