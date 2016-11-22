(function() {
  'use strict';
  angular.module('saan.controllers')
  .controller('2Ctrl', ['$scope', '$timeout', '$state', '$log', 'ColorPattern',
  'ActividadesFinalizadasService', 'Util', 'AssetsPath',
  function ($scope, $timeout, $state, $log, ColorPattern, ActividadesFinalizadasService, Util, AssetsPath) {
    var MODE_SEQUENCE = 1;
    var MODE_FILLIN = 2;

    $scope.mode = MODE_SEQUENCE;
    $scope.dropzone = [];

    $scope.activityId = 2;

    var Ctrl2 = Ctrl2 || {};
    var stageNumber;
    var stageData;
    var level;
    var config;
    var instructionsPlayer;
    var position;
    var pattern;

    $scope.$on('$ionicView.beforeEnter', function() {
      stageNumber = 1; //TODO: retrieve and load from local storage
      level = Util.getLevel($scope.activityId) || 1;
      Ctrl2.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, level);
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
        // play instructions of activity
        instructionsPlayer = new Media(AssetsPath.getGeneralAudio() + config.instructionsPath,
          function(){
            instructionsPlayer.release();
          },
          function(err){ $log.error(err); }
        );

        instructionsPlayer.play();
      });
    };

    Ctrl2.setActivity = function(){
      $scope.patternOptions = [];
      $scope.patternLeft = [];
      $scope.mode = config.level.mode;
      position = 0;

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
        return Ctrl2.checkAccept(sourceItemHandleScope.modelValue);
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-' + $scope.activityId + '-content',
      containerPositioning: 'relative',
      clone: true,
      dragEnd: function(eventObj) {
        //check that item was correctly moved
        return Ctrl2.checkDragEnd(eventObj.source.itemScope.modelValue);
      },
      itemMoved: function (eventObj) {
        $scope.dummyDropzone.splice(0,1);
        if ($scope.mode == MODE_SEQUENCE){
          position++;
          if (position >= stageData.patternLength){
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
      if (stageNumber < stageData.stages){
        stageNumber++;
        $timeout(function(){
          Ctrl2.setActivity();
        }, 1000);
      }
      else {
        if (level == ColorPattern.getMinLevel() &&
          !ActividadesFinalizadasService.finalizada($scope.activityId)){
          // if player reached minimum for setting activity as finished
          ActividadesFinalizadasService.add($scope.activityId);
          level++;
          $state.go('lobby');
        }
        else {
          if (level >= ColorPattern.getMaxLevel()){
            level = 1;
            $state.go('lobby');
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
        return _.last($scope.patternLeft) == movedValue;
      }
      else {
        return $scope.patternLeft.length + $scope.patternRight.length == stageData.patternLength;
      }
    };
  }]);
})();
