(function() {
  'use strict';
  angular.module('saan.directives')
  .directive('numberGroup', function(){
    return {
      restrict: "E",
      scope: {
        list: '=',
        target: '=',
        itemClass: '@'
      },
      templateUrl: "templates/directives/numberGroup.html",
      link: function(scope, element, attrs){
        scope.$watch('list', function(newValue, oldValue) {
          if (scope.target >= 4 && newValue && newValue.length == scope.target){
            switch(scope.target){
              case 4:
                scope.row1 = newValue.slice(0,2);
                scope.row3 = newValue.slice(2);
                break;
              case 5:
                scope.row1 = newValue.slice(0,2);
                scope.row2 = newValue.slice(2,3);
                scope.row3 = newValue.slice(3);
                break;
              case 6:
                scope.row1 = newValue.slice(0,3);
                scope.row2 = newValue.slice(3);
                break;
              case 7:
                scope.row1 = newValue.slice(0,3);
                scope.row2 = newValue.slice(3,4);
                scope.row3 = newValue.slice(4);
                break;
              case 8:
                scope.row1 = newValue.slice(0,4);
                scope.row2 = newValue.slice(4);
                break;
              case 9:
                scope.row1 = newValue.slice(0,4);
                scope.row2 = newValue.slice(4,5);
                scope.row3 = newValue.slice(5);
                break;
              case 10:
                scope.row1 = newValue.slice(0,4);
                scope.row2 = newValue.slice(4,6);
                scope.row3 = newValue.slice(6);
                break;
              default:
                break;
            }
            scope.list = [];
          }
        }, true);
      }
    };
  });
})();
