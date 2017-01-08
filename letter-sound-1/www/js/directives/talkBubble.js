(function() {
  'use strict';
  angular.module('saan.directives')
  .directive('talkBubble', function(){
    return {
      restrict: "E",
      templateUrl: "templates/directives/talkBubble.html",
      scope: {
        text: '=',
        text2: '='
      }
    };
  });
})();
