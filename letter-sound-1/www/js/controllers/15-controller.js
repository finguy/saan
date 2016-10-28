(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('15Ctrl',['$scope', '$log', 'MathOralProblems', 'AssetsPath',
  function($scope, $log, MathOralProblems, AssetsPath) {
    $scope.activityId = '15';

    var Ctrl15 = Ctrl15 || {};

    var config;
    var stage;
    var level;

    $scope.$on('$ionicView.beforeEnter', function() {
      stage = 1; //TODO: retrieve and load from local storage
      level = 1; //TODO: retrieve and load from local storage
      Ctrl15.getConfiguration(level);
    });

    Ctrl15.getConfiguration = function (level){
      MathOralProblems.getConfig(level).then(function(data){
        config = data;
        Ctrl15.setActivity(Ctrl15.getStage(stage));
      });
    };

    Ctrl15.setActivity = function(stageData){
			var instructionsPlayer = new Media(AssetsPath.sounds(stageData.soundPath),
				function(){ $scope.$apply(Ctrl15.showOptions(stageData)); },
				function(err){ console.log(err); }
      );

			instructionsPlayer.play();
    };

    Ctrl15.getStage = function(stage){
      return config.problems[stage-1];
    };

    Ctrl15.showOptions = function(stageData){
      $scope.options = [];
      $scope.options.push(stageData.answer);

      var number;

      for (var i = 1; i < config.options; i++){
        var valid = false;
				while (!valid){
					number = Math.floor(Math.random() * 10);
          var index = _.findIndex($scope.options, function(option){return option === number;}, number);
          valid = (number !== 0 && index === -1);
        }

        $scope.options.push(number);
			}

      $scope.options = _.shuffle($scope.options);
    };

    $scope.checkAnswer = function(value){
      if (value === Ctrl15.getStage(stage).answer){
        stage++;
        Ctrl15.setActivity(Ctrl15.getStage(stage));
      }
    }
	}

	]);
})();
