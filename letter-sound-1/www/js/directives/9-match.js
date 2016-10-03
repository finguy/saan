(function() {
  'use strict';
  angular.module('saan.directives')
  .directive('objectDashboardNine', function() {
     return {
       restrict: "E",
       templateUrl: "templates/directives/objectDashboardNine.html",
       scope: 'true',
       link: function(scope) {
         //Drag
         scope.sourceOptions = {
           containment: '.activity9',
           containerPositioning: 'relative',
           dragEnd: function(eventObj) {
             if (!scope.wordOk){
               console.log("wrong!!");
               scope.handleProgress(false);
             } else{
               console.log("move again");
             }
           },
           itemMoved: function (eventObj) {
             console.log("success");
             scope.handleProgress(true);
           }
         };

         //Drop
         scope.targetOptions = {
           containment: '.activity9',
           accept: function(sourceItemHandleScope, destSortableScope){
             scope.wordOk = sourceItemHandleScope.modelValue.word == destSortableScope.modelValue[0];
             return scope.wordOk;
           }
         };

         scope.isVisible = function(item){
           return item && item.dropzone && item.dropzone.length == 1;
         };
       }
     };
   });
  })();
