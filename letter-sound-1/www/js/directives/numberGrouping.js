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
            if (newValue){
              console.log("I see a data change!");
              console.log(newValue);
              if (newValue.length == 4){
                scope.row1 = newValue.slice(0,2);
                scope.row2 = newValue.slice(2);
                scope.list = [];
              }
            }
          }, true);
      }
    };
  });
})();
