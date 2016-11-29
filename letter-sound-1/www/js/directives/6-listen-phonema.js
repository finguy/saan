(function() {
  'use strict';
  angular.module('saan.directives')
  .directive('objectDashboardSix', function() {
     return {
       restrict: "E",
       templateUrl: "templates/directives/objectDashboardSix.html",
       scope: 'true',
       link: function(scope) {

         scope.sortableTargetOptions = {
           containment: '.activity6',
           accept: function(sourceItemHandleScope, destSortableScope){
             scope.isPhonemaOk = scope.checkPhonema(sourceItemHandleScope.modelValue.letter);
             return scope.isPhonemaOk;
           }
         };

         scope.sortableSourceOptions = {
           containment: '.activity6',
           containerPositioning: 'relative',
           clone: true,// ACA si es false se rompe todo!!!!
           allowDuplicates: true,
           dragEnd: function(eventObj) {
             console.log("dragEnd!");
             console.log(scope.isPhonemaOk);
             if (!scope.isPhonemaOk){
                scope.handleProgress(false);
             }
           },
           itemMoved: function (eventObj) {
             console.log("itemMoved");
             var jsonInfo = eventObj.source.itemScope.modelValue;
             var letter_index = jsonInfo.index;
             var letter_value = jsonInfo.letter;
             var index = letter_value + "_" + letter_index;
             scope.hasDraggedLetter[index] = true;
             scope.getNewPhonema();
             scope.handleProgress(true,letter_value);
           }
         };

         scope.isDragged = function(letter , index) {
           return scope.hasDraggedLetter[letter +"_" + index] === true;
         };
         scope.speakConditional = function(letter, index) {
           if (scope.isDragged(letter, index)) {
             scope.speak(letter);
           }
         };
       }
     };
   });
})();
