(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('9Ctrl',['$scope','Util', 'TTSService', function($scope, Util, TTSService) {
		$scope.activityId = '9';
    $scope.dropzone = [];
    $scope.items = ['coso'];
    $scope.step = 1;

    var instructions = ["this is the number two", "And this is how its written"];
    var totalSteps = 3;
    var itemCount = 0;


    var config = '';
    var Ctrl9 = Ctrl9 || {} ;

    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl9.getConfiguration();
    });

    Ctrl9.getConfiguration = function (level){
      $scope.number = 2;
      Ctrl9.startTutorial();
		};

    Ctrl9.startTutorial = function(){
      $scope.dropzone = [];
      $scope.step = 0;
      itemCount = 0;
      for (var i = 1; i <= totalSteps; i++){
        setTimeout(function(){Ctrl9.readInstructions(i)}, i*2000);
      }
    };

    Ctrl9.readInstructions = function(step){
      $scope.$apply(function(){
        console.log(instructions[step]);
        $scope.step++;
      });
    };

    $scope.sortableOptions = {
      containment: '.activity-9-content',
      allowDuplicates: true
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-9-content',
      clone: true,
      itemMoved: function (eventObj) {
        itemCount++;
        console.log(itemCount);

        if (itemCount == $scope.number){
          Ctrl9.startTutorial();          
        }
      }
    };

	}]);
})();
