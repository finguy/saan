(function() {
  'use strict';
  angular.module('saan.directives')
  .directive('numberCard', function(){
    return {
      restrict: "E",
      templateUrl: "templates/directives/numberCard.html",
      scope: {
        number: '='
      }
    };
  });
})();
