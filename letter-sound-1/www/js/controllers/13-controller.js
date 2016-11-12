(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('13Ctrl',['$scope','Util', 'TTSService', 'LearningNumber', 'NumberGroup',
  function($scope, Util, TTSService, LearningNumber, NumberGroup) {
		$scope.activityId = '13';
    $scope.dropzone = [];
    $scope.items = ['dummy'];
    $scope.step = 1;
    $scope.dragDisabled = false;

    var Ctrl13 = Ctrl13 || {};
    var totalSteps = 3;
    var config = '';
    var itemCount = 0;
    var instructionsTime = 2000;

    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl13.getConfiguration(1);
    });

    Ctrl13.getConfiguration = function (level){
      LearningNumber.getConfig(level).then(function(data){
				config = data;
        config.level.level = parseInt(config.level.level, 10);
        config.level.numberFrom = parseInt(config.level.numberFrom, 10);
        config.level.numberTo = parseInt(config.level.numberTo, 10);

        $scope.number = config.level.numberFrom;
        Ctrl13.startTutorial();
      });
		};

    Ctrl13.startTutorial = function(){
      for (var i = 1; i <= totalSteps; i++){
        setTimeout(function(){Ctrl13.readInstructions(i)}, i * instructionsTime);
      }
      $scope.dragDisabled = false;
    };

    Ctrl13.readInstructions = function(step){
      $scope.$apply(function(){
        $scope.step++;
      });
    };

    $scope.numberToWords = function(number){
      return Util.numberToWords(number);
    };

    $scope.sortableOptions = {
      containment: '.activity-13-content',
      allowDuplicates: true
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-13-content',
      clone: true,
      itemMoved: function (eventObj) {
        itemCount++;
        console.log(itemCount);
        if (itemCount == $scope.number){
          var group = NumberGroup.group($scope.number, $scope.dropzone);
          $scope.row1 = group.row1;
          $scope.row2 = group.row2;
          $scope.row3 = group.row3;
          $scope.dropzone = [];
          if ($scope.number < config.level.numberTo){
            $scope.dragDisabled = true;
            setTimeout(function(){
              // $scope.dropzone = [];
              $scope.step = 0;
              itemCount = 0;
              $scope.number++;

              $scope.row1 = [];
              $scope.row2 = [];
              $scope.row3 = [];

              Ctrl13.startTutorial();
              $scope.$apply();
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
