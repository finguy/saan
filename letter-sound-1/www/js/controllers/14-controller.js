(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('14Ctrl',['$scope', '$state', 'Util', 'TTSService', 'NumberOperations',
  function($scope, $state, Util, TTSService, NumberOperations) {
    $scope.activityId = '14';
    $scope.dropzoneModel = [];
    $scope.numbers = [0,0];

    var result;
    var config = '';
    var ADD = 1;
    var SUBTRACT = 2;
    var Ctrl14 = Ctrl14 || {};

    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl14.getConfiguration();
    });

    Ctrl14.getConfiguration = function (level){
      NumberOperations.getConfig(level).then(function(data){
        config = data;
        Ctrl14.setActivity();
      });
    };

    $scope.sortableOptions = {
      containment: '.placeholder',
      allowDuplicates: true,
      accept: function(sourceItemHandleScope, destSortableScope){
        return sourceItemHandleScope.modelValue == result;
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-' + $scope.activityId + '-content',
      clone: true,
      dragEnd: function(eventObj) {
        if (!$scope.sortableOptions.accept(eventObj.source.itemScope, eventObj.dest.sortableScope)){
          console.log("wrong!!");
        }
      },
      itemMoved: function (eventObj) {
        console.log("right!!!");
        setTimeout(function(){
          $scope.$apply(function(){
            Ctrl14.success();
          });
        }, 1000);

      }
    };

    $scope.numberToWord = function(number){
      return Util.numberToWords(number);
    };

    $scope.range = function(number){
      return _.range(number);
    };

    Ctrl14.setActivity  = function (){
      $scope.dropzoneModel = [];
      var results = [];
      var numbers = [];

      // select the two numbers to add/subtract
      numbers.push(_.random(1, config.numberRange));
      if (config.mode == ADD){
        numbers.push(_.random(1, config.numberRange));
        result = numbers[0] + numbers[1];
        $scope.operator = "+";
      }
      else{
        numbers.push(_.random(1, numbers[0]));
        result = numbers[0] - numbers[1];
        $scope.operator = "-";
      }

      results.push(result);
      $scope.numbers = numbers;

      var top = (result + config.optionsRange <= config.numberRange) ? result + config.optionsRange : config.numberRange;
      var bottom = (result - config.optionsRange <= 0) ? 0 : result - config.optionsRange;

      var number;
      var index;
      var valid;

      // select the result options
      for (var i = 1; i < config.options; i++){
        valid = false;
				while (!valid){
          number = _.random(bottom, top);
          index = _.indexOf(results, number);
          valid = index == -1;
        }
				results.push(number);
			}

      //shuffle the results
      $scope.results = _.shuffle(results);
    };

    Ctrl14.success = function(){
      // should increase level and save to storage
      Ctrl14.setActivity();
    };

    $scope.goLobby = function() {
      $state.go('lobby');
    }
    
  }]);

})();
