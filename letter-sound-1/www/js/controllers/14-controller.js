(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('14Ctrl',['$scope', '$log', '$state', '$timeout', 'Util', 'NumberOperations', 'ActividadesFinalizadasService',
  function($scope, $log, $state, $timeout, Util, NumberOperations, ActividadesFinalizadasService) {
    $scope.activityId = 14;
    $scope.dropzoneModel = [];
    $scope.numbers = [0,0];

    var result;
    var config = '';
    var ADD = 1;
    var SUBTRACT = 2;
    var stageNumber;
    var level;
    var Ctrl14 = Ctrl14 || {};

    $scope.$on('$ionicView.beforeEnter', function(){
      stageNumber = 1; //TODO: retrieve and load from local storage
      level = Util.getLevel($scope.activityId) || 1;
      Ctrl14.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, level);
    });

    Ctrl14.getConfiguration = function (level) {
      NumberOperations.getConfig(level).then(function(data){
        config = data;
        $scope.levelConfig = config.levelConfig;
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
          $log.error("wrong!!");
        }
      },
      itemMoved: function (eventObj){
        $log.info("right!!!");
        $timeout(function(){
          $scope.$apply(function(){
            Ctrl14.success();
          });
        }, 1000);

      }
    };

    $scope.range = function(number){
      return _.range(number);
    };

    Ctrl14.setActivity  = function(){
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
      stageNumber++;
      if (stageNumber > config.levelConfig.stages){
        if (level == NumberOperations.getMinLevel() &&
          !ActividadesFinalizadasService.finalizada($scope.activityId)){
          // if player reached minimum for setting activity as finished
          ActividadesFinalizadasService.add($scope.activityId);
          level++;
          $state.go('lobby');
        }
        else {
          if (level == NumberOperations.getMaxLevel()){
            level = 1;
            $state.go('lobby');
          }
          else {
            stageNumber = 1;
            Util.saveLevel($scope.activityId, ++level);
            Ctrl14.getConfiguration(level);
          }
        }
      }
      else {
        Ctrl14.setActivity();
      }
    };

  }]);

})();
