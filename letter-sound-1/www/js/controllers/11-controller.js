(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('11Ctrl', ['$scope', '$log', '$state', 'Listening',
	function($scope, $log, $state, Listening) {
		$scope.activityId = '11';
		var Ctrl11 = Ctrl11 || {};

    var config;
    var stage;
    var level;

		$scope.$on('$ionicView.beforeEnter', function() {
      stage = 1; //TODO: retrieve and load from local storage
      level = 1; //TODO: retrieve and load from local storage
      Ctrl11.getConfiguration(level);
    });

		Ctrl11.getConfiguration = function (level){
      MathOralProblems.getConfig(level).then(function(data){
        config = data;
        Ctrl11.setActivity(Ctrl11.getStage(stage));
      });
    };

    Ctrl11.setActivity = function(stageData){
      $scope.options = [];

      var instructionsPlayer = new Media(AssetsPath.sounds(stageData.soundPath),
        function(){ $scope.$apply(Ctrl11.showOptions(stageData)); },
        function(err){ console.log(err); }
      );

      instructionsPlayer.play();
    };

    Ctrl11.getStage = function(stage){
      return config.stories[stage-1];
    };
	}]);

})();
