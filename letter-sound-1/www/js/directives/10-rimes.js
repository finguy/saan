(function() {
  'use strict';
  angular.module('saan.directives')
  .directive('objectDashboardTen', function() {
      return {
        restrict: "E",
        templateUrl: "templates/directives/objectDashboardTen.html",
        scope: 'true',
        link: function(scope) {
          //Drag
          scope.sortableSourceOptions = {
            containment: '.activity10',
            containerPositioning: 'relative',
            clone: false,
            dragEnd: function(eventObj) {
              if (!scope.sortableTargetOptions.accept(eventObj.source.itemScope, eventObj.dest.sortableScope)){
                console.log("wrong!!");
                scope.handleProgress(false);
                scope.draggedWord = false;
              }
              else{
                console.log("move again");
              }
            },
            itemMoved: function (eventObj) {
              console.log("success");
              scope.handleProgress(true);
            },
            accept: function(sourceItemHandleScope, destSortableScope){
              return false;
            }
          };

          //Drop
          scope.sortableTargetOptions = {
            accept: function(sourceItemHandleScope, destSortableScope){
              console.log("accept");
              var ER = new RegExp(sourceItemHandleScope.modelValue.word,"i");
              return ER.test(scope.rimesStr);
            },
          };
        }
      };
    });
  })();
