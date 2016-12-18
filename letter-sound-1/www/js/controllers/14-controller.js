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
    var instructionsPlayer;
    var successPlayer;
    var failurePlayer;
    var tapPlayer;
    var endPlayer;
    var readInstructions;

    $scope.$on('$ionicView.beforeEnter', function(){
      stageNumber = 1; //TODO: retrieve and load from local storage
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = false; //TODO set this to true
      Ctrl14.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, level);

      if (!angular.isUndefined(instructionsPlayer))
          instructionsPlayer.release();

      if (!angular.isUndefined(successPlayer))
        successPlayer.release();

      if (!angular.isUndefined(failurePlayer))
        failurePlayer.release();

      if (!angular.isUndefined(tapPlayer))
        tapPlayer.release();

      if (!angular.isUndefined(endPlayer))
        endPlayer.release();
    });

    Ctrl14.getConfiguration = function (level) {
      NumberOperations.getConfig(level).then(function(data){
        config = data;
        $scope.levelConfig = config.levelConfig;
        Ctrl14.setActivity();

        if (readInstructions){
          $timeout(function () {
            var introPath = config.instructions.intro[$scope.mode - 1].path;
            // play instructions of activity
            instructionsPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + introPath,
              function(){ instructionsPlayer.release(); },
              function(err){ $log.error(err); instructionsPlayer.release(); }
            );

            instructionsPlayer.play();
            readInstructions = false;
          }, 1000);
        }
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
      dragEnd: function(eventObj){
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
          Ctrl14.minReached();
        }
        else {
          if (level == NumberOperations.getMaxLevel()){
            Ctrl14.maxReached();
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

    $scope.tapInstruction = function() {
      tapPlayer.play();
    };

    Ctrl14.minReached = function(){
      // if player reached minimum for setting activity as finished
      ActividadesFinalizadasService.add($scope.activityId);
      $scope.$apply();
      level++;
      //TODO uncomment this after getting media assets
      // endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[0].path,
      //   function(){
      //     endPlayer.release();
      //     $state.go('lobby');
      //   }, function(err){ $log.error(err);}
      // );
      //
      // endPlayer.play();
    };

    Ctrl14.maxReached = function(){
      level = 1;
      $state.go('lobby'); // TODO remove this line after getting media assets
      //TODO uncomment this after getting media assets
      // endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[1].path,
      //   function(){ endPlayer.release(); $state.go('lobby'); },
      //   function(err){ $log.error(err);}
      // );
      //
      // endPlayer.play();
    };

  }]);

})();
