(function() {
  'use strict';
  angular.module('saan.controllers')
  .controller('2Ctrl', ['$scope', '$timeout', '$state', '$log', 'ColorPattern',
  'ActividadesFinalizadasService', 'Util', 'AssetsPath', 'AppSounds',
  function ($scope, $timeout, $state, $log, ColorPattern, ActividadesFinalizadasService,
    Util, AssetsPath, AppSounds) {
    var MODE_SEQUENCE = 1;
    var MODE_FILLIN = 2;

    $scope.activityId = 2;
    $scope.mode = MODE_SEQUENCE;
    $scope.dropzone = [];
    $scope.showText = false;
    $scope.finished = false;
    $scope.imagePath = AssetsPath.getImgs($scope.activityId);
    $scope.enabled = false;

    var Ctrl2 = Ctrl2 || {};
    var stageNumber;
    var stageData;
    var level;
    var config;
    var instructionsPlayer;
    var successPlayer;
    var failurePlayer;
    var tapPlayer;
    var endPlayer;
    var position;
    var pattern;

    var checking = false;
    var readInstructions;
    var dragChecked = false;

    $scope.$on('$ionicView.beforeEnter', function() {
      stageNumber = 1; //TODO: retrieve and load from local storage
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = true;
      $scope.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
      Ctrl2.getConfiguration(level);
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

    Ctrl2.clearValues = function(){
      stageNumber = 1;
      stageData = {};
      config = {};
    };

    Ctrl2.getConfiguration = function (level){
      Ctrl2.clearValues();
      ColorPattern.getConfig(level).then(function(data){
        config = data;

        Ctrl2.setActivity();

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
                instructionsPlayer.release();
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

    Ctrl2.setActivity = function(){
      checking = false;
      $scope.patternOptions = [];
      $scope.patternLeft = [];
      $scope.patternRight = [];
      $scope.mode = config.level.mode;
      position = 0;
      $scope.enabled = !readInstructions;

      Ctrl2.setSequenceStage();
      if (config.level.mode == MODE_SEQUENCE){
        Ctrl2.buildSequenceStage();
      }
      else if (config.level.mode == MODE_FILLIN){
        Ctrl2.buildFillinStage();
      }
      else {
        $log.error("invalid option");
        return;
      }

      $scope.patternOptions = config.colors;

      Ctrl2.setTapPlayer();

    };

    Ctrl2.setTapPlayer = function() {
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

    Ctrl2.setSequenceStage = function(){
      if (stageNumber >= 1){
        stageData = config.level;
      }else {
        $log.error("Invalid stage number");
      }
    };

    Ctrl2.buildSequenceStage = function(){
      stageData.pattern = ColorPattern.getSequencePattern(stageData.patternLength, stageData.numberOfColors);
      $scope.patternLeft = stageData.pattern;
      $scope.dummyDropzone = [];
      angular.copy(stageData.pattern, $scope.dummyDropzone);
    };

    Ctrl2.buildFillinStage = function(){
      var fillinData = ColorPattern.getFillinPattern(stageData.patternLength, stageData.numberOfColors);
      stageData.pattern = fillinData.pattern;
      stageData.positionToFill = fillinData.positionToFill;

      $scope.patternLeft = fillinData.pattern.slice(0, fillinData.positionToFill);
      $scope.dummyDropzone = [stageData.pattern[stageData.positionToFill]];
      $scope.patternRight = fillinData.pattern.slice(fillinData.positionToFill + 1);

    };

    Ctrl2.setFillinStage = function(fillinData){
      stageData = config.level;
      stageData.fillinData = fillinData;
    };

    $scope.sortableOptions = {
      allowDuplicates: true,
      accept: function(sourceItemHandleScope, destSortableScope){
        dragChecked = true;
        return Ctrl2.checkAccept(sourceItemHandleScope.modelValue);
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-' + $scope.activityId + '-content',
      containerPositioning: 'relative',
      clone: true,
      dragEnd: function(eventObj) {
        //check that item was correctly moved
        if (dragChecked && !Ctrl2.checkDragEnd(eventObj.source.itemScope.modelValue)){
          Ctrl2.failure();
        }
        dragChecked = false;
      },
      itemMoved: function (eventObj) {
        AppSounds.playTap();
        $scope.dummyDropzone.splice(0,1);
        if ($scope.mode == MODE_SEQUENCE){
          if (position + 1 >= stageData.patternLength){
            Ctrl2.success();
          }
        }
        else {
          Ctrl2.success();
        }
      },
      accept: function(sourceItemHandleScope, destSortableScope){
        return false;
      }
    };

    Ctrl2.success =  function(){
      if (!checking){
        $scope.enabled = false;
        var successFeedback = ColorPattern.getSuccessAudio();

        successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
          function(){
            successPlayer.release();
            $scope.showText = false;
            $scope.$apply();

            if (stageNumber < stageData.stages){
              stageNumber++;
              $timeout(function(){
                Ctrl2.setActivity();
              }, 1000);
            }
            else {
              if (level == ColorPattern.getMinLevel() && !$scope.finished){
                Ctrl2.minReached();
              }
              else {
                if (level == ColorPattern.getMaxLevel()){
                  Ctrl2.maxReached();
                }
                else {
                  $timeout(function(){
                    stageNumber = 1;
                    Util.saveLevel($scope.activityId, ++level);
                    Ctrl2.getConfiguration(level);
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

    Ctrl2.failure = function(){
      if (!checking){
        $scope.enabled = false;
        var failureFeedback = ColorPattern.getFailureAudio();

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

    Ctrl2.checkAccept = function(movedValue){
      if (config.level.mode == MODE_SEQUENCE){
        return stageData.pattern[position] == movedValue;
      }
      else {
        return movedValue == stageData.pattern[stageData.positionToFill];
      }
    };

    Ctrl2.checkDragEnd = function(movedValue){
      if (config.level.mode == MODE_SEQUENCE){
        if (stageData.pattern[position] == movedValue){
          position++;
          return true;
        }
        else {
          return false;
        }
      }
      else {
        return $scope.patternLeft.length + $scope.patternRight.length == 2 * stageData.patternLength;
      }
    };

    Ctrl2.minReached = function(){
      // if player reached minimum for setting activity as finished
      ActividadesFinalizadasService.add($scope.activityId);
      $scope.finished = true;
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

    Ctrl2.maxReached = function(){
      ActividadesFinalizadasService.addMax($scope.activityId);
      level = 1;
      endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[1].path,
        function(){ endPlayer.release(); $state.go('lobby'); },
        function(err){ $log.error(err); $state.go('lobby');}
      );

      $scope.textSpeech = config.ending[1].text;
      $scope.showText = true;
      $scope.$apply();
      endPlayer.play();
    };
  }]);
})();
