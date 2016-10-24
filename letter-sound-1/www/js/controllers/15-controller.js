(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('15Ctrl',['$scope','Util', 'TTSService', 'MathWrittenProblems',
  function($scope, Util, MathWrittenProblems) {
    $scope.activityId = '15';
    var Ctrl15 = Ctrl15 || {};

    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl15.getConfiguration();
    });

    Ctrl15.getConfiguration = function (level){
      NumberOperations.getConfig(level).then(function(data){
        config = data;
        Ctrl15.setActivity();
      });
    };

    Ctrl15.setActivity = function(){
      $scope.options = [];
      return true;
    };
	}

	]);
})();
