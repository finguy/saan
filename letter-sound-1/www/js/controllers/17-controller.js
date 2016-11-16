(function() {
  'use strict';
  angular.module('saan.controllers')
  .controller('17Ctrl', ['$scope', '$timeout', '$state', 'TTSService', 'Util', 'RandomNumericalSeq', 'NumberPattern',
  function ($scope, $timeout, $state, TTSService, Util, RandomNumericalSeq, NumberPattern) {
    var MODE_SEQUENCE = 1;
    var MODE_FILLIN = 2;

    var ITEM_COLORS = 1;
    var ITEM_NUMBERS = 2;

    $scope.ITEM_COLORS = 1;
    $scope.ITEM_NUMBERS = 2;

    $scope.mode = MODE_SEQUENCE;
    $scope.itemType = ITEM_NUMBERS;
    $scope.dropzone = [];
    $scope.repetitions = 2;
    $scope.positionToFill = 0;

    $scope.activityId = 17;
    var patternLength = 4;
    // var completions = 0;
    var readWordTimeout = 1000;

    var Ctrl17 = Ctrl17 || {};
    var stageNumber;
    var level;
    var config;
    var instructionsPlayer;
    var stageData;
    var completions = 0;

    $scope.$on('$ionicView.beforeEnter', function() {
      stageNumber = 1; //TODO: retrieve and load from local storage
      level = 5; //TODO: retrieve and load from local storage
      Ctrl17.getConfiguration(level);
    });

    Ctrl17.clearValues = function(){
      stageNumber = 1;
      stageData = {};
      config = {};
      completions = 0;
    };

    Ctrl17.getConfiguration = function (level){
      Ctrl17.clearValues();
      NumberPattern.getConfig(level).then(function(data){

        config = data;
        console.log(config);

        //play instructions of activity
        // instructionsPlayer = new Media(AssetsPath.sounds(config.instructionsPath),
        //   function(){
            Ctrl17.setActivity();
            // instructionsPlayer.release();
        //   },
        //   function(err){ $log.error(err); }
        // );
        //
        // instructionsPlayer.play();
      });
    };

    Ctrl17.setActivity = function(){
      // var patternLeft = [];
      $scope.patternOptions = [];
      $scope.patternLeft = [];

      if (config.level.mode == MODE_SEQUENCE){
        Ctrl17.setSequenceStage();
        Ctrl17.buildSequenceStage();
      }
      else if (config.level.mode == MODE_FILLIN){
        Ctrl17.buildFillinStage();
      }
      else{
        console.log("invalid option");
        return;
      }

      // el crear opciones es igual para ambos casos
      // si hay fillin entonces no quitar en el drag

    };

    Ctrl17.setSequenceStage = function(){
      if (stageNumber >= 1){
        stageData = config.level.stages[stageNumber-1];
      }else{
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



    // function generatePattern(){
    //   return RandomNumericalSeq.sequence(2, 10, patternLength);
    // }

    // $scope.startActivity = function(readInstructions){
    //   generatePattern().then(function(data){
    //     $scope.activityData = data;
    //     $scope.availableFields = data.availableFields;
    //     pattern = data.seq;
    //     populatePattern();
    //
    //     //wait for UI to load
    //     setTimeout(function() {
    //       if (readInstructions){
    //         TTSService.speak(data.instructions);
    //       }
    //     }, readWordTimeout);
    //   });
    // };

    // function populatePattern(){
    //   // elegir posicion para completar
    //   $scope.positionToFill = $scope.activityData.positionToFill;
    //   $scope.patternLeft = pattern.slice(0, $scope.positionToFill);
    //   $scope.patternRight = pattern.slice($scope.positionToFill + 1);
    // }


    // $scope.startActivity(true);
    //
    // $scope.checkColor = function(selectedColor){
    //   return (pattern[$scope.positionToFill] == selectedColor);
    // };
    //
    // $scope.checkLevel = function(){
    //   if ($scope.mode == MODE_SEQUENCE){
    //     completions++;
    //     $scope.positionToFill = ++$scope.positionToFill % patternLength;
    //     if (completions == patternLength * $scope.repetitions){
    //       $scope.startActivity(false);
    //       $scope.selectedComponents = [];
    //       completions = 0;
    //     }
    //   }else if ($scope.mode == MODE_FILLIN){
    //     $scope.startActivity(false);
    //   }
    // };
    //
    // $scope.successMessage = function(){
    //   TTSService.speak(_.sample($scope.activityData.successMessages));
    // };
    //
    // $scope.errorMessage = function(){
    //   TTSService.speak($scope.activityData.errorMessages[0]);
    // };

    $scope.getClass = function(item){
      return 'item-number';
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
      clone: false,
      dragEnd: function(eventObj) {
        //check that item was correctly moved
        Ctrl17.checkDragEnd(eventObj.source.itemScope.modelValue);
      },
      itemMoved: function (eventObj) {
        Ctrl17.success();
      },
      accept: function(sourceItemHandleScope, destSortableScope){
        return false;
      }
    };

    Ctrl17.success =  function(){
      if (config.level.mode == MODE_SEQUENCE){
        Ctrl17.sequenceSuccess();
      }
      else {
        Ctrl17.fillinSuccess();
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

    Ctrl17.sequenceSuccess = function(){
      if ($scope.patternOptions.length === 0){
        if (stageNumber < config.level.stages.length){
          stageNumber++;
          $timeout(function(){
            $scope.$apply(Ctrl17.setActivity());
          }, 1000);
        }
        else {
          if (level >= NumberPattern.getMaxLevel()){
            Ctrl17.finishActivity();
          }
          else {
            Ctrl17.getConfiguration(++level);
          }
        }
      }
    };

    Ctrl17.fillinSuccess = function(){
      completions++;
      if (completions < stageData.completions){
        $timeout(function(){
          $scope.$apply(Ctrl17.setActivity());
        }, 1000);
      }
      else {
        if (level >= NumberPattern.getMaxLevel()){
          Ctrl17.finishActivity();
        }
        else {
          Ctrl17.getConfiguration(++level);
        }
      }
    };

    Ctrl17.finishActivity = function(){
      ActividadesFinalizadasService.add($scope.activityId);
      $state.go('lobby');
    };



  }]);
})();
