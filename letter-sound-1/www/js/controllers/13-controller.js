(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('13Ctrl',['$scope', '$log', '$timeout', '$state', 'Util', 'LearningNumber',
  'ActividadesFinalizadasService', 'AssetsPath', 'AppSounds',
  function($scope, $log, $timeout, $state, Util, LearningNumber, ActividadesFinalizadasService,
    AssetsPath, AppSounds) {
    $scope.activityId = 13;
    $scope.dropzone = [];
    $scope.items = ['dummy'];
    $scope.step = 1;
    $scope.enabled = false;
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

    var leaving= false;

    $scope.$on('$ionicView.beforeEnter', function() {
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = true;
      $scope.autoCheck = false;

      Ctrl13.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      leaving = true;

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
        $scope.enabled = !readInstructions;

        if (readInstructions){
          $timeout(function () {
            var intro = config.instructions.intro[mode];
            // play instructions of activity
            instructionsPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + intro.path,
              function(){
                instructionsPlayer.release();
                if (!leaving){
                  $scope.showText = false;
                  $scope.enabled = true;
                  $scope.showNumber = true;
                  $scope.tapNumber();
                  $scope.$apply();
                }
              },
              function(err){
                $log.error(err);
                instructionsPlayer.release();
                $scope.showText = false;
                $scope.enabled = true;
                $scope.showNumber = true;
                $scope.$apply();
              }
            );

            if (!leaving){
              $scope.textSpeech = intro.text;
              $scope.showText = true;
              instructionsPlayer.play();
              readInstructions = false;
            }
          }, 1000);
        }
        else {
          $scope.showNumber = true;
          $scope.tapNumber();
        }

        Ctrl13.setTapPlayer();
      });
    };

    Ctrl13.startStage = function(){
      $scope.dropzone = [];
      itemCount = 0;
      $scope.enabled = true;
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
        AppSounds.playTap();
        itemCount++;
        if (config.level.autoCheck){
          $scope.checkValue();
        }
      }
    };

    $scope.checkValue = function(){
        if ($scope.enabled){
        var feedback;
        var feedbackPath;
        $scope.enabled = false;

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
              else{
                $scope.enabled = true;
                $scope.$apply();
              }
            },
            function(err){
              $log.error(err);
              feedbackPlayer.release();
              $scope.showText = false;
              $scope.enabled = true;
              $scope.$apply();
            });

          $scope.textSpeech = feedback.text;
          $scope.showText = true;
          feedbackPlayer.play();
        }
      }
    };

    Ctrl13.success = function(){
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
            level++;
          // if player reached minimum for setting activity as finished
          $timeout(function(){ Ctrl13.minReached();}, 1000);
        }
        else {
          if (level == LearningNumber.getMaxLevel()){
            $timeout(function(){ Ctrl13.maxReached();}, 1000);
          }
          else {
            level++;
            Util.saveLevel($scope.activityId, level);
            $timeout(function(){
              $scope.enabled = true;
              Ctrl13.getConfiguration(level);
            }, 1000);
          }
        }
      }
    };

    Ctrl13.setTapPlayer = function() {
      tapPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + config.instructions.tap[mode].path,
        function(){
          $scope.enabled = true;
          $scope.showText = false;
          $scope.$apply();
        }, function(err){
          $log.error(err);
          $scope.enabled = true;
          $scope.showText = false;
          $scope.$apply();
        }
      );
    };

    $scope.tapInstruction = function() {
      if ($scope.enabled){
        $scope.enabled = false;
        $scope.textSpeech = config.instructions.tap[mode].text;
        $scope.showText = true;
        tapPlayer.play();
      }
    };

    $scope.tapNumber = function(){
      if ($scope.enabled){
        $scope.enabled = false;
        numberPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId)+"numbers/"+config.instructions.numbers[$scope.number-1],
          function() {
            numberPlayer.release();
            $scope.enabled = true;
            $scope.$apply();
          },
          function(err){
            numberPlayer.release();
            $scope.enabled = true;
            $scope.$apply();
          });

        numberPlayer.play();
      }
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
        },
        function(err){
          $log.error(err);
          endPlayer.release();
          $scope.showText = false;
          $state.go('lobby');
        }
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
