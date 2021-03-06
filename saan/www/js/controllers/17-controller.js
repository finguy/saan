(function() {
  'use strict';
  angular.module('saan.controllers')
  .controller('17Ctrl', ['$scope', '$timeout', '$state', '$log', 'NumberPattern',
  'ActividadesFinalizadasService', 'Util', 'AssetsPath', 'AppSounds',
  function ($scope, $timeout, $state, $log, NumberPattern, ActividadesFinalizadasService,
    Util, AssetsPath, AppSounds) {
    var MODE_SEQUENCE = 1;
    var MODE_FILLIN = 2;
    $scope.activityId = 17;

    $scope.mode = MODE_SEQUENCE;
    $scope.dropzone = [];
    $scope.imagePath = AssetsPath.getImgs($scope.activityId);
    $scope.enabled = false;

    var Ctrl17 = Ctrl17 || {};
    var stageNumber;
    var stageData;
    var level;
    var config;
    var instructionsPlayer;
    var readInstructions;
    var successPlayer;
    var failurePlayer;
    var tapPlayer;
    var endPlayer;
    var checking = false;
    var dragChecked = false;

    $scope.$on('$ionicView.beforeEnter', function() {
      stageNumber = 1;
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = true;
      Ctrl17.getConfiguration(level);
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

    Ctrl17.clearValues = function(){
      stageNumber = 1;
      stageData = {};
      config = {};
    };

    Ctrl17.getConfiguration = function (level){
      Ctrl17.clearValues();
      NumberPattern.getConfig(level).then(function(data){
        config = data;
        Ctrl17.setActivity();
        if (readInstructions){
          $timeout(function () {
            var intro = config.instructions.intro[$scope.mode - 1];
            // play instructions of activity
            instructionsPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + intro.path,
              function(){
                instructionsPlayer.release();
                $scope.enabled = true;
                $scope.showText = false;
                $scope.$apply();
              },
              function(err){
                $log.error(err);
                $scope.enabled = true;
                $scope.showText = false;
                $scope.$apply();
              }
            );

            $scope.textSpeech = intro.text;
            $scope.showText = true;
            instructionsPlayer.play();
            readInstructions = false;
          }, 1000);
        }
      });
    };

    Ctrl17.setActivity = function(){
      checking = false;
      $scope.hideDropzone = false;
      $scope.patternOptions = [];
      $scope.patternLeft = [];
      $scope.patternRight = [];
      $scope.mode = config.level.mode;
      $scope.enabled = !readInstructions;

      if (config.level.mode == MODE_SEQUENCE){
        Ctrl17.setSequenceStage();
        Ctrl17.buildSequenceStage();
      }
      else if (config.level.mode == MODE_FILLIN){
        Ctrl17.buildFillinStage();
      }
      else {
        $log.error("invalid option");
        return;
      }

      Ctrl17.setTapPlayer();
    };

    Ctrl17.setTapPlayer = function() {
      tapPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + config.instructions.tap.path,
        function(){
          $scope.enabled = true;
          $scope.showText = false;
          $scope.$apply();
        },
        function(err){
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
        $scope.textSpeech = config.instructions.tap.text;
        $scope.showText = true;
        tapPlayer.play();
      }
    };

    Ctrl17.setSequenceStage = function(){
      if (stageNumber >= 1){
        stageData = config.level.stages[stageNumber-1];
      }else {
        $log.error("Invalid stage number");
      }
    };

    Ctrl17.buildSequenceStage = function(){
      $scope.patternLeft = stageData.base;
      $scope.patternOptions = NumberPattern.getSequenceOptions(_.last(stageData.base), stageData.numberTo, stageData.step);
    };

    Ctrl17.buildFillinStage = function(){
      var fillinData = NumberPattern.getFillinData(config.level.step, config.level.patternLength);
      Ctrl17.setFillinStage(fillinData);

      $scope.patternLeft = fillinData.pattern.slice(0, fillinData.positionToFill);
      $scope.patternRight = fillinData.pattern.slice(fillinData.positionToFill + 1);
      $scope.patternOptions = fillinData.patternOptions;
    };

    Ctrl17.setFillinStage = function(fillinData){
      stageData = config.level;
      stageData.fillinData = fillinData;
    };

    $scope.sortableOptions = {
      allowDuplicates: true,
      accept: function(sourceItemHandleScope, destSortableScope){
        dragChecked = true;
        return Ctrl17.checkAccept(sourceItemHandleScope.modelValue);
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-' + $scope.activityId + '-content',
      containerPositioning: 'relative',
      clone: $scope.mode == MODE_FILLIN,
      dragEnd: function(eventObj) {
        //check that item was correctly moved
        if (dragChecked && !Ctrl17.checkDragEnd(eventObj.source.itemScope.modelValue)){
          Ctrl17.failure();
        }
        dragChecked = false;
      },
      itemMoved: function (eventObj) {
        AppSounds.playTap();
        if ($scope.mode == MODE_FILLIN ||
           $scope.mode == MODE_SEQUENCE && $scope.patternOptions.length === 0){
          Ctrl17.success();
        }
      },
      accept: function(sourceItemHandleScope, destSortableScope){
        return false;
      }
    };

    Ctrl17.success =  function(){
      if (!checking){
        $scope.enabled = false;
        var successFeedback = NumberPattern.getSuccessAudio();
        $scope.hideDropzone = true;

        successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
          function(){
            $scope.showText = false;
            if (Ctrl17.stageFinished()){
              stageNumber++;
              $timeout(function(){
                Ctrl17.setActivity();
              }, 1000);
            }
            else {
              if (level == NumberPattern.getMinLevel() &&
                !ActividadesFinalizadasService.finalizada($scope.activityId)){
                  Ctrl17.minReached();
              }
              else {
                if (level >= NumberPattern.getMaxLevel()){
                  Ctrl17.maxReached();
                }
                else {
                  $timeout(function(){
                    stageNumber = 1;
                    Util.saveLevel($scope.activityId, ++level);
                    Ctrl17.getConfiguration(level);
                  }, 1000);
                }
              }
            }
          },
          function(err){ $log.error(err); successPlayer.release(); $scope.showText = false; $scope.$apply();}
        );

        $scope.textSpeech = successFeedback.text;
        $scope.showText = true;
        successPlayer.play();
      }
    };

    Ctrl17.checkAccept = function(movedValue){
      if (config.level.mode == MODE_SEQUENCE){
        return _.last($scope.patternLeft) + stageData.step == movedValue;
      }
      else {
        var fillinData = stageData.fillinData;
        return movedValue == fillinData.pattern[fillinData.positionToFill];
      }
    };

    Ctrl17.checkDragEnd = function(movedValue){
      if (config.level.mode == MODE_SEQUENCE){
        return !_.contains($scope.patternOptions, movedValue);
      }
      else {
        return $scope.patternLeft.length + $scope.patternRight.length == stageData.patternLength;
      }
    };

    Ctrl17.failure = function(){
      if (!checking){
        $scope.enabled = false;
        var failureFeedback = NumberPattern.getFailureAudio();

        failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
          function(){
            failurePlayer.release();
            $scope.showText = false;
            checking = false;
            $scope.enabled = true;
            $scope.$apply();
          },
          function(err){
            failurePlayer.release();
            $log.error(err);
            $scope.showText = false;
            checking = false;
            $scope.enabled = true;
            $scope.$apply();
          }
        );

        $scope.textSpeech = failureFeedback.text;
        $scope.showText = true;
        failurePlayer.play();
      }
    };

    Ctrl17.stageFinished = function(){
      if (config.level.mode == MODE_SEQUENCE){
        return stageNumber < config.level.stages.length;
      }
      else {
        return stageNumber < stageData.completions;
      }
    };

    Ctrl17.minReached = function(){
      // if player reached minimum for setting activity as finished
      ActividadesFinalizadasService.add($scope.activityId);
      level++;

      endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[0].path,
        function(){
          endPlayer.release();
          $state.go('lobby');
        },
        function(err){
          $log.error(err);
          $state.go('lobby');
        }
      );

      $scope.textSpeech = config.ending[0].text;
      $scope.showText = true;
      $scope.$apply();
      endPlayer.play();
    };

    Ctrl17.maxReached = function(){
      level = 1;
      ActividadesFinalizadasService.addMax($scope.activityId);
      endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[1].path,
        function(){
          endPlayer.release();
          $state.go('lobby');
        },
        function(err){
          $log.error(err);
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
