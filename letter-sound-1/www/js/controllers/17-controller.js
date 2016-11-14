(function() {
  'use strict';
  angular.module('saan.controllers')
  .controller('17Ctrl', ['$scope', 'TTSService', 'Util', 'RandomNumericalSeq', 'NumberPattern',
  function ($scope, RandomPattern, TTSService, Util, RandomNumericalSeq, NumberPattern) {
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

    var pattern = [];
    var patternLength = 4;
    var completions = 0;
    var readWordTimeout = 1000;


    var stageNumber;
    var level;
    var config;
    var instructionsPlayer;
    var stageData;

    $scope.$on('$ionicView.beforeEnter', function() {
      stageNumber = 1; //TODO: retrieve and load from local storage
      level = 1; //TODO: retrieve and load from local storage
      Ctrl17.getConfiguration(level);
    });

    Ctrl15.getConfiguration = function (level){
      NumberPattern.getConfig(level).then(function(data){

        config = data;

        //play instructions of activity
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
      $scope.options = [];
      Ctrl17.setStage(stageNumber);
      // el crear opciones es igual para ambos casos
      // si hay fillin entonces no quitar en el drag
      if (stageData.mode == 1){
        // asignar izquierda a patron que viene en stage data
      }
    };

    Ctrl15.setStage = function(stageNumber){
      if (stageNumber >= 1){
        stageData = config.stages[stageNumber-1];
      }else{
        $log.error("Invalid stage number");
      }
    };



    function generatePattern(){
      return RandomNumericalSeq.sequence(2, 10, patternLength);
    }

    $scope.startActivity = function(readInstructions){
      generatePattern().then(function(data){
        $scope.activityData = data;
        $scope.availableFields = data.availableFields;
        pattern = data.seq;
        populatePattern();

        //wait for UI to load
        setTimeout(function() {
          if (readInstructions){
            TTSService.speak(data.instructions);
          }
        }, readWordTimeout);
      });
    };

    function populatePattern(){
      // elegir posicion para completar
      $scope.positionToFill = $scope.activityData.positionToFill;
      $scope.patternLeft = pattern.slice(0, $scope.positionToFill);
      $scope.patternRight = pattern.slice($scope.positionToFill + 1);
    }


    $scope.startActivity(true);

    $scope.checkColor = function(selectedColor){
      return (pattern[$scope.positionToFill] == selectedColor);
    };

    $scope.checkLevel = function(){
      if ($scope.mode == MODE_SEQUENCE){
        completions++;
        $scope.positionToFill = ++$scope.positionToFill % patternLength;
        if (completions == patternLength * $scope.repetitions){
          $scope.startActivity(false);
          $scope.selectedComponents = [];
          completions = 0;
        }
      }else if ($scope.mode == MODE_FILLIN){
        $scope.startActivity(false);
      }
    };

    $scope.successMessage = function(){
      TTSService.speak(_.sample($scope.activityData.successMessages));
    };

    $scope.errorMessage = function(){
      TTSService.speak($scope.activityData.errorMessages[0]);
    };

    $scope.getClass = function(item){
      return 'item-number';
    };

    $scope.sortableOptions = {
      containment: '.pattern-dashboard',
      allowDuplicates: true,
      accept: function(sourceItemHandleScope, destSortableScope){
        return $scope.checkColor(sourceItemHandleScope.modelValue);
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.pattern-dashboard',
      clone: true,
      itemMoved: function (eventObj) {
        $scope.checkLevel();
      }
    };

  }]);
})();
