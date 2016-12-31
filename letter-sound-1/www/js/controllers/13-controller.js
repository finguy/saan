(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('13Ctrl',['$scope', '$log', '$timeout', '$state', 'Util', 'LearningNumber', 'ActividadesFinalizadasService', 'AssetsPath',
  function($scope, $log, $timeout, $state, Util, LearningNumber, ActividadesFinalizadasService, AssetsPath) {
    $scope.activityId = 13;
    $scope.dropzone = [];
    $scope.items = ['dummy'];
    $scope.step = 1;
    $scope.dragDisabled = false;
    $scope.showNumber = false;
    $scope.imgPath = AssetsPath.getImgs($scope.activityId);

    var Ctrl13 = Ctrl13 || {};
    var totalSteps = 3;
    var config = '';
    var itemCount = 0;
    var instructionsTime = 2000;
    var level;
    var instructionsPlayer;
    var feedbackPlayer;
    var tapPlayer;
    var endPlayer;
    var readInstructions;
    var mode;
    var numberPlayer;

    $scope.$on('$ionicView.beforeEnter', function() {
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = true;
      $scope.autoCheck = false;

      Ctrl13.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, level);

      if (!angular.isUndefined(instructionsPlayer))
        instructionsPlayer.release();

      if (!angular.isUndefined(successPlayer))
        feedbackPlayer.release();

      if (!angular.isUndefined(tapPlayer))
        tapPlayer.release();

      if (!angular.isUndefined(endPlayer))
        endPlayer.release();

      if (!angular.isUndefined(numberPlayer))
        numberPlayer.release();
    });

    Ctrl13.getConfiguration = function (level){
      Ctrl13.startStage();
      LearningNumber.getConfig(level).then(function(data){
        config = data;
        $scope.autoCheck = config.level.autoCheck;
        mode = $scope.autoCheck ? 0 : 1;

        $scope.number = config.level.numberFrom;
        $scope.dragDisabled = readInstructions;

        tapPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + config.instructions.tap[mode].path,
          function(){}, function(err){ $log.error(err);}
        );

        if (readInstructions){
          $timeout(function () {
            var intro = config.instructions.intro[mode];
            // play instructions of activity
            instructionsPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + intro.path,
              function(){
                instructionsPlayer.release();
                $scope.showText = false;
                $scope.dragDisabled = false;
                $scope.showNumber = true;
                $scope.tapNumber();
                $scope.$apply();
              },
              function(err){
                $log.error(err);
                instructionsPlayer.release();
                $scope.showText = false;
                $scope.dragDisabled = false;
                $scope.showNumber = true;
                $scope.$apply();
              }
            );

            $scope.textSpeech = intro.text;
            $scope.showText = true;
            instructionsPlayer.play();
            readInstructions = false;
          }, 1000);
        }
        else {
          $scope.showNumber = true;
          $scope.tapNumber();
        }
      });
    };

    Ctrl13.startStage = function(){
      $scope.dropzone = [];
      itemCount = 0;
      $scope.dragDisabled = false;
    };

    $scope.numberToWords = function(number){
      return Util.numberToWords(number);
    };

    $scope.sortableOptions = {
      containment: '.activity-13-content',
      allowDuplicates: true,
      dragEnd: function(eventObj){
        $scope.dropzone.pop();
        itemCount--;
      }
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
      var feedback;
      var feedbackPath;

      if ($scope.number == itemCount){
        feedback = LearningNumber.getSuccessAudio();
        feedbackPath = AssetsPath.getSuccessAudio($scope.activityId);
      }
      else if (!$scope.autoCheck){
        feedback = LearningNumber.getFailureAudio();
        feedbackPath = AssetsPath.getFailureAudio($scope.activityId);
      }

      if (feedbackPath){
        feedbackPath = feedbackPath + feedback.path;

        feedbackPlayer = new Media(feedbackPath,
          function(){
            feedbackPlayer.release();
            $scope.showText = false;
            $scope.$apply();
            if ($scope.number == itemCount){
              Ctrl13.success();
            }
          },
          function(err){
            $log.error(err);
            feedbackPlayer.release();
            $scope.showText = false;
          });

        $scope.textSpeech = feedback.text;
        $scope.showText = true;
        feedbackPlayer.play();
      }
    };

    Ctrl13.success = function(){
      $scope.dragDisabled = true;
      if ($scope.number < config.level.numberTo){
        $timeout(function(){
          $scope.number++;
          Ctrl13.startStage();
          $scope.tapNumber();
        }, 1000);
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
            $timeout(function(){$scope.dragDisabled = false; Ctrl13.getConfiguration(level);}, 1000);
          }
        }
      }
    };

    $scope.tapInstruction = function() {
      if (!$scope.dragDisabled)
        tapPlayer.play();
    };

    $scope.tapNumber = function(){
      numberPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId)+"numbers/"+config.instructions.numbers[$scope.number-1],
        function() { numberPlayer.release(); },
        function(err){ numberPlayer.release(); });

      numberPlayer.play();
    };

    Ctrl13.minReached = function(){
      // if player reached minimum for setting activity as finished
      ActividadesFinalizadasService.add($scope.activityId);
      var minAudio = AssetsPath.getEndingAudio($scope.activityId) + config.ending[0].path;
      endPlayer = new Media(minAudio,
        function(){
          endPlayer.release();
          $scope.showText = false;
          $state.go('lobby');
        }, function(err){
          $log.error(err);
          endPlayer.release();
          $scope.showText = false;
          $state.go('lobby');}
      );

      $scope.textSpeech = config.ending[0].text;
      $scope.showText = true;
      $scope.$apply();
      endPlayer.play();
    };

    Ctrl13.maxReached = function(){
      level = 1;
      var maxAudio = AssetsPath.getEndingAudio($scope.activityId) + config.ending[1].path;
      endPlayer = new Media(maxAudio,
        function(){
          endPlayer.release();
          $scope.showText = false;
          $state.go('lobby');
        },
        function(err){
          $log.error(err);
          $scope.showText = false;
          $state.go('lobby');
        }
      );

      $scope.textSpeech = config.ending[1].text;
      $scope.showText = true;
      $scope.$apply();
      endPlayer.play();
    };

  }]);
})();
