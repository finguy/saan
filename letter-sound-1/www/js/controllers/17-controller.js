(function() {
  'use strict';
  angular.module('saan.controllers')
  .controller('17Ctrl', ['$scope', '$timeout', '$state', '$log', 'NumberPattern', 'ActividadesFinalizadasService',
  function ($scope, $timeout, $state, $log, NumberPattern, ActividadesFinalizadasService) {
    var MODE_SEQUENCE = 1;
    var MODE_FILLIN = 2;

    $scope.mode = MODE_SEQUENCE;
    $scope.dropzone = [];

    $scope.activityId = 17;

    var Ctrl17 = Ctrl17 || {};
    var stageNumber;
    var stageData;
    var level;
    var config;
    var instructionsPlayer;

    $scope.$on('$ionicView.beforeEnter', function() {
      stageNumber = 1; //TODO: retrieve and load from local storage
      level = 1; //TODO: retrieve and load from local storage
      Ctrl17.getConfiguration(level);
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

        // play instructions of activity
        instructionsPlayer = new Media(AssetsPath.sounds(config.instructionsPath),
          function(){
            Ctrl17.setActivity();
            instructionsPlayer.release();
          },
          function(err){ $log.error(err); }
        );

        instructionsPlayer.play();
      });
    };

    Ctrl17.setActivity = function(){
      $scope.hideDropzone = false;
      $scope.patternOptions = [];
      $scope.patternLeft = [];
      $scope.mode = config.level.mode;

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
        return Ctrl17.checkAccept(sourceItemHandleScope.modelValue);
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-' + $scope.activityId + '-content',
      containerPositioning: 'relative',
      clone: $scope.mode == MODE_FILLIN,
      dragEnd: function(eventObj) {
        //check that item was correctly moved
        return Ctrl17.checkDragEnd(eventObj.source.itemScope.modelValue);
      },
      itemMoved: function (eventObj) {
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
      $scope.hideDropzone = true;

      if (Ctrl17.stageFinished()){
        stageNumber++;
        $timeout(function(){
          Ctrl17.setActivity();
        }, 1000);
      }
      else {
        if (level >= NumberPattern.getMaxLevel()){
          Ctrl17.finishActivity();
        }
        else {
          $timeout(function(){
            Ctrl17.getConfiguration(++level);
          }, 1000);
        }
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
        return _.contains($scope.patternOptions, movedValue);
      }
      else {
        return $scope.patternLeft.length + $scope.patternRight.length == stageData.patternLength;
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

    Ctrl17.finishActivity = function(){
      ActividadesFinalizadasService.add($scope.activityId);
      $state.go('lobby');
    };
  }]);
})();
