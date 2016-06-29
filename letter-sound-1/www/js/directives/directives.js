angular.module('saan.directives', [])
  .directive('letterDashboard', function() {
    return {
      restrict: "E",
      templateUrl: "templates/directives/letterDashboard.html",
      scope: 'true',
      link: function(scope) {
        scope.selectLetter = function(position, letter) {
          scope.selectedLetters[position] = letter;
          scope.speak(letter);
          setTimeout(function (){
            if (scope.selectedLetters.length === scope.word.split("").length)
              scope.checkWord();
          }, 500);
        };
      }
    };
  })

  .directive('patternDashboard', function(){
    return {
      restrict: "E",
      templateUrl: "templates/directives/patternDashboard.html",
      scope: 'true',
      link: function(scope) {
        var index = 0;
      	var availableFields = [{color: "red"}, {color: "purple"}, {color: "blue"}, {color: "green"}, {color: "yellow"}, {color: "orange"}, {color: "brown"}];

        scope.draggables = availableFields.map(function(x){
        	return [x];
        });

      	scope.selectedComponents = [];

        scope.draggableOptions = {
          connectWith: ".dropzone",
      		update: function (e, ui) {
      			if (ui.item.sortable.source.hasClass('dropzone')){
      				ui.item.sortable.cancel();
      			}
      		},
          stop: function (e, ui) {
            // if the element is removed from the first container
            if (ui.item.sortable.source.hasClass('draggable-element-container') &&
                ui.item.sortable.droptarget &&
                ui.item.sortable.droptarget != ui.item.sortable.source &&
                ui.item.sortable.droptarget.hasClass('dropzone')) {
              // restore the removed item
      				scope.$apply(scope.dragging = false);
              ui.item.sortable.sourceModel.push(ui.item.sortable.model);
      				if (checkColor()){
                scope.successMessage();
              }
              else{
                scope.errorMessage();
              }
            }
          }
        };

        scope.sortableOptions = {};

      	var checkColor = function() {
      		var i = index;
      		if (scope.pattern[i] == scope.selectedComponents[0].color) {
      			scope.pattern.push(scope.selectedComponents[0].color);
            index++;
            if (scope.checkLevel(index)) {
              index = 0;
            }
            return true;
          }else{
            scope.selectedComponents.pop();
            return false;
    		  }
      	};
      }
    };
  });
