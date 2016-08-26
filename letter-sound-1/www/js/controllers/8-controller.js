(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('8Ctrl',['$scope','Util', function($scope, Util) {
		$scope.activityId = '8';

    function setActivity(){
      $scope.number = Util.getRandomNumber(10);
    }
	}]);
})();
