angular.module('saan.controllers')
.controller('2Ctrl', function($scope) {
	$scope.activityId = '2';

	$scope.availableFields = [{color: "Red"}, {color: "Blue"}, {color: "Green"}, {color: "Yellow"}, {color: "Violet"}, {color: "Orange"}];
	
  $scope.draggables = $scope.availableFields.map(function(x){
  	return [x];
  });

	$scope.selectedComponents = [];

	$scope.pattern = function(){
		console.log($scope.selectedComponents);
		return $scope.selectedComponents;
	};

  $scope.draggableOptions = {
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
				$scope.$apply($scope.dragging = false);
        ui.item.sortable.sourceModel.push(ui.item.sortable.model);
      }
			else{
				console.log("afuerraaa");
			}
    }
  };

  $scope.sortableOptions = {};

});
