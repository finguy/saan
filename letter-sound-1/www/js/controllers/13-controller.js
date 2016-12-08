(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('13Ctrl',['$scope', '$log', '$timeout', '$state', 'Util', 'LearningNumber', 'ActividadesFinalizadasService',
  function($scope, $log, $timeout, $state, Util, LearningNumber, ActividadesFinalizadasService) {
    $scope.activityId = 13;
    $scope.dropzone = [];
    $scope.items = ['dummy'];
    $scope.step = 1;
    $scope.dragDisabled = false;

    var Ctrl13 = Ctrl13 || {};
    var totalSteps = 3;
    var config = '';
    var itemCount = 0;
    var instructionsTime = 2000;
    var level;
    var instructionsPlayer;
    var successPlayer;
    var failurePlayer;
    var tapPlayer;
    var endPlayer;
    var readInstructions;

    $scope.$on('$ionicView.beforeEnter', function() {
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = false; //TODO set this to true
      Ctrl13.getConfiguration(level);
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

    Ctrl13.getConfiguration = function (level){
      LearningNumber.getConfig(level).then(function(data){
        config = data;
        $scope.showButton = !config.level.autoCheck;
        $scope.number = config.level.numberFrom;

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
        else {
          Ctrl13.startTutorial();
        }
      });
    };

    Ctrl13.startTutorial = function(){
      $scope.dropzone = [];
      $scope.step = 0;
      itemCount = 0;

      for (var i = 1; i <= totalSteps; i++){
        $timeout(function(){Ctrl13.readInstructions(i)}, i * instructionsTime);
      }
      $scope.dragDisabled = false;
    };

    Ctrl13.readInstructions = function(step){
      $scope.step++;
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
        if (config.level.autoCheck){
          $scope.checkValue();
        }
      }
    };

    $scope.checkValue = function(){
      if (itemCount == $scope.number){
        Ctrl13.success();
      }
    };

    Ctrl13.success = function(){
      $scope.dragDisabled = true;
      if ($scope.number < config.level.numberTo){
        $timeout(function(){ $scope.number++; Ctrl13.startTutorial();}, 1000);
      }
      else {
        if (level == LearningNumber.getMinLevel() &&
          !ActividadesFinalizadasService.finalizada($scope.activityId)){
          // if player reached minimum for setting activity as finished
          $timeout(function(){ Ctrl13.minReached();}, 1000);
        }
        else {
          if (level == LearningNumber.getMaxLevel()){
            $timeout(function(){ Ctrl13.maxReached();}, 1000);
          }
          else {
            Util.saveLevel($scope.activityId, ++level);
            $timeout(function(){ Ctrl13.getConfiguration(level);}, 1000);
          }
        }
      }
    };

    $scope.tapInstruction = function() {
      tapPlayer.play();
    };

    Ctrl13.minReached = function(){
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

    Ctrl13.maxReached = function(){
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
