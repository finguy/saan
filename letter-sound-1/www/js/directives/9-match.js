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
           containerPositioning: 'relative'
           // accept: function(sourceItemHandleScope, destSortableScope){
           //   console.log("word:");
           //   console.log( sourceItemHandleScope.modelValue.word);
           //   scope.word = sourceItemHandleScope.modelValue.word;
           //   return true;
           // },
           // dragEnd: function(eventObj) {
           //   if (scope.selectedItem && scope.word) {
           //     var ER = new RegExp(scope.word,"i");
           //     var result = ER.test(scope.selectedItem);
           //     if (result) {
           //       scope.draggedImgs.push(scope.selectedItem);
           //       scope.selectedItem = null;
           //       scope.word = null;
           //       scope.handleProgress(true);
           //     } else {
           //       //eventObj.dest.sortableScope.removeItem(eventObj.dest.index);
           //       scope.handleProgress(false);
           //     }
           //   } else {// Buggy drag and drop
           //     if (!scope.word) {
           //       scope.speak("Drag the word again!");
           //     } else if (!scope.selectedItem) {
           //       scope.speak("Select the image!");
           //     }
           //   }
           // }
         };

         //Drop
         scope.targetOptions = {
           containment: '.activity9',
           accept: function(sourceItemHandleScope, destSortableScope){
             return sourceItemHandleScope.modelValue.word == destSortableScope.modelValue[0];
           },
           dragEnd: function(eventObj) {
             if (!scope.sortableTargetOptions.accept(eventObj.source.itemScope, eventObj.dest.sortableScope)){
               console.log("wrong!!");
               scope.handleProgress(false);
             }
             else{
               console.log("move again");
             }
           },
           itemMoved: function (eventObj) {
             console.log("success");
             scope.handleProgress(true);
           }
         };

         scope.isVisible = function(item){
           return item && item.dropzone && item.dropzone.length == 1;
         };
       }
     };
   });
  })();
