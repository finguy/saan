(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('9Ctrl',['$scope','Util', function($scope, Util) {
		$scope.activityId = '9';
    $scope.dropzone = [];

    var config = '';
    var Ctrl9 = Ctrl9 || {} ;

    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl9.getConfiguration();
    });

    Ctrl9.getConfiguration = function (level){

		};

    $scope.sortableOptions = {
      containment: '.activity-9-content',
      allowDuplicates: true
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-9-content',
      clone: true
    };

	}]);
})();
