(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('9Ctrl',['$scope','Util', 'TTSService', 'LearningNumber', function($scope, Util, TTSService, LearningNumber) {
		$scope.activityId = '9';
    $scope.dropzone = [];
    $scope.items = ['dummy'];
    $scope.step = 1;
    $scope.dragDisabled = false;

    var Ctrl9 = Ctrl9 || {};
    var totalSteps = 3;
    var config = '';
    var itemCount = 0;
    var instructionsTime = 2000;

    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl9.getConfiguration(1);
    });

    Ctrl9.getConfiguration = function (level){
      LearningNumber.getConfig(level).then(function(data){
				config = data;
        config.level.level = parseInt(config.level.level, 10);
        config.level.numberFrom = parseInt(config.level.numberFrom, 10);
        config.level.numberTo = parseInt(config.level.numberTo, 10);

        $scope.number = config.level.numberFrom;
        Ctrl9.startTutorial();
      });
		};

    Ctrl9.startTutorial = function(){
      for (var i = 1; i <= totalSteps; i++){
        setTimeout(function(){Ctrl9.readInstructions(i)}, i*instructionsDelay);
      }
      $scope.dragDisabled = false;
    };

    Ctrl9.readInstructions = function(step){
      $scope.$apply(function(){
        $scope.step++;
      });
    };

    $scope.numberToWords = function(number){
      return Util.numberToWords(number);
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
          if ($scope.number < config.level.numberTo){
            $scope.dragDisabled = true;
            setTimeout(function(){
              $scope.dropzone = [];
              $scope.step = 0;
              itemCount = 0;
              $scope.number++;
              Ctrl9.startTutorial();
            }, 500);
          }
          else{
            console.log("fin");
          }
        }
      }
    };

	}]);
})();
