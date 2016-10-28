(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('15Ctrl',['$scope','Util', 'MathOralProblems',
  function($scope, Util, MathOralProblems) {
    $scope.activityId = '15';
    var Ctrl15 = Ctrl15 || {};

    var config;

    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl15.getConfiguration();
    });

    Ctrl15.getConfiguration = function (level){
      console.log(MathOralProblems);
      MathOralProblems.getConfig(level).then(function(data){
        config = data;
        Ctrl15.setActivity();
      });
    };

    Ctrl15.setActivity = function(){
      $scope.options = [];
      // $ionicPlatform.ready(function() {
  			console.log(Media);

  			var coso2 = new Media("/android_asset/www/sounds/Galaga_Theme.mp3",
  				function(){ console.log("sabe2");},
  				function(err){ console.log(err);} );

  			coso2.play();


  		// });
      return true;
    };
	}

	]);
})();
