(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('14Ctrl',['$scope','Util', 'TTSService', 'NumberOperations',
  function($scope, Util, TTSService, NumberOperations) {
    $scope.activityId = '14';
    $scope.dropzoneModel = [];
    $scope.numbers = [0,0];

    var config = '';
    var Ctrl14 = Ctrl14 || {};

    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl14.getConfiguration();
    });

    Ctrl14.getConfiguration = function (level){
      NumberOperations.getConfig(level).then(function(data){
        config = data;
        config.options = parseInt(config.options, 10);
        config.numberRange = parseInt(config.numberRange, 10);
        Ctrl14.setActivity();
      });
    };

    Ctrl14.setActivity  = function (){
      $scope.results = [];

      var number;
      var index;
      var valid;

      // select the two numbers to add/subtract
      for (var i = 0; i < 2; i++){
        valid = false;
				while (!valid){
          number = _.random(1, 10);
          index = _.indexOf($scope.numbers, number);
          valid = index == -1;
        }
				$scope.numbers[i] = number;
      }

      // select the result options
      for (i = 0; i < config.options; i++){
        valid = false;
				while (!valid){
          number = _.random(1, $scope.numbers[0] + $scope.numbers[1]);
          index = _.indexOf($scope.results, number);
          valid = index == -1;
        }

				$scope.results.push(number);
			}
    };

    $scope.sortableOptions = {
      containment: '.placeholder',
      allowDuplicates: true,
      accept: function(sourceItemHandleScope, destSortableScope){
        return true;
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-' + $scope.activityId + '-content',
      clone: true
    };

    $scope.numberToWord = function(number){
      return Util.numberToWords(number);
    };

  }]);

})();
